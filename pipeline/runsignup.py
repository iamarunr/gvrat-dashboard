"""
RunSignup API client.

Activity tally unit — confirmed 2026-05-01:
  result_split_tally_value is an integer in millimeters.
  Conversion: miles = mm / 1_609_344  (1 international mile = 1609.344 m = 1,609,344 mm)
  Verified: bib 4 (Jenna Dagger) → 42,325,747 mm = 26.3000 miles (matches CSV fixture).

Activity event routing — confirmed 2026-05-01:
  All VR activities for both event IDs (1142660 US, 1142661 NON-USA) are stored under
  event 1142660 only. NON-USA participants (registered under 1142661) must also have
  their activities fetched from event 1142660.

Participant status:
  status=None in the API response means active. Mapped to "Active" on ingest.
"""
import logging
import os
import time
from datetime import date
from typing import Optional

import requests

from pipeline.models import Activity, Participant

log = logging.getLogger(__name__)

BASE_URL = "https://api.runsignup.com/rest"
ACTIVITY_FETCH_DELAY = 0.25   # 250 ms between per-bib activity calls (RunSignup guidance)
MAX_RETRIES = 3
RETRY_DELAYS = (1, 2, 4)       # exponential backoff in seconds


class RunSignupError(Exception):
    pass


class ApiSource:
    """Fetches participants and VR activities from the RunSignup REST API."""

    def __init__(self, max_runners: Optional[int] = None):
        self._api_key = os.environ.get("RUNSIGNUP_API_KEY", "")
        self._api_secret = os.environ.get("RUNSIGNUP_API_SECRET", "")
        if not self._api_key or not self._api_secret:
            raise RunSignupError(
                "RUNSIGNUP_API_KEY and RUNSIGNUP_API_SECRET environment variables must be set"
            )
        self._max_runners = max_runners
        self._session = requests.Session()

    def _auth_params(self) -> dict:
        return {
            "format": "json",
            "rsu_api_key": self._api_key,
        }

    def _auth_headers(self) -> dict:
        return {"X-RSU-API-Secret": self._api_secret}

    def _get(self, path: str, params: dict) -> object:
        """GET with retry: 3 retries, exponential backoff on 5xx and connection errors."""
        url = f"{BASE_URL}/{path.lstrip('/')}"
        all_params = {**self._auth_params(), **params}
        for attempt in range(MAX_RETRIES + 1):
            try:
                resp = self._session.get(url, params=all_params, headers=self._auth_headers(), timeout=30)
                if resp.status_code >= 500:
                    if attempt < MAX_RETRIES:
                        delay = RETRY_DELAYS[attempt]
                        log.warning("HTTP %s on %s, retry %d in %ds", resp.status_code, path, attempt + 1, delay)
                        time.sleep(delay)
                        continue
                    raise RunSignupError(f"HTTP {resp.status_code} from {url} after {MAX_RETRIES} retries")
                if resp.status_code >= 400:
                    raise RunSignupError(f"HTTP {resp.status_code} from {url}: {resp.text[:300]}")
                return resp.json()
            except requests.ConnectionError as exc:
                if attempt < MAX_RETRIES:
                    delay = RETRY_DELAYS[attempt]
                    log.warning("Connection error on %s, retry %d in %ds: %s", path, attempt + 1, delay, exc)
                    time.sleep(delay)
                else:
                    raise RunSignupError(f"Connection failed after {MAX_RETRIES} retries: {exc}") from exc
        raise RunSignupError("Unreachable")

    # ------------------------------------------------------------------ #
    # Public methods                                                       #
    # ------------------------------------------------------------------ #

    def load_participants(self, race_id: int, event_ids: list[int]) -> list[Participant]:
        """Fetch all participants across all event IDs (each paginated separately)."""
        participants: list[Participant] = []

        for event_id in event_ids:
            page = 1
            results_per_page = 100
            event_total = 0
            log.info("Fetching participants for event %s (race %s)...", event_id, race_id)

            while True:
                data = self._get(f"/race/{race_id}/participants", {
                    "event_id": str(event_id),
                    "page": page,
                    "results_per_page": results_per_page,
                    "supports_nb": "T",
                })
                part_list = _extract_participants_page(data)
                if not part_list:
                    break

                for raw in part_list:
                    try:
                        participants.append(_parse_participant(raw))
                    except Exception as exc:
                        log.warning("Skipping bad participant (reg_id=%s): %s", raw.get("registration_id"), exc)

                event_total += len(part_list)
                log.info("  event %s page %d: %d records", event_id, page, len(part_list))
                if len(part_list) < results_per_page:
                    break
                page += 1

            log.info("Event %s: %d participants total", event_id, event_total)

        log.info("Participants fetch complete: %d total across %d events", len(participants), len(event_ids))
        return participants

    def fetch_activity_types(self, race_id: int, event_id: int) -> list[dict]:
        """Fetch VR activity type definitions — confirms available activity types."""
        data = self._get("/v2/vr-activities/vr-activity-types.json", {"race_id": race_id, "event_id": event_id})
        types = []
        if isinstance(data, dict):
            for key in ("activity_types", "vr_activity_types"):
                if key in data and isinstance(data[key], list):
                    types = data[key]
                    break
        names = [t.get("activity_type_name", t.get("name", t.get("virtual_race_activity_type_id", str(t)))) for t in types]
        log.info("Activity types for race %s: %s", race_id, names)
        return types

    def load_activities(
        self,
        race_id: int,
        participants: list[Participant],
        event_ids: list[int],
        virtual_bibs: Optional[set[int]] = None,
    ) -> list[Activity]:
        """Fetch VR activities for each real participant (250ms delay between calls).

        All activities live under event_ids[0] regardless of which event the participant
        registered under — confirmed 2026-05-01.
        """
        activity_event_id = event_ids[0]
        skip_bibs = virtual_bibs or set()

        bibs = sorted({p.bib for p in participants if p.bib not in skip_bibs})
        if self._max_runners is not None:
            bibs = bibs[: self._max_runners]
            log.info("--max-runners=%d: fetching activities for first %d bibs", self._max_runners, len(bibs))
        else:
            log.info("Fetching activities for %d runners from event %s...", len(bibs), activity_event_id)

        activities: list[Activity] = []
        for i, bib in enumerate(bibs):
            try:
                bib_acts = self._fetch_activities_for_bib(race_id, bib, activity_event_id)
                activities.extend(bib_acts)
            except RunSignupError as exc:
                log.warning("Failed to fetch activities for bib %d: %s", bib, exc)

            if i < len(bibs) - 1:
                time.sleep(ACTIVITY_FETCH_DELAY)

        self._log_bib4_tally_verification(activities)
        log.info("Activities fetch complete: %d total activity records", len(activities))
        return activities

    # ------------------------------------------------------------------ #
    # Private helpers                                                      #
    # ------------------------------------------------------------------ #

    def _fetch_activities_for_bib(self, race_id: int, bib: int, event_id: int) -> list[Activity]:
        activities: list[Activity] = []
        page = 1
        while True:
            data = self._get("/v2/vr-activities.json", {
                "race_id": race_id,
                "event_id": event_id,
                "bib_num": bib,
                "page": page,
                "num": 100,
            })
            act_list = data.get("activities", []) if isinstance(data, dict) else []
            if not act_list:
                break
            for raw in act_list:
                try:
                    activities.append(_parse_activity(raw, bib))
                except Exception as exc:
                    log.warning("Skipping bad activity for bib %d: %s — %s", bib, raw, exc)
            if len(act_list) < 100:
                break
            page += 1
        return activities

    @staticmethod
    def _log_bib4_tally_verification(activities: list[Activity]) -> None:
        """Log raw mm value for bib 4 alongside the converted miles (CSV fixture: 26.3 miles)."""
        bib4_acts = [a for a in activities if a.bib == 4]
        if bib4_acts:
            sample = bib4_acts[0]
            log.info(
                "BIB 4 TALLY VERIFICATION — tallyValue=%r date=%s "
                "(CSV fixture: 26.3 miles; raw API: millimeters ÷ 1,609,344)",
                sample.tallyValue, sample.activityDate,
            )
        else:
            log.info("BIB 4 TALLY VERIFICATION — bib 4 has no activities yet")


# ------------------------------------------------------------------ #
# Response parsers                                                     #
# ------------------------------------------------------------------ #

def _extract_participants_page(data: object) -> list[dict]:
    """Extract the flat participant list from one page of the API response.

    Response structure: list[{"event": {"event_id": N, ...}, "participants": [...]}]
    """
    if not isinstance(data, list) or not data:
        return []
    # Each item in the list corresponds to one event (when requesting a single event_id).
    # Collect all participants across all items.
    result: list[dict] = []
    for item in data:
        if not isinstance(item, dict):
            continue
        parts = item.get("participants", [])
        if isinstance(parts, list):
            result.extend(parts)
    return result


def _parse_participant(raw: dict) -> Participant:
    """Map a RunSignup participant record to the internal Participant model (no PII)."""
    user = raw.get("user", {}) or {}
    addr = user.get("address", {}) or {}

    bib_raw = raw.get("bib_num", "0")
    try:
        bib = int(bib_raw)
    except (TypeError, ValueError):
        bib = 0

    try:
        age = int(raw.get("age") or 0)
    except (TypeError, ValueError):
        age = 0

    event_id_raw = raw.get("event_id")
    try:
        event_id = int(event_id_raw) if event_id_raw is not None else None
    except (TypeError, ValueError):
        event_id = None

    # status=None from the API means the participant is active.
    status = (raw.get("status") or "Active").strip()

    return Participant(
        registrationId=str(raw.get("registration_id", "")),
        bib=bib,
        firstName=(user.get("first_name") or "").strip(),
        lastName=(user.get("last_name") or "").strip(),
        gender=(user.get("gender") or "").strip().upper()[:1],
        age=age,
        city=(addr.get("city") or "").strip(),
        state=(addr.get("state") or "").strip(),
        country=(addr.get("country_code") or "").strip(),
        event=str(event_id or ""),
        status=status,
        eventId=event_id,
    )


def _parse_activity(raw: dict, bib: int) -> Activity:
    """Map a RunSignup VR activity record to the internal Activity model.

    result_split_tally_value is in millimeters (integer).
    Converted to miles: mm / 1_609_344 (1 international mile = 1,609,344 mm).
    """
    mm = raw.get("result_split_tally_value", 0) or 0
    miles = int(mm) / 1_609_344
    tally_str = f"{miles:.6f} miles"

    # Date field is tally_split_date (not activity_date)
    date_raw = str(raw.get("tally_split_date", "")).strip()
    act_date = date.fromisoformat(date_raw[:10])

    # activity type is a numeric ID; store as string
    activity_type = str(raw.get("virtual_race_activity_type_id", "")).strip()

    # tally_split_comment is the runner's note; API doesn't expose duration as a time string
    comment = str(raw.get("tally_split_comment", "") or "").strip()

    return Activity(
        registrationId=str(raw.get("registration_id", "")),
        bib=bib,
        activityDate=act_date,
        tallyValue=tally_str,
        activityType=activity_type,
        time=None,
        comment=comment,
    )

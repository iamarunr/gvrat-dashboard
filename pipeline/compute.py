import re
from collections import defaultdict
from datetime import date
from typing import Optional

from pipeline.models import Activity, LeaderboardOutput, Participant, PublicRunner, RaceConfig
from pipeline.waypoints import WaypointMap

DIST_RE = re.compile(r"^([\d.]+)\s*(miles|km|kilometers?|mi)$", re.IGNORECASE)


def parse_distance(s: str) -> float:
    """Parse a distance string like '26.3 miles' or '10 km' into miles."""
    m = DIST_RE.match(s.strip())
    if not m:
        raise ValueError(f"Unparseable distance: {s!r}")
    val = float(m.group(1))
    unit = m.group(2).lower()
    if unit.startswith("k"):
        return val * 0.621371
    return val


def derive_home(country: str, state: str) -> str:
    """Return 'US-{state}' for US runners, ISO country code otherwise."""
    if country == "US":
        return f"US-{state}"
    return country


def build_leaderboard(
    participants: list[Participant],
    activities: list[Activity],
    waypoints: WaypointMap,
    config: RaceConfig,
    as_of_date: date,
    day_number: int,
    overrides: dict,
) -> LeaderboardOutput:
    """Aggregate activities, rank runners, and return a LeaderboardOutput.

    Session 2 scope: real runners only. Virtual characters, projected finish,
    gender ranking, and location descriptions are added in Session 3.
    """
    # 1. Sum miles per bib. Day 1 of the race = activities through as_of_date.
    # The fairness cutoff (12:00 UTC) means we include all activities whose
    # activityDate <= as_of_date — see SPEC §1.
    miles_by_bib: dict[int, float] = defaultdict(float)
    last_activity_by_bib: dict[int, date] = {}
    for activity in activities:
        if activity.activityDate > as_of_date:
            continue
        miles = parse_distance(activity.tallyValue)
        miles_by_bib[activity.bib] += miles
        prev = last_activity_by_bib.get(activity.bib)
        if prev is None or activity.activityDate > prev:
            last_activity_by_bib[activity.bib] = activity.activityDate

    # 2. Apply manual overrides (data corrections).
    for bib_str, override in overrides.items():
        bib = int(bib_str)
        if "milesAdjustment" in override:
            miles_by_bib[bib] += override["milesAdjustment"]

    # 3. Build real runner rows; skip virtual-character bibs.
    virtual_bibs = {
        config.virtualCharacters.gingerbreadMan.bib,
        config.virtualCharacters.buzzard.bib,
    }
    runners: list[PublicRunner] = []
    for p in participants:
        if p.status != "Active":
            continue
        if p.bib in virtual_bibs:
            continue
        miles = round(miles_by_bib.get(p.bib, 0.0), 4)
        last_act = last_activity_by_bib.get(p.bib)
        current_mile = min(int(miles), 680)
        wp = waypoints.lookup(current_mile)
        runners.append(PublicRunner(
            rank=0,
            rankDisplay="",
            bib=p.bib,
            firstName=p.firstName,
            lastName=p.lastName,
            displayName=f"{p.firstName} {p.lastName}",
            event=config.abbreviation,
            home=derive_home(p.country, p.state),
            gender=p.gender,
            age=p.age,
            miles=miles,
            km=round(miles * 1.60934, 2),
            compPercent=round(miles / config.totalMiles * 100, 2),
            currentMile=current_mile,
            lat=wp.lat,
            lon=wp.lon,
            locationDescription="",  # populated in Session 3
            projectedFinish=None,    # populated in Session 3
            projectedFinishDate=None,
            genderRank=None,         # populated in Session 3
            eventGen=f"{config.abbreviation}{p.gender}",
            virtual=False,
            virtualType=None,
            lastActivityDate=last_act.isoformat() if last_act else None,
        ))

    # 4. Sort by miles desc; assign rank and rankDisplay.
    runners.sort(key=lambda r: -r.miles)
    for i, r in enumerate(runners):
        r.rank = i + 1
        r.rankDisplay = f"#{i + 1}"

    from datetime import datetime, timezone
    now_utc = datetime.now(timezone.utc)

    return LeaderboardOutput(
        race=config.id,
        lastUpdatedUtc=now_utc.strftime("%Y-%m-%dT%H:%M:%SZ"),
        asOfDate=as_of_date.isoformat(),
        dayNumber=day_number,
        totalDays=config.totalDays,
        runners=runners,
    )

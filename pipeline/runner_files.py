"""Write per-runner JSON files to data/{race_id}/runners/{bib}.json."""
import json
from collections import defaultdict
from datetime import date, timedelta
from pathlib import Path

from pipeline.compute import parse_distance
from pipeline.models import Activity, LeaderboardOutput, Participant, RaceConfig


def _normalize_type(activity_type: str) -> str:
    """Map activityType to 'run' or 'walk'. API path sends text names; CSV path sends strings."""
    at = activity_type.lower().strip()
    if at in ("walk", "walking"):
        return "walk"
    if at in ("run", "running"):
        return "run"
    return "run"


def _activity_entry(act: Activity) -> dict:
    miles = round(parse_distance(act.tallyValue), 2)
    return {
        "date": act.activityDate.isoformat(),
        "miles": miles,
        "km": round(miles * 1.60934, 2),
        "type": _normalize_type(act.activityType),
        "time": act.time,
        "comment": act.comment,
    }


def _rest_entry(d: date) -> dict:
    return {
        "date": d.isoformat(),
        "miles": 0.0,
        "km": 0.0,
        "type": "rest",
        "time": None,
        "comment": "",
    }


def save_runner_files(
    participants: list[Participant],
    activities: list[Activity],
    leaderboard: LeaderboardOutput,
    config: RaceConfig,
    as_of_date: date,
    day_number: int,
    race_id: str,
    base_dir: Path = Path("data"),
) -> int:
    """Write per-runner JSON files; return the number of files written.

    Writes data/{race_id}/runners/{bib}.json for every active, non-virtual participant.
    Also writes the Buzzard synthetic file at data/{race_id}/runners/9998.json.
    Gingerbread Man is skipped (no activities; profile page not needed for synthetic character).

    Rest days are filled in for every day from race startDate through as_of_date
    on which a runner has no logged activity.
    """
    out_dir = Path(base_dir) / race_id / "runners"
    out_dir.mkdir(parents=True, exist_ok=True)

    buzzard_bib = config.virtualCharacters.buzzard.bib
    gbm_bib = config.virtualCharacters.gingerbreadMan.bib
    virtual_bibs = {buzzard_bib, gbm_bib}

    # Group activities by bib, filtered to the fairness cutoff
    acts_by_bib: dict[int, list[Activity]] = defaultdict(list)
    for act in activities:
        if act.activityDate <= as_of_date:
            acts_by_bib[act.bib].append(act)

    # --- Buzzard synthetic file ---
    daily_pace = round(config.totalMiles / config.totalDays, 4)
    real_runners = [r for r in leaderboard.runners if not r.virtual]
    buzzard_runner = next((r for r in leaderboard.runners if r.bib == buzzard_bib), None)
    buzzard_miles = buzzard_runner.miles if buzzard_runner else round(day_number * daily_pace, 4)

    runners_ahead = sum(1 for r in real_runners if r.miles > buzzard_miles)
    runners_behind = sum(1 for r in real_runners if r.miles <= buzzard_miles)

    buzzard_acts = []
    d = config.startDate
    for _ in range(day_number):
        if d > as_of_date:
            break
        day_miles = round(daily_pace, 2)
        buzzard_acts.append({
            "date": d.isoformat(),
            "miles": day_miles,
            "km": round(day_miles * 1.60934, 2),
            "type": "buzzard",
            "time": None,
            "comment": "Flying at race pace",
        })
        d += timedelta(days=1)

    buzzard_file = {
        "bib": buzzard_bib,
        "firstName": "Buzzard",
        "lastName": "",
        "displayName": "Buzzard",
        "virtual": True,
        "virtualType": "buzzard",
        "dailyPace": daily_pace,
        "projectedFinish": config.endDate.isoformat(),
        "activities": buzzard_acts,
        "runnersAhead": runners_ahead,
        "runnersBehind": runners_behind,
    }
    (out_dir / f"{buzzard_bib}.json").write_text(
        json.dumps(buzzard_file, indent=2), encoding="utf-8"
    )
    files_written = 1

    # --- Per-runner files ---
    lb_miles_by_bib = {r.bib: r.miles for r in leaderboard.runners}

    for participant in participants:
        if participant.status != "Active":
            continue
        if participant.bib in virtual_bibs:
            continue

        bib_acts = sorted(acts_by_bib.get(participant.bib, []), key=lambda a: a.activityDate)

        # Group by date to handle multiple activities on the same day
        acts_by_date: dict[date, list[Activity]] = defaultdict(list)
        for a in bib_acts:
            acts_by_date[a.activityDate].append(a)

        # Walk every day from race start through as_of_date, inserting rest entries
        activity_list = []
        cur = config.startDate
        while cur <= as_of_date:
            if cur in acts_by_date:
                for act in acts_by_date[cur]:
                    activity_list.append(_activity_entry(act))
            else:
                activity_list.append(_rest_entry(cur))
            cur += timedelta(days=1)

        active_days = len(acts_by_date)
        total_activities = len(bib_acts)

        runner_file = {
            "bib": participant.bib,
            "firstName": participant.firstName,
            "lastName": participant.lastName,
            "displayName": f"{participant.firstName} {participant.lastName}".strip(),
            "activities": activity_list,
            "totalActivities": total_activities,
            "activeDays": active_days,
            "restDays": day_number - active_days,
        }
        (out_dir / f"{participant.bib}.json").write_text(
            json.dumps(runner_file, indent=2), encoding="utf-8"
        )
        files_written += 1

    return files_written

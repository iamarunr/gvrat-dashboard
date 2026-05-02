import re
from collections import defaultdict
from datetime import date, timedelta
from typing import Optional

from pipeline.descriptions import DescriptionMap
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


def compute_projected_finish(
    miles: float,
    day_number: int,
    config: RaceConfig,
    last_activity_date: Optional[str],
) -> tuple[Optional[str], Optional[str]]:
    """Return (projectedFinish display string, projectedFinishDate ISO string).

    Display format per SPEC §4:
    - miles == 0 or day 0         → ("—", None)
    - miles >= totalMiles (done)  → ("FINISHED", last_activity_date)
    - finish before endDate       → ISO date string in both fields
    - finish after endDate        → ("NNN days", ISO date string)
    """
    if miles == 0 or day_number == 0:
        return "—", None
    if miles >= config.totalMiles:
        return "FINISHED", last_activity_date
    daily_pace = miles / day_number
    days_to_finish = config.totalMiles / daily_pace
    finish_date = config.startDate + timedelta(days=days_to_finish)
    finish_iso = finish_date.isoformat()
    if finish_date <= config.endDate:
        return finish_iso, finish_iso
    return f"{int(days_to_finish):03d} days", finish_iso


def build_leaderboard(
    participants: list[Participant],
    activities: list[Activity],
    waypoints: WaypointMap,
    config: RaceConfig,
    as_of_date: date,
    day_number: int,
    overrides: dict,
    *,
    descriptions: Optional[DescriptionMap] = None,
) -> LeaderboardOutput:
    """Aggregate activities, add virtual characters, rank runners, return LeaderboardOutput.

    Fairness cutoff: include all activities whose activityDate <= as_of_date — SPEC §1.
    """
    # 1. Sum miles per bib through the fairness cutoff date.
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

    # 3. Build real runner rows; skip virtual-character bibs and inactive participants.
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
        last_act_iso = last_act.isoformat() if last_act else None
        current_mile = min(int(miles), 680)
        wp = waypoints.lookup(current_mile)
        loc_desc = descriptions.lookup(current_mile) if descriptions else ""
        proj_finish, proj_finish_date = compute_projected_finish(
            miles, day_number, config, last_act_iso
        )
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
            locationDescription=loc_desc,
            projectedFinish=proj_finish,
            projectedFinishDate=proj_finish_date,
            genderRank=None,
            eventGen=f"{config.abbreviation}{p.gender}",
            virtual=False,
            virtualType=None,
            lastActivityDate=last_act_iso,
        ))

    # 4. Sort real runners by miles desc; assign real-only ranks and rankDisplay.
    runners.sort(key=lambda r: -r.miles)
    for i, r in enumerate(runners):
        r.rankDisplay = f"#{i + 1}"

    # 5. Assign gender ranks among real runners only.
    _assign_gender_ranks(runners)

    # 6. Insert Buzzard (pace = totalMiles / totalDays per day).
    from pipeline.virtual_chars import build_buzzard, build_gingerbread_man
    buzzard = build_buzzard(day_number, config, waypoints, descriptions)
    runners.append(buzzard)

    # 7. Insert Gingerbread Man (1 mile ahead of the top real runner).
    top_real = next((r for r in runners if not r.virtual), None)
    top_real_miles = top_real.miles if top_real else 0.0
    gbm = build_gingerbread_man(
        top_real if top_real else _zero_runner(config),
        config,
        waypoints,
        descriptions,
    )
    runners.append(gbm)

    # 8. Final sort by miles desc; assign overall rank.
    runners.sort(key=lambda r: -r.miles)
    for i, r in enumerate(runners):
        r.rank = i + 1

    # 9. rankDisplay for virtual characters (real runners already have theirs from step 4).
    for r in runners:
        if r.virtualType == "gingerbread":
            r.rankDisplay = "#1"
        elif r.virtualType == "buzzard":
            count = sum(1 for x in runners if not x.virtual and x.miles > r.miles)
            r.rankDisplay = f"#{count + 1}"

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


def _assign_gender_ranks(real_runners: list[PublicRunner]) -> None:
    """Set genderRank on real runners (already sorted by miles desc)."""
    m_rank = f_rank = 1
    for r in real_runners:
        if r.gender == "M":
            r.genderRank = m_rank
            m_rank += 1
        elif r.gender == "F":
            r.genderRank = f_rank
            f_rank += 1


def _zero_runner(config: RaceConfig) -> PublicRunner:
    """Fallback stub when there are no real runners — gives GBM a safe base."""
    from pipeline.waypoints import WaypointMap
    return PublicRunner(
        rank=0, rankDisplay="", bib=0, firstName="", lastName="", displayName="",
        event=config.abbreviation, home="", gender="M", age=0,
        miles=0.0, km=0.0, compPercent=0.0, currentMile=0,
        lat=0.0, lon=0.0, locationDescription="",
        projectedFinish="—", projectedFinishDate=None,
        genderRank=None, eventGen="", virtual=False, virtualType=None,
        lastActivityDate=None,
    )

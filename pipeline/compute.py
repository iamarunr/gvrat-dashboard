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
    return finish_iso, finish_iso


def calculate_completion_days(
    bib: int,
    activities: list[Activity],
    start_date: date,
    total_miles: float,
    as_of_date: date,
    overrides: dict,
) -> Optional[int]:
    """Calculate the earliest calendar day on which a runner reached or crossed the total miles.
    May 1st is Day 1. Returns None if they haven't finished."""
    runner_acts = [a for a in activities if a.bib == bib and a.activityDate <= as_of_date]
    if not runner_acts:
        adjustment = overrides.get(str(bib), {}).get("milesAdjustment", 0.0)
        if round(adjustment, 4) >= total_miles:
            return 1
        return None

    # Group miles by activityDate
    miles_by_date = defaultdict(float)
    for act in runner_acts:
        miles_by_date[act.activityDate] += parse_distance(act.tallyValue)

    adjustment = overrides.get(str(bib), {}).get("milesAdjustment", 0.0)
    cumulative = 0.0
    for d in sorted(miles_by_date.keys()):
        cumulative += miles_by_date[d]
        if round(cumulative + adjustment, 4) >= total_miles:
            return max(1, (d - start_date).days + 1)

    return None


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
    temp_runners = []
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
        
        is_finished = miles >= config.totalMiles
        days = None
        if is_finished:
            days = calculate_completion_days(
                p.bib, activities, config.startDate, config.totalMiles, as_of_date, overrides
            )
            if days is None:
                days = max(1, (as_of_date - config.startDate).days + 1)
            comp_percent_str = "100.00%"
            proj_finish = f"{days} days"
        else:
            pct = round(miles / config.totalMiles * 100, 2)
            comp_percent_str = f"{pct:.2f}%"

        temp_runners.append({
            "participant": p,
            "raw_miles": miles,
            "last_act_iso": last_act_iso,
            "comp_percent_str": comp_percent_str,
            "wp": wp,
            "loc_desc": loc_desc,
            "proj_finish": proj_finish,
            "proj_finish_date": proj_finish_date,
            "is_finished": is_finished,
            "days": days
        })

    # 4. Sort real runners: finished runners first (fewest days), then active runners (miles desc).
    temp_runners.sort(key=lambda x: (
        0 if x["is_finished"] else 1,
        x["days"] if x["is_finished"] else 0,
        -x["raw_miles"]
    ))

    # Construct PublicRunner objects with capped miles and km
    runners: list[PublicRunner] = []
    for i, tr in enumerate(temp_runners):
        p = tr["participant"]
        miles = tr["raw_miles"]
        display_miles = min(miles, config.totalMiles)
        display_km = round(display_miles * 1.60934, 2)
        
        runners.append(PublicRunner(
            rank=0,
            rankDisplay=f"#{i + 1}",
            bib=p.bib,
            firstName=p.firstName,
            lastName=p.lastName,
            displayName=f"{p.firstName} {p.lastName}",
            event=config.abbreviation,
            home=derive_home(p.country, p.state),
            gender=p.gender,
            age=p.age,
            miles=display_miles,
            km=display_km,
            compPercent=tr["comp_percent_str"],
            currentMile=min(int(display_miles), 680),
            lat=tr["wp"].lat,
            lon=tr["wp"].lon,
            locationDescription=tr["loc_desc"],
            projectedFinish=tr["proj_finish"],
            projectedFinishDate=tr["proj_finish_date"],
            genderRank=None,
            eventGen=f"{config.abbreviation}{p.gender}",
            virtual=False,
            virtualType=None,
            lastActivityDate=tr["last_act_iso"],
        ))

    # 5. Assign gender ranks among real runners only (already sorted).
    _assign_gender_ranks(runners)

    # 6. Insert Buzzard (pace = totalMiles / totalDays per day).
    from pipeline.virtual_chars import build_buzzard, build_gingerbread_man
    buzzard = build_buzzard(day_number, config, waypoints, descriptions)
    runners.append(buzzard)

    # 7. Insert Gingerbread Man (1 mile ahead of the top real runner).
    top_real = next((r for r in runners if not r.virtual), None)
    gbm = build_gingerbread_man(
        top_real if top_real else _zero_runner(config),
        config,
        waypoints,
        descriptions,
        activities,
        as_of_date,
        overrides,
    )
    runners.append(gbm)

    # 8. Final sort overall: Gingerbread Man first, then finished runners (fewest days), then active runners (miles desc).
    def final_sort_key(r: PublicRunner) -> tuple[int, float, float]:
        if r.virtualType == "gingerbread":
            return (0, 0.0, 0.0)
        if "days" in (r.projectedFinish or ""):
            try:
                days = int(r.projectedFinish.split()[0])
            except ValueError:
                days = 153
            return (1, float(days), 0.0)
        return (2, 0.0, -r.miles)

    runners.sort(key=final_sort_key)
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
        miles=0.0, km=0.0, compPercent="0.00%", currentMile=0,
        lat=0.0, lon=0.0, locationDescription="",
        projectedFinish="—", projectedFinishDate=None,
        genderRank=None, eventGen="", virtual=False, virtualType=None,
        lastActivityDate=None,
    )

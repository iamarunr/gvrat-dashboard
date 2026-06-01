"""Gingerbread Man and Buzzard virtual character builders per SPEC §1 and §4."""
from datetime import date
from collections import defaultdict
from pipeline.descriptions import DescriptionMap
from pipeline.models import Activity, PublicRunner, RaceConfig
from pipeline.waypoints import WaypointMap
from pipeline.compute import parse_distance


def build_buzzard(
    day_number: int,
    config: RaceConfig,
    waypoints: WaypointMap,
    descriptions: DescriptionMap | None,
) -> PublicRunner:
    """Buzzard flies at exactly the pace to finish on the last day.
    Miles on day N = N × (totalMiles / totalDays) — SPEC §1."""
    miles = round(day_number * (config.totalMiles / config.totalDays), 4)
    display_miles = min(miles, config.totalMiles)
    current_mile = min(int(miles), 680)
    wp = waypoints.lookup(current_mile)
    loc_desc = descriptions.lookup(current_mile) if descriptions else ""

    if miles < config.totalMiles:
        pct = round(miles / config.totalMiles * 100, 2)
        comp_percent_str = f"{pct:.2f}%"
        proj_finish = config.endDate.isoformat()
    else:
        comp_percent_str = "100.00%"
        proj_finish = f"{config.totalDays} days"

    return PublicRunner(
        rank=0,
        rankDisplay="",
        bib=config.virtualCharacters.buzzard.bib,
        firstName="Buzzard",
        lastName="",
        displayName="Buzzard",
        event=config.abbreviation,
        home="US-TN",
        gender="M",
        age=0,
        miles=display_miles,
        km=round(display_miles * 1.60934, 2),
        compPercent=comp_percent_str,
        currentMile=current_mile,
        lat=wp.lat,
        lon=wp.lon,
        locationDescription=loc_desc,
        projectedFinish=proj_finish,
        projectedFinishDate=config.endDate.isoformat(),
        genderRank=None,
        eventGen=f"{config.abbreviation}M",
        virtual=True,
        virtualType="buzzard",
        lastActivityDate=None,
    )


def build_gingerbread_man(
    top_runner: PublicRunner,
    config: RaceConfig,
    waypoints: WaypointMap,
    descriptions: DescriptionMap | None,
    activities: list[Activity],
    as_of_date: date,
    overrides: dict,
) -> PublicRunner:
    """GBM is always 1 mile ahead of the current leader. Projection mirrors the leader's."""
    miles = round(top_runner.miles + 1.0, 4)
    display_miles = min(miles, config.totalMiles)
    current_mile = min(int(miles), 680)
    wp = waypoints.lookup(current_mile)
    loc_desc = descriptions.lookup(current_mile) if descriptions else ""

    if miles < config.totalMiles:
        pct = round(miles / config.totalMiles * 100, 2)
        comp_percent_str = f"{pct:.2f}%"
        proj_finish = top_runner.projectedFinish
    else:
        comp_percent_str = "100.00%"
        if top_runner.miles >= config.totalMiles:
            if top_runner.projectedFinish and "days" in top_runner.projectedFinish:
                try:
                    leader_days = int(top_runner.projectedFinish.split()[0])
                except ValueError:
                    leader_days = 30
                proj_finish = f"{max(1, leader_days - 1)} days"
            else:
                proj_finish = f"{config.totalDays - 1} days"
        else:
            # Gingerbread Man has finished but leader has not.
            # Find when the leader first reached 678.0 miles.
            runner_acts = [a for a in activities if a.bib == top_runner.bib and a.activityDate <= as_of_date]
            miles_by_date = defaultdict(float)
            for act in runner_acts:
                miles_by_date[act.activityDate] += parse_distance(act.tallyValue)
            adjustment = overrides.get(str(top_runner.bib), {}).get("milesAdjustment", 0.0)
            cumulative = 0.0
            gbm_days = None
            for d in sorted(miles_by_date.keys()):
                cumulative += miles_by_date[d]
                if round(cumulative + adjustment, 4) >= 678.0:
                    gbm_days = max(1, (d - config.startDate).days + 1)
                    break
            
            if gbm_days is not None:
                proj_finish = f"{gbm_days} days"
            else:
                proj_finish = f"{max(1, (as_of_date - config.startDate).days + 1)} days"

    return PublicRunner(
        rank=0,
        rankDisplay="#1",
        bib=config.virtualCharacters.gingerbreadMan.bib,
        firstName="Gingerbread",
        lastName="Man",
        displayName="Gingerbread Man",
        event=config.abbreviation,
        home="US-TN",
        gender="M",
        age=100,
        miles=display_miles,
        km=round(display_miles * 1.60934, 2),
        compPercent=comp_percent_str,
        currentMile=current_mile,
        lat=wp.lat,
        lon=wp.lon,
        locationDescription=loc_desc,
        projectedFinish=proj_finish,
        projectedFinishDate=top_runner.projectedFinishDate,
        genderRank=None,
        eventGen=f"{config.abbreviation}M",
        virtual=True,
        virtualType="gingerbread",
        lastActivityDate=None,
    )

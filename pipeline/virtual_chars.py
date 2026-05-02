"""Gingerbread Man and Buzzard virtual character builders per SPEC §1 and §4."""
from pipeline.descriptions import DescriptionMap
from pipeline.models import PublicRunner, RaceConfig
from pipeline.waypoints import WaypointMap


def build_buzzard(
    day_number: int,
    config: RaceConfig,
    waypoints: WaypointMap,
    descriptions: DescriptionMap | None,
) -> PublicRunner:
    """Buzzard flies at exactly the pace to finish on the last day.
    Miles on day N = N × (totalMiles / totalDays) — SPEC §1."""
    miles = round(day_number * (config.totalMiles / config.totalDays), 4)
    current_mile = min(int(miles), 680)
    wp = waypoints.lookup(current_mile)
    loc_desc = descriptions.lookup(current_mile) if descriptions else ""
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
        miles=miles,
        km=round(miles * 1.60934, 2),
        compPercent=round(miles / config.totalMiles * 100, 2),
        currentMile=current_mile,
        lat=wp.lat,
        lon=wp.lon,
        locationDescription=loc_desc,
        projectedFinish=config.endDate.isoformat(),
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
) -> PublicRunner:
    """GBM is always 1 mile ahead of the current leader. Projection mirrors the leader's."""
    miles = round(top_runner.miles + 1.0, 4)
    current_mile = min(int(miles), 680)
    wp = waypoints.lookup(current_mile)
    loc_desc = descriptions.lookup(current_mile) if descriptions else ""
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
        miles=miles,
        km=round(miles * 1.60934, 2),
        compPercent=round(miles / config.totalMiles * 100, 2),
        currentMile=current_mile,
        lat=wp.lat,
        lon=wp.lon,
        locationDescription=loc_desc,
        projectedFinish=top_runner.projectedFinish,
        projectedFinishDate=top_runner.projectedFinishDate,
        genderRank=None,
        eventGen=f"{config.abbreviation}M",
        virtual=True,
        virtualType="gingerbread",
        lastActivityDate=None,
    )

import re
from pathlib import Path
import gpxpy
from pipeline.models import Waypoint

_MILE_NAME_RE = re.compile(r"^\d{3}$")


class WaypointMap:
    def __init__(self, waypoints: dict[int, Waypoint]) -> None:
        self._wpts = waypoints

    def lookup(self, mile: int) -> Waypoint:
        mile = max(0, min(mile, 680))
        return self._wpts[mile]

    def __len__(self) -> int:
        return len(self._wpts)


def parse_gpx(path: Path) -> WaypointMap:
    """Parse GPX waypoints named '000'–'680' into a mile→Waypoint map."""
    with open(path) as f:
        gpx = gpxpy.parse(f)

    wpts: dict[int, Waypoint] = {}
    for wpt in gpx.waypoints:
        if wpt.name and _MILE_NAME_RE.match(wpt.name):
            mile = int(wpt.name)
            wpts[mile] = Waypoint(mile=mile, lat=wpt.latitude, lon=wpt.longitude)

    return WaypointMap(wpts)

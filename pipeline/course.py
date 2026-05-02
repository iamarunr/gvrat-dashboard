"""Build course.geojson from the race GPX file.

Output: one LineString for the route polyline + 681 Point features for mile markers.
Track points are sampled every 10th point (~2000 coords) for a compact bundle.
"""
import json
import logging
from pathlib import Path

import gpxpy

log = logging.getLogger(__name__)

_TRACK_SAMPLE = 10   # keep every Nth track point for the route polyline


def build_course_geojson(gpx_path: Path, out_path: Path) -> None:
    with open(gpx_path) as f:
        gpx = gpxpy.parse(f)

    features = []

    # Route polyline from track points (sampled)
    coords: list[list[float]] = []
    for track in gpx.tracks:
        for seg in track.segments:
            pts = seg.points
            sampled = pts[::_TRACK_SAMPLE]
            # Always include the final point so the line ends exactly at the finish
            if pts and pts[-1] not in sampled:
                sampled = list(sampled) + [pts[-1]]
            for p in sampled:
                coords.append([round(p.longitude, 6), round(p.latitude, 6)])

    features.append({
        "type": "Feature",
        "geometry": {"type": "LineString", "coordinates": coords},
        "properties": {"type": "route"},
    })
    log.info("Route: %d track points → %d sampled", sum(
        len(s.points) for t in gpx.tracks for s in t.segments
    ), len(coords))

    # Mile markers from named waypoints "000"–"680"
    import re
    _mile_re = re.compile(r"^\d{3}$")
    for wpt in gpx.waypoints:
        if wpt.name and _mile_re.match(wpt.name):
            mile = int(wpt.name)
            features.append({
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [round(wpt.longitude, 6), round(wpt.latitude, 6)],
                },
                "properties": {"mile": mile, "type": "waypoint"},
            })

    log.info("Waypoints: %d mile markers", len(features) - 1)

    geojson = {"type": "FeatureCollection", "features": features}
    out_path.write_text(json.dumps(geojson, separators=(",", ":")), encoding="utf-8")
    size_kb = out_path.stat().st_size / 1024
    log.info("Wrote %s (%.1f KB)", out_path, size_kb)

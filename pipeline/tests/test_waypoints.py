from pathlib import Path
import pytest
from pipeline.waypoints import parse_gpx

FIXTURES = Path(__file__).parent / "fixtures"


@pytest.fixture(scope="module")
def wmap():
    return parse_gpx(FIXTURES / "route.gpx")


def test_mile_0_coordinates(wmap):
    wp = wmap.lookup(0)
    assert wp.lat == pytest.approx(37.071815, abs=1e-5)
    assert wp.lon == pytest.approx(-94.741077, abs=1e-5)


def test_mile_680_is_valid(wmap):
    wp = wmap.lookup(680)
    assert -90 <= wp.lat <= 90
    assert -180 <= wp.lon <= 180


def test_lookup_clamps_below_zero(wmap):
    assert wmap.lookup(-5) == wmap.lookup(0)


def test_lookup_clamps_above_680(wmap):
    assert wmap.lookup(999) == wmap.lookup(680)


def test_681_waypoints_loaded(wmap):
    assert len(wmap) == 681

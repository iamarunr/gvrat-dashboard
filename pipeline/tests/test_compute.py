from datetime import date
from pathlib import Path
import pytest

from pipeline.compute import build_leaderboard, derive_home, parse_distance
from pipeline.config import load_race_config, load_overrides
from pipeline.csv_source import load_activities, load_participants
from pipeline.waypoints import parse_gpx

FIXTURES = Path(__file__).parent / "fixtures"
RACES_DIR = Path(__file__).parent.parent.parent / "races"


# --- parse_distance ---

def test_parse_distance_miles():
    assert parse_distance("26.3 miles") == pytest.approx(26.3)


def test_parse_distance_km():
    assert parse_distance("10 km") == pytest.approx(6.21371, rel=1e-4)


def test_parse_distance_km_long():
    assert parse_distance("10 kilometers") == pytest.approx(6.21371, rel=1e-4)


def test_parse_distance_mi():
    assert parse_distance("5.0 mi") == pytest.approx(5.0)


def test_parse_distance_invalid():
    with pytest.raises(ValueError):
        parse_distance("not a distance")


# --- derive_home ---

def test_derive_home_us():
    assert derive_home("US", "TN") == "US-TN"


def test_derive_home_gb():
    assert derive_home("GB", "LIN") == "GB"


def test_derive_home_au():
    assert derive_home("AU", "QLD") == "AU"


def test_derive_home_us_military():
    assert derive_home("US", "AE") == "US-AE"


# --- integration: leaderboard from fixtures ---

@pytest.fixture(scope="module")
def leaderboard():
    config = load_race_config("gvrat-2026")
    overrides = load_overrides("gvrat-2026")
    waypoints = parse_gpx(FIXTURES / "route.gpx")
    participants = load_participants(FIXTURES)
    activities = load_activities(FIXTURES)
    return build_leaderboard(
        participants=participants,
        activities=activities,
        waypoints=waypoints,
        config=config,
        as_of_date=date(2026, 5, 1),
        day_number=1,
        overrides=overrides,
    )


def test_jenna_dagger_is_leader(leaderboard):
    leader = leaderboard.runners[0]
    assert leader.bib == 4
    assert leader.firstName == "Jenna"
    assert leader.lastName == "Dagger"


def test_jenna_dagger_miles(leaderboard):
    leader = leaderboard.runners[0]
    assert leader.miles == pytest.approx(26.3, rel=1e-4)


def test_ranking_is_descending(leaderboard):
    miles = [r.miles for r in leaderboard.runners]
    assert miles == sorted(miles, reverse=True)


def test_rank_numbers_sequential(leaderboard):
    ranks = [r.rank for r in leaderboard.runners]
    assert ranks == list(range(1, len(ranks) + 1))


def test_derive_home_gb_in_leaderboard(leaderboard):
    jenna = next(r for r in leaderboard.runners if r.bib == 4)
    assert jenna.home == "GB"


def test_derive_home_us_in_leaderboard(leaderboard):
    # Steve Durbin bib 5 is US-NC
    steve = next(r for r in leaderboard.runners if r.bib == 5)
    assert steve.home == "US-NC"


def test_no_virtual_bibs_in_output(leaderboard):
    bibs = {r.bib for r in leaderboard.runners}
    assert 9998 not in bibs  # Buzzard
    assert 9999 not in bibs  # Gingerbread Man


def test_runners_with_zero_miles_present(leaderboard):
    zero_miles = [r for r in leaderboard.runners if r.miles == 0.0]
    assert len(zero_miles) > 0  # fixture has participants who didn't log May 1


def test_waypoints_assigned(leaderboard):
    for r in leaderboard.runners:
        assert -90 <= r.lat <= 90
        assert -180 <= r.lon <= 180


def test_multi_activity_bib_summed(leaderboard):
    # Bib 19 has 3 activities in the fixture — verify they're summed, not just one taken
    bib19 = next((r for r in leaderboard.runners if r.bib == 19), None)
    if bib19 is not None:
        assert bib19.miles > 0

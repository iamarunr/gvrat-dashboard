from datetime import date
from pathlib import Path
import pytest

from pipeline.compute import build_leaderboard
from pipeline.config import load_race_config, load_overrides
from pipeline.csv_source import load_activities, load_participants
from pipeline.descriptions import load_descriptions
from pipeline.waypoints import parse_gpx

FIXTURES = Path(__file__).parent / "fixtures"


@pytest.fixture(scope="module")
def lb():
    config = load_race_config("gvrat-2026")
    overrides = load_overrides("gvrat-2026")
    waypoints = parse_gpx(FIXTURES / "route.gpx")
    participants = load_participants(FIXTURES)
    activities = load_activities(FIXTURES)
    descriptions = load_descriptions("gvrat-2026")
    return build_leaderboard(
        participants=participants,
        activities=activities,
        waypoints=waypoints,
        config=config,
        as_of_date=date(2026, 5, 1),
        day_number=1,
        overrides=overrides,
        descriptions=descriptions,
    )


# --- Buzzard unit tests (no fixture required) ---

def test_buzzard_day1_miles():
    from pipeline.config import load_race_config
    from pipeline.waypoints import parse_gpx
    from pipeline.virtual_chars import build_buzzard
    config = load_race_config("gvrat-2026")
    waypoints = parse_gpx(FIXTURES / "route.gpx")
    b = build_buzzard(1, config, waypoints, None)
    assert b.miles == pytest.approx(679 / 153, rel=1e-4)


def test_buzzard_day153_miles():
    from pipeline.config import load_race_config
    from pipeline.waypoints import parse_gpx
    from pipeline.virtual_chars import build_buzzard
    config = load_race_config("gvrat-2026")
    waypoints = parse_gpx(FIXTURES / "route.gpx")
    b = build_buzzard(153, config, waypoints, None)
    assert b.miles == pytest.approx(679, rel=1e-4)


# --- Integration tests via lb fixture ---

def test_buzzard_in_leaderboard(lb):
    bibs = {r.bib for r in lb.runners}
    assert 9998 in bibs


def test_gbm_in_leaderboard(lb):
    bibs = {r.bib for r in lb.runners}
    assert 9999 in bibs


def test_gbm_miles_is_leader_plus_one(lb):
    gbm = next(r for r in lb.runners if r.bib == 9999)
    real_leader = next(r for r in lb.runners if not r.virtual)
    assert gbm.miles == pytest.approx(real_leader.miles + 1.0, rel=1e-4)


def test_gbm_rank_display_is_hash_one(lb):
    gbm = next(r for r in lb.runners if r.bib == 9999)
    assert gbm.rankDisplay == "#1"


def test_gbm_has_higher_miles_than_any_real_runner(lb):
    gbm = next(r for r in lb.runners if r.bib == 9999)
    real_miles = [r.miles for r in lb.runners if not r.virtual]
    assert gbm.miles > max(real_miles)


def test_virtual_chars_have_no_gender_rank(lb):
    for r in lb.runners:
        if r.virtual:
            assert r.genderRank is None, f"bib {r.bib} is virtual but has genderRank={r.genderRank}"


def test_real_runners_have_gender_rank(lb):
    # Gender ranks are assigned for M and F only; X/other genders are left as None
    mf_runners = [r for r in lb.runners if not r.virtual and r.gender in ("M", "F")]
    for r in mf_runners:
        assert r.genderRank is not None, f"bib {r.bib} gender={r.gender} has no genderRank"


def test_gender_ranks_sequential_m(lb):
    m_ranks = sorted(r.genderRank for r in lb.runners if not r.virtual and r.gender == "M")
    assert m_ranks == list(range(1, len(m_ranks) + 1))


def test_gender_ranks_sequential_f(lb):
    f_ranks = sorted(r.genderRank for r in lb.runners if not r.virtual and r.gender == "F")
    assert f_ranks == list(range(1, len(f_ranks) + 1))

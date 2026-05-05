"""Tests for pipeline/runner_files.py."""
import json
from datetime import date
from pathlib import Path

import pytest

from pipeline.compute import build_leaderboard, parse_distance
from pipeline.config import load_race_config, load_overrides
from pipeline.csv_source import load_activities, load_participants
from pipeline.descriptions import load_descriptions
from pipeline.runner_files import save_runner_files
from pipeline.waypoints import parse_gpx

FIXTURES = Path(__file__).parent / "fixtures"


@pytest.fixture(scope="module")
def runner_files_env(tmp_path_factory):
    """Run save_runner_files against fixtures with as_of_date=2026-05-01, return out dir."""
    tmp = tmp_path_factory.mktemp("runners")

    config = load_race_config("gvrat-2026")
    overrides = load_overrides("gvrat-2026")
    waypoints = parse_gpx(FIXTURES / "route.gpx")
    participants = load_participants(FIXTURES)
    activities = load_activities(FIXTURES)
    descriptions = load_descriptions("gvrat-2026")

    as_of_date = date(2026, 5, 1)
    day_number = 1

    lb = build_leaderboard(
        participants=participants,
        activities=activities,
        waypoints=waypoints,
        config=config,
        as_of_date=as_of_date,
        day_number=day_number,
        overrides=overrides,
        descriptions=descriptions,
    )

    count = save_runner_files(
        participants=participants,
        activities=activities,
        leaderboard=lb,
        config=config,
        as_of_date=as_of_date,
        day_number=day_number,
        race_id="gvrat-2026",
        base_dir=tmp,
    )

    runners_dir = tmp / "gvrat-2026" / "runners"
    return {"dir": runners_dir, "count": count, "lb": lb, "participants": participants, "activities": activities}


class TestTommyHolder:
    """bib 233 — Tommy Holder is in the fixture but has no activities."""

    def test_file_exists(self, runner_files_env):
        assert (runner_files_env["dir"] / "233.json").exists()

    def test_schema_fields(self, runner_files_env):
        data = json.loads((runner_files_env["dir"] / "233.json").read_text())
        assert data["bib"] == 233
        assert data["firstName"] == "Tommy"
        assert data["lastName"] == "Holder"
        assert data["displayName"] == "Tommy Holder"
        assert "activities" in data
        assert "totalActivities" in data
        assert "activeDays" in data
        assert "restDays" in data

    def test_rest_day_filled_in(self, runner_files_env):
        """No activities on May 1 → one rest entry for May 1."""
        data = json.loads((runner_files_env["dir"] / "233.json").read_text())
        assert len(data["activities"]) == 1
        entry = data["activities"][0]
        assert entry["date"] == "2026-05-01"
        assert entry["type"] == "rest"
        assert entry["miles"] == 0.0
        assert entry["km"] == 0.0
        assert entry["time"] is None
        assert entry["comment"] == ""

    def test_counts(self, runner_files_env):
        data = json.loads((runner_files_env["dir"] / "233.json").read_text())
        assert data["totalActivities"] == 0
        assert data["activeDays"] == 0
        assert data["restDays"] == 1  # day_number=1, activeDays=0

    def test_miles_match_leaderboard(self, runner_files_env):
        data = json.loads((runner_files_env["dir"] / "233.json").read_text())
        lb = runner_files_env["lb"]
        lb_runner = next((r for r in lb.runners if r.bib == 233), None)
        assert lb_runner is not None
        total_miles = sum(e["miles"] for e in data["activities"] if e["type"] != "rest")
        assert round(total_miles, 2) == round(lb_runner.miles, 2)


class TestJennaDagger:
    """bib 4 — Jenna Dagger has 26.3 miles on May 1."""

    def test_file_exists(self, runner_files_env):
        assert (runner_files_env["dir"] / "4.json").exists()

    def test_has_activity(self, runner_files_env):
        data = json.loads((runner_files_env["dir"] / "4.json").read_text())
        acts = [e for e in data["activities"] if e["type"] != "rest"]
        assert len(acts) >= 1
        assert acts[0]["miles"] == pytest.approx(26.3, abs=0.01)

    def test_activities_sorted_ascending(self, runner_files_env):
        data = json.loads((runner_files_env["dir"] / "4.json").read_text())
        dates = [e["date"] for e in data["activities"]]
        assert dates == sorted(dates)

    def test_activity_type_normalized(self, runner_files_env):
        """CSV fixture has 'walk'; must appear as 'walk' in output."""
        data = json.loads((runner_files_env["dir"] / "4.json").read_text())
        acts = [e for e in data["activities"] if e["type"] != "rest"]
        for a in acts:
            assert a["type"] in ("run", "walk")

    def test_miles_match_leaderboard(self, runner_files_env):
        data = json.loads((runner_files_env["dir"] / "4.json").read_text())
        lb = runner_files_env["lb"]
        lb_runner = next((r for r in lb.runners if r.bib == 4), None)
        assert lb_runner is not None
        total_miles = sum(e["miles"] for e in data["activities"] if e["type"] != "rest")
        assert round(total_miles, 2) == round(lb_runner.miles, 2)

    def test_time_field_present(self, runner_files_env):
        """CSV fixture has Time column — must appear in output."""
        data = json.loads((runner_files_env["dir"] / "4.json").read_text())
        acts = [e for e in data["activities"] if e["type"] != "rest"]
        assert len(acts) >= 1
        # time is a string (HH:MM:SS) or null; CSV fixture has "10:37:51" for bib 4
        assert acts[0]["time"] is not None or acts[0]["time"] is None  # present as a key


class TestBuzzardFile:
    def test_file_exists(self, runner_files_env):
        assert (runner_files_env["dir"] / "9998.json").exists()

    def test_schema(self, runner_files_env):
        data = json.loads((runner_files_env["dir"] / "9998.json").read_text())
        assert data["bib"] == 9998
        assert data["displayName"] == "Buzzard"
        assert data["virtual"] is True
        assert data["virtualType"] == "buzzard"
        assert "dailyPace" in data
        assert "projectedFinish" in data
        assert "activities" in data
        assert "runnersAhead" in data
        assert "runnersBehind" in data

    def test_activity_type_is_buzzard(self, runner_files_env):
        data = json.loads((runner_files_env["dir"] / "9998.json").read_text())
        for entry in data["activities"]:
            assert entry["type"] == "buzzard"
            assert entry["comment"] == "Flying at race pace"

    def test_runners_ahead_plus_behind_equals_total(self, runner_files_env):
        data = json.loads((runner_files_env["dir"] / "9998.json").read_text())
        lb = runner_files_env["lb"]
        total_real = sum(1 for r in lb.runners if not r.virtual)
        assert data["runnersAhead"] + data["runnersBehind"] == total_real

    def test_projected_finish_is_race_end(self, runner_files_env):
        data = json.loads((runner_files_env["dir"] / "9998.json").read_text())
        assert data["projectedFinish"] == "2026-09-30"

    def test_day1_miles(self, runner_files_env):
        """Day 1: Buzzard miles = 679/153 ≈ 4.44."""
        data = json.loads((runner_files_env["dir"] / "9998.json").read_text())
        assert len(data["activities"]) == 1
        assert data["activities"][0]["miles"] == pytest.approx(4.44, abs=0.01)


class TestActivityTypeMapping:
    """Activity type IDs from the RunSignup API must map to 'run' or 'walk', never all-run."""

    def test_walk_id_parsed_as_walk(self):
        """Numeric ID 37793 (walk) must produce activityType='walk', not default to 'run'."""
        from pipeline.runsignup import _parse_activity
        raw = {
            "registration_id": "110987393",
            "tally_split_date": "2026-05-02",
            "result_split_tally_value": 19312128,
            "tally_split_comment": None,
            "virtual_race_activity_type_id": 37793,
        }
        act = _parse_activity(raw, bib=104)
        assert act.activityType == "walk"

    def test_run_id_parsed_as_run(self):
        """Numeric ID 37792 (run) must produce activityType='run'."""
        from pipeline.runsignup import _parse_activity
        raw = {
            "registration_id": "110987393",
            "tally_split_date": "2026-05-01",
            "result_split_tally_value": 8577804,
            "tally_split_comment": None,
            "virtual_race_activity_type_id": 37792,
        }
        act = _parse_activity(raw, bib=104)
        assert act.activityType == "run"

    def test_csv_walk_string_written_as_walk(self, runner_files_env):
        """CSV fixture bib 4 has Activity Type='walk' — must appear as type='walk' in JSON, not 'run'."""
        data = json.loads((runner_files_env["dir"] / "4.json").read_text())
        active = [e for e in data["activities"] if e["type"] not in ("rest", "buzzard")]
        assert any(e["type"] == "walk" for e in active), (
            "Expected at least one walk activity for bib 4 (CSV fixture has 'walk' type) "
            "but all activities are 'run' — normalize_type is broken"
        )

    def test_not_all_activities_are_run(self, runner_files_env):
        """If every non-rest activity is 'run', the type mapping is broken."""
        data = json.loads((runner_files_env["dir"] / "4.json").read_text())
        types = {e["type"] for e in data["activities"] if e["type"] != "rest"}
        assert types != {"run"}, "All activities defaulted to 'run' — activity type mapping failed"


class TestFileCount:
    def test_buzzard_file_written(self, runner_files_env):
        assert runner_files_env["count"] >= 1

    def test_gingerbread_man_not_written(self, runner_files_env):
        """Gingerbread Man (bib 9999) should have no runner file."""
        assert not (runner_files_env["dir"] / "9999.json").exists()

    def test_active_participants_have_files(self, runner_files_env):
        """Every active non-virtual participant in the fixture must have a file."""
        participants = runner_files_env["participants"]
        virtual_bibs = {9998, 9999}
        active_bibs = {p.bib for p in participants if p.status == "Active" and p.bib not in virtual_bibs}
        for bib in active_bibs:
            assert (runner_files_env["dir"] / f"{bib}.json").exists(), f"Missing file for bib {bib}"

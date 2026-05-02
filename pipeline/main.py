"""CLI entry point: python -m pipeline.main --race gvrat-2026 [--from-csv path/]"""
import argparse
import json
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

from pipeline.config import load_overrides, load_race_config
from pipeline.compute import build_leaderboard
from pipeline.waypoints import parse_gpx


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="GVRAT pipeline")
    parser.add_argument("--race", required=True, help="Race ID, e.g. gvrat-2026")
    parser.add_argument("--from-csv", metavar="DIR", help="Load data from CSVs in DIR instead of the RunSignup API")
    args = parser.parse_args(argv)

    config = load_race_config(args.race)
    overrides = load_overrides(args.race)

    gpx_path = Path("races") / args.race / "route.gpx"
    waypoints = parse_gpx(gpx_path)
    print(f"Loaded {len(waypoints)} waypoints from {gpx_path}")

    # Fairness cutoff: asOfDate = yesterday UTC. See SPEC §1.
    as_of_date = (datetime.now(timezone.utc) - timedelta(days=1)).date()
    day_number = (as_of_date - config.startDate).days + 1

    if day_number < 1:
        print(f"WARNING: as_of_date {as_of_date} is before race start {config.startDate}; day_number={day_number}")

    if args.from_csv:
        from pipeline.csv_source import load_activities, load_participants
        csv_dir = Path(args.from_csv)
        participants = load_participants(csv_dir)
        activities = load_activities(csv_dir)
        print(f"Loaded {len(participants)} participants, {len(activities)} activities from {csv_dir}")
    else:
        print("ERROR: --from-csv is required in Session 2. RunSignup API client is Session 4.", file=sys.stderr)
        return 1

    leaderboard = build_leaderboard(
        participants=participants,
        activities=activities,
        waypoints=waypoints,
        config=config,
        as_of_date=as_of_date,
        day_number=day_number,
        overrides=overrides,
    )

    out_dir = Path("data") / args.race
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / "leaderboard.json"
    out_path.write_text(
        json.dumps(leaderboard.model_dump(), indent=2, default=str),
        encoding="utf-8",
    )
    print(f"Written {len(leaderboard.runners)} runners to {out_path}")
    if leaderboard.runners:
        leader = leaderboard.runners[0]
        print(f"Leader: {leader.displayName} (bib {leader.bib}) — {leader.miles} miles")
    return 0


if __name__ == "__main__":
    sys.exit(main())

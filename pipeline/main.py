"""CLI entry point: python -m pipeline.main --race gvrat-2026 [--from-csv path/] [--as-of-date YYYY-MM-DD]"""
import argparse
import json
import sys
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

from pipeline.config import load_overrides, load_race_config
from pipeline.compute import build_leaderboard
from pipeline.descriptions import load_descriptions
from pipeline.snapshots import save_snapshot
from pipeline.waypoints import parse_gpx


def _build_meta(leaderboard, config, participants) -> dict:
    real_runners = [r for r in leaderboard.runners if not r.virtual]
    leader = real_runners[0] if real_runners else None
    as_of = date.fromisoformat(leaderboard.asOfDate)
    next_day = as_of + timedelta(days=1)
    fmt = lambda d: d.strftime("%m-%d-%Y")
    banner = (
        f"Day {leaderboard.dayNumber}: {fmt(as_of)}. "
        f"Results below are updated as of {fmt(next_day)} and include everything through "
        f"the end of the last FULL day ({fmt(as_of)}) for ALL TIME ZONES. "
        f"Any submitted results for the next day ({fmt(next_day)}) are not included in these totals."
    )
    return {
        "race": config.id,
        "lastUpdatedUtc": leaderboard.lastUpdatedUtc,
        "asOfDate": leaderboard.asOfDate,
        "dayNumber": leaderboard.dayNumber,
        "totalDays": leaderboard.totalDays,
        "totalRunnersRegistered": len(participants),
        "totalRunnersActive": len(real_runners),
        "totalMilesLogged": round(sum(r.miles for r in real_runners), 2),
        "leaderMiles": leader.miles if leader else 0.0,
        "leaderName": leader.displayName if leader else "",
        "asOfBannerText": banner,
    }


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="GVRAT pipeline")
    parser.add_argument("--race", required=True, help="Race ID, e.g. gvrat-2026")
    parser.add_argument("--from-csv", metavar="DIR", help="Load data from CSVs in DIR instead of the RunSignup API")
    parser.add_argument("--as-of-date", metavar="YYYY-MM-DD", help="Override the as-of date (for testing)")
    args = parser.parse_args(argv)

    config = load_race_config(args.race)
    overrides = load_overrides(args.race)
    descriptions = load_descriptions(args.race)

    gpx_path = Path("races") / args.race / "route.gpx"
    waypoints = parse_gpx(gpx_path)
    print(f"Loaded {len(waypoints)} waypoints from {gpx_path}")

    # Fairness cutoff: asOfDate = yesterday UTC. See SPEC §1.
    if args.as_of_date:
        as_of_date = date.fromisoformat(args.as_of_date)
    else:
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
        print("ERROR: --from-csv is required in Session 2-3. RunSignup API client is Session 4.", file=sys.stderr)
        return 1

    leaderboard = build_leaderboard(
        participants=participants,
        activities=activities,
        waypoints=waypoints,
        config=config,
        as_of_date=as_of_date,
        day_number=day_number,
        overrides=overrides,
        descriptions=descriptions,
    )

    out_dir = Path("data") / args.race
    out_dir.mkdir(parents=True, exist_ok=True)

    # Write leaderboard.json
    lb_path = out_dir / "leaderboard.json"
    lb_path.write_text(
        json.dumps(leaderboard.model_dump(), indent=2, default=str),
        encoding="utf-8",
    )

    # Write meta.json
    meta = _build_meta(leaderboard, config, participants)
    (out_dir / "meta.json").write_text(
        json.dumps(meta, indent=2),
        encoding="utf-8",
    )

    # Write snapshot
    snap_path = save_snapshot(leaderboard, args.race, as_of_date)

    real_runners = [r for r in leaderboard.runners if not r.virtual]
    print(f"Written {len(leaderboard.runners)} runners ({len(real_runners)} real) to {lb_path}")
    print(f"Snapshot: {snap_path}")
    print(f"Meta: {out_dir / 'meta.json'}")
    if real_runners:
        leader = real_runners[0]
        print(f"Leader: {leader.displayName} (bib {leader.bib}) — {leader.miles} miles")
    return 0


if __name__ == "__main__":
    sys.exit(main())

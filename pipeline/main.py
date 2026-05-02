"""CLI entry point: python -m pipeline.main --race gvrat-2026 [--from-csv path/] [--as-of-date YYYY-MM-DD] [--max-runners N]"""
import argparse
import json
import logging
import os
import sys
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

from pipeline.config import load_overrides, load_race_config
from pipeline.compute import build_leaderboard
from pipeline.descriptions import load_descriptions
from pipeline.snapshots import save_snapshot
from pipeline.waypoints import parse_gpx

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger(__name__)


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
    parser.add_argument("--from-csv", metavar="DIR", help="Load data from CSVs in DIR (skips live API)")
    parser.add_argument("--as-of-date", metavar="YYYY-MM-DD", help="Override the as-of date (for testing)")
    parser.add_argument("--max-runners", metavar="N", type=int, default=None,
                        help="Fetch activities for at most N runners (development/testing)")
    parser.add_argument("--rebuild-course", action="store_true",
                        help="(Re)generate course.geojson from the GPX file and exit")
    args = parser.parse_args(argv)

    config = load_race_config(args.race)
    overrides = load_overrides(args.race)
    descriptions = load_descriptions(args.race)

    gpx_path = Path("races") / args.race / "route.gpx"

    if args.rebuild_course:
        from pipeline.course import build_course_geojson
        out_dir = Path("data") / args.race
        out_dir.mkdir(parents=True, exist_ok=True)
        build_course_geojson(gpx_path, out_dir / "course.json")
        return 0

    waypoints = parse_gpx(gpx_path)
    log.info("Loaded %d waypoints from %s", len(waypoints), gpx_path)

    # Fairness cutoff: asOfDate = yesterday UTC. See SPEC §1.
    if args.as_of_date:
        as_of_date = date.fromisoformat(args.as_of_date)
    else:
        as_of_date = (datetime.now(timezone.utc) - timedelta(days=1)).date()
    day_number = (as_of_date - config.startDate).days + 1

    if day_number < 1:
        log.warning("as_of_date %s is before race start %s; day_number=%d", as_of_date, config.startDate, day_number)

    if args.from_csv:
        from pipeline.ingestion.csv_source import CsvSource
        source = CsvSource(Path(args.from_csv))
        participants = source.load_participants()
        activities = source.load_activities()
        log.info("Loaded %d participants, %d activities from %s", len(participants), len(activities), args.from_csv)
    else:
        api_key = os.environ.get("RUNSIGNUP_API_KEY", "")
        api_secret = os.environ.get("RUNSIGNUP_API_SECRET", "")
        if not api_key or not api_secret:
            print(
                "ERROR: RUNSIGNUP_API_KEY and RUNSIGNUP_API_SECRET must be set, "
                "or use --from-csv for CSV mode.",
                file=sys.stderr,
            )
            return 1

        from pipeline.runsignup import ApiSource
        api = ApiSource(max_runners=args.max_runners)

        # Fetch participants for both event IDs (separate paginated calls per event)
        participants = api.load_participants(config.runsignup.raceId, config.runsignup.eventIds)
        log.info("Loaded %d participants from RunSignup API", len(participants))

        # Confirm activity types before fetching activities
        api.fetch_activity_types(config.runsignup.raceId, config.runsignup.eventIds[0])

        # Skip virtual character bibs when fetching activities
        virtual_bibs = {
            config.virtualCharacters.gingerbreadMan.bib,
            config.virtualCharacters.buzzard.bib,
        }
        activities = api.load_activities(
            config.runsignup.raceId,
            participants,
            event_ids=config.runsignup.eventIds,
            virtual_bibs=virtual_bibs,
        )
        log.info("Loaded %d activity records from RunSignup API", len(activities))

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
    log.info("Written %d runners (%d real) to %s", len(leaderboard.runners), len(real_runners), lb_path)
    log.info("Snapshot: %s", snap_path)
    log.info("Meta: %s", out_dir / "meta.json")
    if real_runners:
        leader = real_runners[0]
        log.info("Leader: %s (bib %d) — %.4f miles", leader.displayName, leader.bib, leader.miles)

    # Print top-5 for quick review
    print(f"\nTop 5 runners (as of {as_of_date}):")
    for r in leaderboard.runners[:5]:
        label = f"[virtual:{r.virtualType}]" if r.virtual else ""
        print(f"  rank={r.rank} bib={r.bib} {r.displayName} {r.miles:.4f} mi {label}")

    return 0


if __name__ == "__main__":
    sys.exit(main())

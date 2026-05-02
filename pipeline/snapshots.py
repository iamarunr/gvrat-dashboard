"""Daily snapshot writer — copies leaderboard.json to snapshots/{asOfDate}.json."""
import json
import logging
from datetime import date
from pathlib import Path

from pipeline.models import LeaderboardOutput

logger = logging.getLogger(__name__)


def save_snapshot(leaderboard: LeaderboardOutput, race_id: str, as_of_date: date) -> Path:
    out_dir = Path("data") / race_id / "snapshots"
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / f"{as_of_date.isoformat()}.json"
    if out_path.exists():
        logger.warning("Overwriting existing snapshot for %s", as_of_date)
    out_path.write_text(
        json.dumps(leaderboard.model_dump(), indent=2, default=str),
        encoding="utf-8",
    )
    return out_path

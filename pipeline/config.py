from pathlib import Path
from pipeline.models import RaceConfig


def load_race_config(race_id: str) -> RaceConfig:
    path = Path("races") / race_id / "config.json"
    return RaceConfig.model_validate_json(path.read_text())


def load_overrides(race_id: str) -> dict:
    path = Path("races") / race_id / "overrides.json"
    if not path.exists():
        return {}
    import json
    return json.loads(path.read_text())

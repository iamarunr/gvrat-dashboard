"""CsvSource — loads participants and activities from RunSignup-exported CSV files."""
from pathlib import Path

from pipeline.csv_source import load_activities as _load_activities
from pipeline.csv_source import load_participants as _load_participants
from pipeline.models import Activity, Participant


class CsvSource:
    """Implements the Source protocol using CSV files exported from RunSignup."""

    def __init__(self, csv_dir: Path):
        self._dir = Path(csv_dir)

    def load_participants(self) -> list[Participant]:
        return _load_participants(self._dir)

    def load_activities(self, participants: list[Participant] = None) -> list[Activity]:
        return _load_activities(self._dir)

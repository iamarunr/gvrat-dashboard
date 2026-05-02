"""Abstract Source protocol — both CsvSource and ApiSource satisfy this interface."""
from typing import Protocol, runtime_checkable

from pipeline.models import Activity, Participant


@runtime_checkable
class Source(Protocol):
    def load_participants(self) -> list[Participant]: ...
    def load_activities(self, participants: list[Participant]) -> list[Activity]: ...

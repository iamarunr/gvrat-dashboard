"""CSV ingestion — reads RunSignup export CSVs from a directory."""
import csv
from datetime import date
from pathlib import Path

from pipeline.models import Activity, Participant


def _parse_date(s: str) -> date:
    return date.fromisoformat(s.strip())


def _int_or(s: str, default: int = 0) -> int:
    try:
        return int(s.strip())
    except (ValueError, AttributeError):
        return default


def load_participants(csv_dir: Path) -> list[Participant]:
    participants: list[Participant] = []
    for path in sorted(csv_dir.glob("participants-*.csv")):
        with open(path, newline="", encoding="utf-8-sig") as f:
            for row in csv.DictReader(f):
                participants.append(Participant(
                    registrationId=row["Registration ID"].strip(),
                    bib=int(row["Bib"].strip()),
                    firstName=row["First Name"].strip(),
                    lastName=row["Last Name"].strip(),
                    gender=row["Gender"].strip(),
                    age=_int_or(row.get("Age", "0")),
                    city=row.get("City", "").strip(),
                    state=row.get("State", "").strip(),
                    country=row.get("Country", "").strip(),
                    event=row.get("Event", "").strip(),
                    status=row.get("Status", "").strip(),
                ))
    return participants


def load_activities(csv_dir: Path) -> list[Activity]:
    activities: list[Activity] = []
    for path in sorted(csv_dir.glob("activities-*.csv")):
        with open(path, newline="", encoding="utf-8-sig") as f:
            for row in csv.DictReader(f):
                raw_date = row.get("Activity Date", "").strip()
                if not raw_date:
                    continue
                activities.append(Activity(
                    registrationId=row["Registration ID"].strip(),
                    bib=int(row["Bib No."].strip()),
                    activityDate=_parse_date(raw_date),
                    tallyValue=row["Tally Value"].strip(),
                    activityType=row.get("Activity Type", "").strip(),
                ))
    return activities

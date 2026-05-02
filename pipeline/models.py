from __future__ import annotations
from datetime import date
from typing import Optional
from pydantic import BaseModel


class VirtualCharacterConfig(BaseModel):
    bib: int
    registeredInRunSignup: bool


class VirtualCharactersConfig(BaseModel):
    gingerbreadMan: VirtualCharacterConfig
    buzzard: VirtualCharacterConfig


class RunSignupConfig(BaseModel):
    raceId: Optional[int]
    eventIds: list[int]


class RaceConfig(BaseModel):
    id: str
    name: str
    shortName: str
    abbreviation: str
    totalMiles: float
    startDate: date
    endDate: date
    totalDays: int
    runsignup: RunSignupConfig
    virtualCharacters: VirtualCharactersConfig


class Participant(BaseModel):
    """Internal model — contains only the fields we extract from source data.
    PII (email, phone, address, DOB, zip) is never loaded into this model."""
    registrationId: str
    bib: int
    firstName: str
    lastName: str
    gender: str
    age: int
    city: str
    state: str
    country: str
    event: str
    status: str


class Activity(BaseModel):
    registrationId: str
    bib: int
    activityDate: date
    tallyValue: str
    activityType: str


class Waypoint(BaseModel):
    mile: int
    lat: float
    lon: float


class PublicRunner(BaseModel):
    """Strict allowlist — only these fields may appear in public JSON output."""
    rank: int
    rankDisplay: str
    bib: int
    firstName: str
    lastName: str
    displayName: str
    event: str
    home: str
    gender: str
    age: int
    miles: float
    km: float
    compPercent: float
    currentMile: int
    lat: float
    lon: float
    locationDescription: str
    projectedFinish: Optional[str]
    projectedFinishDate: Optional[str]
    genderRank: Optional[int]
    eventGen: str
    virtual: bool
    virtualType: Optional[str]
    lastActivityDate: Optional[str]


class LeaderboardOutput(BaseModel):
    race: str
    lastUpdatedUtc: str
    asOfDate: str
    dayNumber: int
    totalDays: int
    runners: list[PublicRunner]

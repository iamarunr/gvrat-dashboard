import leaderboardRaw from "@data/gvrat-2026/leaderboard.json";
import metaRaw from "@data/gvrat-2026/meta.json";

export type Runner = {
  rank: number;
  rankDisplay: string;
  bib: number;
  firstName: string;
  lastName: string;
  displayName: string;
  event: string;
  home: string;
  gender: string;
  age: number;
  miles: number;
  km: number;
  compPercent: number;
  currentMile: number;
  lat: number;
  lon: number;
  locationDescription: string;
  projectedFinish: string;
  projectedFinishDate: string | null;
  genderRank: number | null;
  eventGen: string;
  virtual: boolean;
  virtualType: string | null;
  lastActivityDate: string | null;
};

export type LeaderboardData = {
  race: string;
  lastUpdatedUtc: string;
  asOfDate: string;
  dayNumber: number;
  totalDays: number;
  runners: Runner[];
};

export type MetaData = {
  race: string;
  lastUpdatedUtc: string;
  asOfDate: string;
  dayNumber: number;
  totalDays: number;
  totalRunnersRegistered: number;
  totalRunnersActive: number;
  totalMilesLogged: number;
  leaderMiles: number;
  leaderName: string;
  asOfBannerText: string;
};

export const leaderboardData = leaderboardRaw as unknown as LeaderboardData;
export const metaData = metaRaw as MetaData;

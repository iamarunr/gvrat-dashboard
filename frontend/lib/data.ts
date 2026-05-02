import leaderboardRaw from "@data/gvrat-2026/leaderboard.json";
import metaRaw from "@data/gvrat-2026/meta.json";
import courseRaw from "@data/gvrat-2026/course.json";

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

export type CourseRouteFeature = {
  type: "Feature";
  geometry: { type: "LineString"; coordinates: [number, number][] };
  properties: { type: "route" };
};

export type CourseWaypointFeature = {
  type: "Feature";
  geometry: { type: "Point"; coordinates: [number, number] };
  properties: { mile: number; type: "waypoint" };
};

export type CourseData = {
  type: "FeatureCollection";
  features: (CourseRouteFeature | CourseWaypointFeature)[];
};

export const leaderboardData = leaderboardRaw as unknown as LeaderboardData;
export const metaData = metaRaw as MetaData;
export const courseData = courseRaw as unknown as CourseData;

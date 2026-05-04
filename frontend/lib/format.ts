export function formatMiles(miles: number): string {
  return miles.toFixed(2);
}

export function formatKm(km: number): string {
  return km.toFixed(2);
}

export function formatCompPercent(pct: number): string {
  return pct.toFixed(2) + "%";
}

export function formatRank(rankDisplay: string): string {
  return rankDisplay;
}

export function formatProjFinish(proj: string): string {
  if (!proj || proj === "—" || proj === "FINISHED") return proj;
  const d = new Date(proj + "T00:00:00");
  if (isNaN(d.getTime())) return proj;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

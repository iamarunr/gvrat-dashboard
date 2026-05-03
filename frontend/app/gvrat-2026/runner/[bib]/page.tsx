import fs from "fs";
import path from "path";
import Link from "next/link";

const TOTAL_MILES = 679;
const DATA_DIR = path.join(process.cwd(), "..", "data", "gvrat-2026");
const NAVY = "#1B3F6E";
const GOLD = "#F4A623";
const RED = "#C0392B";
const GREEN = "#27AE60";
const DISPLAY = "'Barlow Condensed', sans-serif";

// Pueblo, CO finish line coords
const FINISH_LAT = 38.2544;
const FINISH_LON = -104.6091;

type ActivityEntry = {
  date: string;
  miles: number;
  km: number;
  type: "run" | "walk" | "rest" | "buzzard";
  time: string | null;
  comment: string;
};

type RunnerFile = {
  bib: number;
  firstName: string;
  lastName: string;
  displayName: string;
  activities: ActivityEntry[];
  totalActivities: number;
  activeDays: number;
  restDays: number;
  virtual?: boolean;
  virtualType?: string;
  dailyPace?: number;
  projectedFinish?: string;
  runnersAhead?: number;
  runnersBehind?: number;
};

type LbRunner = {
  rank: number;
  rankDisplay: string;
  bib: number;
  displayName: string;
  home: string;
  gender: string;
  age: number;
  miles: number;
  lat: number;
  lon: number;
  currentMile: number;
  locationDescription: string;
  projectedFinish: string;
  genderRank: number | null;
  virtual: boolean;
  virtualType: string | null;
};

export async function generateStaticParams() {
  const dir = path.join(DATA_DIR, "runners");
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => ({ bib: f.replace(".json", "") }));
}

function countryFlag(home: string): string {
  const code = home.startsWith("US-") ? "US" : home.split("-")[0];
  if (!code || code.length !== 2) return "";
  try {
    return String.fromCodePoint(
      ...Array.from(code.toUpperCase()).map((c) => 0x1f1e6 + c.charCodeAt(0) - 65)
    );
  } catch {
    return "";
  }
}

function daysUntilEnd(): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const end = new Date("2026-09-30T00:00:00");
  return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / 86400000));
}

function shortDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function longDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function SectionHeader({ title, sub }: { title: string; sub: string }) {
  return (
    <div
      style={{
        padding: "14px 20px 10px",
        borderBottom: "0.5px solid rgba(0,0,0,0.06)",
      }}
    >
      <div
        style={{
          fontFamily: DISPLAY,
          fontWeight: 700,
          fontSize: 14,
          textTransform: "uppercase",
          color: NAVY,
          letterSpacing: "0.08em",
        }}
      >
        {title}
      </div>
      {sub && (
        <div style={{ fontSize: 11, color: "rgba(0,0,0,0.4)", marginTop: 2 }}>{sub}</div>
      )}
    </div>
  );
}

function StatCard({
  value,
  sub,
  color,
}: {
  value: string;
  sub: string;
  color?: string;
}) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: 10,
        border: "0.5px solid rgba(0,0,0,0.07)",
        padding: "12px 14px",
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
    >
      <div
        className="stat-value"
        style={{
          fontFamily: DISPLAY,
          fontWeight: 800,
          fontSize: 22,
          lineHeight: 1.1,
          color: color || NAVY,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontFamily: DISPLAY,
          fontWeight: 400,
          fontSize: 9,
          textTransform: "uppercase",
          letterSpacing: "0.15em",
          color: "rgba(0,0,0,0.32)",
        }}
      >
        {sub}
      </div>
    </div>
  );
}

function ProgressBar({
  runnerMiles,
  markerPct,
  markerEmoji,
  markerTitle,
}: {
  runnerMiles: number;
  markerPct: number;
  markerEmoji: string;
  markerTitle: string;
}) {
  const fillPct = Math.min(100, (runnerMiles / TOTAL_MILES) * 100);
  const milesLeft = Math.max(0, TOTAL_MILES - runnerMiles);
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 6,
          fontSize: 11,
          color: "rgba(0,0,0,0.4)",
        }}
      >
        <span>
          <strong style={{ color: NAVY }}>{runnerMiles.toFixed(2)}</strong> miles completed
        </span>
        <span>
          <strong style={{ color: NAVY }}>{milesLeft.toFixed(2)}</strong> miles remaining
        </span>
      </div>
      <div
        style={{
          position: "relative",
          height: 10,
          background: "#eeece8",
          borderRadius: 5,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: `${fillPct}%`,
            height: "100%",
            background: "linear-gradient(90deg, #1B3F6E, #F4A623)",
            borderRadius: 5,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: `${Math.min(99, markerPct)}%`,
            top: -9,
            transform: "translateX(-50%)",
            fontSize: 13,
            lineHeight: 1,
            cursor: "default",
            userSelect: "none",
          }}
          title={markerTitle}
        >
          {markerEmoji}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 10,
          fontSize: 9,
          fontFamily: DISPLAY,
          textTransform: "uppercase",
          color: "rgba(0,0,0,0.28)",
          letterSpacing: "0.05em",
        }}
      >
        <span>Start · Baxter Springs, KS</span>
        <span>Finish · Pueblo, CO · 679 mi</span>
      </div>
    </div>
  );
}

export default async function RunnerPage({
  params,
}: {
  params: Promise<{ bib: string }>;
}) {
  const { bib } = await params;

  const filePath = path.join(DATA_DIR, "runners", `${bib}.json`);
  if (!fs.existsSync(filePath)) {
    return (
      <main style={{ padding: 40, textAlign: "center" }}>
        <p style={{ marginBottom: 16, color: "rgba(0,0,0,0.5)" }}>Runner not found.</p>
        <Link href="/gvrat-2026" style={{ color: NAVY, fontSize: 14 }}>
          ← Back to Leaderboard
        </Link>
      </main>
    );
  }

  const rf: RunnerFile = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const lb: { runners: LbRunner[] } = JSON.parse(
    fs.readFileSync(path.join(DATA_DIR, "leaderboard.json"), "utf-8")
  );

  const lr = lb.runners.find((r) => r.bib === Number(bib));
  const buzzardLb = lb.runners.find((r) => r.virtualType === "buzzard");
  const leaderLb = lb.runners.find((r) => !r.virtual);

  const bf: RunnerFile = JSON.parse(
    fs.readFileSync(path.join(DATA_DIR, "runners", "9998.json"), "utf-8")
  );

  const isBuzzard = rf.virtualType === "buzzard";
  const runnerMiles = lr?.miles ?? 0;
  const buzzMiles = buzzardLb?.miles ?? 0;
  const leaderMiles = leaderLb?.miles ?? 0;
  const pace = bf.dailyPace ?? 4.4379;

  const dl = daysUntilEnd();
  const milesLeft = Math.max(0, TOTAL_MILES - runnerMiles);
  const avgNeeded = dl > 0 ? milesLeft / dl : 999;
  const vsB = runnerMiles - buzzMiles;

  const genderLabel = lr?.gender === "F" ? "Female" : "Male";
  const isOverall1 = (lr?.rank ?? Infinity) === 1 && !lr?.virtual;
  const isFinished = !isBuzzard && runnerMiles >= TOTAL_MILES;

  const activeMiles = rf.activities
    .filter((a) => a.type !== "rest")
    .map((a) => a.miles);
  const maxDayMiles = activeMiles.length > 0 ? Math.max(...activeMiles) : 1;

  // Map coordinates
  const mapLat = isFinished ? FINISH_LAT : (lr?.lat ?? 0);
  const mapLon = isFinished ? FINISH_LON : (lr?.lon ?? 0);
  const hasCoords = mapLat !== 0 && mapLon !== 0;
  const mapUrl = hasCoords
    ? `https://tiles.stadiamaps.com/static/?lat=${mapLat}&lng=${mapLon}&zoom=10&width=740&height=220&style=alidade_smooth&markers=icon:small-red-dot|${mapLat},${mapLon}`
    : null;
  const mapLocationLabel = isFinished
    ? `🏁 FINISHED · Pueblo, CO · Mile 679 of 679`
    : `📍 ${lr?.locationDescription ?? "—"} · Mile ${lr?.currentMile ?? "—"} of 679`;

  const card: React.CSSProperties = {
    background: "white",
    border: "0.5px solid rgba(0,0,0,0.07)",
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 12,
  };

  return (
    <main style={{ background: "#f5f5f3", minHeight: "100vh" }}>
      {/* NavBar */}
      <nav
        style={{
          background: "white",
          borderBottom: "0.5px solid rgba(0,0,0,0.07)",
          padding: "12px 20px",
        }}
      >
        <Link
          href="/gvrat-2026"
          className="back-btn"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: NAVY,
            color: "#ffffff",
            fontFamily: DISPLAY,
            fontWeight: 700,
            fontSize: 12,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            padding: "6px 16px",
            borderRadius: 20,
            textDecoration: "none",
          }}
        >
          ← BACK TO LEADERBOARD
        </Link>
      </nav>

      {/* Contained content column */}
      <div className="runner-container">
        {/* Hero Card */}
        <div style={{ ...card, padding: 24, marginTop: 20 }}>
          {isBuzzard ? (
            <>
              <div style={{ marginBottom: 20 }}>
                <h1
                  style={{
                    fontFamily: DISPLAY,
                    fontWeight: 800,
                    fontSize: 30,
                    color: RED,
                    margin: 0,
                  }}
                >
                  🦅 Buzzard
                </h1>
                <p style={{ fontSize: 11, color: "rgba(0,0,0,0.4)", margin: "4px 0 0" }}>
                  The pace you must beat to finish by Sep 30
                </p>
              </div>
              <ProgressBar
                runnerMiles={buzzMiles}
                markerPct={(leaderMiles / TOTAL_MILES) * 100}
                markerEmoji="⭐"
                markerTitle={`Leader — ${leaderMiles.toFixed(2)} mi`}
              />
              <div
                style={{
                  borderTop: "0.5px solid rgba(0,0,0,0.06)",
                  marginTop: 12,
                  paddingTop: 10,
                  fontSize: 12,
                  color: "rgba(0,0,0,0.5)",
                }}
              >
                Flying at {pace.toFixed(2)} mi/day · Will finish Sep 30, 2026
              </div>
            </>
          ) : (
            <>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                  gap: 12,
                  marginBottom: 20,
                }}
              >
                <div>
                  <h1
                    style={{
                      fontFamily: DISPLAY,
                      fontWeight: 800,
                      fontSize: 30,
                      color: NAVY,
                      margin: 0,
                    }}
                  >
                    {lr?.displayName ?? rf.displayName}
                  </h1>
                  <p style={{ fontSize: 11, color: "rgba(0,0,0,0.4)", margin: "4px 0 0" }}>
                    {countryFlag(lr?.home ?? "")} {lr?.home ?? ""} · Bib {rf.bib} · Age{" "}
                    {lr?.age ?? "—"} · {lr?.gender ?? "—"}
                  </p>
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {lr && (
                    <span
                      style={{
                        fontFamily: DISPLAY,
                        fontWeight: 700,
                        fontSize: 12,
                        background: isOverall1 ? GOLD : NAVY,
                        color: "white",
                        padding: "4px 12px",
                        borderRadius: 20,
                      }}
                    >
                      {lr.rankDisplay} Overall
                    </span>
                  )}
                  {lr?.genderRank != null && (
                    <span
                      style={{
                        fontFamily: DISPLAY,
                        fontWeight: 700,
                        fontSize: 12,
                        background: NAVY,
                        color: "white",
                        padding: "4px 12px",
                        borderRadius: 20,
                      }}
                    >
                      #{lr.genderRank} {genderLabel}
                    </span>
                  )}
                </div>
              </div>
              <ProgressBar
                runnerMiles={runnerMiles}
                markerPct={(buzzMiles / TOTAL_MILES) * 100}
                markerEmoji="🦅"
                markerTitle={`Buzzard — ${buzzMiles.toFixed(2)} mi`}
              />
              <div
                style={{
                  borderTop: "0.5px solid rgba(0,0,0,0.06)",
                  marginTop: 12,
                  paddingTop: 10,
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "6px 16px",
                  fontSize: 12,
                  color: "rgba(0,0,0,0.5)",
                }}
              >
                <span>📍 {lr?.locationDescription ?? "—"}</span>
                <span>
                  🏁 Projected finish:{" "}
                  {lr?.projectedFinish ? longDate(lr.projectedFinish) : "—"}
                </span>
                {vsB >= 0 ? (
                  <span style={{ color: GREEN, fontWeight: 600 }}>
                    🦅 +{vsB.toFixed(1)} mi ahead of Buzzard
                  </span>
                ) : (
                  <span style={{ color: RED, fontWeight: 600 }}>
                    🦅 {Math.abs(vsB).toFixed(1)} mi behind Buzzard
                  </span>
                )}
              </div>
            </>
          )}
        </div>

        {/* Stats Row */}
        {isBuzzard ? (
          <div className="runner-stats">
            <StatCard value={`${pace.toFixed(2)} mi`} sub="daily pace" />
            <StatCard value="Sep 30, 2026" sub="finish date" />
            <StatCard
              value={String(bf.runnersAhead ?? 0)}
              sub="runners ahead"
              color={GREEN}
            />
            <StatCard
              value={String(bf.runnersBehind ?? 0)}
              sub="runners behind"
              color={RED}
            />
            <StatCard value={`${pace.toFixed(2)} mi`} sub="miles today" />
          </div>
        ) : (
          <div className="runner-stats">
            <StatCard value={runnerMiles.toFixed(2)} sub="miles logged" />
            <StatCard value={milesLeft.toFixed(1)} sub="miles to finish" color={GOLD} />
            <StatCard value={String(dl)} sub="days until Sep 30" />
            <StatCard
              value={avgNeeded.toFixed(2)}
              sub="mi/day to finish"
              color={avgNeeded <= pace ? GREEN : RED}
            />
            <StatCard
              value={`${vsB >= 0 ? "+" : ""}${vsB.toFixed(1)}`}
              sub={vsB >= 0 ? "miles ahead" : "miles behind"}
              color={vsB >= 0 ? GREEN : RED}
            />
          </div>
        )}

        {/* Mini Map */}
        <div style={card}>
          <SectionHeader
            title="Current Location"
            sub={isFinished ? "🏁 FINISHED · Pueblo, CO" : (lr?.locationDescription ?? "—")}
          />
          {mapUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={mapUrl}
              alt={`Map showing ${lr?.locationDescription ?? "runner location"}`}
              className="runner-map-img"
            />
          ) : (
            <div
              style={{
                height: 120,
                background: "#f5f5f3",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                color: "rgba(0,0,0,0.35)",
              }}
            >
              Location data unavailable
            </div>
          )}
          <div
            style={{
              padding: "8px 16px",
              fontSize: 11,
              color: "rgba(0,0,0,0.45)",
            }}
          >
            {mapLocationLabel}
          </div>
        </div>

        {/* Bar Chart */}
        <div style={card}>
          <SectionHeader
            title="Daily Mileage"
            sub={
              isBuzzard
                ? `${pace.toFixed(2)} mi/day · relentless`
                : `${rf.activeDays > 0 ? (runnerMiles / rf.activeDays).toFixed(2) : "0.00"} mi avg · ${rf.activeDays} active days`
            }
          />
          <div style={{ padding: 20 }}>
            {rf.activities.map((act, i) => {
              const isRest = act.type === "rest";
              const barColor =
                isBuzzard ? RED : act.type === "walk" ? "#7fa8d4" : NAVY;
              const pct = isRest ? 0 : (act.miles / maxDayMiles) * 100;
              return (
                <div key={`${act.date}-${i}`} className="runner-chart-row">
                  <div className="runner-chart-date">{shortDate(act.date)}</div>
                  <div className="runner-chart-track">
                    {!isRest && (
                      <div
                        style={{
                          width: `${pct}%`,
                          height: "100%",
                          background: barColor,
                          borderRadius: 4,
                        }}
                      />
                    )}
                  </div>
                  <div
                    className="runner-chart-miles"
                    style={{
                      fontFamily: isRest ? "inherit" : DISPLAY,
                      fontWeight: isRest ? 400 : 700,
                      fontSize: isRest ? 11 : 12,
                      color: isRest ? "rgba(0,0,0,0.25)" : NAVY,
                      fontStyle: isRest ? "italic" : "normal",
                    }}
                  >
                    {isRest ? "rest" : `${act.miles.toFixed(2)} mi`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Activity Table */}
        {(() => {
          const rows = [
            ...(isBuzzard
              ? rf.activities
              : rf.activities.filter((a) => a.type !== "rest")),
          ].reverse();

          return (
            <div style={{ ...card, marginBottom: 40 }}>
              <SectionHeader
                title="Activity Log"
                sub={`${rows.length} ${rows.length === 1 ? "entry" : "entries"}`}
              />
              {rows.length === 0 ? (
                <p style={{ padding: 20, color: "rgba(0,0,0,0.4)", textAlign: "center" }}>
                  No activities logged yet.
                </p>
              ) : (
                <div className="table-wrap">
                  <table className="runner-table">
                    <thead>
                      <tr>
                        {["Date", "Type", "Miles", "Time", "Comment"].map((h) => (
                          <th
                            key={h}
                            className={`runner-th${h === "Time" ? " col-time-runner" : ""}`}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((act, i) => (
                        <tr
                          key={`${act.date}-${i}`}
                          style={{ background: i % 2 === 0 ? "white" : "#fafafa" }}
                        >
                          <td className="runner-td">{shortDate(act.date)}</td>
                          <td className="runner-td">
                            <span
                              style={{
                                display: "inline-block",
                                padding: "2px 8px",
                                borderRadius: 4,
                                fontSize: 11,
                                fontFamily: DISPLAY,
                                fontWeight: 600,
                                textTransform: "uppercase",
                                ...(act.type === "walk"
                                  ? { background: "#e8f0fb", color: "#3b6fba" }
                                  : act.type === "buzzard"
                                  ? { background: "#fff0ee", color: RED }
                                  : { background: "rgba(27,63,110,0.1)", color: NAVY }),
                              }}
                            >
                              {act.type}
                            </span>
                          </td>
                          <td
                            className="runner-td"
                            style={{
                              fontFamily: DISPLAY,
                              fontWeight: 700,
                              fontSize: 14,
                            }}
                          >
                            {act.miles.toFixed(2)}
                          </td>
                          <td
                            className="runner-td col-time-runner"
                            style={{ color: "rgba(0,0,0,0.5)", fontSize: 12 }}
                          >
                            {act.time ?? "—"}
                          </td>
                          <td
                            className="runner-td"
                            style={{
                              fontStyle: "italic",
                              color: "rgba(0,0,0,0.4)",
                              fontSize: 12,
                            }}
                          >
                            {act.comment || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })()}
      </div>
    </main>
  );
}

import fs from "fs";
import path from "path";
import Link from "next/link";

const TOTAL_MILES = 679;
const DATA_DIR = path.join(process.cwd(), "..", "data", "gvrat-2026");
const NAVY = "#1B3F6E";
const GOLD = "#F4A623";
const DISPLAY = "'Barlow Condensed', sans-serif";

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
  if (!iso || iso === "—") return "—";
  if (iso.includes("days")) return iso;
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}


function DotSep() {
  return (
    <span
      aria-hidden="true"
      style={{
        width: 3,
        height: 3,
        borderRadius: "50%",
        background: "rgba(255,255,255,0.3)",
        display: "inline-block",
        flexShrink: 0,
      }}
    />
  );
}

function RankBadge({ rank, label, isGold }: { rank: string; label: string; isGold: boolean }) {
  return (
    <div
      style={{
        fontFamily: DISPLAY,
        fontWeight: 800,
        padding: "10px 18px",
        borderRadius: 8,
        textAlign: "center",
        minWidth: 80,
        background: isGold ? GOLD : "rgba(255,255,255,0.1)",
        color: isGold ? "#0a1628" : "#ffffff",
        border: isGold ? "none" : "1px solid rgba(255,255,255,0.2)",
      }}
    >
      <span style={{ fontSize: 28, lineHeight: 1, display: "block" }}>{rank}</span>
      <span
        style={{
          fontSize: 10,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          display: "block",
          marginTop: 3,
          fontWeight: 600,
          opacity: isGold ? 0.6 : 0.7,
        }}
      >
        {label}
      </span>
    </div>
  );
}

function StatCell({
  value,
  label,
  color,
  isLast,
}: {
  value: string;
  label: string;
  color?: string;
  isLast?: boolean;
}) {
  return (
    <div
      style={{
        padding: "20px 16px",
        textAlign: "center",
        borderRight: isLast ? "none" : "1px solid rgba(0,0,0,0.07)",
      }}
    >
      <span
        style={{
          fontFamily: DISPLAY,
          fontWeight: 800,
          fontSize: 38,
          lineHeight: 1,
          display: "block",
          color: color || NAVY,
        }}
      >
        {value}
      </span>
      <span
        style={{
          fontFamily: DISPLAY,
          fontSize: 10,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: "rgba(0,0,0,0.35)",
          marginTop: 4,
          display: "block",
        }}
      >
        {label}
      </span>
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
  markerEmoji?: string;
  markerTitle: string;
}) {
  const fillPct = Math.min(100, (runnerMiles / TOTAL_MILES) * 100);
  const milesLeft = Math.max(0, TOTAL_MILES - runnerMiles);
  const markerLabel = markerTitle.split("—")[0].trim();
  return (
    <div style={{ marginBottom: 16 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 32,
        }}
      >
        <span style={{ fontSize: 16, fontWeight: 600, color: "#ffffff", letterSpacing: "0.01em" }}>
          {runnerMiles.toFixed(2)} miles completed
        </span>
        <span style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>
          {runnerMiles >= TOTAL_MILES ? "Completed!" : `${milesLeft.toFixed(2)} mi remaining`}
        </span>
      </div>
      <div
        style={{
          position: "relative",
          height: 10,
          background: "rgba(255,255,255,0.15)",
          borderRadius: 5,
          marginBottom: 12,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: `${fillPct}%`,
            height: "100%",
            background: GOLD,
            borderRadius: 5,
          }}
        />
        {/* Competitor / Buzzard Marker */}
        <div
          style={{
            position: "absolute",
            left: `${Math.min(99, Math.max(1, markerPct))}%`,
            top: "50%",
            transform: "translate(-50%, -50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            pointerEvents: "none",
          }}
          title={markerTitle}
        >
          <div
            style={{
              fontSize: 18,
              transform: "scaleX(-1) translateY(-14px)",
              filter: "brightness(0) invert(1) drop-shadow(0px 2px 4px rgba(0,0,0,0.5))",
            }}
          >
            {markerEmoji}
          </div>
          <div style={{ width: 3, height: 16, background: "rgba(255,255,255,0.8)", borderRadius: 2, transform: "translateY(-14px)" }} />
        </div>
      </div>
      <div className="runner-route-labels">
        <span>Start · Baxter Springs, KS</span>
        <span>Finish · Pueblo, CO · 679 mi</span>
      </div>
    </div>
  );
}

function CumulativeChart({
  activities,
  pace,
  isBuzzard,
}: {
  activities: ActivityEntry[];
  pace: number;
  isBuzzard: boolean;
}) {
  if (activities.length === 0) return null;

  const sorted = [...activities].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const startDate = new Date(sorted[0].date).getTime();

  let cum = 0;
  const data = sorted.map((a) => {
    cum += a.miles;
    const dayIndex = Math.round(
      (new Date(a.date).getTime() - startDate) / 86400000
    );
    return { dayIndex, cum, dateStr: a.date };
  });

  if (data.length > 0 && data[0].dayIndex !== 0) {
    data.unshift({ dayIndex: 0, cum: 0, dateStr: sorted[0].date });
  }

  const maxDays = Math.max(1, data[data.length - 1].dayIndex);
  const maxMiles = Math.max(cum, maxDays * pace, 10);

  const W = 732;
  const H = 220;
  const padX = 10;
  const padTop = 20;
  const padBottom = 24; // increased for X axis labels

  const getX = (d: number) => padX + (d / maxDays) * (W - padX * 2);
  const getY = (m: number) => H - padBottom - (m / maxMiles) * (H - padTop - padBottom);

  const runnerPath =
    "M " + data.map((d) => `${getX(d.dayIndex)},${getY(d.cum)}`).join(" L ");
  const buzzardPath = `M ${getX(0)},${getY(0)} L ${getX(maxDays)},${getY(maxDays * pace)}`;

  return (
    <div
      style={{
        paddingTop: 24,
        paddingBottom: 24,
        borderTop: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 16,
        }}
      >
        <span
          style={{
            fontFamily: DISPLAY,
            fontWeight: 700,
            fontSize: 15,
            color: NAVY,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
          }}
        >
          Cumulative Progress
        </span>
        <div style={{ display: "flex", gap: 16, fontSize: 11, color: "rgba(0,0,0,0.5)" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 12, height: 3, background: NAVY, borderRadius: 2 }} />
            Runner
          </span>
          {!isBuzzard && (
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 12, height: 3, background: "#fca5a5", borderRadius: 2 }} />
              Buzzard Pace
            </span>
          )}
        </div>
      </div>

      <div
        style={{
          width: "100%",
          background: "#f8fafc",
          borderRadius: 8,
          padding: "16px 0 8px",
          overflow: "hidden",
          border: "1px solid rgba(0,0,0,0.04)"
        }}
      >
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }}>
          {[0, 0.25, 0.5, 0.75, 1].map((p) => {
            const y = getY(maxMiles * p);
            return (
              <g key={p}>
                <line
                  x1={padX}
                  y1={y}
                  x2={W - padX}
                  y2={y}
                  stroke="rgba(0,0,0,0.05)"
                  strokeWidth="1"
                />
                <text
                  x={padX + 4}
                  y={y - 4}
                  fill="rgba(0,0,0,0.3)"
                  fontSize="10"
                  fontFamily="sans-serif"
                >
                  {Math.round(maxMiles * p)} mi
                </text>
              </g>
            );
          })}

          {!isBuzzard && (
            <path
              d={buzzardPath}
              fill="none"
              stroke="#fca5a5"
              strokeWidth="2"
              strokeDasharray="4 4"
            />
          )}

          <path
            d={`${runnerPath} L ${getX(data[data.length - 1].dayIndex)},${getY(0)} L ${getX(0)},${getY(0)} Z`}
            fill="rgba(27, 63, 110, 0.08)"
          />
          <path
            d={runnerPath}
            fill="none"
            stroke={NAVY}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <circle
            cx={getX(data[data.length - 1].dayIndex)}
            cy={getY(data[data.length - 1].cum)}
            r="4"
            fill={NAVY}
          />
          
          {/* X Axis Labels */}
          <text
            x={padX + 4}
            y={H - 4}
            fill="rgba(0,0,0,0.4)"
            fontSize="10"
            fontFamily="sans-serif"
            fontWeight="bold"
          >
            {shortDate(data[0].dateStr)}
          </text>
          {maxDays > 0 && (
            <text
              x={W - padX - 4}
              y={H - 4}
              fill="rgba(0,0,0,0.4)"
              fontSize="10"
              fontFamily="sans-serif"
              fontWeight="bold"
              textAnchor="end"
            >
              {shortDate(data[data.length - 1].dateStr)}
            </text>
          )}
        </svg>
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
  const isOverall1 = lr?.rankDisplay === "#1" && !lr?.virtual;

  const activeMiles = rf.activities
    .filter((a) => a.type !== "rest")
    .map((a) => a.miles);
  const maxDayMiles = activeMiles.length > 0 ? Math.max(...activeMiles) : 1;
  const hasWalk = rf.activities.some((a) => a.type === "walk");

  const heroBackground = isBuzzard
    ? "linear-gradient(to bottom, rgba(69, 10, 10, 0.85), rgba(107, 15, 15, 0.95)), url('/bg-topo.webp')"
    : "linear-gradient(to bottom, rgba(13, 17, 28, 0.85), rgba(13, 17, 28, 0.95)), url('/bg-topo.webp')";

  function SectionHead({ title, sub }: { title: string; sub: string }) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 16,
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <span
          style={{
            fontFamily: DISPLAY,
            fontWeight: 700,
            fontSize: 15,
            color: NAVY,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
          }}
        >
          {title}
        </span>
        <span style={{ fontSize: 12, color: "rgba(0,0,0,0.4)" }}>{sub}</span>
      </div>
    );
  }

  return (
    <main style={{ background: "var(--surface-bg)", minHeight: "100vh" }}>
      {/* ── HERO ── */}
      <div
        style={{
          backgroundImage: heroBackground,
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
          padding: "16px 0 28px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            maxWidth: 780,
            margin: "0 auto",
            padding: "0 24px",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Back button */}
          <Link
            href="/gvrat-2026"
            className="hero-back-btn"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "rgba(255,255,255,0.65)",
              fontFamily: DISPLAY,
              fontWeight: 700,
              fontSize: 11,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              padding: "5px 14px",
              borderRadius: 20,
              textDecoration: "none",
              marginBottom: 20,
            }}
          >
            ← BACK TO LEADERBOARD
          </Link>

          {isBuzzard ? (
            /* ── BUZZARD HERO ── */
            <>
              <div style={{ marginBottom: 20 }}>
                <h1
                  className="runner-hero-name"
                  style={{
                    fontFamily: DISPLAY,
                    fontWeight: 800,
                    color: "#fca5a5",
                    margin: 0,
                    lineHeight: 0.95,
                    letterSpacing: "-0.01em",
                  }}
                >
                  🦅 Buzzard
                </h1>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", margin: "6px 0 0" }}>
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
                  borderTop: "1px solid rgba(255,255,255,0.1)",
                  paddingTop: 14,
                  marginTop: 16,
                  fontSize: 13,
                  color: "rgba(255,255,255,0.65)",
                }}
              >
                Flying at {pace.toFixed(2)} mi/day · Will finish Sep 30, 2026
              </div>
            </>
          ) : (
            /* ── REGULAR RUNNER HERO ── */
            <>
              {/* Top row: name left, badges right */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 16,
                  marginBottom: 20,
                  flexWrap: "wrap",
                }}
              >
                {/* Name + meta */}
                <div>
                  <h1
                    className="runner-hero-name"
                    style={{
                      fontFamily: DISPLAY,
                      fontWeight: 800,
                      color: "#ffffff",
                      margin: 0,
                      lineHeight: 0.95,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {lr?.displayName ?? rf.displayName}
                  </h1>
                  <div
                    style={{
                      marginTop: 8,
                      fontSize: 13,
                      color: "rgba(255,255,255,0.6)",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      flexWrap: "wrap",
                    }}
                  >
                    <span>{countryFlag(lr?.home ?? "")} {lr?.home ?? ""}</span>
                    <DotSep />
                    <span>Bib {rf.bib}</span>
                    {lr?.age ? (
                      <>
                        <DotSep />
                        <span>Age {lr.age}</span>
                      </>
                    ) : null}
                    <DotSep />
                    <span>{genderLabel}</span>
                  </div>
                </div>

                {/* Rank badges — row */}
                {lr && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      gap: 8,
                      alignItems: "flex-start",
                      flexShrink: 0,
                    }}
                  >
                    <RankBadge
                      rank={lr.rankDisplay}
                      label="Overall"
                      isGold={isOverall1}
                    />
                    {lr.genderRank != null && (
                      <RankBadge
                        rank={`#${lr.genderRank}`}
                        label={`${genderLabel} Place`}
                        isGold={isOverall1}
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Progress bar */}
              <ProgressBar
                runnerMiles={runnerMiles}
                markerPct={(buzzMiles / TOTAL_MILES) * 100}
                markerEmoji="🦅"
                markerTitle={`Buzzard — ${buzzMiles.toFixed(2)} mi`}
              />

              {/* Location strip */}
              <div
                style={{
                  borderTop: "1px solid rgba(255,255,255,0.1)",
                  paddingTop: 14,
                  marginTop: 16,
                  display: "flex",
                  alignItems: "center",
                  flexWrap: "wrap",
                  rowGap: 8,
                }}
              >
                <div
                  className="runner-loc-item"
                  style={{
                    padding: "0 16px 0 0",
                    borderRight: "1px solid rgba(255,255,255,0.12)",
                  }}
                >
                  <span>📍</span>
                  <span style={{ color: "#ffffff", fontWeight: 600 }}>
                    {lr?.locationDescription ?? "—"}
                  </span>
                </div>
                <div
                  className="runner-loc-item"
                  style={{
                    padding: "0 16px",
                    borderRight: "1px solid rgba(255,255,255,0.12)",
                  }}
                >
                  <span>🏁</span>
                  <span style={{ color: "rgba(255,255,255,0.5)" }}>
                    {runnerMiles >= TOTAL_MILES ? "Completed" : "Projected"}
                  </span>
                  <span style={{ color: "#ffffff", fontWeight: 600 }}>
                    {lr?.projectedFinish ? longDate(lr.projectedFinish) : "—"}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    fontSize: 13,
                    padding: "0 0 0 16px",
                  }}
                >
                  <span
                    style={{
                      fontSize: 16,
                      transform: "scaleX(-1)",
                      filter: "brightness(0) invert(1) drop-shadow(0px 1px 2px rgba(0,0,0,0.5))",
                      marginRight: 4,
                      opacity: 0.9,
                    }}
                  >
                    🦅
                  </span>
                  {vsB >= 0 ? (
                    <span style={{ color: "#4ade80", fontWeight: 700 }}>
                      +{vsB.toFixed(1)} mi ahead of Buzzard
                    </span>
                  ) : (
                    <span style={{ color: "#f87171", fontWeight: 700 }}>
                      {Math.abs(vsB).toFixed(1)} mi behind Buzzard
                    </span>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── STATS STRIP — outer full-width, inner centered grid ── */}
      <div
        style={{
          background: "var(--surface-panel)",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
          padding: "0 24px",
        }}
      >
        <div
          className="runner-stats-grid"
          style={{
            maxWidth: 780,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
          }}
        >
          {isBuzzard ? (
            <>
              <StatCell value={pace.toFixed(2)} label="Daily Pace" color="#dc2626" />
              <StatCell value="Sep 30" label="Finish Date" color={NAVY} />
              <StatCell value={String(bf.runnersAhead ?? 0)} label="Runners Ahead" color="#16a34a" />
              <StatCell value={String(bf.runnersBehind ?? 0)} label="Runners Behind" color="#dc2626" isLast />
            </>
          ) : (
            <>
              <StatCell value={runnerMiles.toFixed(2)} label="Total Miles" color={NAVY} />
              <StatCell
                value={runnerMiles >= TOTAL_MILES ? "Finished" : milesLeft.toFixed(1)}
                label={
                  runnerMiles >= TOTAL_MILES
                    ? (lr?.projectedFinish && lr.projectedFinish.includes("days")
                        ? `in ${lr.projectedFinish}`
                        : "completed")
                    : "Miles to Finish"
                }
                color={GOLD}
              />
              <StatCell value={String(dl)} label="Days Until Sep 30" color={NAVY} />
              <StatCell
                value={avgNeeded.toFixed(2)}
                label="Mi/Day to Finish"
                color={avgNeeded <= pace ? "#16a34a" : "#dc2626"}
                isLast
              />
            </>
          )}
        </div>
      </div>

      {/* ── BODY SECTIONS ── */}
      <div style={{ maxWidth: 780, margin: "0 auto", padding: "0 24px 32px" }}>
        <CumulativeChart activities={rf.activities} pace={pace} isBuzzard={isBuzzard} />

        {/* Activity Log */}
        {(() => {
          const rows = [
            ...(isBuzzard
              ? rf.activities
              : rf.activities.filter((a) => a.type !== "rest")),
          ].reverse();

          return (
            <div
              style={{
                paddingTop: 24,
                paddingBottom: 0,
                borderTop: "1px solid rgba(0,0,0,0.06)",
              }}
            >
              <SectionHead
                title="Activity Log"
                sub={`${rows.length} ${rows.length === 1 ? "entry" : "entries"}`}
              />
              {rows.length === 0 ? (
                <p
                  style={{
                    color: "rgba(0,0,0,0.4)",
                    textAlign: "center",
                    padding: "20px 0",
                  }}
                >
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
                            style={{
                              textAlign: h === "Miles" ? "right" : "left",
                              paddingRight: h === "Miles" ? 12 : 0,
                              paddingLeft: h !== "Date" ? 12 : 0,
                            }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((act, i) => (
                        <tr key={`${act.date}-${i}`}>
                          <td className="runner-td" style={{ color: "rgba(0,0,0,0.5)" }}>
                            {shortDate(act.date)}
                          </td>
                          <td className="runner-td" style={{ paddingLeft: 12 }}>
                            <span
                              style={{
                                display: "inline-block",
                                padding: "3px 8px",
                                borderRadius: 4,
                                fontSize: 10,
                                fontFamily: DISPLAY,
                                fontWeight: 700,
                                textTransform: "uppercase",
                                ...(act.type === "walk"
                                  ? { background: "rgba(59,130,246,0.08)", color: "#3b82f6" }
                                  : act.type === "buzzard"
                                  ? { background: "rgba(220,38,38,0.08)", color: "#dc2626" }
                                  : { background: "rgba(27,63,110,0.08)", color: NAVY }),
                              }}
                            >
                              {act.type}
                            </span>
                          </td>
                          <td
                            className="runner-td"
                            style={{
                              fontFamily: DISPLAY,
                              fontWeight: 800,
                              fontSize: 16,
                              color: NAVY,
                              textAlign: "right",
                              paddingLeft: 12,
                              paddingRight: 12,
                            }}
                          >
                            {act.miles.toFixed(2)}
                          </td>
                          <td
                            className="runner-td col-time-runner"
                            style={{
                              color: "rgba(0,0,0,0.4)",
                              fontSize: 12,
                              paddingLeft: 12,
                            }}
                          >
                            {act.time ?? "—"}
                          </td>
                          <td
                            className="runner-td"
                            style={{
                              fontStyle: "italic",
                              color: "rgba(0,0,0,0.4)",
                              fontSize: 12,
                              paddingLeft: 12,
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

/**
 * PROTOTYPE — StatStrip (replaces StatCards for P1 review)
 * Unboxed horizontal stat strip. No card borders, no SaaS template.
 * Numbers are proud and large. Dividers separate, not boxes.
 */
import type { MetaData } from "@/lib/data";

const DISPLAY = "var(--font-display)";
const NAVY = "#1B3F6E";
const GOLD = "#F4A623";

type StatItem = {
  label: string;
  value: React.ReactNode;
  sub?: string;
  accent?: string;
};

function StatCell({
  label,
  value,
  sub,
  accent,
  isLast,
}: StatItem & { isLast?: boolean }) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px 24px",
        borderRight: isLast ? "none" : "1px solid rgba(0,0,0,0.07)",
        minWidth: 0,
      }}
    >
      {/* Small uppercase label */}
      <span
        style={{
          fontFamily: DISPLAY,
          fontWeight: 400,
          fontSize: 9,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "rgba(0,0,0,0.32)",
          marginBottom: 6,
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>

      {/* Big number — the hero */}
      <span
        style={{
          fontFamily: DISPLAY,
          fontWeight: 800,
          fontSize: "clamp(28px, 3.5vw, 44px)",
          lineHeight: 1,
          color: accent ?? NAVY,
          fontVariantNumeric: "tabular-nums",
          letterSpacing: "-0.01em",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          maxWidth: "100%",
        }}
      >
        {value}
      </span>

      {/* Optional sub-label */}
      {sub && (
        <span className="stat-sub">
          {sub}
        </span>
      )}
    </div>
  );
}

export default function StatStrip({ meta }: { meta: MetaData }) {
  const stats: StatItem[] = [
    {
      label: "Race Day",
      value: meta.dayNumber,
      sub: `of ${meta.totalDays} days`,
      accent: NAVY,
    },
    {
      label: "Runners on Course",
      value: meta.totalRunnersActive.toLocaleString(),
      accent: NAVY,
    },
    {
      label: "Miles Logged",
      value: meta.totalMilesLogged.toLocaleString(),
      accent: GOLD,
    },
    {
      label: "Current Leader",
      value: meta.leaderName,
      sub: `${meta.leaderMiles} mi`,
      accent: NAVY,
    },
  ];

  return (
    <div
      style={{
        background: "#ffffff",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      {/* Mobile: 2×2 grid. Desktop: single row */}
      <div
        className="stat-strip-grid"
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
        }}
      >
        <style>{`
          @media (max-width: 640px) {
            .stat-strip-grid {
              grid-template-columns: repeat(2, 1fr) !important;
            }
            .stat-strip-grid > div {
              border-bottom: 1px solid rgba(0,0,0,0.07);
            }
            .stat-strip-grid > div:nth-child(3),
            .stat-strip-grid > div:nth-child(4) {
              border-bottom: none;
            }
          }
        `}</style>
        {stats.map((s, i) => (
          <StatCell key={i} {...s} isLast={i === stats.length - 1} />
        ))}
      </div>
    </div>
  );
}

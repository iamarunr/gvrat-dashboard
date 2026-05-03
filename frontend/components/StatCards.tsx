import type { MetaData } from "@/lib/data";

const DISPLAY = "var(--font-display)";
const NAVY = "#1B3F6E";
const GOLD = "#F4A623";

const LABEL: React.CSSProperties = {
  fontFamily: DISPLAY,
  fontWeight: 400,
  fontSize: 9,
  color: "rgba(0,0,0,0.32)",
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  marginBottom: 3,
};

const BIG_NUM: React.CSSProperties = {
  fontFamily: DISPLAY,
  fontWeight: 800,
  fontSize: 30,
  color: NAVY,
  lineHeight: 1,
  fontVariantNumeric: "tabular-nums",
};

const SUBTEXT: React.CSSProperties = {
  fontSize: 11,
  color: "rgba(0,0,0,0.28)",
  marginTop: 3,
};

const BASE_CARD: React.CSSProperties = {
  background: "#ffffff",
  borderRadius: 10,
  border: "1px solid rgba(0,0,0,0.06)",
  borderTop: "2px solid transparent",
  padding: "14px 16px 12px",
  display: "flex",
  flexDirection: "column",
  minWidth: 0,
};

export default function StatCards({ meta }: { meta: MetaData }) {
  return (
    <div
      className="grid grid-cols-2 md:grid-cols-4"
      style={{
        gap: 10,
        background: "#f5f5f3",
        padding: 14,
      }}
    >
      {/* Race Day */}
      <div style={BASE_CARD}>
        <span style={LABEL}>Race Day</span>
        <span className="stat-value" style={BIG_NUM}>{meta.dayNumber}</span>
        <span style={SUBTEXT}>of {meta.totalDays} days</span>
      </div>

      {/* Active Runners */}
      <div style={BASE_CARD}>
        <span style={LABEL}>Active Runners</span>
        <span className="stat-value" style={BIG_NUM}>{meta.totalRunnersActive.toLocaleString()}</span>
      </div>

      {/* Miles Logged — gold top border */}
      <div style={{ ...BASE_CARD, borderTop: `2px solid ${GOLD}` }}>
        <span style={LABEL}>Miles Logged</span>
        <span className="stat-value" style={{ ...BIG_NUM, color: GOLD }}>
          {meta.totalMilesLogged.toLocaleString()}
        </span>
      </div>

      {/* Current Leader */}
      <div style={BASE_CARD}>
        <span style={LABEL}>Current Leader</span>
        <span
          className="stat-value name"
          style={{
            fontFamily: DISPLAY,
            fontWeight: 800,
            fontSize: 18,
            color: NAVY,
            lineHeight: 1.2,
            paddingTop: 4,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {meta.leaderName}
        </span>
        <span
          style={{
            fontFamily: DISPLAY,
            fontWeight: 500,
            fontSize: 13,
            color: GOLD,
            marginTop: 2,
          }}
        >
          {meta.leaderMiles} mi
        </span>
      </div>
    </div>
  );
}

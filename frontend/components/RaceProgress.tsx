type Props = { dayNumber: number; totalDays: number };

export default function RaceProgress({ dayNumber, totalDays }: Props) {
  const pct = Math.min((dayNumber / totalDays) * 100, 100);

  return (
    <div
      style={{
        background: "white",
        borderTop: "1px solid rgba(0,0,0,0.04)",
        borderBottom: "1px solid rgba(0,0,0,0.04)",
      }}
    >
      <div style={{ position: "relative", height: 3, background: "#eeece8" }}>
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            height: "100%",
            width: `${pct}%`,
            background: "#F4A623",
          }}
        >
          <div
            style={{
              position: "absolute",
              right: -3,
              top: -2,
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "#F4A623",
              boxShadow: "0 0 6px rgba(244,166,35,0.7)",
            }}
          />
        </div>
      </div>
    </div>
  );
}

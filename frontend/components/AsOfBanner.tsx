const DISPLAY = "var(--font-display)";

// Split text to bold the date and "12:00 UTC"
const BOLD_RE =
  /((?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+\d{4}|12:00 UTC)/;
const BOLD_TEST =
  /^(?:(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+\d{4}|12:00 UTC)$/;

function formatText(text: string): React.ReactNode {
  return text.split(BOLD_RE).map((part, i) =>
    BOLD_TEST.test(part) ? (
      <span key={i} style={{ color: "rgba(0,0,0,0.55)", fontWeight: 500 }}>
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

export default function AsOfBanner({ text }: { text: string }) {
  return (
    <div
      style={{
        background: "white",
        borderBottom: "1px solid rgba(0,0,0,0.05)",
        padding: "7px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
      }}
    >
      <div
        aria-hidden="true"
        style={{
          width: 13,
          height: 13,
          borderRadius: "50%",
          border: "1px solid rgba(27,63,110,0.3)",
          color: "#1B3F6E",
          fontFamily: DISPLAY,
          fontWeight: 700,
          fontSize: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          lineHeight: 1,
          userSelect: "none",
        }}
      >
        i
      </div>
      <p style={{ fontSize: 11, color: "rgba(0,0,0,0.38)", lineHeight: 1.4, margin: 0 }}>
        {formatText(text)}
      </p>
    </div>
  );
}

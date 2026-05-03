export default function AsOfBanner({ text }: { text: string }) {
  return (
    <div
      className="px-4 md:px-8 py-2.5 text-sm flex items-start gap-2"
      style={{ background: "#FFF8E7", borderLeft: "4px solid #F4A623", color: "#92400E" }}
    >
      <span
        className="shrink-0 cursor-help"
        title="Results are locked at midnight UTC so every runner in every time zone has a full day recorded equally — ensuring fairness regardless of where you live."
      >
        ℹ️
      </span>
      <p className="leading-snug">{text}</p>
    </div>
  );
}

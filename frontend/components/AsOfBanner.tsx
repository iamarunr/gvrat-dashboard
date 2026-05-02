export default function AsOfBanner({ text }: { text: string }) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-800 flex items-start gap-2">
      <span
        className="shrink-0 mt-0.5 cursor-help"
        title="Results are locked at midnight UTC so every runner in every time zone has a full day recorded equally — ensuring fairness regardless of where you live."
      >
        ℹ️
      </span>
      <p>{text}</p>
    </div>
  );
}

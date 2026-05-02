export default function DayCounter({
  dayNumber,
  totalDays,
}: {
  dayNumber: number;
  totalDays: number;
}) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="text-2xl font-bold text-slate-800">Day {dayNumber}</span>
      <span className="text-slate-400 text-base">of {totalDays}</span>
    </div>
  );
}

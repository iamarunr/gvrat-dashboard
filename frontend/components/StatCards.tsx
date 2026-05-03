import type { MetaData } from "@/lib/data";

function Card({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 flex flex-col min-w-0">
      <span
        className="text-xs uppercase tracking-wide font-medium"
        style={{ color: "#6B7280" }}
      >
        {label}
      </span>
      {children}
    </div>
  );
}

export default function StatCards({ meta }: { meta: MetaData }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <Card label="Race Day">
        <span className="text-3xl font-bold mt-1 tabular-nums" style={{ color: "#1A1A2E" }}>
          {meta.dayNumber}
        </span>
        <span className="text-xs mt-0.5" style={{ color: "#6B7280" }}>
          of {meta.totalDays} days
        </span>
      </Card>

      <Card label="Active Runners">
        <span className="text-3xl font-bold mt-1 tabular-nums" style={{ color: "#1A1A2E" }}>
          {meta.totalRunnersActive.toLocaleString()}
        </span>
      </Card>

      <Card label="Miles Logged">
        <span className="text-3xl font-bold mt-1 tabular-nums" style={{ color: "#F4A623" }}>
          {meta.totalMilesLogged.toLocaleString()}
        </span>
      </Card>

      <Card label="Current Leader">
        <span className="text-base font-bold mt-1 truncate" style={{ color: "#1A1A2E" }}>
          {meta.leaderName}
        </span>
        <span className="text-sm font-semibold tabular-nums" style={{ color: "#F4A623" }}>
          {meta.leaderMiles} mi
        </span>
      </Card>
    </div>
  );
}

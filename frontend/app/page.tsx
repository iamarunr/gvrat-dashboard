import Link from "next/link";
import { metaData } from "@/lib/data";

export default function Home() {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center p-8"
      style={{ background: "#F8F9FA" }}
    >
      <div className="max-w-sm w-full space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold" style={{ color: "#1B3F6E" }}>
            GVRAT
          </h1>
          <p className="text-sm mt-1" style={{ color: "#6B7280" }}>
            Virtual Race Dashboard
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold" style={{ color: "#1A1A2E" }}>
                GVRAT 2026
              </h2>
              <p className="text-sm mt-0.5" style={{ color: "#6B7280" }}>
                Day {metaData.dayNumber} of {metaData.totalDays}
              </p>
            </div>
            <span className="text-xs bg-green-100 text-green-800 font-medium px-2 py-1 rounded-full">
              Live
            </span>
          </div>

          <div className="text-sm space-y-1" style={{ color: "#374151" }}>
            <p>{metaData.totalRunnersActive.toLocaleString()} active runners</p>
            <p>
              Leader: <strong>{metaData.leaderName}</strong> &mdash;{" "}
              <span style={{ color: "#F4A623", fontWeight: 600 }}>
                {metaData.leaderMiles} mi
              </span>
            </p>
          </div>

          <Link
            href="/gvrat-2026"
            className="block w-full text-center font-semibold py-2.5 px-4 rounded-lg transition-colors text-white hover:opacity-90"
            style={{ background: "#1B3F6E" }}
          >
            View Dashboard →
          </Link>
        </div>
      </div>
    </main>
  );
}

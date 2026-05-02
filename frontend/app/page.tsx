import Link from "next/link";
import { metaData } from "@/lib/data";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8">
      <div className="max-w-sm w-full space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-slate-800">GVRAT</h1>
          <p className="text-slate-500 mt-1">Virtual Race Dashboard</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-800">
                GVRAT 2026
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                Day {metaData.dayNumber} of {metaData.totalDays}
              </p>
            </div>
            <span className="text-xs bg-green-100 text-green-800 font-medium px-2 py-1 rounded-full">
              Live
            </span>
          </div>

          <div className="text-sm text-slate-600 space-y-1">
            <p>{metaData.totalRunnersActive.toLocaleString()} active runners</p>
            <p>
              Leader: {metaData.leaderName} &mdash; {metaData.leaderMiles} mi
            </p>
          </div>

          <Link
            href="/gvrat-2026"
            className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors"
          >
            View Dashboard →
          </Link>
        </div>
      </div>
    </main>
  );
}

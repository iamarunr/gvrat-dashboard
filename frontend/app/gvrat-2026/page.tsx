import { leaderboardData, metaData } from "@/lib/data";
import AsOfBanner from "@/components/AsOfBanner";
import DayCounter from "@/components/DayCounter";
import Leaderboard from "@/components/Leaderboard";

export default function GvratDashboard() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">GVRAT 2026</h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Great Virtual Race Across The States
            </p>
          </div>
          <DayCounter
            dayNumber={metaData.dayNumber}
            totalDays={metaData.totalDays}
          />
        </div>

        <AsOfBanner text={metaData.asOfBannerText} />

        <div className="text-sm text-slate-500 space-x-3">
          <span>{metaData.totalRunnersActive.toLocaleString()} active runners</span>
          <span>·</span>
          <span>{metaData.totalMilesLogged.toLocaleString()} miles logged</span>
          <span>·</span>
          <span>
            Leader: {metaData.leaderName} ({metaData.leaderMiles} mi)
          </span>
        </div>

        <Leaderboard runners={leaderboardData.runners} />
      </div>
    </main>
  );
}

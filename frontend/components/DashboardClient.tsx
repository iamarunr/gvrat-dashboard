"use client";

import { useState, useCallback } from "react";
import type { Runner, MetaData } from "@/lib/data";
import AsOfBanner from "@/components/AsOfBanner";
import RaceMap from "@/components/RaceMap";
import StatCards from "@/components/StatCards";
import Leaderboard from "@/components/Leaderboard";

const NAVY = "#1B3F6E";

type Props = {
  runners: Runner[];
  courseCoords: [number, number][];
  meta: MetaData;
};

export default function DashboardClient({ runners, courseCoords, meta }: Props) {
  const [selectedRunner, setSelectedRunner] = useState<Runner | null>(null);

  const handleSelect = useCallback((r: Runner | null) => {
    setSelectedRunner(r);
  }, []);

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "#F8F9FA" }}>
      {/* Header */}
      <header
        className="flex items-center px-4 md:px-8 flex-shrink-0"
        style={{ background: NAVY, height: 64 }}
      >
        <div className="flex items-center justify-between w-full">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white leading-tight">
              GVRAT 2026
            </h1>
            <p className="text-blue-200 text-xs hidden sm:block leading-tight">
              Great Virtual Race Across The States
            </p>
          </div>
          <div className="text-right">
            <div
              className="text-2xl md:text-3xl font-bold tabular-nums leading-tight"
              style={{ color: "#F4A623" }}
            >
              Day {meta.dayNumber}
            </div>
            <div className="text-xs text-blue-200 leading-tight">
              of {meta.totalDays} days
            </div>
          </div>
        </div>
      </header>

      {/* As-of banner */}
      <AsOfBanner text={meta.asOfBannerText} />

      {/* Map — full width, edge to edge */}
      <div
        className="w-full flex-shrink-0 h-[300px] md:h-[60vh]"
        style={{ minHeight: 300, boxShadow: "0 4px 16px rgba(0,0,0,0.10)" }}
      >
        <RaceMap
          runners={runners}
          courseCoords={courseCoords}
          selectedRunner={selectedRunner}
        />
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto w-full px-4 md:px-6 py-6 space-y-6 flex-1">
        <StatCards meta={meta} />
        <Leaderboard
          runners={runners}
          selectedRunner={selectedRunner}
          onSelect={handleSelect}
        />
      </div>

      {/* Footer */}
      <footer
        className="w-full py-4 text-center text-xs flex-shrink-0"
        style={{ background: NAVY, color: "rgba(255,255,255,0.55)" }}
      >
        GVRAT 2026 &middot; Updated daily at 12:00 UTC &middot; dashboard.gvrat.com
      </footer>
    </div>
  );
}

"use client";

import { useState, useCallback } from "react";
import type { Runner, MetaData } from "@/lib/data";
import AsOfBanner from "@/components/AsOfBanner";
import RaceMap from "@/components/RaceMap";
import RaceProgress from "@/components/RaceProgress";
import StatStrip from "@/components/StatStrip";
import Leaderboard from "@/components/Leaderboard";

const NAVY = "#1B3F6E";
const GOLD = "#F4A623";
const DISPLAY = "var(--font-display)";

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
    <div className="flex flex-col min-h-screen" style={{ background: "var(--surface-bg)" }}>
      {/* 1. Title block */}
      <header
        style={{
          background: "var(--surface-panel)",
          borderBottom: "1px solid rgba(0,0,0,0.05)",
          padding: "22px 28px 18px",
          textAlign: "center",
          flexShrink: 0,
        }}
      >
        <h1
          className="race-title"
          style={{
            fontFamily: DISPLAY,
            fontWeight: 800,
            fontSize: 40,
            color: NAVY,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            lineHeight: 1,
            margin: 0,
          }}
        >
          GVRAT 2026
        </h1>
        <p
          className="race-subtitle"
          style={{
            fontFamily: DISPLAY,
            fontWeight: 400,
            fontSize: 10,
            color: "rgba(0,0,0,0.35)",
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            marginTop: 5,
            marginBottom: 0,
          }}
        >
          Great Virtual Race Across The States
        </p>
        <div
          style={{
            width: 40,
            height: 2,
            background: GOLD,
            margin: "8px auto 0",
            borderRadius: 2,
          }}
        />
      </header>

      {/* 2. Stat strip — unboxed, full bleed */}
      <StatStrip meta={meta} />

      {/* 3. Map — full bleed, edge to edge */}
      <div
        className="map-wrap w-full flex-shrink-0 h-[200px] sm:h-[250px] lg:h-[40vh] relative"
        aria-label="Interactive race map showing runner locations"
        style={{
          borderTop: "1px solid rgba(0,0,0,0.05)",
          borderBottom: "1px solid rgba(0,0,0,0.05)",
        }}
      >
        <RaceMap
          runners={runners}
          courseCoords={courseCoords}
          selectedRunner={selectedRunner}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            zIndex: 1000,
            background:
              "linear-gradient(to bottom, transparent 65%, rgba(245,245,243,0.45) 100%)",
          }}
        />
      </div>

      {/* 4. Progress bar */}
      <RaceProgress dayNumber={meta.dayNumber} totalDays={meta.totalDays} />

      {/* 5. Info strip */}
      <AsOfBanner text={meta.asOfBannerText} />

      {/* 6 + 7. Search + Leaderboard */}
      <div className="mx-auto w-full px-4 md:px-6 py-6 flex-1">
        <Leaderboard
          runners={runners}
          selectedRunner={selectedRunner}
          onSelect={handleSelect}
        />
      </div>

      {/* 8. Footer */}
      <footer
        className="w-full py-4 text-center text-xs flex-shrink-0"
        style={{ background: NAVY, color: "rgba(255,255,255,0.85)" }}
      >
        GVRAT 2026 &middot; Updated daily at 12:00 UTC &middot; dashboard.gvrat.com
      </footer>
    </div>
  );
}

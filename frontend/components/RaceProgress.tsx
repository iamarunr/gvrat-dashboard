"use client";

import type { MetaData } from "@/lib/data";

const DISPLAY = "var(--font-display, 'Barlow Condensed', sans-serif)";
const BODY = "var(--font-body, 'DM Sans', sans-serif)";
const GOLD = "#F4A623";

type Props = { dayNumber: number; totalDays: number };

export default function RaceProgress({ dayNumber, totalDays }: Props) {
  const pct = Math.min((dayNumber / totalDays) * 100, 100);

  return (
    <div
      style={{
        background: "#ffffff",
        borderTop: "1px solid rgba(0,0,0,0.06)",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
        padding: "16px 24px",
      }}
    >
      <div style={{ maxWidth: "1024px", margin: "0 auto", position: "relative" }}>
        
        {/* Progress Track */}
        <div
          style={{
            position: "relative",
            height: 20,
            background: "rgba(0,0,0,0.04)",
            borderRadius: 10,
            overflow: "hidden",
            boxShadow: "inset 0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          {/* Gold Fill */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              height: "100%",
              width: `${pct}%`,
              background: `linear-gradient(90deg, rgba(244,166,35,0.7) 0%, rgba(244,166,35,0.9) 100%)`,
              borderRight: "2px solid #D48C1C",
              transition: "width 0.8s ease-out",
            }}
          >
            {/* Subtle Texture overlay */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                opacity: 0.15,
                backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 10px, #000 10px, #000 20px)",
              }}
            />
          </div>
        </div>

        {/* Current Day Marker (larger circle) */}
        <div
          style={{
            position: "absolute",
            top: 10,
            left: `calc(${pct}% - 10px)`,
            transform: "translateY(-50%)",
            width: 20,
            height: 20,
            borderRadius: "50%",
            background: "#ffffff",
            border: `3px solid ${GOLD}`,
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "left 0.8s ease-out",
          }}
        >
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: GOLD }} />
        </div>

        {/* Labels below the track */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 8,
            fontFamily: BODY,
            fontSize: 12,
            color: "rgba(0,0,0,0.5)",
            padding: "0 4px",
          }}
        >
          <span>Day 1 &middot; May 1</span>
          
          {/* Current day label floating with marker, if it's not at the very ends to prevent overlap */}
          {pct > 15 && pct < 85 && (
            <span
              style={{
                position: "absolute",
                top: 36,
                left: `${pct}%`,
                transform: "translateX(-50%)",
                fontWeight: 600,
                color: "#1B3F6E",
                fontFamily: DISPLAY,
                fontSize: 14,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              Day {dayNumber}
            </span>
          )}

          <span>Day {totalDays} &middot; Sep 30</span>
        </div>

      </div>
    </div>
  );
}

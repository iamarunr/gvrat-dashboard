"use client";
import Link from "next/link";
import Image from "next/image";
import { metaData, leaderboardData } from "@/lib/data";



const DISPLAY = "'Barlow Condensed', sans-serif";
const GOLD = "#F4A623";

export default function Home() {
  const pctComplete = Math.min(
    100,
    Math.round((metaData.dayNumber / metaData.totalDays) * 100)
  );

  // Extract top runners
  const realRunners = leaderboardData.runners.filter((r) => !r.virtual);
  const topMen = realRunners
    .filter((r) => r.gender === "M")
    .sort((a, b) => b.miles - a.miles)
    .slice(0, 3);
  const topWomen = realRunners
    .filter((r) => r.gender === "F")
    .sort((a, b) => b.miles - a.miles)
    .slice(0, 3);

  return (
    <main
      style={{
        height: "100vh",
        backgroundImage: "linear-gradient(to bottom, rgba(13, 17, 28, 0.8), rgba(13, 17, 28, 0.9)), url('/bg-topo.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        flexDirection: "column",
        fontFamily: DISPLAY,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* NAV */}
      <nav
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 28px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div
          style={{
            fontFamily: DISPLAY,
            fontWeight: 800,
            fontSize: 14,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.35)",
          }}
        >
          GVRAT 2026
        </div>
        <a
          href="https://gvrat.racing"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontFamily: DISPLAY,
            fontWeight: 700,
            fontSize: 11,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.35)",
            textDecoration: "none",
          }}
        >
          gvrat.racing ↗
        </a>
      </nav>

      {/* HERO */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 24px 60px",
          textAlign: "center",
        }}
      >


        {/* Logo */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            marginBottom: 8,
            mixBlendMode: "lighten",
          }}
        >
          <Image
            src="/gvrat-logo-transparent.png"
            alt="GVRAT 2026"
            width={160}
            height={160}
            priority
            style={{ mixBlendMode: "lighten" }}
          />
        </div>

        {/* Route progress bar */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            width: "100%",
            maxWidth: 640,
            marginBottom: 20,
            marginTop: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 11,
              fontFamily: DISPLAY,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.4)",
              marginBottom: 8,
            }}
          >
            <span>Baxter Springs, KS</span>
            <span>Pueblo, CO</span>
          </div>

          <div
            style={{
              position: "relative",
              height: 6,
              background: "rgba(255,255,255,0.08)",
              borderRadius: 3,
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                height: "100%",
                width: `${pctComplete}%`,
                background: GOLD,
                borderRadius: 3,
                transition: "width 0.8s ease-out",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: `${pctComplete}%`,
                top: "50%",
                transform: "translate(-50%, -50%)",
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: GOLD,
                boxShadow:
                  "0 0 0 4px rgba(244,166,35,0.2), 0 0 12px rgba(244,166,35,0.5)",
              }}
            />
          </div>
        </div>

        {/* Live stats strip */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            display: "flex",
            gap: 0,
            marginBottom: 20,
            width: "100%",
            maxWidth: 640,
          }}
        >
          {[
            {
              value: metaData.dayNumber.toString(),
              label: `Race Day`,
              color: "rgba(255,255,255,0.95)",
            },
            {
              value: metaData.totalRunnersActive.toLocaleString(),
              label: "Runners on course",
              color: "rgba(255,255,255,0.95)",
            },
            {
              value: metaData.totalMilesLogged.toLocaleString(),
              label: "Miles logged",
              color: GOLD,
            },
          ].map((stat, i, arr) => (
            <div
              key={i}
              style={{
                flex: 1,
                textAlign: "center",
                padding: "0 20px",
                borderRight:
                  i < arr.length - 1
                    ? "1px solid rgba(255,255,255,0.08)"
                    : "none",
              }}
            >
              <div
                style={{
                  fontFamily: DISPLAY,
                  fontWeight: 800,
                  fontSize: "clamp(28px, 4vw, 40px)",
                  lineHeight: 1,
                  color: stat.color,
                  fontVariantNumeric: "tabular-nums",
                  letterSpacing: "-0.01em",
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  fontFamily: DISPLAY,
                  fontWeight: 400,
                  fontSize: 11,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.4)",
                  marginTop: 6,
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Mini Leaderboard Table */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            display: "flex",
            gap: 40,
            justifyContent: "center",
            width: "100%",
            maxWidth: 680,
            marginBottom: 28,
            background: "rgba(0,0,0,0.3)",
            backdropFilter: "blur(4px)",
            border: "1px solid rgba(255,255,255,0.05)",
            borderRadius: 12,
            padding: "20px 40px",
            textAlign: "left",
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
          }}
        >
          {/* Top Women */}
          <div style={{ flex: 1 }}>
            <h3
              style={{
                fontFamily: DISPLAY,
                fontSize: 13,
                fontWeight: 700,
                color: "rgba(255,255,255,0.5)",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                marginBottom: 16,
                borderBottom: "1px solid rgba(255,255,255,0.08)",
                paddingBottom: 8,
              }}
            >
              Top Women
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {topWomen.map((r, i) => (
                <div key={r.bib} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
                    <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 13, fontWeight: 600 }}>{i + 1}</span>
                    <span style={{ color: "rgba(255,255,255,0.95)", fontSize: 17, fontWeight: 500, letterSpacing: "0.02em" }}>
                      {r.displayName.split(" ")[0]} {r.displayName.split(" ").length > 1 ? r.displayName.split(" ")[1][0] + "." : ""}
                    </span>
                  </div>
                  <span style={{ color: GOLD, fontSize: 17, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                    {r.miles.toFixed(1)} <span style={{ fontSize: 11, color: "rgba(244,166,35,0.6)", fontWeight: 800 }}>MI</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Vertical Divider */}
          <div style={{ width: 1, background: "rgba(255,255,255,0.08)" }} />

          {/* Top Men */}
          <div style={{ flex: 1 }}>
            <h3
              style={{
                fontFamily: DISPLAY,
                fontSize: 13,
                fontWeight: 700,
                color: "rgba(255,255,255,0.5)",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                marginBottom: 16,
                borderBottom: "1px solid rgba(255,255,255,0.08)",
                paddingBottom: 8,
              }}
            >
              Top Men
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {topMen.map((r, i) => (
                <div key={r.bib} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
                    <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 13, fontWeight: 600 }}>{i + 1}</span>
                    <span style={{ color: "rgba(255,255,255,0.95)", fontSize: 17, fontWeight: 500, letterSpacing: "0.02em" }}>
                      {r.displayName.split(" ")[0]} {r.displayName.split(" ").length > 1 ? r.displayName.split(" ")[1][0] + "." : ""}
                    </span>
                  </div>
                  <span style={{ color: GOLD, fontSize: 17, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                    {r.miles.toFixed(1)} <span style={{ fontSize: 11, color: "rgba(244,166,35,0.6)", fontWeight: 800 }}>MI</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div style={{ position: "relative", zIndex: 2 }}>
          <Link
            id="view-leaderboard-btn"
            href="/gvrat-2026"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontFamily: DISPLAY,
              fontWeight: 800,
              fontSize: 15,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "oklch(12% 0.018 248)",
              background: GOLD,
              padding: "14px 40px",
              borderRadius: 4,
              textDecoration: "none",
              transition: "opacity 0.15s, transform 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.opacity = "0.88";
              (
                e.currentTarget as HTMLAnchorElement
              ).style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.opacity = "1";
              (
                e.currentTarget as HTMLAnchorElement
              ).style.transform = "translateY(0)";
            }}
          >
            View Full Leaderboard
          </Link>
          <p
            style={{
              fontFamily: DISPLAY,
              fontSize: 13,
              fontWeight: 500,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.4)",
              marginTop: 16,
              textAlign: "center",
            }}
          >
            Updated daily · 12:00 UTC
          </p>
        </div>
      </div>
    </main>
  );
}

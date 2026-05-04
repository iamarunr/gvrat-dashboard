"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { Runner } from "@/lib/data";

const PAGE_SIZE = 10;
const FINISH_MILES = 679;
const NAVY = "#1B3F6E";
const GOLD = "#F4A623";
const RED = "#C0392B";
const GREEN = "#27AE60";
const DISPLAY = "var(--font-display)";

const HEADER_BG = "linear-gradient(180deg, #1B3F6E 0%, #163558 100%)";

function getCountry(home: string): string {
  return home.startsWith("US-") ? "US" : home;
}

function formatProjFinShort(projFin: string): string {
  if (!projFin || projFin === "—") return "—";
  if (projFin === "FINISHED") return "🎉";
  try {
    const date = new Date(projFin + "T00:00:00");
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return projFin;
  }
}

type SortKey = { col: string; dir: "asc" | "desc" };

function sortRunners(rows: Runner[], sort: SortKey): Runner[] {
  return [...rows].sort((a, b) => {
    let av: string | number = 0;
    let bv: string | number = 0;
    switch (sort.col) {
      case "pos": av = a.rank; bv = b.rank; break;
      case "bib": av = a.bib; bv = b.bib; break;
      case "name": av = a.displayName; bv = b.displayName; break;
      case "gender": av = a.gender; bv = b.gender; break;
      case "miles": av = a.miles; bv = b.miles; break;
      case "km": av = a.km; bv = b.km; break;
      case "comp": av = a.compPercent; bv = b.compPercent; break;
      case "proj": av = a.projectedFinish; bv = b.projectedFinish; break;
      case "genderPlace": av = a.genderRank ?? Infinity; bv = b.genderRank ?? Infinity; break;
    }
    if (av < bv) return sort.dir === "asc" ? -1 : 1;
    if (av > bv) return sort.dir === "asc" ? 1 : -1;
    return 0;
  });
}

function getPosColor(r: Runner): string {
  if (r.virtualType === "buzzard") return RED;
  if (r.rankDisplay === "#1" && !r.virtual) return GOLD;
  return NAVY;
}

function getRowBg(r: Runner, idx: number, selectedBib: number | undefined): string {
  if (r.virtualType === "gingerbread") return "linear-gradient(90deg, #fffbf0, #ffffff)";
  if (r.virtualType === "buzzard") return "linear-gradient(90deg, #fff5f5, #ffffff)";
  if (selectedBib !== undefined && r.bib === selectedBib) return "#e8f4fd";
  return idx % 2 === 0 ? "#ffffff" : "#fafafa";
}

type RowProps = {
  r: Runner;
  idx: number;
  selectedBib: number | undefined;
  onMapPin: (r: Runner) => void;
  onNavigate: (r: Runner) => void;
};

function DataRow({ r, idx, selectedBib, onMapPin, onNavigate }: RowProps) {
  const isGingerbread = r.virtualType === "gingerbread";
  const isBuzzard = r.virtualType === "buzzard";
  const rowBg = getRowBg(r, idx, selectedBib);

  return (
    <div
      className="lb-grid-row"
      tabIndex={isGingerbread ? undefined : 0}
      role={isGingerbread ? "row" : "button"}
      onKeyDown={!isGingerbread ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onNavigate(r); } } : undefined}
      style={{
        background: rowBg,
        borderBottom: "1px solid rgba(0,0,0,0.04)",
        cursor: isGingerbread ? "default" : "pointer",
        transition: "background 0.1s, outline 0.1s",
      }}
      onClick={() => !isGingerbread && onNavigate(r)}
      onMouseEnter={
        isGingerbread
          ? undefined
          : (e) => { (e.currentTarget as HTMLElement).style.background = "#f0f5ff"; }
      }
      onMouseLeave={
        isGingerbread
          ? undefined
          : (e) => { (e.currentTarget as HTMLElement).style.background = rowBg; }
      }
      title={
        isBuzzard
          ? "Stay ahead of the Buzzard to finish by Sep 30! Runners below this line may not finish in time."
          : undefined
      }
    >
      {/* Col 1: Pos */}
      <div
        style={{
          fontFamily: DISPLAY,
          fontWeight: 800,
          fontSize: 14,
          color: getPosColor(r),
          textAlign: "right",
        }}
      >
        {r.rankDisplay}
      </div>

      {/* Col 2: Bib */}
      <div
        className="hide-tablet"
        style={{ fontSize: 12, color: "rgba(0,0,0,0.3)", textAlign: "right" }}
      >
        {r.bib}
      </div>

      {/* Col 3: Location pin */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMapPin(r);
          }}
          title="Zoom to this runner on the map"
          style={{
            width: "24px",
            height: "24px",
            borderRadius: "50%",
            border: "1px solid rgba(0,0,0,0.1)",
            background: "#ffffff",
            fontSize: "11px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            flexShrink: 0,
            padding: 0,
            margin: "0 auto",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#1B3F6E"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#ffffff"; }}
        >
          📍
        </button>
      </div>

      {/* Col 4: Name */}
      <div style={{ display: "flex", alignItems: "center", gap: 5, minWidth: 0 }}>
        {r.virtualType === "gingerbread" && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src="/icons/gingerbread.svg" width={12} height={12} alt="" style={{ flexShrink: 0 }} />
        )}
        {r.virtualType === "buzzard" && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src="/icons/buzzard.svg" width={14} height={14} alt="" style={{ flexShrink: 0 }} />
        )}
        <span
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: isBuzzard ? RED : "#1A1A2E",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {r.displayName}
        </span>
        {!isGingerbread && (
          <div
            style={{
              width: 13,
              height: 13,
              borderRadius: 3,
              background: isBuzzard ? "rgba(192,57,43,0.08)" : "rgba(27,63,110,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 8,
              color: isBuzzard ? RED : NAVY,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7"/><path d="M7 7h10v10"/></svg>
          </div>
        )}
      </div>

      {/* Col 5: G */}
      <div style={{ fontSize: 12, color: "rgba(0,0,0,0.4)", textAlign: "center" }}>
        {r.gender}
      </div>

      {/* Col 6: Miles + progress bar */}
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {r.miles >= FINISH_MILES ? (
          <span style={{ fontSize: 12, fontWeight: 600, color: GREEN }}>🎉</span>
        ) : (
          <>
            <span
              className="tabular-nums"
              style={{
                fontFamily: DISPLAY,
                fontWeight: 700,
                fontSize: 13,
                color: isBuzzard ? RED : "#1A1A2E",
              }}
            >
              {r.miles.toFixed(2)}
            </span>
            <div style={{ height: 2, background: "#eeece8", borderRadius: 2, width: "100%" }}>
              <div
                style={{
                  height: "100%",
                  background: isBuzzard ? RED : GOLD,
                  borderRadius: 2,
                  width: `${Math.min(r.compPercent, 100)}%`,
                }}
              />
            </div>
          </>
        )}
      </div>

      {/* Col 7: KM */}
      <div
        className="hide-tablet tabular-nums"
        style={{ fontSize: 12, color: "rgba(0,0,0,0.4)", textAlign: "right" }}
      >
        {r.km.toFixed(2)}
      </div>

      {/* Col 8: Comp% */}
      <div
        className="hide-tablet tabular-nums"
        style={{ fontSize: 12, color: "rgba(0,0,0,0.4)", textAlign: "right" }}
      >
        {r.compPercent.toFixed(2)}%
      </div>

      {/* Col 9: Proj Fin */}
      <div style={{ fontSize: 12, color: "rgba(0,0,0,0.5)" }}>
        {formatProjFinShort(r.projectedFinish)}
      </div>

      {/* Col 10: Gender Place */}
      <div
        className="hide-tablet tabular-nums"
        style={{ fontSize: 12, color: "rgba(0,0,0,0.5)", textAlign: "right" }}
      >
        {r.genderRank != null ? `#${r.genderRank}` : "—"}
      </div>
    </div>
  );
}

const HEADER_COLS = [
  { id: "pos",         label: "Pos",                hide: "",            noSort: false },
  { id: "bib",         label: "Bib",                hide: "hide-tablet", noSort: false },
  { id: "location",    label: "Location",           hide: "hide-mobile", noSort: true  },
  { id: "name",        label: "Participant's Name", hide: "",            noSort: false },
  { id: "gender",      label: "G",                  hide: "",            noSort: false },
  { id: "miles",       label: "Miles",              hide: "",            noSort: false },
  { id: "km",          label: "KM",                 hide: "hide-tablet", noSort: false },
  { id: "comp",        label: "Comp%",              hide: "hide-tablet", noSort: false },
  { id: "proj",        label: "Proj Fin",           hide: "",            noSort: false },
  { id: "genderPlace", label: "Gender Place",       hide: "hide-tablet", noSort: false },
];

type Props = {
  runners: Runner[];
  selectedRunner: Runner | null;
  onSelect: (r: Runner | null) => void;
};

export default function Leaderboard({ runners, selectedRunner, onSelect }: Props) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [genderFilter, setGenderFilter] = useState("All");
  const [countryFilter, setCountryFilter] = useState("All");
  const [sort, setSort] = useState<SortKey>({ col: "pos", dir: "asc" });
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const onSelectRef = useRef(onSelect);
  useEffect(() => {
    onSelectRef.current = onSelect;
  });

  const gingerbread = useMemo(
    () => runners.find((r) => r.virtualType === "gingerbread") ?? null,
    [runners]
  );
  const buzzard = useMemo(
    () => runners.find((r) => r.virtualType === "buzzard") ?? null,
    [runners]
  );
  const realRunners = useMemo(() => runners.filter((r) => !r.virtual), [runners]);

  const countries = useMemo(() => {
    const set = new Set(realRunners.map((r) => getCountry(r.home)));
    return ["All", ...Array.from(set).sort()];
  }, [realRunners]);

  const isSearchActive = !!(searchQuery || genderFilter !== "All" || countryFilter !== "All");

  const realFiltered = useMemo(() => {
    return realRunners.filter((r) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!r.displayName.toLowerCase().includes(q) && !String(r.bib).includes(q))
          return false;
      }
      if (genderFilter !== "All" && r.gender !== genderFilter) return false;
      if (countryFilter !== "All" && getCountry(r.home) !== countryFilter) return false;
      return true;
    });
  }, [realRunners, searchQuery, genderFilter, countryFilter]);

  useEffect(() => {
    if (searchQuery && realFiltered.length === 1) {
      onSelectRef.current(realFiltered[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [realFiltered, searchQuery]);

  const pool = useMemo(
    () => (buzzard ? [...realFiltered, buzzard] : realFiltered),
    [realFiltered, buzzard]
  );
  const sorted = useMemo(() => sortRunners(pool, sort), [pool, sort]);

  const visibleRows = isSearchActive ? sorted : sorted.slice(0, visibleCount);
  const buzzardInVisible = visibleRows.some((r) => r.virtualType === "buzzard");
  const showPinnedBuzzard = !buzzardInVisible && !!buzzard;

  const totalRealFiltered = realFiltered.length;
  const visibleRealCount = visibleRows.filter((r) => !r.virtual).length;
  const hasMore = !isSearchActive && visibleRealCount < totalRealFiltered;

  const selectedBib = selectedRunner?.bib;

  function handleSort(colId: string) {
    setSort((prev) =>
      prev.col === colId
        ? { col: colId, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { col: colId, dir: "asc" }
    );
  }

  function handleSearch(val: string) {
    setSearchQuery(val);
    setVisibleCount(PAGE_SIZE);
    if (!val) onSelect(null);
  }

  function handleMapPin(r: Runner) {
    onSelect(selectedRunner?.bib === r.bib ? null : r);
  }

  function handleNavigate(r: Runner) {
    router.push(`/gvrat-2026/runner/${r.bib}`);
  }

  const pillBase: React.CSSProperties = {
    fontFamily: DISPLAY,
    fontSize: 12,
    textTransform: "uppercase",
    padding: "0 16px",
    minHeight: 44,
    borderRadius: 22,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    lineHeight: 1,
  };

  const thBase: React.CSSProperties = {
    fontFamily: DISPLAY,
    fontSize: 11,
    color: "rgba(255,255,255,0.6)",
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    userSelect: "none",
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto w-full">
      <style>{`
          .lb-grid-row {
            display: grid;
            grid-template-columns: 40px 36px 50px 1fr 24px 72px 60px 54px 70px 70px;
            gap: 12px;
            padding: 10px 18px;
            align-items: center;
          }
          .lb-grid-row:focus-visible {
            outline: 2px solid #1B3F6E;
            outline-offset: -2px;
            border-radius: 4px;
          }
          @media (max-width: 768px) {
            .lb-grid-row {
              grid-template-columns: 40px 1fr 24px 72px 64px;
              padding: 10px 12px;
              gap: 8px;
            }
            .hide-tablet, .hide-mobile { display: none !important; }
            .lb-header { font-size: 7.5px !important; letter-spacing: 0.1em !important; }
          }
          @media (max-width: 430px) {
            .lb-grid-row {
              grid-template-columns: 32px 1fr 24px 64px 60px;
              padding: 10px 8px;
              gap: 4px;
            }
            .lb-header { font-size: 7px !important; }
          }
      `}</style>

      {/* Toolbar: Search + Filters */}
      <div
        style={{
          display: "flex",
          gap: 16,
          alignItems: "center",
          flexWrap: "wrap",
          padding: "0 4px",
        }}
      >
        {/* Search input - now bounded and inline */}
        <div style={{ position: "relative", flex: "1 1 280px", maxWidth: "340px" }}>
          <span
            style={{
              position: "absolute",
              left: 14,
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: 14,
              pointerEvents: "none",
              userSelect: "none",
              lineHeight: 1,
              zIndex: 1,
              opacity: 0.5,
              display: "flex"
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </span>
          <input
            type="text"
            placeholder="Search runners…"
            aria-label="Search runners by name or bib"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            style={{
              width: "100%",
              height: "44px",
              background: "#ffffff",
              border: "1px solid rgba(0,0,0,0.1)",
              borderRadius: "22px",
              padding: "0 40px 0 36px",
              fontSize: "14px",
              outline: "none",
              transition: "border-color 0.2s, box-shadow 0.2s",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = NAVY;
              e.target.style.boxShadow = `0 0 0 2px rgba(27,63,110,0.15)`;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "rgba(0,0,0,0.1)";
              e.target.style.boxShadow = "none";
            }}
          />
          {searchQuery.length > 0 && (
            <button
              onClick={() => handleSearch("")}
              aria-label="Clear search"
              style={{
                position: "absolute",
                right: 12,
                top: "50%",
                transform: "translateY(-50%)",
                background: "rgba(0,0,0,0.08)",
                color: "rgba(0,0,0,0.5)",
                border: "none",
                borderRadius: "50%",
                width: 20,
                height: 20,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                padding: 0,
                zIndex: 1,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(0,0,0,0.15)";
                e.currentTarget.style.color = "rgba(0,0,0,0.8)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(0,0,0,0.08)";
                e.currentTarget.style.color = "rgba(0,0,0,0.5)";
              }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center" style={{ gap: 6 }}>
          {(["All", "M", "F"] as const).map((g) => (
            <button
              key={g}
              onClick={() => setGenderFilter(g)}
              aria-pressed={genderFilter === g}
              className="transition-all"
              style={{
                ...pillBase,
                ...(genderFilter === g
                  ? { background: NAVY, color: "#fff", border: `1px solid ${NAVY}` }
                  : { background: "#fff", border: "1px solid rgba(0,0,0,0.12)", color: "rgba(0,0,0,0.6)" }),
              }}
            >
              {g === "All" ? "All genders" : g}
            </button>
          ))}
          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            style={{
              ...pillBase,
              border: "1px solid rgba(0,0,0,0.12)",
              background: "#fff",
              color: "rgba(0,0,0,0.6)",
              outline: "none",
              cursor: "pointer",
            }}
            aria-label="Filter by country"
          >
            {countries.map((c) => (
              <option key={c} value={c}>
                {c === "All" ? "All countries" : c}
              </option>
            ))}
          </select>
        </div>

        {/* Results count */}
        <span
          className="hidden md:block"
          style={{ fontSize: 11, color: "rgba(0,0,0,0.3)", marginLeft: "auto" }}
        >
          Showing {visibleRealCount} of {totalRealFiltered}
        </span>
      </div>

      {/* Legend */}
      <div
        style={{
          display: "flex",
          gap: 20,
          fontSize: 12,
          color: "rgba(0,0,0,0.4)",
          padding: "4px 4px 0",
          flexWrap: "wrap",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 14,
              height: 14,
              borderRadius: 3,
              background: "rgba(27,63,110,0.1)",
              color: NAVY,
              fontSize: 9,
              fontWeight: 700,
            }}
          >
            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7"/><path d="M7 7h10v10"/></svg>
          </span>
          Click runner to view profile
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ fontSize: 13 }}>📍</span>
          Click pin to zoom map
        </span>
      </div>

      {/* Leaderboard Table */}
      <div className="table-wrap shadow-sm" style={{ borderRadius: 10, overflow: "hidden", border: "1px solid rgba(0,0,0,0.05)" }}>
        {/* Header */}
        <div className="lb-grid-row" style={{ background: HEADER_BG, borderRadius: "10px 10px 0 0" }}>
          {HEADER_COLS.map(({ id, label, hide, noSort }) => (
            <div
              key={id}
              className={`${hide} lb-header`}
              onClick={noSort ? undefined : () => handleSort(id)}
              title={noSort ? undefined : `Sort by ${label}`}
              style={{
                ...thBase,
                cursor: noSort ? "default" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: id === "bib" || id === "km" || id === "comp" || id === "genderPlace" ? "flex-end" : (id === "location" || id === "gender" ? "center" : "flex-start"),
                gap: 4,
              }}
            >
              {label}
              {!noSort && (
                <span 
                  style={{ 
                    opacity: sort.col === id ? 0.9 : 0.3,
                    fontSize: sort.col === id ? 12 : 10,
                    transition: "opacity 0.2s"
                  }}
                  className={sort.col !== id ? "hover:opacity-100" : ""}
                >
                  {sort.col === id ? (sort.dir === "asc" ? "↑" : "↓") : "↕"}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Gingerbread — always pinned first */}
        {gingerbread && (
          <DataRow
            r={gingerbread}
            idx={-1}
            selectedBib={selectedBib}
            onMapPin={handleMapPin}
            onNavigate={handleNavigate}
          />
        )}

        {/* Visible rows */}
        {visibleRows.map((r, i) => (
          <DataRow
            key={r.bib}
            r={r}
            idx={i}
            selectedBib={selectedBib}
            onMapPin={handleMapPin}
            onNavigate={handleNavigate}
          />
        ))}

        {/* Pinned Buzzard separator when outside current page */}
        {showPinnedBuzzard && buzzard && (
          <>
            <div
              style={{
                textAlign: "center",
                fontSize: 12,
                fontWeight: 500,
                color: RED,
                background: "#FFF0EE",
                padding: "8px 14px",
                borderBottom: "1px solid rgba(0,0,0,0.04)",
              }}
            >
              ── 🦅 Buzzard is at position #{buzzard.rank} ──
            </div>
            <DataRow
              r={buzzard}
              idx={-2}
              selectedBib={selectedBib}
              onMapPin={handleMapPin}
              onNavigate={handleNavigate}
            />
          </>
        )}
      </div>

      {totalRealFiltered === 0 && (
        <p className="text-center py-10" style={{ color: "#6B7280" }}>
          No runners match the current filters.
        </p>
      )}

      {hasMore && (
        <div className="flex justify-center pt-2">
          <button
            onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
            className="show-btn transition-all hover:opacity-90 active:scale-95 shadow-sm"
            style={{ 
              background: GOLD, 
              color: NAVY,
              minHeight: 44,
              padding: "0 32px",
              borderRadius: 22,
              fontSize: 14,
              fontWeight: 600,
              display: "inline-flex",
              alignItems: "center"
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "center" }}>
              Show next {PAGE_SIZE}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </span>
          </button>
        </div>
      )}
    </div>
  );
}

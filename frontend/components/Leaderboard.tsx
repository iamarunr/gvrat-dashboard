"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import type { Runner } from "@/lib/data";
import {
  formatMiles,
  formatKm,
  formatCompPercent,
  formatProjFinish,
} from "@/lib/format";

const PAGE_SIZE = 10;
const FINISH_MILES = 679;
const NAVY = "#1B3F6E";
const GOLD = "#F4A623";
const RED = "#C0392B";
const GREEN = "#27AE60";

function getCountry(home: string): string {
  return home.startsWith("US-") ? "US" : home;
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
      case "event": av = a.event; bv = b.event; break;
      case "home": av = a.home; bv = b.home; break;
      case "gender": av = a.gender; bv = b.gender; break;
      case "age": av = a.age; bv = b.age; break;
      case "miles": av = a.miles; bv = b.miles; break;
      case "km": av = a.km; bv = b.km; break;
      case "comp": av = a.compPercent; bv = b.compPercent; break;
      case "proj": av = a.projectedFinish; bv = b.projectedFinish; break;
      case "genderPlace": av = a.genderRank ?? Infinity; bv = b.genderRank ?? Infinity; break;
      case "eventGen": av = a.eventGen; bv = b.eventGen; break;
    }
    if (av < bv) return sort.dir === "asc" ? -1 : 1;
    if (av > bv) return sort.dir === "asc" ? 1 : -1;
    return 0;
  });
}

type ColDef = {
  id: string;
  header: string;
  mobile: boolean;
  align?: "right";
  render: (r: Runner) => React.ReactNode;
};

const COLS: ColDef[] = [
  {
    id: "pos", header: "Pos", mobile: true, align: "right",
    render: (r) => (
      <span
        className="tabular-nums font-bold"
        style={r.rank <= 3 && !r.virtual ? { color: NAVY } : {}}
      >
        {r.rankDisplay}
      </span>
    ),
  },
  {
    id: "bib", header: "Bib", mobile: true, align: "right",
    render: (r) => <span className="tabular-nums">{r.bib}</span>,
  },
  {
    id: "name", header: "Participant's Name", mobile: true,
    render: (r) => {
      const icon =
        r.virtualType === "gingerbread" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src="/icons/gingerbread.svg" width={16} height={16} className="inline -mt-0.5 mr-1" alt="" />
        ) : r.virtualType === "buzzard" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src="/icons/buzzard.svg" width={16} height={16} className="inline -mt-0.5 mr-1" alt="" />
        ) : null;
      return (
        <span className={r.rank === 1 && !r.virtual ? "font-bold" : ""}>
          {icon}{r.displayName}
        </span>
      );
    },
  },
  {
    id: "event", header: "Event", mobile: false,
    render: (r) => r.event,
  },
  {
    id: "home", header: "Home", mobile: true,
    render: (r) => r.home,
  },
  {
    id: "gender", header: "G", mobile: true,
    render: (r) => r.gender,
  },
  {
    id: "age", header: "A", mobile: true, align: "right",
    render: (r) => <span className="tabular-nums">{r.age}</span>,
  },
  {
    id: "miles", header: "Miles", mobile: true, align: "right",
    render: (r) =>
      r.miles >= FINISH_MILES ? (
        <span className="font-semibold" style={{ color: GREEN }}>FINISHED 🎉</span>
      ) : (
        <span className="tabular-nums">{formatMiles(r.miles)}</span>
      ),
  },
  {
    id: "km", header: "KM", mobile: false, align: "right",
    render: (r) => <span className="tabular-nums">{formatKm(r.km)}</span>,
  },
  {
    id: "comp", header: "Comp%", mobile: true, align: "right",
    render: (r) => <span className="tabular-nums">{formatCompPercent(r.compPercent)}</span>,
  },
  {
    id: "proj", header: "Proj Fin", mobile: true,
    render: (r) => formatProjFinish(r.projectedFinish),
  },
  {
    id: "genderPlace", header: "Gender Place", mobile: false, align: "right",
    render: (r) =>
      r.genderRank != null ? <span className="tabular-nums">#{r.genderRank}</span> : "—",
  },
  {
    id: "eventGen", header: "Event Gen", mobile: false,
    render: (r) => r.eventGen,
  },
];

function rowStyle(
  r: Runner,
  idx: number,
  selectedBib: number | undefined
): React.CSSProperties {
  if (r.virtualType === "gingerbread")
    return { background: "#FFF8E7", borderLeft: `4px solid ${GOLD}` };
  if (r.virtualType === "buzzard")
    return { background: "#FFF5F5", borderLeft: `4px solid ${RED}` };
  if (selectedBib !== undefined && r.bib === selectedBib)
    return {
      background: "#E8F4FD",
      borderLeft: `4px solid ${NAVY}`,
      animation: "borderPulse 2s ease-in-out infinite",
    };
  if (r.rank === 1 && !r.virtual)
    return { background: "#FFFDF0", borderLeft: `4px solid ${GOLD}` };
  return { background: idx % 2 === 0 ? "#ffffff" : "#FAFAFA" };
}

type RowProps = {
  r: Runner;
  idx: number;
  selectedBib: number | undefined;
  onRowClick: (r: Runner) => void;
};

function DataRow({ r, idx, selectedBib, onRowClick }: RowProps) {
  const isBuzzard = r.virtualType === "buzzard";
  return (
    <tr
      onClick={() => !r.virtual && onRowClick(r)}
      style={{ ...rowStyle(r, idx, selectedBib), cursor: r.virtual ? "default" : "pointer" }}
      className={!r.virtual ? "hover:bg-blue-50 transition-colors" : ""}
      title={
        isBuzzard
          ? "Stay ahead of the Buzzard to finish by Sep 30! Runners below this line may not finish in time."
          : undefined
      }
    >
      {COLS.map((col) => (
        <td
          key={col.id}
          className={`px-3 py-2 whitespace-nowrap text-sm ${
            col.align === "right" ? "text-right" : ""
          } ${col.mobile ? "" : "hidden md:table-cell"}`}
        >
          {col.render(r)}
        </td>
      ))}
    </tr>
  );
}

type Props = {
  runners: Runner[];
  selectedRunner: Runner | null;
  onSelect: (r: Runner | null) => void;
};

export default function Leaderboard({ runners, selectedRunner, onSelect }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [genderFilter, setGenderFilter] = useState("All");
  const [countryFilter, setCountryFilter] = useState("All");
  const [sort, setSort] = useState<SortKey>({ col: "pos", dir: "asc" });
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Stable ref avoids stale onSelect in the auto-select effect
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

  // Auto-select when exactly one runner matches search
  useEffect(() => {
    if (searchQuery && realFiltered.length === 1) {
      onSelectRef.current(realFiltered[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [realFiltered, searchQuery]);

  // Pool for sort: real filtered + buzzard (buzzard always participates in sorting)
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

  function handleRowClick(r: Runner) {
    onSelect(selectedRunner?.bib === r.bib ? null : r);
  }

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="space-y-3">
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg select-none pointer-events-none">
            🔍
          </span>
          <input
            type="text"
            placeholder="Search by name or bib number…"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-full text-sm focus:outline-none transition-all"
            style={{ border: `2px solid ${NAVY}`, boxShadow: "0 1px 4px rgba(27,63,110,0.08)" }}
            onFocus={(e) =>
              (e.target.style.boxShadow = "0 0 0 3px rgba(244,166,35,0.35)")
            }
            onBlur={(e) =>
              (e.target.style.boxShadow = "0 1px 4px rgba(27,63,110,0.08)")
            }
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-1">
            {(["All", "M", "F"] as const).map((g) => (
              <button
                key={g}
                onClick={() => setGenderFilter(g)}
                className="px-3 py-1 rounded-full text-xs font-medium transition-all"
                style={
                  genderFilter === g
                    ? { background: NAVY, color: "white" }
                    : { background: "#E5E7EB", color: "#374151" }
                }
              >
                {g === "All" ? "All genders" : g}
              </button>
            ))}
          </div>
          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            className="border border-slate-300 rounded-full px-3 py-1 text-xs focus:outline-none bg-white"
            aria-label="Filter by country"
          >
            {countries.map((c) => (
              <option key={c} value={c}>
                {c === "All" ? "All countries" : c}
              </option>
            ))}
          </select>
          <span className="text-xs ml-auto" style={{ color: "#6B7280" }}>
            Showing {visibleRealCount} of {totalRealFiltered} runners
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-sm">
        <table className="min-w-full text-sm">
          <thead>
            <tr>
              {COLS.map((col) => (
                <th
                  key={col.id}
                  onClick={() => handleSort(col.id)}
                  className={`px-3 py-2.5 text-xs font-semibold uppercase tracking-wider whitespace-nowrap cursor-pointer select-none transition-opacity hover:opacity-80 ${
                    col.align === "right" ? "text-right" : "text-left"
                  } ${col.mobile ? "" : "hidden md:table-cell"}`}
                  style={{ background: NAVY, color: "white" }}
                >
                  {col.header}
                  {sort.col === col.id && (
                    <span className="ml-1 opacity-75">
                      {sort.dir === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Gingerbread — always pinned first, not paginated */}
            {gingerbread && (
              <DataRow
                r={gingerbread}
                idx={-1}
                selectedBib={selectedBib}
                onRowClick={handleRowClick}
              />
            )}

            {visibleRows.map((r, i) => (
              <DataRow
                key={r.bib}
                r={r}
                idx={i}
                selectedBib={selectedBib}
                onRowClick={handleRowClick}
              />
            ))}

            {/* Pinned buzzard separator when outside the current page */}
            {showPinnedBuzzard && buzzard && (
              <>
                <tr>
                  <td
                    colSpan={COLS.length}
                    className="py-1 text-center text-xs font-medium"
                    style={{ color: RED, background: "#FFF0EE" }}
                  >
                    ── 🦅 Buzzard is at position #{buzzard.rank} ──
                  </td>
                </tr>
                <DataRow
                  r={buzzard}
                  idx={-2}
                  selectedBib={selectedBib}
                  onRowClick={handleRowClick}
                />
              </>
            )}
          </tbody>
        </table>

        {totalRealFiltered === 0 && (
          <p className="text-center py-10" style={{ color: "#6B7280" }}>
            No runners match the current filters.
          </p>
        )}
      </div>

      {hasMore && (
        <div className="flex justify-center">
          <button
            onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
            className="w-full sm:w-auto px-8 py-2.5 rounded-full text-sm font-semibold transition-all hover:opacity-90 active:scale-95"
            style={{ background: GOLD, color: "white" }}
          >
            Show next {PAGE_SIZE} ▼
          </button>
        </div>
      )}
    </div>
  );
}

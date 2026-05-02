"use client";

import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from "@tanstack/react-table";
import type { Runner } from "@/lib/data";
import { formatMiles, formatKm, formatCompPercent, formatProjFinish } from "@/lib/format";

const columnHelper = createColumnHelper<Runner>();

const columns = [
  columnHelper.accessor("rank", {
    id: "pos",
    header: "Pos",
    cell: (info) => info.row.original.rankDisplay,
  }),
  columnHelper.accessor("bib", {
    header: "Bib",
  }),
  columnHelper.accessor("displayName", {
    id: "name",
    header: "Participant's Name",
    cell: (info) => {
      const r = info.row.original;
      const icon =
        r.virtualType === "gingerbread"
          ? "🍪 "
          : r.virtualType === "buzzard"
          ? "🦅 "
          : "";
      return `${icon}${r.displayName}`;
    },
  }),
  columnHelper.accessor("event", { header: "Event" }),
  columnHelper.accessor("home", { header: "Home" }),
  columnHelper.accessor("gender", { id: "g", header: "G" }),
  columnHelper.accessor("age", { id: "a", header: "A" }),
  columnHelper.accessor("miles", {
    header: "Miles",
    cell: (info) => formatMiles(info.getValue()),
  }),
  columnHelper.accessor("km", {
    header: "KM",
    cell: (info) => formatKm(info.getValue()),
  }),
  columnHelper.accessor("compPercent", {
    header: "Comp%",
    cell: (info) => formatCompPercent(info.getValue()),
  }),
  columnHelper.accessor("projectedFinish", {
    header: "Proj Fin",
    cell: (info) => formatProjFinish(info.getValue()),
  }),
  columnHelper.accessor("genderRank", {
    header: "Gender Place",
    cell: (info) => {
      const v = info.getValue();
      return v != null ? `#${v}` : "—";
    },
  }),
  columnHelper.accessor("eventGen", { header: "Event Gen" }),
];

function getCountry(home: string): string {
  return home.startsWith("US-") ? "US" : home;
}

const inputCls =
  "border border-slate-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white";

export default function Leaderboard({ runners }: { runners: Runner[] }) {
  const [nameFilter, setNameFilter] = useState("");
  const [bibFilter, setBibFilter] = useState("");
  const [genderFilter, setGenderFilter] = useState("All");
  const [countryFilter, setCountryFilter] = useState("All");
  const [sorting, setSorting] = useState<SortingState>([
    { id: "pos", desc: false },
  ]);

  const countries = useMemo(() => {
    const set = new Set(runners.map((r) => getCountry(r.home)));
    return ["All", ...Array.from(set).sort()];
  }, [runners]);

  const filtered = useMemo(() => {
    return runners.filter((r) => {
      if (
        nameFilter &&
        !r.displayName.toLowerCase().includes(nameFilter.toLowerCase())
      )
        return false;
      if (bibFilter && !String(r.bib).includes(bibFilter)) return false;
      if (genderFilter !== "All" && r.gender !== genderFilter) return false;
      if (countryFilter !== "All" && getCountry(r.home) !== countryFilter)
        return false;
      return true;
    });
  }, [runners, nameFilter, bibFilter, genderFilter, countryFilter]);

  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 items-center">
        <input
          type="text"
          placeholder="Search name…"
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
          className={inputCls}
        />
        <input
          type="text"
          placeholder="Bib #"
          value={bibFilter}
          onChange={(e) => setBibFilter(e.target.value)}
          className={`${inputCls} w-24`}
        />
        <select
          value={genderFilter}
          onChange={(e) => setGenderFilter(e.target.value)}
          className={inputCls}
          aria-label="Filter by gender"
        >
          <option value="All">All genders</option>
          <option value="M">M</option>
          <option value="F">F</option>
        </select>
        <select
          value={countryFilter}
          onChange={(e) => setCountryFilter(e.target.value)}
          className={inputCls}
          aria-label="Filter by country"
        >
          {countries.map((c) => (
            <option key={c} value={c}>
              {c === "All" ? "All countries" : c}
            </option>
          ))}
        </select>
        <span className="text-sm text-slate-500">
          {filtered.length} runner{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100 sticky top-0">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className="px-3 py-2 text-left font-semibold text-slate-600 whitespace-nowrap cursor-pointer select-none hover:bg-slate-200 transition-colors"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                    {header.column.getIsSorted() === "asc" && (
                      <span className="ml-1 text-blue-500">↑</span>
                    )}
                    {header.column.getIsSorted() === "desc" && (
                      <span className="ml-1 text-blue-500">↓</span>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row, i) => {
              const isVirtual = row.original.virtual;
              return (
                <tr
                  key={row.id}
                  className={
                    isVirtual
                      ? "bg-amber-50 italic text-amber-900"
                      : i % 2 === 0
                      ? "bg-white hover:bg-slate-50"
                      : "bg-slate-50 hover:bg-slate-100"
                  }
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-3 py-2 whitespace-nowrap">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-center text-slate-500 py-8">No runners match the current filters.</p>
        )}
      </div>
    </div>
  );
}

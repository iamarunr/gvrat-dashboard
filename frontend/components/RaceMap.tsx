"use client";

import dynamic from "next/dynamic";
import type { Runner } from "@/lib/data";

const RaceMapInner = dynamic(() => import("./RaceMapInner"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-slate-100">
      <span className="text-slate-400 text-sm">Loading map…</span>
    </div>
  ),
});

type Props = {
  runners: Runner[];
  courseCoords: [number, number][];
};

export default function RaceMap({ runners, courseCoords }: Props) {
  return (
    <div className="h-[300px] md:h-[500px] rounded-lg overflow-hidden border border-slate-200 shadow-sm">
      <RaceMapInner runners={runners} courseCoords={courseCoords} />
    </div>
  );
}

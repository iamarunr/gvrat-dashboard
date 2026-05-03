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
  selectedRunner?: Runner | null;
};

export default function RaceMap({ runners, courseCoords, selectedRunner = null }: Props) {
  return (
    <div className="h-full w-full">
      <RaceMapInner
        runners={runners}
        courseCoords={courseCoords}
        selectedRunner={selectedRunner}
      />
    </div>
  );
}

"use client";

import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-markercluster";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "react-leaflet-markercluster/styles";
import type { Runner } from "@/lib/data";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;

// Module-level stable icons (safe: this file is never loaded during SSR)
const LEADER_ICON = L.icon({
  iconUrl: "/icons/leader.svg",
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -16],
});

const GINGERBREAD_ICON = L.divIcon({
  html: `<img src="/icons/gingerbread.svg" width="32" height="32" style="display:block;filter:drop-shadow(0 1px 2px rgba(0,0,0,0.5))">`,
  className: "",
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -18],
});

const BUZZARD_ICON = L.divIcon({
  html: `<img src="/icons/buzzard.svg" width="32" height="32" style="display:block;filter:drop-shadow(0 1px 2px rgba(0,0,0,0.5))">`,
  className: "",
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -18],
});

function makeRunnerIcon(gender: string, selected: boolean): L.DivIcon {
  const bg = gender === "M" ? "#3b82f6" : gender === "F" ? "#f472b6" : "#9ca3af";
  if (selected) {
    return L.divIcon({
      html: `<div style="position:relative;width:24px;height:24px;display:flex;align-items:center;justify-content:center">
        <div style="position:absolute;width:24px;height:24px;border-radius:50%;background:${bg};opacity:0.35;animation:pulse 1.5s ease-in-out infinite"></div>
        <div style="width:14px;height:14px;border-radius:50%;background:${bg};border:2px solid white;box-shadow:0 0 6px rgba(0,0,0,0.4)"></div>
      </div>`,
      className: "",
      iconSize: [24, 24],
      iconAnchor: [12, 12],
      popupAnchor: [0, -14],
    });
  }
  return L.divIcon({
    html: `<div style="width:12px;height:12px;border-radius:50%;background:${bg};border:1.5px solid rgba(0,0,0,0.3);box-sizing:border-box"></div>`,
    className: "",
    iconSize: [12, 12],
    iconAnchor: [6, 6],
    popupAnchor: [0, -8],
  });
}

// Stable runner marker — memoizes position and icon so react-leaflet
// doesn't call setLatLng / setIcon on every parent re-render
function RunnerMarker({
  r,
  selectedBib,
  isLeader,
}: {
  r: Runner;
  selectedBib: number | undefined;
  isLeader: boolean;
}) {
  const selected = r.bib === selectedBib;
  const position = useMemo((): [number, number] => [r.lat, r.lon], [r.lat, r.lon]);
  const icon = useMemo(
    () => (isLeader && !selected ? LEADER_ICON : makeRunnerIcon(r.gender, selected)),
    [r.gender, selected, isLeader]
  );
  return (
    <Marker position={position} icon={icon} zIndexOffset={isLeader ? 500 : 0}>
      <Popup>
        <RunnerPopup r={r} />
      </Popup>
    </Marker>
  );
}

function VirtualMarker({ r, icon }: { r: Runner; icon: L.DivIcon }) {
  const position = useMemo((): [number, number] => [r.lat, r.lon], [r.lat, r.lon]);
  return (
    <Marker position={position} icon={icon} zIndexOffset={1000}>
      <Popup>
        <RunnerPopup r={r} />
      </Popup>
    </Marker>
  );
}

function MapController({
  selectedRunner,
  courseCoords,
}: {
  selectedRunner: Runner | null;
  courseCoords: [number, number][];
}) {
  const map = useMap();

  useEffect(() => {
    let active = true;
    if (selectedRunner) {
      map.flyTo([selectedRunner.lat, selectedRunner.lon], 12, { duration: 1.5 });
      const handler = () => {
        if (!active) return;
        L.popup({ maxWidth: 240, closeButton: true })
          .setLatLng([selectedRunner.lat, selectedRunner.lon])
          .setContent(
            `<div style="min-width:160px;font-family:system-ui,sans-serif;font-size:13px">
              <strong>${selectedRunner.displayName}</strong><br>
              <span style="color:#555">Bib #${selectedRunner.bib} · ${selectedRunner.rankDisplay}</span><br>
              <span style="font-weight:600">${selectedRunner.miles.toFixed(2)} mi</span><br>
              <span style="color:#666;font-size:11px">${selectedRunner.locationDescription}</span>
            </div>`
          )
          .openOn(map);
      };
      map.once("moveend", handler);
      return () => {
        active = false;
        map.off("moveend", handler);
      };
    } else if (courseCoords.length > 1) {
      map.closePopup();
      map.fitBounds(L.latLngBounds(courseCoords), { padding: [20, 20] });
    }
  }, [selectedRunner, map, courseCoords]);

  return null;
}

function RunnerPopup({ r }: { r: Runner }) {
  return (
    <div style={{ minWidth: 160 }}>
      <strong>{r.displayName}</strong>
      <br />
      Bib #{r.bib} &middot; {r.rankDisplay}
      <br />
      {r.miles.toFixed(2)} mi
      <br />
      <span style={{ fontSize: "0.85em", color: "#555" }}>{r.locationDescription}</span>
    </div>
  );
}

type Props = {
  runners: Runner[];
  courseCoords: [number, number][];
  selectedRunner: Runner | null;
};

export default function RaceMapInner({ runners, courseCoords, selectedRunner }: Props) {
  const realRunners = runners.filter((r) => !r.virtual);
  const virtualRunners = runners.filter((r) => r.virtual);
  const leader = realRunners[0] ?? null;
  const selectedBib = selectedRunner?.bib;

  return (
    <MapContainer
      center={[37.5, -99.0]}
      zoom={5}
      style={{ height: "100%", width: "100%" }}
      preferCanvas
    >
      <MapController selectedRunner={selectedRunner} courseCoords={courseCoords} />

      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        maxZoom={19}
      />

      <Polyline
        positions={courseCoords}
        pathOptions={{ color: "#7c3aed", weight: 3, opacity: 0.8 }}
      />

      <MarkerClusterGroup chunkedLoading maxClusterRadius={40}>
        {leader && (
          <RunnerMarker
            key={`leader-${leader.bib}`}
            r={leader}
            selectedBib={selectedBib}
            isLeader
          />
        )}
        {realRunners
          .filter((r) => r !== leader)
          .map((r) => (
            <RunnerMarker
              key={r.bib}
              r={r}
              selectedBib={selectedBib}
              isLeader={false}
            />
          ))}
      </MarkerClusterGroup>

      {virtualRunners.map((r) => (
        <VirtualMarker
          key={r.bib}
          r={r}
          icon={r.virtualType === "gingerbread" ? GINGERBREAD_ICON : BUZZARD_ICON}
        />
      ))}
    </MapContainer>
  );
}

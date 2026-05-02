"use client";

import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-markercluster";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "react-leaflet-markercluster/styles";
import type { Runner } from "@/lib/data";

// Suppress default-icon _getIconUrl which breaks in webpack/turbopack
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;

const leaderIcon = L.icon({
  iconUrl: "/icons/leader.svg",
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -16],
});

function runnerIcon(gender: string): L.DivIcon {
  const bg =
    gender === "M" ? "#3b82f6" : gender === "F" ? "#f472b6" : "#9ca3af";
  return L.divIcon({
    html: `<div style="width:12px;height:12px;border-radius:50%;background:${bg};border:1.5px solid rgba(0,0,0,0.3);box-sizing:border-box"></div>`,
    className: "",
    iconSize: [12, 12],
    iconAnchor: [6, 6],
    popupAnchor: [0, -8],
  });
}

function virtualIcon(src: string): L.DivIcon {
  return L.divIcon({
    html: `<img src="${src}" width="32" height="32" style="display:block;filter:drop-shadow(0 1px 2px rgba(0,0,0,0.5))">`,
    className: "",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
  });
}

function FitCourse({ coords }: { coords: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (coords.length > 1) {
      map.fitBounds(L.latLngBounds(coords), { padding: [20, 20] });
    }
  }, [map, coords]);
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
      <span style={{ fontSize: "0.85em", color: "#555" }}>
        {r.locationDescription}
      </span>
    </div>
  );
}

type Props = {
  runners: Runner[];
  courseCoords: [number, number][];
};

export default function RaceMapInner({ runners, courseCoords }: Props) {
  const realRunners = runners.filter((r) => !r.virtual);
  const virtualRunners = runners.filter((r) => r.virtual);
  const leader = realRunners[0] ?? null;

  const gingerbreadIcon = virtualIcon("/icons/gingerbread.svg");
  const buzzardIcon = virtualIcon("/icons/buzzard.svg");

  return (
    <MapContainer
      center={[37.5, -99.0]}
      zoom={5}
      style={{ height: "100%", width: "100%" }}
      preferCanvas
    >
      <FitCourse coords={courseCoords} />

      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        maxZoom={19}
      />

      {/* Course polyline */}
      <Polyline
        positions={courseCoords}
        pathOptions={{ color: "#7c3aed", weight: 3, opacity: 0.8 }}
      />

      {/* Clustered real runner markers */}
      <MarkerClusterGroup chunkedLoading maxClusterRadius={40}>
        {leader && (
          <Marker
            key={`leader-${leader.bib}`}
            position={[leader.lat, leader.lon]}
            icon={leaderIcon}
            zIndexOffset={500}
          >
            <Popup>
              <RunnerPopup r={leader} />
            </Popup>
          </Marker>
        )}
        {realRunners
          .filter((r) => r !== leader)
          .map((r) => (
            <Marker
              key={r.bib}
              position={[r.lat, r.lon]}
              icon={runnerIcon(r.gender)}
            >
              <Popup>
                <RunnerPopup r={r} />
              </Popup>
            </Marker>
          ))}
      </MarkerClusterGroup>

      {/* Virtual character markers — always visible, outside cluster */}
      {virtualRunners.map((r) => {
        const icon =
          r.virtualType === "gingerbread" ? gingerbreadIcon : buzzardIcon;
        return (
          <Marker
            key={r.bib}
            position={[r.lat, r.lon]}
            icon={icon}
            zIndexOffset={1000}
          >
            <Popup>
              <RunnerPopup r={r} />
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}

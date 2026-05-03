import { leaderboardData, metaData, courseData } from "@/lib/data";
import DashboardClient from "@/components/DashboardClient";

function getCourseCoords(): [number, number][] {
  const route = courseData.features.find((f) => f.geometry.type === "LineString");
  if (!route) return [];
  return (route.geometry.coordinates as [number, number][]).map(
    ([lon, lat]) => [lat, lon]
  );
}

const courseCoords = getCourseCoords();

export default function GvratDashboard() {
  return (
    <DashboardClient
      runners={leaderboardData.runners}
      courseCoords={courseCoords}
      meta={metaData}
    />
  );
}

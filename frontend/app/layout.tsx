import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GVRAT 2026 — Race Dashboard",
  description:
    "Great Virtual Race Across The States · Live leaderboard and interactive race map",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

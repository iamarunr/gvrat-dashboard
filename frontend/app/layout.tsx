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
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" />
        {/* Preload hero background — CSS background-images are invisible to the
            preload scanner; this hint fetches bg-topo.webp in parallel with CSS
            parsing, directly improving LCP on the landing page. */}
        <link rel="preload" as="image" href="/bg-topo.webp" fetchPriority="high" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  );
}

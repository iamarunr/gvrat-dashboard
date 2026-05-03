# BACKLOG — v2 and beyond

Items here are explicitly **out of scope for v1**. The v1 architecture is designed to support all of them — no rewrites needed, just additions.

---

## Features

### Per-runner profile pages

Route: `/gvrat-2026/runner/[bib]`

Daily mileage chart built client-side from `data/gvrat-2026/snapshots/*.json`. Each snapshot already contains the full leaderboard; the chart is just a filter + plot. No database needed — snapshots have been collected from day one.

### Stats page

Route: `/gvrat-2026/stats`

- Miles logged by country (bar chart)
- Gender split
- Age distribution histogram
- Biggest single day across all runners
- Most miles in last 7 days

All computable from `leaderboard.json` + snapshots.

### "Today's biggest movers" widget

Diff today's `leaderboard.json` against yesterday's snapshot. Show the top 10 rank climbers on the dashboard homepage. Already have the data; just needs a component.

### Country flags in leaderboard

Add flag emoji or SVG flag next to the `Home` column. The `home` field already has ISO country codes (`GB`, `AU`, `US-TN`, etc.). Map to emoji flags for non-US; show state abbreviation for US runners.

### Embed mode

An iframe-friendly route (e.g., `?embed=1`) that strips the header and renders just the leaderboard table. Useful for embedding back into the GVRAT WordPress site if the Ninja Tables workflow is retired but a widget is still wanted on the existing site.

### Open-graph cards

Shareable image: "I'm at mile 247 of GVRAT 2026 — past Dodge City!" Generated via a serverless OG image endpoint (Cloudflare Workers + Satori, or Vercel OG). Runner searches for their bib, gets a shareable link.

### Email digest opt-in

Weekly summary email for runners who opt in. "You logged 32 miles this week. You're at mile 187, ranked #43." Built on a simple serverless function + email provider (Resend or Postmark). Requires a small data store (just bib → email; no PII in the repo).

---

## Multi-race support

### Transcon

Add `races/transcon-2026/` with its own config, GPX, and descriptions. The pipeline and frontend are already parameterized by `--race` / race ID. Adding Transcon is a config addition, not a code change.

### Year-over-year comparisons

GVRAT 2025 vs 2026 comparison view. Requires storing 2025 data (or pulling it from RunSignup history) in a separate race directory.

---

## Integrations

### RunSignup MCP integration

RunSignup announced an MCP Server in Nov 2025 (currently internal pilot with 4 tools). When it ships publicly with virtual-race activity endpoints, expose the dashboard data via MCP so race directors and runners can query it conversationally through Claude, ChatGPT, etc.

Reference: https://info.runsignup.com/2025/11/16/runsignup-advances-mcp-server/

### Activity caching

After v1 ships, add `data/gvrat-2026/_cache/activities-{bib}.json`. Use `submitted_time_in_ms` to skip already-seen activities. Cuts ~416 API calls/day to ~5–10 incremental calls after day 1. Build only when the 3-5 min daily run becomes a problem.

---

## Internationalisation

Multi-language support (race has runners from 30+ countries). The JSON structure is already language-neutral; this is a frontend-only addition using Next.js i18n routing.

---

## Operations

### Automated cutover validation

Productionize the Cowork validation task into a proper CI check: fetch both the new dashboard data and the Ninja Tables JSON, assert they match within tolerance. Run as a GitHub Action nightly during the transition period.

### Slack/Discord alerts on pipeline failure

Instead of relying on GitHub Actions email, post a message to a Slack or Discord channel when the daily workflow fails. One additional step in `daily-update.yml` using a webhook secret.

# Graph Report - .  (2026-05-04)

## Corpus Check
- 60 files · ~60,756 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 367 nodes · 618 edges · 41 communities detected
- Extraction: 71% EXTRACTED · 29% INFERRED · 0% AMBIGUOUS · INFERRED: 179 edges (avg confidence: 0.62)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Data Source Abstraction|Data Source Abstraction]]
- [[_COMMUNITY_Leaderboard Build Engine|Leaderboard Build Engine]]
- [[_COMMUNITY_Project Docs & Agent Rules|Project Docs & Agent Rules]]
- [[_COMMUNITY_Test Suite & Fixtures|Test Suite & Fixtures]]
- [[_COMMUNITY_Data Models & CSV Source|Data Models & CSV Source]]
- [[_COMMUNITY_Computation & Geo Utilities|Computation & Geo Utilities]]
- [[_COMMUNITY_Backlog & Feature Roadmap|Backlog & Feature Roadmap]]
- [[_COMMUNITY_CSV Loader Implementation|CSV Loader Implementation]]
- [[_COMMUNITY_Leaderboard UI Component|Leaderboard UI Component]]
- [[_COMMUNITY_Main Page & UI Helpers|Main Page & UI Helpers]]
- [[_COMMUNITY_Course Waypoint System|Course Waypoint System]]
- [[_COMMUNITY_Per-Runner File Writer|Per-Runner File Writer]]
- [[_COMMUNITY_Formatting Utilities|Formatting Utilities]]
- [[_COMMUNITY_Race Map Components|Race Map Components]]
- [[_COMMUNITY_Daily Snapshot Writer|Daily Snapshot Writer]]
- [[_COMMUNITY_Course GeoJSON Builder|Course GeoJSON Builder]]
- [[_COMMUNITY_Dashboard Page|Dashboard Page]]
- [[_COMMUNITY_App Layout|App Layout]]
- [[_COMMUNITY_Race Map Wrapper|Race Map Wrapper]]
- [[_COMMUNITY_As-Of Date Banner|As-Of Date Banner]]
- [[_COMMUNITY_Race Config Contract|Race Config Contract]]
- [[_COMMUNITY_Waypoint Descriptions|Waypoint Descriptions]]
- [[_COMMUNITY_Data Overrides Contract|Data Overrides Contract]]
- [[_COMMUNITY_Race Metadata Contract|Race Metadata Contract]]
- [[_COMMUNITY_Course GeoJSON Contract|Course GeoJSON Contract]]
- [[_COMMUNITY_RunSignup MCP Backlog|RunSignup MCP Backlog]]
- [[_COMMUNITY_Alerting Backlog|Alerting Backlog]]
- [[_COMMUNITY_App Icon GVRAT|App Icon GVRAT]]
- [[_COMMUNITY_Generic File Icon|Generic File Icon]]
- [[_COMMUNITY_USA Map Hero Background|USA Map Hero Background]]
- [[_COMMUNITY_GVRAT Logo White|GVRAT Logo White]]
- [[_COMMUNITY_GVRAT Favicon|GVRAT Favicon]]
- [[_COMMUNITY_Vercel Logo|Vercel Logo]]
- [[_COMMUNITY_Next.js Logo|Next.js Logo]]
- [[_COMMUNITY_Topographic Background|Topographic Background]]
- [[_COMMUNITY_GVRAT Logo Transparent|GVRAT Logo Transparent]]
- [[_COMMUNITY_Globe Icon|Globe Icon]]
- [[_COMMUNITY_Window Icon|Window Icon]]
- [[_COMMUNITY_Buzzard Mascot Icon|Buzzard Mascot Icon]]
- [[_COMMUNITY_Leader Gold Star Icon|Leader Gold Star Icon]]
- [[_COMMUNITY_Gingerbread Mascot Icon|Gingerbread Mascot Icon]]

## God Nodes (most connected - your core abstractions)
1. `Participant` - 32 edges
2. `Activity` - 31 edges
3. `PublicRunner` - 17 edges
4. `build_leaderboard()` - 17 edges
5. `WaypointMap` - 16 edges
6. `main()` - 16 edges
7. `RaceConfig` - 15 edges
8. `ApiSource` - 15 edges
9. `LeaderboardOutput` - 14 edges
10. `DescriptionMap` - 14 edges

## Surprising Connections (you probably didn't know these)
- `Frontend README: Next.js app, npm run dev, npm run build static export to frontend/out/` --implements--> `Frontend stack: Next.js 14+ App Router, static export, Tailwind CSS, react-leaflet, TanStack Table, TypeScript`  [INFERRED]
  frontend/README.md → SPEC.md
- `v2 backlog: runner profile pages, stats page, map pins, do NOT build in v1` --conceptually_related_to--> `BACKLOG v2 features: per-runner profiles, stats page, biggest movers widget, country flags, embed mode, OG cards, email digest`  [EXTRACTED]
  SPEC.md → BACKLOG.md
- `Parse GPX waypoints named '000'–'680' into a mile→Waypoint map.` --uses--> `Waypoint`  [INFERRED]
  /Users/nareshkumar/Documents/Projects/gvrat-dashboard/pipeline/waypoints.py → /Users/nareshkumar/Documents/Projects/gvrat-dashboard/pipeline/models.py
- `Backlog: multi-race support — Transcon, year-over-year comparisons` --conceptually_related_to--> `Ingestion is pluggable: RunSignup adapter can be swapped for CSV or other sources`  [INFERRED]
  BACKLOG.md → SPEC.md
- `Rule: always verify field names from SPEC.md §3 or leaderboard.json before using in code` --references--> `Data contract: data/gvrat-2026/leaderboard.json — runners array with rank, rankDisplay, bib, miles, virtual, virtualType, etc.`  [EXTRACTED]
  CLAUDE.md → SPEC.md

## Hyperedges (group relationships)
- **Daily update chain: GitHub Actions triggers Python pipeline which writes JSON which triggers Cloudflare Pages redeploy** —  [EXTRACTED 1.00]
- **Fairness principle drives: cron schedule at 12:00 UTC, activity date filter, as-of banner** —  [EXTRACTED 1.00]
- **Leaderboard runner object: rank, rankDisplay, virtual, virtualType, miles, compPercent, home, genderRank, projectedFinish** —  [EXTRACTED 1.00]

## Communities

### Community 0 - "Data Source Abstraction"
Cohesion: 0.09
Nodes (26): Abstract Source protocol — both CsvSource and ApiSource satisfy this interface., Source, load_overrides(), load_race_config(), load_descriptions(), Location description lookup with past/approaching interpolation per SPEC §3., _build_meta(), main() (+18 more)

### Community 1 - "Leaderboard Build Engine"
Cohesion: 0.16
Nodes (26): BaseModel, _assign_gender_ranks(), build_leaderboard(), compute_projected_finish(), Parse a distance string like '26.3 miles' or '10 km' into miles., Set genderRank on real runners (already sorted by miles desc)., Fallback stub when there are no real runners — gives GBM a safe base., Return 'US-{state}' for US runners, ISO country code otherwise. (+18 more)

### Community 2 - "Project Docs & Agent Rules"
Cohesion: 0.06
Nodes (36): Backlog: multi-race support — Transcon, year-over-year comparisons, Agent rule: This Next.js version has breaking changes — read node_modules/next/dist/docs/ before writing code, frontend/CLAUDE.md: imports AGENTS.md and README.md as project instructions, Frontend README: Next.js app, npm run dev, npm run build static export to frontend/out/, Anti-references: avoid heavy analytics dashboards, avoid cluttered data tables, Brand Personality: energetic, athletic, motivating, accessible, Design Principles: find yourself in under 5 seconds, understand pace vs Buzzard cutoff, feel motivated, GVRAT 2026 Live Tracking Dashboard (+28 more)

### Community 3 - "Test Suite & Fixtures"
Cohesion: 0.06
Nodes (13): Tests for pipeline/runner_files.py., bib 4 — Jenna Dagger has 26.3 miles on May 1., CSV fixture has 'walk'; must appear as 'walk' in output., CSV fixture has Time column — must appear in output., Day 1: Buzzard miles = 679/153 ≈ 4.44., Gingerbread Man (bib 9999) should have no runner file., Every active non-virtual participant in the fixture must have a file., bib 233 — Tommy Holder is in the fixture but has no activities. (+5 more)

### Community 4 - "Data Models & CSV Source"
Cohesion: 0.14
Nodes (23): Implements the Source protocol using CSV files exported from RunSignup., Exception, Activity, Participant, Internal model — contains only the fields we extract from source data.     PII (, Map activityType (CSV string or API numeric ID) to 'run' or 'walk'., Write per-runner JSON files; return the number of files written.      Writes dat, ApiSource (+15 more)

### Community 5 - "Computation & Geo Utilities"
Cohesion: 0.15
Nodes (27): derive_home(), parse_distance(), leaderboard(), test_derive_home_au(), test_derive_home_gb(), test_derive_home_gb_in_leaderboard(), test_derive_home_us(), test_derive_home_us_in_leaderboard() (+19 more)

### Community 6 - "Backlog & Feature Roadmap"
Cohesion: 0.08
Nodes (28): Backlog: activity caching using submitted_time_in_ms to cut API calls ~95% after day 1, Backlog: 'Today's biggest movers' widget — diff leaderboard vs yesterday's snapshot, top 10 rank climbers, Backlog: country flags in leaderboard using home field ISO codes, Backlog: embed mode for WordPress iframe embedding, BACKLOG v2 features: per-runner profiles, stats page, biggest movers widget, country flags, embed mode, OG cards, email digest, Backlog: open-graph cards for social sharing, Backlog: per-runner profile pages at /gvrat-2026/runner/{bib}, Backlog: stats page /gvrat-2026/stats — miles by country, gender split, age histogram, biggest day, top 7-day movers (+20 more)

### Community 7 - "CSV Loader Implementation"
Cohesion: 0.18
Nodes (7): CsvSource, _int_or(), load_activities(), load_participants(), _parse_date(), CsvSource — loads participants and activities from RunSignup-exported CSV files., Pluggable ingestion sources for the GVRAT pipeline.  Usage in main.py:     from

### Community 8 - "Leaderboard UI Component"
Cohesion: 0.33
Nodes (9): formatProjFinShort(), getCountry(), getPosColor(), getRowBg(), handleMapPin(), handleNavigate(), handleSearch(), handleSort() (+1 more)

### Community 9 - "Main Page & UI Helpers"
Cohesion: 0.36
Nodes (8): countryFlag(), daysUntilEnd(), DotSep(), generateStaticParams(), getX(), getY(), longDate(), shortDate()

### Community 10 - "Course Waypoint System"
Cohesion: 0.44
Nodes (6): test_681_waypoints_loaded(), test_lookup_clamps_above_680(), test_lookup_clamps_below_zero(), test_mile_0_coordinates(), test_mile_680_is_valid(), wmap()

### Community 11 - "Per-Runner File Writer"
Cohesion: 0.62
Nodes (5): _activity_entry(), _normalize_type(), Write per-runner JSON files to data/{race_id}/runners/{bib}.json., _rest_entry(), save_runner_files()

### Community 12 - "Formatting Utilities"
Cohesion: 0.48
Nodes (5): formatCompPercent(), formatKm(), formatMiles(), formatProjFinish(), formatRank()

### Community 13 - "Race Map Components"
Cohesion: 0.53
Nodes (4): makeRunnerIcon(), MapController(), RunnerMarker(), VirtualMarker()

### Community 14 - "Daily Snapshot Writer"
Cohesion: 0.67
Nodes (2): Daily snapshot writer — copies leaderboard.json to snapshots/{asOfDate}.json., save_snapshot()

### Community 15 - "Course GeoJSON Builder"
Cohesion: 0.67
Nodes (2): build_course_geojson(), Build course.geojson from the race GPX file.  Output: one LineString for the rou

### Community 16 - "Dashboard Page"
Cohesion: 0.67
Nodes (2): getCourseCoords(), GvratDashboard()

### Community 17 - "App Layout"
Cohesion: 0.67
Nodes (1): RootLayout()

### Community 18 - "Race Map Wrapper"
Cohesion: 0.67
Nodes (1): RaceMap()

### Community 19 - "As-Of Date Banner"
Cohesion: 0.67
Nodes (1): formatText()

### Community 42 - "Race Config Contract"
Cohesion: 1.0
Nodes (1): Data contract: races/gvrat-2026/config.json — race configuration

### Community 43 - "Waypoint Descriptions"
Cohesion: 1.0
Nodes (1): Data contract: races/gvrat-2026/descriptions.json — waypoint/location descriptions

### Community 44 - "Data Overrides Contract"
Cohesion: 1.0
Nodes (1): Data contract: races/gvrat-2026/overrides.json — manual data corrections

### Community 45 - "Race Metadata Contract"
Cohesion: 1.0
Nodes (1): Data contract: data/gvrat-2026/meta.json — race metadata

### Community 46 - "Course GeoJSON Contract"
Cohesion: 1.0
Nodes (1): Data contract: data/gvrat-2026/course.geojson — route GeoJSON from GPX

### Community 47 - "RunSignup MCP Backlog"
Cohesion: 1.0
Nodes (1): Backlog: RunSignup MCP integration for AI-driven data access

### Community 48 - "Alerting Backlog"
Cohesion: 1.0
Nodes (1): Backlog: Slack/Discord alerts on pipeline failure

### Community 49 - "App Icon GVRAT"
Cohesion: 1.0
Nodes (1): GVRAT 2026 App Icon — vulture mascot with bold red 'GVRAT' and blue '2026' text on white background, used as the Next.js app icon (favicon/PWA icon)

### Community 50 - "Generic File Icon"
Cohesion: 1.0
Nodes (1): Generic File/Document Icon (16x16 SVG)

### Community 51 - "USA Map Hero Background"
Cohesion: 1.0
Nodes (1): Dotted USA Map Hero Background — dark navy canvas with gold/amber dot-matrix silhouette of the contiguous United States plus Hawaii and Alaska, used as a full-bleed atmospheric background image for the GVRAT dashboard

### Community 52 - "GVRAT Logo White"
Cohesion: 1.0
Nodes (1): GVRAT 2026 Logo — official brand mark for the Great Virtual Race Across Tennessee 2026 event. Features a vulture (buzzard) mascot perched atop bold red 'GVRAT' text with blue '2026' year beneath; teal/green drop-shadow accents; white background. The vulture is a key race character ('Buzzard') that chases virtual runners. Red/blue/teal color palette evokes patriotic American identity. Used as primary site favicon and public-facing brand asset.

### Community 53 - "GVRAT Favicon"
Cohesion: 1.0
Nodes (1): GVRAT 2026 Favicon - Brand logo featuring a California condor/vulture mascot perched upper-left, bold red 'GVRAT' text with teal shadow/outline, bold blue '2026' text below, white background, square format PNG used as site favicon and brand identity icon

### Community 54 - "Vercel Logo"
Cohesion: 1.0
Nodes (1): Vercel Logo SVG

### Community 55 - "Next.js Logo"
Cohesion: 1.0
Nodes (1): Next.js Logo SVG

### Community 56 - "Topographic Background"
Cohesion: 1.0
Nodes (1): Topographic USA map background image — dark navy base with gold/amber contour lines showing US state boundaries and terrain elevation, used as hero section background to establish geographic/athletic mood

### Community 57 - "GVRAT Logo Transparent"
Cohesion: 1.0
Nodes (1): GVRAT 2026 Logo (Transparent Background)

### Community 58 - "Globe Icon"
Cohesion: 1.0
Nodes (1): Globe SVG Icon (16x16 world/geographic icon, gray fill #666, used in public assets)

### Community 59 - "Window Icon"
Cohesion: 1.0
Nodes (1): Browser Window Icon (window.svg) — 16x16 SVG depicting a browser/application window frame with three circular toolbar dots (traffic-light style), used as a UI icon in the public assets

### Community 60 - "Buzzard Mascot Icon"
Cohesion: 1.0
Nodes (1): Buzzard SVG Icon — Virtual Runner Mascot (GVRAT)

### Community 61 - "Leader Gold Star Icon"
Cohesion: 1.0
Nodes (1): Leader/First-Place Gold Star Icon — 32x32 SVG badge used in the GVRAT race leaderboard UI to indicate the leading runner; renders a gold 10-point star (fill #f5c518, stroke #c8860a) with an inner highlight polygon (fill #ffe066, opacity 0.55) for a glossy effect

### Community 62 - "Gingerbread Mascot Icon"
Cohesion: 1.0
Nodes (1): Gingerbread Man SVG Icon (GBM Virtual Runner Mascot)

## Knowledge Gaps
- **68 isolated node(s):** `Internal model — contains only the fields we extract from source data.     PII (`, `Strict allowlist — only these fields may appear in public JSON output.`, `Run save_runner_files against fixtures with as_of_date=2026-05-01, return out di`, `bib 233 — Tommy Holder is in the fixture but has no activities.`, `No activities on May 1 → one rest entry for May 1.` (+63 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Daily Snapshot Writer`** (4 nodes): `snapshots.py`, `Daily snapshot writer — copies leaderboard.json to snapshots/{asOfDate}.json.`, `save_snapshot()`, `snapshots.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Course GeoJSON Builder`** (4 nodes): `build_course_geojson()`, `Build course.geojson from the race GPX file.  Output: one LineString for the rou`, `course.py`, `course.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Dashboard Page`** (4 nodes): `page.tsx`, `getCourseCoords()`, `GvratDashboard()`, `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `App Layout`** (3 nodes): `layout.tsx`, `RootLayout()`, `layout.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Race Map Wrapper`** (3 nodes): `RaceMap.tsx`, `RaceMap()`, `RaceMap.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `As-Of Date Banner`** (3 nodes): `formatText()`, `AsOfBanner.tsx`, `AsOfBanner.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Race Config Contract`** (1 nodes): `Data contract: races/gvrat-2026/config.json — race configuration`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Waypoint Descriptions`** (1 nodes): `Data contract: races/gvrat-2026/descriptions.json — waypoint/location descriptions`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Data Overrides Contract`** (1 nodes): `Data contract: races/gvrat-2026/overrides.json — manual data corrections`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Race Metadata Contract`** (1 nodes): `Data contract: data/gvrat-2026/meta.json — race metadata`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Course GeoJSON Contract`** (1 nodes): `Data contract: data/gvrat-2026/course.geojson — route GeoJSON from GPX`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `RunSignup MCP Backlog`** (1 nodes): `Backlog: RunSignup MCP integration for AI-driven data access`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Alerting Backlog`** (1 nodes): `Backlog: Slack/Discord alerts on pipeline failure`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `App Icon GVRAT`** (1 nodes): `GVRAT 2026 App Icon — vulture mascot with bold red 'GVRAT' and blue '2026' text on white background, used as the Next.js app icon (favicon/PWA icon)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Generic File Icon`** (1 nodes): `Generic File/Document Icon (16x16 SVG)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `USA Map Hero Background`** (1 nodes): `Dotted USA Map Hero Background — dark navy canvas with gold/amber dot-matrix silhouette of the contiguous United States plus Hawaii and Alaska, used as a full-bleed atmospheric background image for the GVRAT dashboard`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `GVRAT Logo White`** (1 nodes): `GVRAT 2026 Logo — official brand mark for the Great Virtual Race Across Tennessee 2026 event. Features a vulture (buzzard) mascot perched atop bold red 'GVRAT' text with blue '2026' year beneath; teal/green drop-shadow accents; white background. The vulture is a key race character ('Buzzard') that chases virtual runners. Red/blue/teal color palette evokes patriotic American identity. Used as primary site favicon and public-facing brand asset.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `GVRAT Favicon`** (1 nodes): `GVRAT 2026 Favicon - Brand logo featuring a California condor/vulture mascot perched upper-left, bold red 'GVRAT' text with teal shadow/outline, bold blue '2026' text below, white background, square format PNG used as site favicon and brand identity icon`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Vercel Logo`** (1 nodes): `Vercel Logo SVG`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Next.js Logo`** (1 nodes): `Next.js Logo SVG`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Topographic Background`** (1 nodes): `Topographic USA map background image — dark navy base with gold/amber contour lines showing US state boundaries and terrain elevation, used as hero section background to establish geographic/athletic mood`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `GVRAT Logo Transparent`** (1 nodes): `GVRAT 2026 Logo (Transparent Background)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Globe Icon`** (1 nodes): `Globe SVG Icon (16x16 world/geographic icon, gray fill #666, used in public assets)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Window Icon`** (1 nodes): `Browser Window Icon (window.svg) — 16x16 SVG depicting a browser/application window frame with three circular toolbar dots (traffic-light style), used as a UI icon in the public assets`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Buzzard Mascot Icon`** (1 nodes): `Buzzard SVG Icon — Virtual Runner Mascot (GVRAT)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Leader Gold Star Icon`** (1 nodes): `Leader/First-Place Gold Star Icon — 32x32 SVG badge used in the GVRAT race leaderboard UI to indicate the leading runner; renders a gold 10-point star (fill #f5c518, stroke #c8860a) with an inner highlight polygon (fill #ffe066, opacity 0.55) for a glossy effect`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Gingerbread Mascot Icon`** (1 nodes): `Gingerbread Man SVG Icon (GBM Virtual Runner Mascot)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `runner_files_env()` connect `Data Source Abstraction` to `Per-Runner File Writer`, `Leaderboard Build Engine`, `Test Suite & Fixtures`?**
  _High betweenness centrality (0.099) - this node is a cross-community bridge._
- **Why does `build_leaderboard()` connect `Leaderboard Build Engine` to `Data Source Abstraction`, `Course Waypoint System`, `Computation & Geo Utilities`?**
  _High betweenness centrality (0.070) - this node is a cross-community bridge._
- **Why does `main()` connect `Data Source Abstraction` to `Leaderboard Build Engine`, `Data Models & CSV Source`, `CSV Loader Implementation`, `Per-Runner File Writer`, `Daily Snapshot Writer`, `Course GeoJSON Builder`?**
  _High betweenness centrality (0.069) - this node is a cross-community bridge._
- **Are the 28 inferred relationships involving `Participant` (e.g. with `CsvSource — loads participants and activities from RunSignup-exported CSV files.` and `RunSignupError`) actually correct?**
  _`Participant` has 28 INFERRED edges - model-reasoned connections that need verification._
- **Are the 28 inferred relationships involving `Activity` (e.g. with `CsvSource — loads participants and activities from RunSignup-exported CSV files.` and `RunSignupError`) actually correct?**
  _`Activity` has 28 INFERRED edges - model-reasoned connections that need verification._
- **Are the 13 inferred relationships involving `PublicRunner` (e.g. with `Gingerbread Man and Buzzard virtual character builders per SPEC §1 and §4.` and `Buzzard flies at exactly the pace to finish on the last day.     Miles on day N`) actually correct?**
  _`PublicRunner` has 13 INFERRED edges - model-reasoned connections that need verification._
- **Are the 9 inferred relationships involving `build_leaderboard()` (e.g. with `main()` and `.lookup()`) actually correct?**
  _`build_leaderboard()` has 9 INFERRED edges - model-reasoned connections that need verification._
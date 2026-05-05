# GVRAT 2026 Design System

Reference document for all UI work. Read this before writing any frontend code.
Last extracted from codebase on 2026-05-04.

---

## 1. Color System

| Token | Hex | Used For |
|-------|-----|----------|
| `--gvrat-navy` | `#1B3F6E` | Primary brand color. Headers, rank numbers, stat values, borders, active pills, CTA outlines, footer bg |
| `--gvrat-gold` | `#F4A623` | Accent. Miles logged stat, progress bar fills, CTA button bg, "Show next" button bg, route line on map |
| `--gvrat-red` | `#C0392B` | Buzzard row text/border, Buzzard rank color |
| `--gvrat-green` | `#27AE60` | Finished runner "🎉" state |
| `--color-foreground` | `#1A1A2E` | Body text, runner names in leaderboard |
| `--surface-bg` | `oklch(97% 0.005 250)` | Page background (light grey-blue); also `#f5f5f3` via Tailwind |
| `--surface-panel` | `oklch(100% 0 0)` | White panels: dashboard header, StatStrip, RaceProgress, AsOfBanner |
| Leaderboard header | `linear-gradient(180deg, #1B3F6E 0%, #163558 100%)` | Table header background |
| Row even | `#ffffff` | Leaderboard alternating rows |
| Row odd | `#fafafa` | Leaderboard alternating rows |
| Row hover | `#f0f5ff` | Leaderboard row hover state |
| Row selected | `#e8f4fd` | Map-pinned runner highlight |
| Gingerbread row | `linear-gradient(90deg, #fffbf0, #ffffff)` | GBM virtual runner row |
| Buzzard row | `linear-gradient(90deg, #fff5f5, #ffffff)` | Buzzard virtual runner row |
| Buzzard separator | `#FFF0EE` | Pinned buzzard notice band |
| Hero dark overlay | `rgba(13, 17, 28, 0.8–0.9)` | bg-topo.webp overlay on landing + runner profile |
| Buzzard hero overlay | `rgba(69, 10, 10, 0.85) / rgba(107, 15, 15, 0.95)` | Dark red overlay on Buzzard profile hero |
| Chart bg | `#f8fafc` | Cumulative progress chart container |
| Buzzard pace line | `#fca5a5` | Dashed reference line in cumulative chart |
| Buzzard name color | `#fca5a5` | Buzzard hero h1 text |
| Ahead of Buzzard | `#4ade80` | "+X mi ahead" text in runner hero |
| Behind Buzzard | `#f87171` | "X mi behind" text in runner hero |
| Danger / Buzzard stats | `#dc2626` | Buzzard daily pace stat, mi/day-to-finish when failing |
| Success green | `#16a34a` | Runners-ahead stat, mi/day-to-finish when on pace |
| Male dot (map) | `#3b82f6` | Male runner pin on Leaflet map |
| Female dot (map) | `#f472b6` | Female runner pin on Leaflet map |
| Walk badge | `#3b82f6` on `rgba(59,130,246,0.08)` | Activity type pill for walk |
| Run badge | `#1B3F6E` on `rgba(27,63,110,0.08)` | Activity type pill for run |
| Buzzard badge | `#dc2626` on `rgba(220,38,38,0.08)` | Activity type pill for buzzard entries |
| Dividers | `rgba(0,0,0,0.04–0.08)` | All horizontal rules, borders between cells |
| Dark-context divider | `rgba(255,255,255,0.08–0.12)` | Dividers on dark (hero) backgrounds |

---

## 2. Typography

### Font Families

| Family | CSS Variable | Import Weights | Where Used |
|--------|-------------|----------------|-----------|
| Barlow Condensed | `var(--font-display)` / `--font-display` | 400, 800 | All headings, stat numbers, table headers, labels, filter pills, nav, CTA button |
| DM Sans | `var(--font-body)` / `--font-body` | 300, 400, 500, 600 (also italic 400) | Body text, lb-cell, search input, activity table cells, sub-labels |

**Import source:** Google Fonts via `layout.tsx`
```html
https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap
```

**CSS shortcut:** `.font-display` applies `font-family: var(--font-display)`.

### Font Sizes

| Size | Class/Context | Used For |
|------|---------------|---------|
| 9px | `.runner-stat-label`, `.lb-header` | Stat labels, leaderboard column headers |
| 10px | inline style | Activity type badge, rank badge sub-label, chart Y-axis labels |
| 11px | inline style | AsOfBanner text, mini-leaderboard section titles, nav links, StatStrip labels |
| 12px | `.lb-cell` (mobile ≤768px), `runner-th`, `runner-td` | Table data, bib, km, comp%, proj-fin, gender, route labels |
| 13px | `.lb-cell` (desktop), runner names, search input | Leaderboard cell default, toolbar label, activity rows |
| 14px | inline style | Progress tracker "Day X" floating label, map popup, CTA sub-text |
| 15px | inline style | Section heads (`SectionHead`), mini-lb names/miles, CTA button |
| 16px | inline style | Activity miles value in table, ProgressBar "X miles completed" header |
| 17px | inline style | Mini-leaderboard runner name and miles on landing |
| 28px | `.runner-stat-value` (≤640px), `RankBadge` rank | Stat values on mobile, rank badge number |
| 38px | `StatCell` on runner profile | Runner profile stats panel values |
| 40px | `.race-title`, `.runner-stat-value` | Dashboard title, stat values desktop |
| 52px | `.runner-hero-name` | Runner profile hero name (desktop) |
| 36px | `.runner-hero-name` (≤640px) | Runner profile hero name (mobile) |
| clamp(28px, 4vw, 40px) | landing hero | Landing page stat numbers |
| clamp(28px, 3.5vw, 44px) | StatStrip | Dashboard stat strip numbers |

### Font Weights

| Weight | Font | Where Used |
|--------|------|-----------|
| 400 | Barlow Condensed | `lb-header`, stat labels, `.runner-stat-label`, filter labels |
| 500 | DM Sans | Body text, runner names in mini-lb, meta text |
| 600 | DM Sans | Route labels, rank numbers in mini-lb, bold highlights |
| 700 | Barlow Condensed | `SectionHead` title, nav brand, mini-lb section titles, back button |
| 800 | Barlow Condensed | All hero h1, big stat numbers, rank display in leaderboard, CTA button, `runner-stat-value` |

### Letter Spacing

| Value | Used For |
|-------|---------|
| `0.1em` | Section heads, race title |
| `0.12em` | Activity table headers |
| `0.14em` | Route labels, progress bar labels |
| `0.15em` | `.lb-header`, `.runner-stat-label`, rank badge sub-label |
| `0.16em` | Landing hero stat labels |
| `0.18em` | CTA button |
| `0.2em` | StatStrip labels, mini-lb section titles, dashboard subtitle |
| `0.22em` | Nav brand "GVRAT 2026" |
| `-0.01em` | All large stat numbers (tabular, condensed feel) |

---

## 3. Spacing Scale

| Value | Applied To |
|-------|-----------|
| 3px | Gold accent underline height; divider dot (DotSep) |
| 4px | `filter-pill` gap; runner-stat-item padding; border-bottom light |
| 5px | Back button padding vertical; DotSep gap |
| 6px | StatStrip label margin-bottom |
| 7px | AsOfBanner padding top/bottom |
| 8px | Mini-lb gap mobile; stat-label margin-top; progress labels margin-top |
| 10px | Activity table row padding; back button height padding |
| 12px | Tablet lb-cell padding; mobile container padding |
| 14px | Default lb-cell padding horizontal; activity cell padding |
| 16px | Search/pill horizontal padding; standard section padding; chart section pad |
| 18px | Desktop lb-grid-row padding horizontal |
| 20px | Dashboard header padding vertical; runner hero section padding |
| 24px | Container horizontal padding; stat padding; chart section padding |
| 28px | Landing hero padding bottom; dashboard header horizontal padding |
| 32px | "Show more" button horizontal padding; body section bottom padding |
| 40px | Mini-leaderboard horizontal padding (desktop) |

**Most common pattern:** `padding: "0 24px"` for page-width containers.

---

## 4. Component Inventory

### AsOfBanner.tsx
**Path:** `frontend/components/AsOfBanner.tsx`  
**Purpose:** Informational banner showing data freshness. "Data as of [date] at 12:00 UTC."

**Props:**
```typescript
{ text: string }  // e.g. "Data as of May 4, 2026 at 12:00 UTC"
```

**Visual:** White bar, centered, 7px vertical / 20px horizontal padding. 16×16 "i" icon circle (navy border `rgba(27,63,110,0.5)`, navy text `#1B3F6E`, 10px Barlow 800). Text is 11px DM Sans `rgba(0,0,0,0.38)`. Dates and "12:00 UTC" are bolded to `rgba(0,0,0,0.55)` weight 500.

```jsx
<AsOfBanner text={meta.asOfBannerText} />
```

---

### DashboardClient.tsx
**Path:** `frontend/components/DashboardClient.tsx`  
**Purpose:** Full dashboard shell. Composes all sub-components in order.

**Props:**
```typescript
{
  runners: Runner[];
  courseCoords: [number, number][];
  meta: MetaData;
}
```

**Visual layout (top to bottom):**
1. Header (white bg, `borderBottom: 1px solid rgba(0,0,0,0.05)`, padding `20px 28px 16px`) — logo 70×70 + title block
2. StatStrip (full bleed)
3. Map (full bleed, `h-[200px] sm:h-[250px] lg:h-[40vh]`)
4. RaceProgress
5. AsOfBanner
6. Leaderboard section (`mx-auto w-full px-4 md:px-6 py-6`)
7. Footer (navy bg, white text, `py-4`)

**Header title block:**
```jsx
<h1 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 40, color: "#1B3F6E",
  letterSpacing: "0.1em", textTransform: "uppercase", lineHeight: 1 }}>
  GVRAT 2026
</h1>
// subtitle: 11px, weight 700, opacity 0.75, letterSpacing "0.2em"
// gold underline: width 48px, height 3px, background "#F4A623", borderRadius 2, margin "10px 0 0 0"
```

**Mobile title override** (via globals.css): `.race-title` → 28px at ≤480px; `.race-subtitle` → 9px at ≤480px.

---

### Leaderboard.tsx
**Path:** `frontend/components/Leaderboard.tsx`  
**Purpose:** Sortable/filterable/paginated table of all runners. Handles search, gender filter, country filter, pagination.

**Props:**
```typescript
{
  runners: Runner[];
  selectedRunner: Runner | null;
  onSelect: (r: Runner | null) => void;
}
```

**Grid columns (10 columns desktop):**
```
grid-template-columns: 40px 36px 50px 1fr 24px 72px 60px 54px 70px 70px
gap: 12px
padding: 10px 18px
```

**Columns:** Pos | Bib | Location (pin) | Name | G | Miles | KM | Comp% | Proj Fin | Gender Place

**Tablet (≤768px) — 5 visible columns:**
```
grid-template-columns: 40px 1fr 24px 72px 64px
gap: 8px; padding: 10px 12px
```
Hidden: Bib, KM, Comp%, Gender Place

**Mobile (≤430px) — 5 visible columns:**
```
grid-template-columns: 32px 1fr 24px 64px 60px
gap: 4px; padding: 10px 8px
```

**Header:** `linear-gradient(180deg, #1B3F6E 0%, #163558 100%)`, text `rgba(255,255,255,0.6)`, 9px Barlow 400, letterSpacing 0.15em uppercase.

**Filter pills:**
```jsx
// Active:
{ background: "#1B3F6E", color: "#fff", border: "1px solid #1B3F6E" }
// Inactive:
{ background: "#fff", border: "1px solid rgba(0,0,0,0.12)", color: "rgba(0,0,0,0.6)" }
// Both: fontFamily: DISPLAY, fontSize: 12, minHeight: 44, borderRadius: 22, padding: "0 16px" }
```

**Search input:**
```jsx
{ height: 44, background: "#ffffff", border: "1px solid rgba(0,0,0,0.1)",
  borderRadius: 22, padding: "0 40px 0 36px", fontSize: 14 }
// Focus: borderColor "#1B3F6E", boxShadow "0 0 0 2px rgba(27,63,110,0.15)"
```

**"Show next" button:**
```jsx
{ background: "#F4A623", color: "#1B3F6E", minHeight: 44, padding: "0 32px",
  borderRadius: 22, fontSize: 14, fontWeight: 600 }
```

**Row colors:**
```typescript
gingerbread: "linear-gradient(90deg, #fffbf0, #ffffff)"
buzzard:     "linear-gradient(90deg, #fff5f5, #ffffff)"
selected:    "#e8f4fd"
even:        "#ffffff"
odd:         "#fafafa"
hover:       "#f0f5ff"   // transition: "background 0.1s"
```

**Map pin button (Col 3):**
```jsx
{ width: 24, height: 24, borderRadius: "50%", border: "1px solid rgba(0,0,0,0.1)",
  background: "#ffffff", fontSize: 11 }
// hover: background "#1B3F6E"
```

---

### RaceMap.tsx
**Path:** `frontend/components/RaceMap.tsx`  
**Purpose:** Thin wrapper that dynamically imports RaceMapInner with SSR disabled.

**Props:**
```typescript
{
  runners: Runner[];
  courseCoords: [number, number][];
  selectedRunner?: Runner | null;
}
```

**Loading state:** `bg-slate-100`, text-slate-400, centered "Loading map…"

---

### RaceMapInner.tsx
**Path:** `frontend/components/RaceMapInner.tsx`  
**Purpose:** Leaflet map with course route, runner markers, clustering.

**Props:** Same as RaceMap (no optional).

**Tile layer:** `https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png` (CartoDB Light)

**Route rendering (two polylines):**
```javascript
// Glow beneath:
{ color: "#F4A623", weight: 14, opacity: 0.15 }
// Main line:
{ color: "#F4A623", weight: 4, opacity: 1 }
```

**Marker sizes and icons:**
```
leader.svg:     iconSize [28,28], file: /icons/leader.svg
gingerbread:    iconSize [32,32], file: /icons/gingerbread.svg, divIcon
buzzard:        iconSize [32,32], file: /icons/buzzard.svg, divIcon
male runner:    12×12 circle, bg #3b82f6, border 1.5px rgba(0,0,0,0.3)
female runner:  12×12 circle, bg #f472b6, border 1.5px rgba(0,0,0,0.3)
selected male:  14×14 inner + 24×24 pulsing outer ring (same hue)
selected female: same pattern, pink
```

**Cluster:** `maxClusterRadius: 40`, `chunkedLoading: true`

**Initial map state:** `center: [37.5, -99.0]`, `zoom: 5`  
**On runner select:** `flyTo(lat, lon, zoom=12, duration=1.5s)`

---

### RaceProgress.tsx
**Path:** `frontend/components/RaceProgress.tsx`  
**Purpose:** Race calendar progress bar (Day 1 → Day N).

**Props:**
```typescript
{ dayNumber: number; totalDays: number }
```

**Visual:** White bg (`#ffffff`), `padding: 16px 24px`, `maxWidth: 1024px` centered.

**Progress track:**
```jsx
{ height: 20, background: "rgba(0,0,0,0.04)", borderRadius: 10 }
// Gold fill:
{ background: "linear-gradient(90deg, rgba(244,166,35,0.7) 0%, rgba(244,166,35,0.9) 100%)",
  borderRight: "2px solid #D48C1C" }
// Has diagonal stripe texture overlay (opacity 0.15)
```

**Marker dot:**
```jsx
{ width: 20, height: 20, borderRadius: "50%", background: "#ffffff",
  border: "3px solid #F4A623", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }
// Inner fill: 6×6 #F4A623 dot
```

**"Day X" floating label** (only when 15% < progress < 85%):
```jsx
{ fontFamily: DISPLAY, fontSize: 14, fontWeight: 600, color: "#1B3F6E",
  letterSpacing: "0.05em", textTransform: "uppercase" }
```

---

### StatStrip.tsx
**Path:** `frontend/components/StatStrip.tsx`  
**Purpose:** 4-cell stat summary strip below the dashboard header.

**Props:**
```typescript
{ meta: MetaData }
```

**Stats displayed:** Race Day | Runners on Course | Miles Logged (GOLD) | Current Leader

**Layout:** White bg, `maxWidth: 1280px`, 4-column grid. Mobile (≤640px) → 2×2 grid with borders on all 4 sides.

**Each cell:**
```jsx
// Label: 9px Barlow 400, letterSpacing "0.2em", color rgba(0,0,0,0.32)
// Value: clamp(28px, 3.5vw, 44px) Barlow 800, fontVariantNumeric: "tabular-nums"
// Sub (optional): .stat-sub class = 11px DM Sans 400, rgba(0,0,0,0.32)
// Separator: borderRight "1px solid rgba(0,0,0,0.07)"
// Padding: "20px 24px"
```

---

## 5. Layout System

### Page Max-Widths

| Container | Max-Width | Used In |
|-----------|-----------|---------|
| `640px` | Landing hero content, progress bar, mini-lb | `app/page.tsx` |
| `680px` | Mini-leaderboard card | `app/page.tsx` |
| `780px` | Runner profile body | `runner/[bib]/page.tsx` |
| `1024px` | RaceProgress bar | `RaceProgress.tsx` |
| `1280px` | StatStrip | `StatStrip.tsx` |
| `max-w-5xl` (1024px) | Leaderboard + toolbar | `Leaderboard.tsx` |
| Full bleed | Map, header, footer, stat strip | `DashboardClient.tsx` |

### CSS Grid Definitions

```css
/* Leaderboard — desktop */
.lb-grid-row {
  grid-template-columns: 40px 36px 50px 1fr 24px 72px 60px 54px 70px 70px;
  gap: 12px;
  padding: 10px 18px;
}

/* Leaderboard — tablet (≤768px) */
grid-template-columns: 40px 1fr 24px 72px 64px;
gap: 8px; padding: 10px 12px;

/* Leaderboard — mobile (≤430px) */
grid-template-columns: 32px 1fr 24px 64px 60px;
gap: 4px; padding: 10px 8px;

/* StatStrip — desktop */
.stat-strip-grid { grid-template-columns: repeat(4, 1fr); }

/* StatStrip — mobile (≤640px) */
.stat-strip-grid { grid-template-columns: repeat(2, 1fr); }

/* Runner profile stats panel — desktop */
.runner-stats-grid { grid-template-columns: repeat(4, 1fr); }

/* Runner profile stats panel — mobile (≤640px) */
.runner-stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
```

### Flexbox Patterns

```jsx
// Standard centered header:
{ display: "flex", justifyContent: "center", alignItems: "center", gap: 24 }

// Full-width toolbar:
{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }

// Runner meta (name + badges):
{ display: "flex", justifyContent: "space-between", alignItems: "flex-start",
  gap: 16, flexWrap: "wrap" }

// Location strip:
{ display: "flex", alignItems: "center", flexWrap: "wrap", rowGap: 8 }
```

### Responsive Breakpoints

| Breakpoint | Utility Class | Effect |
|------------|--------------|--------|
| `≤ 480px` | `.hide-sm` | Hides time column in activity table |
| `≤ 480px` | `.filter-pill` | `min-height: 36px` |
| `≤ 480px` | `.show-btn` | `min-height: 44px; width: 100%` |
| `≤ 480px` | `.lb-cell` | font 11px, padding 8px 10px |
| `≤ 480px` | `.lb-header` | padding 8px 10px |
| `≤ 480px` | `.race-title` | font 28px |
| `≤ 480px` | `.race-subtitle` | font 9px, letterSpacing 0.18em |
| `≤ 480px` | `.runner-container` | padding 0 12px |
| `≤ 480px` | `.runner-td` | font 12px, padding 8px 10px 8px 0 |
| `≤ 640px` | `.runner-hero-name` | font 36px |
| `≤ 640px` | `.runner-stats-strip` | switches to 2-col grid |
| `≤ 640px` | `.runner-stat-value` | font 28px |
| `≤ 640px` | `.runner-stat-divider` | `display: none` |
| `≤ 640px` | `.runner-bar-track` | height 26px |
| `≤ 640px` | `.stat-strip-grid` | switches to 2×2 grid |
| `≤ 640px` | `.mini-lb-container` | `flex-direction: column` |
| `≤ 640px` | `.runner-loc-item` | removes borders |
| `≤ 768px` | `.hide-mobile` | Hides desktop-only elements (map pin column, .hide-mobile spans) |
| `≤ 768px` | `.hide-tablet` | Hides tablet-hidden elements (Bib, KM, Comp%, Gender Place) |
| `≤ 768px` | `.lb-miles-bar` | `display: none` |
| `≤ 768px` | `.lb-cell` | font 12px, padding 8px 12px |
| `≤ 430px` | `.lb-grid-row` | 5-col tighter grid |

---

## 6. Interactive States

### Transitions

| Element | Transition | Duration |
|---------|-----------|---------|
| Leaderboard row | background | 0.1s |
| Back button (hero) | background | 0.12s |
| Runner name link | color + underline | instant |
| CTA button | opacity + translateY | 0.15s |
| Progress bar fill | width | 0.8s ease-out |
| Progress marker | left | 0.8s ease-out |
| Search focus border | border-color + box-shadow | 0.2s |
| Clear search btn | background + color | instant |
| Filter pills | all (Tailwind `transition-all`) | default |

### Hover Colors

```css
/* Leaderboard row */
onMouseEnter: background → #f0f5ff
onMouseLeave: background → original row bg

/* Map pin button */
onMouseEnter: background → #1B3F6E   (also: .map-pin-btn:hover { border-color: #1B3F6E })
onMouseLeave: background → #ffffff

/* CTA button (landing) */
onMouseEnter: opacity → 0.88, transform → translateY(-1px)
onMouseLeave: opacity → 1, transform → translateY(0)

/* Back button (hero, .hero-back-btn) */
:hover { background: rgba(255,255,255,0.14) !important }

/* Runner name link (.runner-name-link) */
:hover { color: #1B3F6E !important; text-decoration: underline; cursor: pointer }

/* Back button profile (.back-btn) */
:hover { opacity: 0.85 }

/* Search focus */
onFocus: borderColor → #1B3F6E, boxShadow → "0 0 0 2px rgba(27,63,110,0.15)"
onBlur:  borderColor → rgba(0,0,0,0.1), boxShadow → none

/* Clear search button */
onMouseEnter: background → rgba(0,0,0,0.15), color → rgba(0,0,0,0.8)
onMouseLeave: background → rgba(0,0,0,0.08), color → rgba(0,0,0,0.5)
```

### Focus Visible

```css
.lb-grid-row:focus-visible {
  outline: 2px solid #1B3F6E;
  outline-offset: -2px;
  border-radius: 4px;
}
```

---

## 7. Page Structure

### Landing page (`app/page.tsx`)

Full-viewport dark page. Background: `bg-topo.webp` + `linear-gradient(to bottom, rgba(13,17,28,0.8), rgba(13,17,28,0.9))`.

```
<main>                        // min-height 100svh, Barlow Condensed, dark bg
  <nav>                       // GVRAT 2026 wordmark left | gvrat.racing link right
  <div.landing-hero>          // flex-col, center, padding 0 24px 60px
    <Image gvrat-logo-transparent.png>  // 160×160, mixBlendMode: lighten
    <div>                     // Route progress bar (maxWidth 640px, gold 6px track)
    <div>                     // Live stats strip: Race Day | Runners | Miles (maxWidth 640px)
    <div.mini-lb-container>   // Top Women | divider | Top Men (maxWidth 680px, glass card)
    <Link /gvrat-2026>        // "View Full Leaderboard" CTA (gold button)
    <p>                       // "Updated daily · 07:00 CDT (12:00 UTC)"
```

### Dashboard (`app/gvrat-2026/page.tsx` → `DashboardClient.tsx`)

Light page, `background: var(--surface-bg)`.

```
<div>
  <header>                    // White panel: logo 70×70 + GVRAT 2026 title + gold underline
  <StatStrip />               // 4 stats, full bleed white, max-width 1280px
  <div.map-wrap>              // h-[200px] sm:h-[250px] lg:h-[40vh], with gradient fade overlay
    <RaceMap />
  <RaceProgress />            // White bar, gold progress track, max-width 1024px
  <AsOfBanner />              // White info bar, data freshness
  <div>                       // mx-auto w-full px-4 md:px-6 py-6
    <Leaderboard />
  <footer>                    // navy bg, white text, py-4, text-xs center
```

### Runner profile (`app/gvrat-2026/runner/[bib]/page.tsx`)

Light page with dark hero at top. `background: var(--surface-bg)`.

```
<main>
  <div>                       // HERO: dark topo overlay, padding 16px 0 28px
    <div.runner-container>    // maxWidth 780px, padding 0 24px
      <Link←>                 // Back button pill (glass style)
      <h1.runner-hero-name>   // Runner name, 52px/36px, Barlow 800
      <ProgressBar />         // Gold 10px track, Buzzard/Leader emoji marker
      <div>                   // Location strip: 📍 current | 🏁 projected | 🦅 vs Buzzard
  <div>                       // STATS PANEL: white bg, borderBottom, padding 0 24px
    <div.runner-stats-grid>   // 4×1 / 2×2 grid, maxWidth 780px
      4× StatCell             // value 38px navy/gold, label 10px uppercase
  <div>                       // BODY: maxWidth 780px, padding 0 24px 32px
    <CumulativeChart />       // SVG chart, f8fafc bg, borderTop divider
    <div>                     // Activity Log, borderTop divider
      <SectionHead />         // 15px Barlow 700 navy + count
      <table.runner-table>    // Date | Type | Miles | Time | Comment
```

---

## 8. Assets

### Background Images

| File | Size | Used In | Purpose |
|------|------|---------|---------|
| `bg-topo.webp` | — | `app/page.tsx` (landing hero), `runner/[bib]/page.tsx` (runner hero) | Topographic map texture as dark-overlay background. Preloaded with `fetchPriority="high"` in layout.tsx |
| `bg-dots.png` | — | **Not referenced in any component** | Unused — do not introduce unless intentional |

### Logos

| File | Used In | Display Size | Notes |
|------|---------|-------------|-------|
| `gvrat-logo-transparent.png` | Landing (`app/page.tsx`) | 160×160 (110px at ≤780px height, 80px at ≤700px height) | `mixBlendMode: "lighten"` so it composites on dark bg |
| `gvrat-logo-transparent.png` | Dashboard header (`DashboardClient.tsx`) | 70×70 | Standard `<img>` tag, `objectFit: contain` |
| `gvrat-logo.png` | Not referenced in any component | — | Available but unused |
| `favicon.png` | `layout.tsx` `<link rel="icon">` | — | Browser tab icon |

### Icons (`/public/icons/`)

| File | Size on Map | Size in Leaderboard | Used For |
|------|------------|---------------------|---------|
| `leader.svg` | 28×28 (`L.icon`) | — | Leader runner position marker on map |
| `gingerbread.svg` | 32×32 (`L.divIcon`) | 12×12 inline `<img>` | GBM virtual runner; map marker + leaderboard name prefix |
| `buzzard.svg` | 32×32 (`L.divIcon`) | 14×14 inline `<img>` | Buzzard virtual runner; map marker + leaderboard name prefix |

---

## 9. Design Tokens (Quick Reference)

| Token | Value | Usage Rule |
|-------|-------|------------|
| Navy | `#1B3F6E` | Primary text color for stats, titles, and all interactive foreground on light backgrounds |
| Gold | `#F4A623` | Accent only. Miles logged, progress fills, primary CTA, "Show more" button |
| Red | `#C0392B` | Buzzard-specific elements only — row color, rank number |
| Green | `#27AE60` | Finished state only |
| Surface BG | `var(--surface-bg)` ≈ `oklch(97% 0.005 250)` | Page background — never use `#f5f5f3` directly |
| Surface Panel | `var(--surface-panel)` = `#ffffff` | Cards, headers, strips — always white |
| Font Display | `var(--font-display)` = Barlow Condensed | All numbers, titles, labels, pills, buttons |
| Font Body | `var(--font-body)` = DM Sans | All prose, table data, search input |
| Stat number size | `clamp(28px, 3.5vw, 44px)` | StatStrip; mirrors `clamp(28px, 4vw, 40px)` on landing |
| Hero name | 52px / 36px (≤640px) | Runner profile h1 |
| Divider | `rgba(0,0,0,0.06–0.08)` | All light-bg borders |
| Dark divider | `rgba(255,255,255,0.08–0.12)` | All dark-bg (hero) borders |
| Row hover | `#f0f5ff` | Only on leaderboard rows |
| Row selected | `#e8f4fd` | Map-pinned runner |
| Pill radius | `22px` | All pill buttons (filters, search bar, "Show more") |
| Card radius | `10px` | Leaderboard table container |
| Badge radius | `8px` | RankBadge on runner profile |
| Gold underline | `48px × 3px`, `borderRadius: 2` | Dashboard title accent — not reusable as a generic divider |

---

## 10. Anti-patterns (Do Not Use)

### Colors to Never Use
- `bg-dots.png` — in public, not used anywhere, don't reference it
- Any shade of blue other than `#1B3F6E` (navy) or `#3b82f6` (map male dot only) on light backgrounds
- `#9ca3af` — map-only grey for unknown gender; never use as general text color

### CSS Approaches to Avoid
- Do not use Tailwind color utilities (`text-blue-600`, `bg-gray-100`) for brand colors — always use hex values or CSS variables
- Do not use `vh` for full-height layouts on mobile — use `svh` via `@supports (min-height: 100svh)` as in landing page
- Do not use `display: flex` for the leaderboard table — it is a CSS Grid layout specifically sized for pixel-perfect alignment
- Do not use generic `border: 1px solid #ddd` — always use `rgba(0,0,0,0.05–0.08)` for light surfaces

### Typography Anti-patterns
- Never use vague size descriptors ("large", "small") — always specify exact px
- Never mix Barlow Condensed and DM Sans on the same text block — labels use Barlow, content uses DM Sans
- Never use weight 600 Barlow Condensed — only 400 and 800 are imported

### Component Anti-patterns
- Do not add stats outside the 4-cell `StatStrip` pattern without a redesign
- Do not add a 5th column to the runner profile stats panel — it is a 4-column grid responsive to 2×2
- Do not make the map height a fixed px value — it is `h-[200px] sm:h-[250px] lg:h-[40vh]`
- Do not add `overflow: visible` to `.map-wrap` — it requires `overflow: hidden` and `touch-action: pan-y`
- Do not apply `mixBlendMode: "lighten"` outside the logo on the dark hero

### Layout Anti-patterns
- Do not center the leaderboard container at more than `max-w-5xl` (1024px)
- Do not center StatStrip content at more than `1280px`
- Do not wrap runner profile content beyond `780px`
- Do not give landing page content a max-width beyond `680px`

---

## 11. Rules for New Components

### New stat display (additional metric cell)

Must match the `StatCell` pattern from `StatStrip.tsx` exactly:

```jsx
<div style={{
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "20px 24px",
  borderRight: isLast ? "none" : "1px solid rgba(0,0,0,0.07)",
  minWidth: 0,
}}>
  <span style={{
    fontFamily: "var(--font-display)",
    fontWeight: 400,
    fontSize: 9,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    color: "rgba(0,0,0,0.32)",
    marginBottom: 6,
    whiteSpace: "nowrap",
  }}>LABEL</span>
  <span style={{
    fontFamily: "var(--font-display)",
    fontWeight: 800,
    fontSize: "clamp(28px, 3.5vw, 44px)",
    lineHeight: 1,
    color: "#1B3F6E",   // or "#F4A623" for accent stats
    fontVariantNumeric: "tabular-nums",
    letterSpacing: "-0.01em",
  }}>VALUE</span>
  {/* Optional sub: */}
  <span className="stat-sub">sub text</span>
</div>
```

### New table column in leaderboard

1. Add column ID to `HEADER_COLS` array in `Leaderboard.tsx`
2. Update the CSS grid template in all three breakpoints (desktop/tablet/mobile)
3. Add a `<div>` inside `DataRow` in the exact column order
4. Apply `.hide-tablet` or `.hide-mobile` class if it should collapse on smaller screens
5. Match header style:
```jsx
<div style={{
  fontFamily: "var(--font-display)",
  fontSize: 11,
  color: "rgba(255,255,255,0.6)",
  letterSpacing: "0.15em",
  textTransform: "uppercase",
}}>HEADER</div>
```
6. Match cell style:
```jsx
<div style={{ fontSize: 12, color: "rgba(0,0,0,0.4)", textAlign: "right" }}>
  {value}
</div>
```

### New section on runner profile page

Follow the `SectionHead` + content pattern:

```jsx
<div style={{ paddingTop: 24, paddingBottom: 0, borderTop: "1px solid rgba(0,0,0,0.06)" }}>
  <SectionHead title="SECTION TITLE" sub="optional sub-label" />
  {/* content */}
</div>
```

`SectionHead` renders:
```jsx
<span style={{
  fontFamily: "'Barlow Condensed', sans-serif",
  fontWeight: 700,
  fontSize: 15,
  color: "#1B3F6E",
  textTransform: "uppercase",
  letterSpacing: "0.1em",
}}>
  {title}
</span>
<span style={{ fontSize: 12, color: "rgba(0,0,0,0.4)" }}>{sub}</span>
```

### New button (primary action)

```jsx
<button style={{
  background: "#F4A623",
  color: "#1B3F6E",
  fontFamily: "var(--font-display)",
  fontWeight: 800,
  fontSize: 15,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  padding: "14px 40px",
  borderRadius: 4,
  border: "none",
  cursor: "pointer",
  transition: "opacity 0.15s, transform 0.15s",
}}>
  BUTTON LABEL
</button>
// hover: opacity 0.88, translateY(-1px)
```

### New pill button (filter-style)

```jsx
// Active state:
<button style={{
  fontFamily: "var(--font-display)",
  fontSize: 12,
  textTransform: "uppercase",
  padding: "0 16px",
  minHeight: 44,
  borderRadius: 22,
  background: "#1B3F6E",
  color: "#ffffff",
  border: "1px solid #1B3F6E",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
}}>ACTIVE</button>

// Inactive state:
<button style={{
  /* same as above except: */
  background: "#ffffff",
  color: "rgba(0,0,0,0.6)",
  border: "1px solid rgba(0,0,0,0.12)",
}}>INACTIVE</button>
```

### New card / panel

Use the leaderboard card pattern:

```jsx
<div style={{
  borderRadius: 10,
  overflow: "hidden",
  border: "1px solid rgba(0,0,0,0.05)",
  background: "#ffffff",
}}>
  {/* card content */}
</div>
```

For glass cards on dark backgrounds (landing page style):

```jsx
<div style={{
  background: "rgba(0,0,0,0.3)",
  backdropFilter: "blur(4px)",
  border: "1px solid rgba(255,255,255,0.05)",
  borderRadius: 12,
  boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
}}>
```

---

## 12. Dark vs Light Contexts

### Dark Background Pages/Sections

| Location | Background |
|----------|-----------|
| Landing page (`app/page.tsx`) | `bg-topo.webp` + `rgba(13,17,28,0.8–0.9)` gradient overlay |
| Runner profile hero | `bg-topo.webp` + `rgba(13,17,28,0.85–0.95)` overlay |
| Buzzard profile hero | `bg-topo.webp` + red-tinted overlay `rgba(69,10,10,0.85)` |
| Dashboard footer | `background: #1B3F6E` |
| Leaderboard table header | `linear-gradient(180deg, #1B3F6E, #163558)` |

**Text colors on dark backgrounds:**

| Semantic | Color |
|----------|-------|
| Primary text | `#ffffff` or `rgba(255,255,255,0.95)` |
| Secondary / meta text | `rgba(255,255,255,0.55–0.65)` |
| Muted / labels | `rgba(255,255,255,0.35–0.4)` |
| Dividers | `rgba(255,255,255,0.08–0.12)` |
| Accent numbers (miles) | `#F4A623` |
| Leaderboard header text | `rgba(255,255,255,0.6)` |

**Interactive elements on dark backgrounds:**

- Back button: `background: rgba(255,255,255,0.08)`, `border: 1px solid rgba(255,255,255,0.15)`
- Back button hover: `background: rgba(255,255,255,0.14)`
- Dot separator (DotSep): `background: rgba(255,255,255,0.3)`, 3×3px circle

### Light Background Pages/Sections

| Location | Background |
|----------|-----------|
| Dashboard page body | `var(--surface-bg)` = `oklch(97% 0.005 250)` |
| Runner profile body | `var(--surface-bg)` |
| Dashboard header | `var(--surface-panel)` = `#ffffff` |
| StatStrip | `#ffffff` |
| RaceProgress | `#ffffff` |
| AsOfBanner | `#ffffff` (or `white`) |
| Leaderboard rows | `#ffffff` / `#fafafa` alternating |
| Chart background | `#f8fafc` |

**Text colors on light backgrounds:**

| Semantic | Color |
|----------|-------|
| Primary text | `#1A1A2E` |
| Navy brand text | `#1B3F6E` |
| Secondary / muted | `rgba(0,0,0,0.4–0.5)` |
| Very muted / labels | `rgba(0,0,0,0.3–0.35)` |
| Dividers | `rgba(0,0,0,0.04–0.08)` |
| Accent (miles) | `#F4A623` |

**Component styles that change between contexts:**

| Component | Dark Context | Light Context |
|-----------|-------------|---------------|
| Dividers | `rgba(255,255,255,0.08)` | `rgba(0,0,0,0.06–0.08)` |
| Secondary text | `rgba(255,255,255,0.4–0.6)` | `rgba(0,0,0,0.4–0.5)` |
| Progress track | `rgba(255,255,255,0.08)` | `rgba(0,0,0,0.04)` |
| Progress bar height | 6px (landing), 10px (runner hero) | 20px (RaceProgress) |
| Back button | Glass with white border | N/A |
| Route labels font color | `rgba(255,255,255,0.5)` | N/A |

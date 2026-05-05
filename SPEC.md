# GVRAT Dashboard — Project Spec

A statically-deployed dashboard for **The Great Virtual Race Across The States (GVRAT) 2026**, replacing a manual Google Sheets + Ninja Tables workflow with an automated daily pipeline.

**Live at**: `dashboard.gvrat.com`
**Stack**: Python pipeline + Next.js frontend + GitHub Actions cron + Cloudflare Pages
**Cost**: $0 infra (within free tiers)

This document is the seed for a Claude Code project. It is detailed enough to execute against but leaves implementation decisions (specific library APIs, file organization within modules, etc.) to the agent. Build sequentially — don't start session N+1 until session N's tests pass and the human approves.

---

## 1. The race, and why the design is what it is

### What GVRAT is
GVRAT is a virtual race covering **679 miles** along a fixed route from Baxter Springs, KS to the Pueblo, CO area. ~400–500 runners participate. Each runner logs their daily run/walk activities on the **RunSignup** platform; their cumulative miles determine their virtual position on the route.

**Race window**: May 1, 2026 → September 30, 2026 (153 days).

### The fairness cutoff (critical design principle)

The leaderboard updates **once per day, at 12:00 UTC**. This is not an arbitrary cron schedule — it is the only time of day where every runner on Earth has had the exact same number of *complete* calendar days to log activities.

- 12:00 UTC is midnight on Howland Island (UTC-12), the last place on Earth where any given calendar day ends.
- At that moment, every other runner globally has already finished that same day.
- A New Zealand runner's day ended 13 hours earlier; a Tennessee runner's ended 7 hours earlier; Howland's just ended.
- Every runner has had N complete days, no more, no less. The comparison is fair.

**This principle drives several decisions:**

1. The cron schedule is `0 12 * * *` UTC, with no timezone override. (It is 7am CDT in summer / 6am CST in winter — incidental.)
2. The pipeline filters activities by `Activity Date <= (UTC today - 1 day)`.
3. The dashboard surfaces this concept in a banner: "Results below are updated as of YYYY-MM-DD and include everything through the end of the last FULL day (YYYY-MM-DD) for ALL TIME ZONES. Any submitted results for the next day are not included in these totals."

Code comments in the pipeline must reference this principle whenever date logic appears.

### The two virtual characters

GVRAT's narrative is built around two non-runners on the leaderboard:

**Gingerbread Man** (bib `9999`):
- Always positioned exactly **1 mile ahead of the current leader**.
- He's the carrot. Every leader is chasing him.
- He IS registered as a real bib in RunSignup, but no activities are logged for him there. His position is computed entirely by this pipeline.

**Buzzard** (bib `9998`):
- Flies at exactly the pace needed to finish on Sept 30.
- His miles on day N = `N × (679 / 153)` ≈ `N × 4.4379`.
- He's the stick: stay ahead of him or you won't finish in time.
- Not registered in RunSignup at all — synthetic row, invented by the pipeline.

Both appear in the leaderboard with full Pos/Bib/Name/Miles/etc. like real runners. They are flagged with a `virtual: true` field in the JSON output so the frontend can render them with distinct icons.

### What the dashboard shows (v1 scope)

- **Course map** with the 679-mile route as a polyline
- **Pins for every runner** at their current mile position, including Buzzard and Gingerbread Man with distinct icons
- **Sortable, filterable leaderboard table** showing all runners with the same columns the current Ninja Table shows
- **"As of" banner** explaining the fairness cutoff
- **Day counter**: "Day 47 of 153"

**Out of scope for v1** (architected for, not built):
- Per-runner profile pages
- Stats / aggregate views
- Multiple races simultaneously (Transcon comes later as a config addition)
- Any auth / login
- Real-time updates

---

## 2. Architecture

### High-level flow

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────┐
│  RunSignup API  │───▶│  Python pipeline │───▶│ JSON files  │
└─────────────────┘    │  (GitHub Action) │    │  in repo    │
                       └──────────────────┘    └──────┬──────┘
                                                      │
                                                      ▼
                                              ┌──────────────┐
                                              │   Next.js    │
                                              │  static site │
                                              │ (Cloudflare) │
                                              └──────────────┘
```

Once per day at 12:00 UTC:
1. GitHub Action triggers
2. Python script runs: fetch from RunSignup → compute leaderboard → write JSON
3. JSON files are committed to repo
4. Cloudflare Pages detects commit, redeploys frontend
5. Public dashboard updates ~30 seconds later

### Repository structure

```
gvrat-dashboard/
├── pipeline/                    # Python data pipeline
│   ├── __init__.py
│   ├── main.py                  # CLI entry: `python -m pipeline.main --race gvrat-2026`
│   ├── runsignup.py             # RunSignup API client
│   ├── compute.py               # Leaderboard computation
│   ├── waypoints.py             # GPX parsing + mile-to-location lookup
│   ├── virtual_chars.py         # Gingerbread Man + Buzzard logic
│   ├── snapshots.py             # Daily snapshot writer
│   ├── models.py                # Pydantic models
│   ├── config.py                # Race config loader
│   └── tests/
│       ├── fixtures/            # Real CSV + GPX as test data
│       │   ├── activities-may-1.csv
│       │   ├── participants-may-1.csv
│       │   └── route.gpx
│       ├── test_compute.py
│       ├── test_waypoints.py
│       └── test_virtual_chars.py
│
├── races/
│   └── gvrat-2026/
│       ├── config.json          # race metadata + RunSignup IDs
│       ├── route.gpx            # 681-waypoint GPX (mile markers 000-680)
│       ├── descriptions.json    # hand-curated mile labels
│       └── overrides.json       # manual data corrections (start empty)
│
├── data/                        # generated daily, committed to repo
│   └── gvrat-2026/
│       ├── leaderboard.json     # current standings (rebuilt daily)
│       ├── course.geojson       # GPX track as GeoJSON (built once)
│       ├── meta.json            # race-level facts, day number, last updated
│       └── snapshots/
│           ├── 2026-05-01.json
│           ├── 2026-05-02.json
│           └── ...
│
├── frontend/                    # Next.js app
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx             # landing: race selector
│   │   └── gvrat-2026/
│   │       └── page.tsx         # dashboard
│   ├── components/
│   │   ├── RaceMap.tsx          # Leaflet map
│   │   ├── Leaderboard.tsx      # sortable/filterable table
│   │   ├── AsOfBanner.tsx
│   │   └── DayCounter.tsx
│   ├── lib/
│   │   ├── data.ts              # JSON loaders
│   │   └── format.ts            # date/distance/etc. formatters
│   ├── public/
│   │   └── icons/
│   │       ├── runner.svg
│   │       ├── leader.svg
│   │       ├── buzzard.svg
│   │       └── gingerbread.svg
│   ├── package.json
│   └── next.config.mjs
│
├── .github/
│   └── workflows/
│       └── daily-update.yml     # cron: 0 12 * * * UTC
│
├── .gitignore
├── pyproject.toml               # Python deps
├── README.md
└── SPEC.md                      # this document
```

### Why JSON files instead of a database

Data is small, read-only from the public's perspective, updated in batch once a day. JSON committed to the repo + CDN-served gives sub-100ms load times, zero ops, zero cost, free historical snapshots via git. Postgres would be premature and expensive.

If we ever need per-runner profile pages with daily mileage charts, we already have the snapshots — the chart is built client-side from snapshot JSON. No DB needed.

### Ingestion is pluggable

The pipeline must treat "where the raw data came from" as an interchangeable concern. Three ingestion sources exist or might exist:

1. **RunSignup API** (primary; OAuth or api_key+secret). Default for daily cron.
2. **Local CSV** (`--from-csv path/`). Used for testing, fixtures, and as a manual fallback if the API is unreachable. CSVs match the format RunSignup's existing dashboard exports produce — both files the user already downloads today.
3. **Cowork-scraped CSV**. Functionally identical to #2 — just downloaded by an agent rather than by the user clicking the button. Lands in the same `--from-csv` path.

The compute, virtual-character, snapshot, and serialization stages do not know or care which source produced the inputs. They consume normalized internal models (`Participant`, `Activity`) populated by an `IngestionSource` interface.

Implementation: define `pipeline/ingestion/__init__.py` with an `IngestionSource` protocol. Concrete classes `ApiSource`, `CsvSource`. Selecting a source happens in `main.py` based on flags. Everything downstream is identical.

This is what makes the "API first, Cowork fallback" workflow viable: the fallback path is *the same code* with a different data source.

---

## 3. Data contracts (JSON schemas)

### `races/gvrat-2026/config.json`

```json
{
  "id": "gvrat-2026",
  "name": "The Great Virtual Race Across The States 2026",
  "shortName": "GVRAT 2026",
  "abbreviation": "RAT",
  "totalMiles": 679,
  "startDate": "2026-05-01",
  "endDate": "2026-09-30",
  "totalDays": 153,
  "runsignup": {
    "raceId": null,
    "eventIds": []
  },
  "virtualCharacters": {
    "gingerbreadMan": { "bib": 9999, "registeredInRunSignup": true },
    "buzzard": { "bib": 9998, "registeredInRunSignup": false }
  }
}
```

The `runsignup.raceId` and `eventIds` are populated by the user before first run. If `eventIds` is empty, the pipeline auto-discovers events for the race and prints them; user copies the IDs in. Document this in README.

### `races/gvrat-2026/descriptions.json`

```json
{
  "0": "Registered",
  "1": "Checked-in",
  "2": "Started",
  "3": "Baxter Springs",
  "5": "Oklahoma",
  "8": "Douthat",
  "11": "North Miami",
  "14": "Miami",
  "17": "Narcissa",
  "26": "approaching Newark"
}
```

Sparse — only labeled miles have entries. The location lookup interpolates: a runner at mile 7 with no entry there falls back to "past Oklahoma" (mile 5 + 2). Rule:
- If `mile` has a description, use it directly.
- Else, find nearest preceding labeled mile X. If runner is at X+1 or X+2, return `"past {X.description}"`.
- Else, find nearest following labeled mile Y. If runner is at Y-1 or Y-2, return `"approaching {Y.description}"`.
- Else, fall back to `"past {X.description}"`.

This matches the existing sheet's pattern.

### `races/gvrat-2026/overrides.json`

```json
{
  "267": {
    "milesAdjustment": -3.5,
    "note": "Double-logged on 2026-05-14",
    "appliedDate": "2026-05-15"
  }
}
```

Applied during compute, after API pull. Empty `{}` is the starting state.

### `data/gvrat-2026/leaderboard.json`

```json
{
  "race": "gvrat-2026",
  "lastUpdatedUtc": "2026-05-15T12:00:00Z",
  "asOfDate": "2026-05-14",
  "dayNumber": 14,
  "totalDays": 153,
  "runners": [
    {
      "rank": 1,
      "rankDisplay": "#1",
      "bib": 9999,
      "firstName": "Gingerbread",
      "lastName": "Man",
      "displayName": "Gingerbread Man",
      "event": "RAT",
      "home": "US-TN",
      "gender": "M",
      "age": 100,
      "miles": 88.3,
      "km": 142.10,
      "compPercent": 13.0,
      "currentMile": 88,
      "lat": 36.804428,
      "lon": -94.927100,
      "locationDescription": "approaching Newark",
      "projectedFinish": "037 days",
      "projectedFinishDate": "2026-06-21",
      "genderRank": 1,
      "eventGen": "RATM",
      "virtual": true,
      "virtualType": "gingerbread",
      "lastActivityDate": null
    },
    {
      "rank": 2,
      "rankDisplay": "#1",
      "bib": 4,
      "firstName": "Jenna",
      "lastName": "Dagger",
      "displayName": "Jenna Dagger",
      "event": "RAT",
      "home": "GB",
      "gender": "F",
      "age": 41,
      "miles": 87.3,
      "km": 140.49,
      "compPercent": 12.86,
      "currentMile": 87,
      "lat": 36.815587,
      "lon": -94.922982,
      "locationDescription": "approaching Narcissa",
      "projectedFinish": "2026-05-26",
      "projectedFinishDate": "2026-05-26",
      "genderRank": 1,
      "eventGen": "RATF",
      "virtual": false,
      "virtualType": null,
      "lastActivityDate": "2026-05-14"
    }
  ]
}
```

Key conventions:
- `rank` is the underlying position; `rankDisplay` is what the table shows. Real runners' `rankDisplay` is their position among real runners only (so #1 real runner is `"#1"` even though Gingerbread Man is technically rank 1 overall). Gingerbread Man and Buzzard share/match the rank of an adjacent real runner for display, matching existing sheet behavior — `rankDisplay` for virtual chars is `"#1"` for Gingerbread Man and the real-runner rank position for Buzzard.
- `home`: `US-{state}` for US runners, ISO country code otherwise.
- `eventGen`: race abbreviation + gender (`RATM`, `RATF`).
- `projectedFinish`: a string for display. For real runners projected to finish before Sept 30, an actual date (`2026-08-22`). For real runners projected past the end, `"NNN days"`. Buzzard always shows the race end date. Gingerbread Man's projection mirrors the leader's.
- `virtualType`: `"gingerbread"`, `"buzzard"`, or null.

### `data/gvrat-2026/meta.json`

```json
{
  "race": "gvrat-2026",
  "lastUpdatedUtc": "2026-05-15T12:00:00Z",
  "asOfDate": "2026-05-14",
  "dayNumber": 14,
  "totalDays": 153,
  "totalRunnersRegistered": 416,
  "totalRunnersActive": 387,
  "totalMilesLogged": 14523.7,
  "leaderMiles": 87.3,
  "leaderName": "Jenna Dagger",
  "asOfBannerText": "Day 14: 05-14-2026. Results below are updated as of 05-15-2026 and include everything through the end of the last FULL day (05-14-2026) for ALL TIME ZONES. Any submitted results for the next day (05-15-2026) are not included in these totals."
}
```

### `data/gvrat-2026/course.geojson`

Standard GeoJSON FeatureCollection with one LineString feature (the route polyline) and 681 Point features (the mile markers). Built **once** from the GPX, committed to the repo. Not regenerated daily. Use `--rebuild-course` flag to regenerate.

### `data/gvrat-2026/snapshots/YYYY-MM-DD.json`

A copy of `leaderboard.json` at the time of that day's run. Filename matches `asOfDate`. Used for future features (movers, history) — collected from day one even though we don't display them in v1.

---

## 4. Pipeline logic

### Entry point

`python -m pipeline.main --race gvrat-2026 [--from-csv path/] [--rebuild-course] [--dry-run]`

Behavior:
1. Load `races/gvrat-2026/config.json`
2. If `runsignup.raceId` is null, error with instructions
3. If `runsignup.eventIds` is empty, call RunSignup to list events for that race, print them, exit with instructions to fill in
4. Compute `asOfDate = (datetime.now(UTC) - timedelta(days=1)).date()`. **Do not convert to local time** — see §1 fairness principle.
5. Compute `dayNumber = (asOfDate - config.startDate).days + 1` (May 1 = day 1)
6. Fetch participants (status=Active) from RunSignup, or from CSV if `--from-csv`
7. Fetch activities from RunSignup with `start_date = config.startDate, end_date = asOfDate`
8. Apply overrides
9. Compute leaderboard
10. Write `leaderboard.json`, `meta.json`, `snapshots/{asOfDate}.json`
11. Course geojson is regenerated only if `--rebuild-course` is passed
12. If `--dry-run`, print summary but don't write files
13. Print summary to stdout (rows produced, leader, etc.)

### RunSignup API client (`runsignup.py`)

**Base URL**: `https://api.runsignup.com/rest`
**Format**: always pass `format=json` (default is XML, which we don't want)
**Reference**: https://runsignup.com/API/Methods

#### Authentication

Two auth methods are usable here. Use whichever the user has access to:

1. **Race director / partner API key + secret** (simplest). Pass as query parameters `api_key=...&api_secret=...` on every request. Read from env vars `RUNSIGNUP_API_KEY` and `RUNSIGNUP_API_SECRET`. Race directors can generate these from their account; partners get them from their partner page.

2. **OAuth 2.0** (preferred per RunSignup, more setup). Authorization Code + PKCE flow. Access tokens last 1 month; refresh tokens last 20 years. For headless cron use, generate a refresh token once interactively, store as env var `RUNSIGNUP_REFRESH_TOKEN`, exchange for an access token at the start of each pipeline run, and use `Authorization: Bearer <token>` header.

Build `runsignup.py` to support both, defaulting to api_key/secret if `RUNSIGNUP_API_KEY` is set, otherwise OAuth.

**NEVER log secrets, tokens, or auth headers.**

#### Endpoints used

```
GET /rest/race/{race_id}?format=json
  → race metadata including events list. Used for event auto-discovery.

GET /rest/race/{race_id}/participants?format=json&event_id={X,Y}&results_per_page=250&page=N
  → paginated participants. event_id accepts comma-separated list, so we fetch both
    GVRAT events in the same paginated stream. results_per_page=250 to minimize calls.
  → relevant response fields per participant:
      registration_id, bib_num, age, status,
      user.first_name, user.middle_name, user.last_name, user.gender,
      user.address.city, user.address.state, user.address.country_code
  → use modified_after_timestamp for incremental syncs once roster is stable.
  → set include_user_anonymous_flag=T to respect runners who opted out of public listing.

GET /rest/v2/vr-activities.json?format=json&race_id={X}&event_id={Y}&bib_num={Z}&num=100&page=N
  → paginated activities for ONE participant. There is NO bulk-by-event endpoint.
  → relevant response fields per activity:
      tally_split_num, tally_split_date, result_split_tally_value,
      split_elevation_gain_in_mm, tally_split_comment,
      submitted_time_in_ms, virtual_race_activity_type_id
  → num=100 is the max page size.

GET /rest/v2/vr-activities/vr-activity-types.json?format=json&race_id={X}&event_id={Y}
  → Activity types configured for the virtual event. Returns activity_type_id → name + unit.
  → Used to map virtual_race_activity_type_id to "run" / "walk" and confirm distance unit.
  → Call once at startup, cache for the run.
```

#### Per-runner activity fetch model

Because `vr-activities.json` requires `bib_num` or `registration_id`, the daily pipeline must iterate over every active runner and fetch their activities individually. With ~416 runners, this is ~416-500 API calls per run (some runners need pagination).

Implementation:
- Build one `RunSignupClient` with a connection pool (`requests.Session`)
- After fetching participants, loop over them, calling `get_activities(race_id, event_id, bib_num)`
- Sleep 250ms between calls (RunSignup recommends "no more than 2 concurrent" — we stay sequential and polite)
- Optionally parallelize with a worker pool of 2 — but only after baseline works
- Total expected runtime: 3-5 minutes per daily run

#### Decoding activity values

`result_split_tally_value` from the API is an integer. **Its unit is not obviously documented** — likely meters, but verify on first run by comparing one runner's API response against the same runner's CSV download.

Fallback strategy: also call `vr-activity-types.json` at startup. The activity-type record likely contains the unit. If unclear, log raw values for the first runner during the first dry run and document the conversion factor in `runsignup.py`.

Internal canonical unit is **miles** throughout the rest of the pipeline.

#### Pagination

For each paginated endpoint, keep fetching until a returned page contains fewer than `num` items (or zero items). Log page counts for observability.

#### Retries & error handling

- 3 retries with exponential backoff (1s, 2s, 4s) on 5xx and `ConnectionError` / `Timeout`.
- Fail fast on 4xx (auth errors, bad params).
- On any unrecoverable failure, the pipeline must exit non-zero so GitHub Actions surfaces the failure.

#### Caching (optional v1.1 optimization)

Activities never change once logged. After v1 ships, add `data/gvrat-2026/_cache/activities-{bib}.json` keyed by registration_id. Each daily run, use `submitted_time_in_ms` to skip already-cached activities. Cuts API calls by ~95% after day 1.

Don't build this in v1. Build it when 416 calls/day starts being a problem (probably never).

### Compute logic (`compute.py`)

Pseudocode:

```
def build_leaderboard(participants, activities, waypoints, descriptions,
                      config, as_of_date, day_number, overrides):
    # 1. Sum miles per bib (run + walk equally)
    miles_by_bib = defaultdict(float)
    last_activity_by_bib = {}
    for activity in activities:
        miles = parse_distance(activity.tally_value)  # handles "26.3 miles" or "X km"
        miles_by_bib[activity.bib] += miles
        if activity.bib not in last_activity_by_bib or activity.activity_date > last_activity_by_bib[activity.bib]:
            last_activity_by_bib[activity.bib] = activity.activity_date

    # 2. Apply overrides
    for bib_str, override in overrides.items():
        bib = int(bib_str)
        if "milesAdjustment" in override:
            miles_by_bib[bib] += override["milesAdjustment"]

    # 3. Build runner rows. Skip the registered-but-virtual Gingerbread Man bib.
    runners = []
    for participant in participants:
        if participant.bib == config.virtualCharacters.gingerbreadMan.bib:
            continue  # we synthesize him below
        miles = miles_by_bib.get(participant.bib, 0.0)
        last_act = last_activity_by_bib.get(participant.bib)
        runners.append(build_real_runner_row(participant, miles, last_act, ...))

    # 4. Sort real runners by miles desc; assign real-only ranks
    runners.sort(key=lambda r: -r.miles)
    for i, r in enumerate(runners):
        r.real_rank = i + 1

    # 5. Insert Buzzard
    buzzard_miles = day_number * (config.totalMiles / config.totalDays)
    runners.append(build_buzzard_row(buzzard_miles, ...))

    # 6. Insert Gingerbread Man (1 mile ahead of leader)
    leader_miles = max((r.miles for r in runners if not r.virtual), default=0)
    gbm_miles = leader_miles + 1
    runners.append(build_gingerbread_row(gbm_miles, ...))

    # 7. Final sort by miles desc; assign final rank
    runners.sort(key=lambda r: -r.miles)
    for i, r in enumerate(runners):
        r.rank = i + 1

    # 8. rankDisplay logic
    for r in runners:
        if r.virtual_type == "gingerbread":
            r.rank_display = "#1"  # always tied with leader
        elif r.virtual_type == "buzzard":
            # Buzzard's display rank is whichever real-runner position he matches
            r.rank_display = compute_buzzard_display_rank(r, runners)
        else:
            r.rank_display = f"#{r.real_rank}"

    # 9. Per-runner enrichment
    for r in runners:
        wp = waypoints.lookup(min(int(r.miles), 680))
        r.lat = wp.lat
        r.lon = wp.lon
        r.location_description = descriptions.lookup(min(int(r.miles), 680))
        r.projected_finish, r.projected_finish_date = compute_projected_finish(r, day_number, config, top_real_runner)
        r.comp_percent = round(r.miles / config.totalMiles * 100, 2)
        r.km = round(r.miles * 1.60934, 2)

    # 10. Gender ranks (real runners only; virtual chars get genderRank based on virtual_type convention)
    assign_gender_ranks(runners)

    return runners
```

### Distance parsing

Activity Tally Value can be `"26.3 miles"` or `"X km"`. Regex extract number + unit; convert km → miles via `* 0.621371`. Internal storage is always miles.

```python
DIST_RE = re.compile(r"^([\d.]+)\s*(miles|km|kilometers?|mi)$", re.IGNORECASE)
def parse_distance(s: str) -> float:
    m = DIST_RE.match(s.strip())
    if not m:
        raise ValueError(f"Unparseable distance: {s!r}")
    val = float(m.group(1))
    unit = m.group(2).lower()
    if unit.startswith("k"):
        return val * 0.621371
    return val
```

### "Home" derivation

```python
def derive_home(participant):
    if participant.country == "US":
        return f"US-{participant.state}"  # e.g., "US-TN"
    return participant.country  # e.g., "GB", "AU"
```

Note: existing sheet shows `US-AE` for one runner — this is "Armed Forces Europe," a US military APO state code. The `f"US-{state}"` rule covers it.

### Projected finish logic

```python
def compute_projected_finish(runner, day_number, config, top_real_runner):
    if runner.virtual_type == "buzzard":
        return config.endDate.isoformat(), config.endDate
    if runner.virtual_type == "gingerbread":
        return compute_projected_finish(top_real_runner, day_number, config, top_real_runner)
    if runner.miles >= config.totalMiles:
        return "FINISHED", runner.last_activity_date
    if runner.miles == 0 or day_number == 0:
        return "—", None
    daily_pace = runner.miles / day_number
    days_to_finish = config.totalMiles / daily_pace
    finish_date = config.startDate + timedelta(days=days_to_finish)
    if finish_date <= config.endDate:
        return finish_date.isoformat(), finish_date
    else:
        return f"{int(days_to_finish):03d} days", finish_date
```

The existing sheet uses `"037 days"` format for runners projected past the end date. Match that.

### Waypoint lookup (`waypoints.py`)

Parse the GPX once at startup. Build a dict `{mile: (lat, lon)}` for miles 0–680 from the `<wpt>` elements where `<name>` matches `\d{3}`.

```python
def lookup(self, mile: int) -> Waypoint:
    mile = max(0, min(mile, 680))
    return self.waypoints[mile]
```

For GeoJSON generation (one-time): parse the `<trk>` element's track points to build the polyline LineString. Add 681 Point features for mile markers as a separate feature collection or properties on the line — frontend's choice.

### Snapshot logic

After writing `leaderboard.json`, copy it to `snapshots/{asOfDate}.json`. If a snapshot already exists for that date (re-run), overwrite (with a log warning).

### Privacy: what NEVER goes into public JSON

The RunSignup participants endpoint returns substantial PII per runner: email address, phone number, full street address, ZIP code, date of birth, waiver-signing timestamps, payment information. **None of this may appear in any file under `data/`** — the `data/` directory is publicly served.

Allowlist (the ONLY participant fields permitted in public output):
- `bib_num`
- `first_name`, `last_name` (skip `middle_name` to be safe — match existing sheet)
- `gender`
- `age` (computed at race start, not DOB)
- `city`, `state`, `country_code` (yes; matches existing public dashboard)
- `event_id` (so we can show event name)
- Anything we compute ourselves (miles, rank, location, etc.)

Denylist (must NEVER leave the pipeline process):
- Email, phone, street address, ZIP, DOB, all financial fields, waiver/payment timestamps, registration_id (internal only — don't expose)

Implementation: define a Pydantic model `PublicRunner` with ONLY the allowlist fields. Serialization to JSON goes through this model. Tests assert that no email/phone/address/DOB strings appear in the serialized JSON. This is a hard guarantee, not a "we'll be careful" thing.

Additionally:
- Runners with `is_anonymous=True` (when `include_user_anonymous_flag=T` is requested) should be displayed with name redacted to "Anonymous Runner #{bib}" (or excluded entirely — pick one and document).
- Never log full participant objects. Log bib + first name + first letter of last name max.

---

## 5. Frontend

### Stack

- **Next.js 14+ (App Router)** with **static export** (`output: 'export'`)
- **Tailwind CSS** for styling
- **react-leaflet** for the map
- **TanStack Table** for the leaderboard
- **TypeScript** throughout

The whole app is a static export deployed to Cloudflare Pages.

### Pages

**`/`** (landing): Race selector. For v1, just one card: "GVRAT 2026" with banner showing day number and a "View Dashboard" button. Architected for adding Transcon later.

**`/gvrat-2026`** (dashboard): The main page. Sections in order:

1. **Header**: race name, day counter ("Day 47 of 153"), "as of" banner from `meta.json`.
2. **Map**: Leaflet, ~50% viewport height. Course polyline. Pin per runner. Custom icons for Buzzard, Gingerbread Man, leader. On pin click: small popup with name/bib/miles/rank.
3. **Leaderboard**: full-width sortable table. Default sort: rank ascending. Filters: name search, bib search, gender, country.

### Map specifics

- Initial bounds: fit the course polyline
- 416 pins is fine for Leaflet (no clustering needed for v1; can add `react-leaflet-cluster` later)
- Pin styling:
  - Real runners: small colored dot
  - Leader (real_rank=1): gold star icon
  - Gingerbread Man: cookie/gingerbread SVG icon
  - Buzzard: vulture SVG icon, distinct red color
- Popups show: name, bib, miles, rankDisplay, locationDescription

### Table columns (matching current Ninja Tables output)

`Pos | Bib | Participant's Name | Event | Home | G | A | Miles | KM | Comp% | Proj Fin | Gender Place | Event Gen`

(Drop `Directory` and `Team` from current sheet — they're empty.)

`Pos` shows `rankDisplay`. All other columns map directly from `leaderboard.json`.

Frontend should render virtual character rows with subtle visual distinction (icon next to name, slightly different background).

### Data loading

JSON files are imported at build time (Next.js static export). No runtime fetch.

```typescript
// lib/data.ts
import leaderboard from '@/data/gvrat-2026/leaderboard.json';
import meta from '@/data/gvrat-2026/meta.json';
import course from '@/data/gvrat-2026/course.geojson';
```

This is enabled by symlinking `/data` from the project root into `/frontend/data` at build time, or by using a Next.js path alias. Pick whichever is cleaner for static export.

### "As of" banner

Pull `asOfBannerText` from `meta.json`, render it prominently at the top of the dashboard. Include a tooltip / "?" icon explaining the 12:00 UTC fairness cutoff.

---

## 6. GitHub Actions workflow

`.github/workflows/daily-update.yml`

```yaml
name: Daily Race Update
on:
  schedule:
    - cron: '0 12 * * *'   # 12:00 UTC, the fairness cutoff. See SPEC §1.
  workflow_dispatch:

jobs:
  update:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.12'
      - name: Install dependencies
        run: pip install -e .
      - name: Run pipeline
        env:
          RUNSIGNUP_API_KEY: ${{ secrets.RUNSIGNUP_API_KEY }}
          RUNSIGNUP_API_SECRET: ${{ secrets.RUNSIGNUP_API_SECRET }}
        run: python -m pipeline.main --race gvrat-2026
      - name: Commit updated data
        run: |
          git config user.name "GVRAT Bot"
          git config user.email "bot@gvrat.com"
          git add data/
          git diff --staged --quiet || git commit -m "Daily update: $(date -u +%Y-%m-%d)"
          git push
```

Cloudflare Pages is configured to deploy from `main` branch on push. The commit triggers redeploy automatically.

Failures: GitHub Actions emails the repo owner on failure.

---

## 7. Deployment

### Domain setup

`dashboard.gvrat.com` → Cloudflare Pages.

User adds a CNAME record in their DNS pointing `dashboard.gvrat.com` to the Cloudflare Pages URL. Cloudflare provides SSL automatically.

### Cloudflare Pages config

- Build command: `cd frontend && npm install && npm run build`
- Build output directory: `frontend/out`
- Root directory: `/`
- Production branch: `main`

### Secrets

GitHub repo settings → Secrets and variables → Actions:
- `RUNSIGNUP_API_KEY`
- `RUNSIGNUP_API_SECRET`

(Or `RUNSIGNUP_REFRESH_TOKEN` if using OAuth instead.)

---

## 7.5 Cowork integration (operational, not architectural)

The user has Claude Cowork available. It is not part of the production pipeline — the daily cron runs in GitHub Actions, not on the user's machine — but Cowork is a force multiplier for three operational tasks. Document each in the README so the user knows what to ask Cowork to do.

### Use 1: One-time onboarding

A Cowork session that walks through §9 "Open items for the human." The user opens Claude Desktop → Cowork tab → points it at the repo folder → asks it to read SPEC.md and complete the open items. Cowork uses Claude in Chrome to interact with the user's already-logged-in RunSignup account to:

- Generate API key + secret (or register an OAuth app and obtain a refresh token)
- Locate Race ID from the race director dashboard URL
- Locate the two Event IDs (US and Non-USA)
- Write all three values into `races/gvrat-2026/config.json` and the local `.env`
- Open the existing Google Sheet, read the RAT tab, port descriptions into `races/gvrat-2026/descriptions.json`

Sample prompt to give Cowork:

> Read SPEC.md and BACKLOG.md in this folder. Then walk through the Open Items in §9. For RunSignup tasks, use Claude in Chrome — I'm already logged in. For the Google Sheet description port, my sheet is named "TC3 Master (2026 GVRAT)" and the relevant tab is "RAT". Pause for my approval before each write to disk. Don't push to GitHub — I'll review and push.

### Use 2: Cutover validation (first 1-2 weeks after launch)

A scheduled Cowork task that runs each morning during the validation period. Defined as a `/schedule` task in Cowork.

Sample prompt:

> Daily at 8:00am Central. Open dashboard.gvrat.com and the existing Ninja Tables page on gvrat.com. Compare the top 50 runners on each. For each runner present in both, check that miles match within 0.1 and rank matches exactly. Produce a one-paragraph summary: "All match" OR "N runners differ — listed below: [...]". Save the summary to ~/Documents/gvrat-validation/YYYY-MM-DD.md. Stop running this task after 2026-05-21 unless I extend it.

After 1-2 weeks of clean comparisons, retire the task. The new dashboard is now the source of truth.

### Use 3: API-failure fallback

A documented procedure (NOT a scheduled task) the user can invoke if a daily GitHub Action fails. The README should include this Cowork prompt:

> The GitHub Action for gvrat-2026 failed this morning. As a fallback:
> 1. Open RunSignup race director dashboard for race ID {RACE_ID}
> 2. Navigate to Reports → Virtual/Challenge Activity Report
> 3. Set Activity Start Date = 2026-05-01, Activity End Date = yesterday's date in UTC
> 4. Select both events (GVRAT 26 R3 and GVRAT 26 R3 - NON USA)
> 5. Click Search, then download the CSV. Save to ~/repo/_inputs/manual/activities-{date}.csv
> 6. Repeat for the Participant Report (no date filter, status=Active). Save to ~/repo/_inputs/manual/participants-{date}.csv
> 7. From the repo directory, run: `python -m pipeline.main --race gvrat-2026 --from-csv _inputs/manual/`
> 8. Inspect the output, then `git add data/ && git commit -m "Manual fallback: {date}" && git push`

Realistic time for this fallback path: ~3 minutes total, mostly waiting on RunSignup's CSV exports.

### What Cowork does NOT do in this project

To prevent scope creep:
- **Cowork does not run the daily production pipeline.** That's GitHub Actions, full stop. Production must not depend on the user's laptop being awake or the desktop app being open.
- **Cowork does not deploy.** Cloudflare Pages handles deploy automatically on git push.
- **Cowork is not a substitute for the API client.** The pipeline talks to the RunSignup API directly. Cowork is for human-in-the-loop tasks where browser-driven actions are easier than coding.

---

## 8. Build sequence (for Claude Code)

These are designed to be sequential Claude Code sessions, each with a clear input/output and verifiable success criteria. Do **not** start session N+1 until session N's tests pass and the human approves.

### Session 1: Project scaffolding

- Create the directory structure from §2
- Initialize Python project with `pyproject.toml` (deps: `pydantic`, `requests`, `gpxpy`, `pytest`, `python-dateutil`)
- Initialize Next.js frontend with `create-next-app` (TypeScript, Tailwind, App Router, static export configured)
- Add react-leaflet, TanStack Table
- Commit a working "Hello World" frontend that builds with `next build` static export
- Set up `.gitignore`, README stub

**Success criteria**: `npm run build` produces a static export; `pytest` runs (zero tests, zero failures).

### Session 2: Pipeline foundations (offline mode)

Build the pipeline using the **uploaded fixture files**, not the live API. Inputs:
- `pipeline/tests/fixtures/participants-may-1.csv`
- `pipeline/tests/fixtures/activities-may-1.csv`
- `races/gvrat-2026/route.gpx`

Implement:
- `models.py` (Runner, Activity, Participant, Waypoint, RaceConfig)
- `waypoints.py` (GPX parsing, mile lookup)
- `config.py` (load race config from JSON)
- `compute.py` minus virtual characters and projections (basic aggregation, ranking, location lookup)
- CLI mode `python -m pipeline.main --race gvrat-2026 --from-csv pipeline/tests/fixtures/`

**Success criteria**: produces a `leaderboard.json` from the fixtures. Tests pass:
- `test_waypoints.py`: mile 0 → (37.071815, -94.741077); mile 680 returns terminus coords
- `test_compute.py`: aggregation matches manual sum; ranking is correct; "Home" derivation works for US, GB, AU samples

### Session 3: Virtual characters + projections + snapshots

Add:
- Buzzard insertion (per §4 logic)
- Gingerbread Man insertion (per §4 logic, accounting for the registered-but-virtual bib)
- Projected finish computation (per §4 logic)
- `rankDisplay` logic
- Gender ranking
- Final `leaderboard.json` schema fully populated
- `snapshots.py` writing dated snapshots
- `meta.json` generation including the as-of banner text
- `descriptions.json` lookup with the past/approaching interpolation rule

**Success criteria**: leaderboard JSON for May 1 fixtures matches expected output. Hand-validate against the existing Google Sheet for May 1 of 2025 race or 2026 race start. Buzzard's miles on day 1 ≈ 4.44; Gingerbread Man's miles = top runner's + 1.

### Session 4: RunSignup API client

Replace fixture loading with live API calls. Note: the activity endpoint is per-runner (one call per bib), not bulk-by-event. This makes the daily run ~430 sequential API calls totalling 2-3 minutes — well within GitHub Actions free tier and RunSignup's politeness guidance. The user has already confirmed API access on their race director account.

**Use RunSignup's official OpenAPI specs as the source of truth, not this document.** Before writing any client code, download:

```
curl 'https://runsignup.com/API/race/:race_id/participants/GET?viewOpenApiSpec=T&download=T' \
  -o _apispecs/participants.json
curl 'https://runsignup.com/API/v2/vr-activities.json/GET?viewOpenApiSpec=T&download=T' \
  -o _apispecs/vr-activities.json
curl 'https://runsignup.com/API/v2/vr-activities/vr-activity-types.json/GET?viewOpenApiSpec=T&download=T' \
  -o _apispecs/vr-activity-types.json
curl 'https://runsignup.com/API/race/:race_id/GET?viewOpenApiSpec=T&download=T' \
  -o _apispecs/race.json
curl 'https://runsignup.com/API/OAuth2/openapi-spec.json' \
  -o _apispecs/oauth2.json
```

Reference these specs when generating `runsignup.py`. Pydantic models for response shapes should mirror the OpenAPI schemas.

Tasks:
- `runsignup.py` with auth (api_key+secret OR OAuth, see §4), pagination, retries
- Fetch participants via paginated bulk endpoint (~9 calls)
- Fetch activity types once (`vr-activity-types.json`)
- Loop participants, fetch activities per runner via `vr-activities.json` (~416 calls, ~3-5 min total)
- Sleep 250ms between activity calls to be polite (RunSignup recommends "no more than 2 concurrent")
- `--from-csv` flag remains for testing
- `--max-runners=N` flag for partial runs during dev (e.g. only fetch first 10 runners' activities to validate quickly)
- README documents how to obtain API key/secret (or generate OAuth refresh token) and where to put them, and how to verify the activity-value unit
- Auto-discover events if config has empty `eventIds`
- **Privacy enforcement**: filter participants through `PublicRunner` model before any further processing; assert tests pass that confirm no PII in JSON output

**Success criteria**:
- Live API run produces output matching fixture-based run for May 1 (within RunSignup data drift since CSV download)
- The `result_split_tally_value` unit is confirmed and documented
- PII allowlist test passes
- Pipeline runs end-to-end within 6 minutes

### Session 5: Frontend — data wiring + table

- Path alias from `frontend/data` → `../data`
- `lib/data.ts` loaders
- `app/gvrat-2026/page.tsx` with header, AsOfBanner, DayCounter, and Leaderboard table (no map yet)
- TanStack Table with sort, filter (name, bib), columns matching §5 spec
- Tailwind styling matching the cleanliness of the current Ninja Tables output
- Mobile-responsive

**Success criteria**: visiting `/gvrat-2026` locally shows the leaderboard reading from real `leaderboard.json`, sortable, filterable.

### Session 6: Frontend — map

- `RaceMap.tsx` using react-leaflet
- Course polyline from `course.geojson`
- Runner pins from `leaderboard.json`
- Custom icons for Buzzard, Gingerbread Man, leader
- Pin popups
- Generate `course.geojson` once via `pipeline/main.py --rebuild-course`

**Success criteria**: map renders course + 416 pins. Buzzard and Gingerbread Man visually distinct. Click a pin → popup shows runner info.

### Session 7: GitHub Actions + Cloudflare deploy

- Workflow file from §6
- Test with `workflow_dispatch` first
- DNS / Cloudflare Pages setup (human task, document in README)
- Set repo secrets

**Success criteria**: manual workflow run succeeds, commits new data, triggers Cloudflare deploy, dashboard.gvrat.com reflects update.

### Session 8: Polish + handoff

- README with full operational guide
- Failure modes documented (what to do if pipeline fails, how to manually re-run, how to add overrides)
- v2 backlog written down in `BACKLOG.md`

---

## 9. Open items for the human

These need human input before or during build. The user has confirmed both API access on their RunSignup race director account and Cowork availability — most of these can be delegated to a Cowork onboarding session (see §7.5 Use 1).

- [ ] **RunSignup API credentials** — pick one path:
  - **Easy path**: from your race director account, generate an API key + secret. Add to GitHub repo secrets as `RUNSIGNUP_API_KEY` and `RUNSIGNUP_API_SECRET`. Cowork can navigate your RunSignup account and capture these.
  - **OAuth path**: register an OAuth 2.0 application at https://runsignup.com/Profile/OAuth2/DeveloperGuide. Generate a refresh token interactively (PKCE flow). Add as `RUNSIGNUP_REFRESH_TOKEN`. Cowork can drive the entire flow.
- [ ] **RunSignup race ID**: from URL of race director dashboard (e.g., `runsignup.com/Race/Dashboard/123456` → `123456`). Cowork can find this.
- [ ] **RunSignup event IDs**: the two events `GVRAT 26 R3` and `GVRAT 26 R3 - NON USA`. Either provide explicitly (Cowork can find them) or use auto-discover on first pipeline run.
- [ ] **Verify activity unit decoding**: First Session 4 run, log raw `result_split_tally_value` for one runner; cross-reference with same runner's CSV download miles to confirm the unit (likely meters). Document conversion factor in `runsignup.py`.
- [ ] **DNS for dashboard.gvrat.com**: CNAME to Cloudflare Pages. Manual; takes 5 minutes; not a Cowork task.
- [ ] **Generate `descriptions.json`**: port hand-curated descriptions from current Google Sheet "RAT" tab into the new JSON file. Cowork can do this directly: open the sheet, read the Mile/Description columns, write the JSON.
- [ ] **Validate first leaderboard output**: side-by-side compare new `leaderboard.json` against current Ninja Tables output for the same day; resolve any discrepancies before going live. Schedule a Cowork validation task per §7.5 Use 2.
- [ ] **Confirm anonymous-runner handling**: if any current GVRAT runners have `is_anonymous=T`, decide policy (redact name vs. exclude entirely)
- [ ] **Update WordPress nav**: add link to `dashboard.gvrat.com`
- [ ] **Sunset Google Sheet workflow**: only after dashboard is live and validated for several days

---

## 10. v2 backlog (do NOT build in v1)

Captured here so we don't forget, and so v1 architecture supports them:

- Per-runner profile pages (`/[race]/runner/[bib]`) with daily mileage chart from snapshots
- Stats page (`/[race]/stats`): miles by country, gender split, age distribution, biggest day
- "Today's biggest movers" widget on dashboard (diff today vs yesterday snapshot)
- Country flags in leaderboard
- Multi-language support (race has international runners)
- Transcon race added as `races/transcon-2026/`
- Year-over-year comparisons (GVRAT 2025 vs 2026)
- Email digest opt-in for runners
- Embed mode (iframe-friendly route for embedding back into WordPress if useful)
- Open-graph cards: shareable image of "I'm at mile X of GVRAT 2026"
- **RunSignup MCP integration**: once RunSignup's MCP Server (announced Nov 2025, currently internal pilot) ships publicly with virtual-race endpoints, expose the dashboard data via MCP so race directors and runners can query it conversationally through ChatGPT, Claude, etc. Reference: https://info.runsignup.com/2025/11/16/runsignup-advances-mcp-server/

---

## Appendix A: The current Google Sheet's column order

For reference when validating output against current Ninja Tables behavior:

```
Pos | Bib | Participant's Name | Event | Home | G | A | Miles | KM |
Approximate Location | Lat | Lon | Directory | Comp% | Proj Fin |
Team | Gender Place | Event Gen
```

`Directory` and `Team` are blank in current production and are dropped from the v1 dashboard table. `Approximate Location`, `Lat`, `Lon` are present in JSON (used by the map) but not shown as table columns in v1 — they're map-only data.

## Appendix B: Why these tech choices

- **Python over Node for pipeline**: data work is more idiomatic in Python; gpxpy is mature; pydantic for typed models is excellent.
- **Next.js over plain static**: makes adding profile pages and stats pages later (v2) trivial; static export means no server.
- **Cloudflare Pages over Netlify/Vercel**: most generous free tier for traffic; clean DNS integration since user likely uses Cloudflare anyway.
- **JSON over Postgres**: explained §2.
- **GitHub Actions over Heroku scheduler / external cron**: free, observable, version-controlled, integrates with the deploy.
- **react-leaflet over Mapbox**: free, no API keys, fine performance for 500 pins.
- **TanStack Table over DataTables/Ag-Grid**: headless, modern, TypeScript-first, no licensing.
- **Custom Next.js app over v0.dev**: RunSignup's vibe-coding ecosystem (https://info.runsignup.com/ai-and-runsignup/runsignup-api/) is built around v0.dev for quick API-backed React apps. Their reference apps (race finder, fundraiser leaderboard, results kiosk, etc.) all run client-side, fetching from RunSignup at runtime. That's a good fit for simple read-only dashboards. Our project needs (a) a non-trivial Python pipeline for aggregation/GPX/virtual-character logic, (b) version-controlled snapshots, and (c) a custom Leaflet course map — all of which sit outside what v0.dev produces in one shot. We could prototype a leaderboard-only view in v0 as a sanity check on auth, but v1 is a custom app.

## Appendix C: RunSignup AI / Vibe-coding context

For the human deciding on architecture, useful reference reading from RunSignup itself:

- **AI for Vibe Coding overview**: https://info.runsignup.com/ai-and-runsignup/runsignup-api/ — landing page explaining their OpenAPI + OAuth2 strategy
- **Application library**: https://info.runsignup.com/ai-and-runsignup/runsignup-ai-application-library/ — gallery of v0.dev-built sample apps. Closest analogue to our work is the Fundraising Leaderboard.
- **Bob Bickel on AI DIY (Jan 2026)**: https://info.runsignup.com/2026/01/29/founders-corner-will-ai-diy-replace-registration-and-ticket-vendors/ — RunSignup's founder candidly discusses what's appropriate to vibe-code. Worth reading. His framing of "traditional system PLUS AI chat" matches what we're building: we're layering custom presentation on top of RunSignup, not replacing it.
- **MCP Server progress (Nov 2025)**: https://info.runsignup.com/2025/11/16/runsignup-advances-mcp-server/ — currently an internal pilot with 4 tools, none of which expose virtual-race activity data. Track for v2 integration.

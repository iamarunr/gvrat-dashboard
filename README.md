# GVRAT Dashboard

A statically-deployed leaderboard and course map for **The Great Virtual Race Across The States (GVRAT) 2026**. A Python pipeline fetches participant data from the RunSignup API once per day at 12:00 UTC, computes rankings and virtual character positions, and writes JSON files that a Next.js static frontend consumes. The result deploys to Cloudflare Pages automatically on each commit — no server infrastructure, no ongoing cost.

**Live at**: `dashboard.gvrat.com`

---

## Table of contents

1. [How it works](#how-it-works)
2. [First-time setup](#first-time-setup)
3. [Running locally](#running-locally)
4. [Deployment](#deployment)
5. [Daily operation](#daily-operation)
6. [If something goes wrong](#if-something-goes-wrong)
7. [Operational procedures](#operational-procedures)
8. [Cowork tasks](#cowork-tasks)

---

## How it works

```
RunSignup API ──▶ Python pipeline (GitHub Actions, 12:00 UTC) ──▶ JSON files in repo
                                                                          │
                                                                          ▼
                                                                  Cloudflare Pages
                                                                  (auto-deploys on push)
```

**Why 12:00 UTC?** That's midnight on Howland Island (UTC-12), the last place on Earth where any given calendar day ends. At that moment every runner globally has had the exact same number of complete calendar days to log activities. The comparison is fair. The pipeline's date filter (`Activity Date ≤ UTC today − 1`) enforces this — see SPEC.md §1 for the full rationale.

**The two virtual characters on the leaderboard:**
- **Gingerbread Man** (bib 9999) — always 1 mile ahead of the current leader. The carrot.
- **Buzzard** (bib 9998) — flies at the pace needed to finish Sept 30. `day × (679 / 153)` miles. The stick.

---

## First-time setup

These steps are done once before the first production run.

### 1. Get RunSignup API credentials

From your race director account, generate an API key + secret:

1. Log in to RunSignup → Profile → API Access
2. Click **Generate New API Key**
3. Copy the **Key** and **Secret**

Store them locally in `.env` (already gitignored):

```
RUNSIGNUP_API_KEY=your_key_here
RUNSIGNUP_API_SECRET=your_secret_here
```

Add the same values as GitHub repo secrets (Settings → Secrets → Actions):
- `RUNSIGNUP_API_KEY`
- `RUNSIGNUP_API_SECRET`

### 2. Set the Race ID and Event IDs

Open `races/gvrat-2026/config.json`. Fill in the RunSignup IDs:

```json
{
  "runsignup": {
    "raceId": 123456,
    "eventIds": [111111, 222222]
  }
}
```

- **Race ID**: visible in the URL of your race director dashboard (`runsignup.com/Race/Dashboard/123456`)
- **Event IDs**: run `python -m pipeline.main --race gvrat-2026` with `eventIds: []` — the pipeline will auto-discover and print all events, then exit. Copy the two GVRAT 2026 event IDs into the config.

### 3. Populate descriptions.json

`races/gvrat-2026/descriptions.json` maps mile markers to place names (e.g., `"3": "Baxter Springs"`). Port these from the existing Google Sheet "RAT" tab. A Cowork session can do this automatically — see [Cowork tasks](#cowork-tasks).

### 4. Verify the activity value unit

On the first live run, check that `result_split_tally_value` is in the expected unit. Run with `--max-runners=1 --dry-run` and compare the output miles against the same runner's CSV download:

```bash
source .env && .venv/bin/python -m pipeline.main --race gvrat-2026 --max-runners=1 --dry-run
```

The conversion factor is documented in `pipeline/runsignup.py`.

---

## Running locally

### Python environment

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
```

### Pipeline — fixture mode (no API needed)

```bash
python -m pipeline.main --race gvrat-2026 --from-csv pipeline/tests/fixtures/
```

Reads from the bundled CSV fixtures. Safe to run any time; produces `data/gvrat-2026/` output.

### Pipeline — live API

```bash
source .env && python -m pipeline.main --race gvrat-2026
```

Fetches live data from RunSignup (~416 API calls, ~3–5 min). Requires credentials in `.env`.

### Useful flags

| Flag | Purpose |
|------|---------|
| `--from-csv DIR` | Use CSV files in DIR instead of live API |
| `--as-of-date YYYY-MM-DD` | Override the as-of date (for testing past dates) |
| `--max-runners N` | Only fetch N runners' activities (fast dev iteration) |
| `--dry-run` | Print summary, skip writing files |
| `--rebuild-course` | Regenerate `course.geojson` from `route.gpx` |

### Frontend

```bash
cd frontend
npm install
npm run dev       # http://localhost:3000
npm run build     # static export → frontend/out/
```

### Tests

```bash
pytest            # from project root; ~40 tests
```

---

## Deployment

### One-time Cloudflare Pages setup

1. [dash.cloudflare.com](https://dash.cloudflare.com) → Workers & Pages → Create → Connect to Git
2. Select the `gvrat-dashboard` repo
3. Build settings:
   - Build command: `cd frontend && npm ci && npm run build`
   - Build output directory: `frontend/out`
   - Root directory: `/`
4. Click **Save and Deploy** — Cloudflare gives you `gvrat-dashboard.pages.dev`

### Custom domain

In Cloudflare Pages → your project → **Custom domains** → Add `dashboard.gvrat.com`. Since gvrat.com is already on Cloudflare, the DNS record is auto-created and SSL is automatic.

### Verify before going live

Open `gvrat-dashboard.pages.dev` and check:
- Dashboard loads with correct day number and as-of banner
- Map renders the gold route and all runner pins
- Leaderboard is sortable and filterable
- Buzzard and Gingerbread Man appear with correct icons
- Data matches the current Ninja Tables output (side-by-side check)

---

## Daily operation

Everything below is fully automated. You do nothing after initial setup.

| Time (UTC) | What happens |
|-----------|-------------|
| 12:00 | GitHub Actions triggers `daily-update.yml` |
| 12:00–12:05 | Pipeline fetches RunSignup data (~416 calls), computes leaderboard, writes JSON |
| 12:05 | Updated `leaderboard.json`, `meta.json`, and `snapshots/YYYY-MM-DD.json` committed to `main` |
| 12:06 | Cloudflare Pages detects the push, rebuilds the frontend (~30 sec) |
| 12:07 | `dashboard.gvrat.com` shows updated standings |

GitHub Actions emails you if the workflow fails.

---

## If something goes wrong

### GitHub Action failed

GitHub sends an email with a link to the failed run. Click it and read the logs.

**Common causes and fixes:**

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| `401 Unauthorized` | API credentials expired or missing | Regenerate the key+secret in RunSignup; update GitHub Secrets |
| `Connection timeout` | RunSignup API temporarily unreachable | Re-run the workflow manually (Actions → Daily Race Update → Run workflow); it usually recovers |
| `eventIds is empty` | Config not filled in | Add the event IDs to `races/gvrat-2026/config.json` |
| `No participants found` | Wrong race/event IDs | Double-check the IDs in config match the race director dashboard |
| Pipeline crash (any other) | Bug or unexpected API response | Check the full log; file an issue |

### Manual re-run after a failure

```bash
# Re-run the GitHub Action manually:
# Actions tab → Daily Race Update → Run workflow → Run workflow

# Or run the pipeline locally and push:
source .env && python -m pipeline.main --race gvrat-2026
git add data/
git commit -m "Manual update: $(date -u +%Y-%m-%d)"
git push
```

### Emergency fallback — API is completely down

If RunSignup's API is unreachable and you need an update today:

1. Log in to RunSignup race director dashboard
2. Go to **Reports → Virtual/Challenge Activity Report**
3. Set Activity Start Date = `2026-05-01`, Activity End Date = yesterday (UTC)
4. Select both events (GVRAT 26 R3 and GVRAT 26 R3 - NON USA)
5. Click Search → download the CSV → save to `_inputs/manual/activities-YYYY-MM-DD.csv`
6. Repeat for **Participant Report** (no date filter, Status = Active) → save to `_inputs/manual/participants-YYYY-MM-DD.csv`
7. Run the pipeline against these CSVs:

```bash
source .env && python -m pipeline.main --race gvrat-2026 --from-csv _inputs/manual/
```

8. Inspect the summary output, then commit and push:

```bash
git add data/
git commit -m "Manual fallback: $(date -u +%Y-%m-%d)"
git push
```

Realistic total time for this fallback: ~3 minutes.

### Adding a data correction (override)

If a runner double-logged miles on a specific day, add an override to `races/gvrat-2026/overrides.json`:

```json
{
  "267": {
    "milesAdjustment": -3.5,
    "note": "Double-logged on 2026-05-14",
    "appliedDate": "2026-05-15"
  }
}
```

Key is the bib number. `milesAdjustment` is added to their total (use negative to subtract). After saving, either wait for the next automatic run at 12:00 UTC, or trigger a manual run.

### Handling an anonymous runner

If a runner registered with privacy opt-out (`is_anonymous=T`), they appear in the leaderboard as `"Anonymous Runner #BIB"`. This is the configured behavior. If you need to change to full exclusion instead, update `pipeline/compute.py`.

---

## Operational procedures

### Validate against the existing Ninja Tables (first 1–2 weeks)

During the cutover period, run a daily side-by-side comparison:

1. Open `dashboard.gvrat.com` and the Ninja Tables page on gvrat.com
2. Compare the top 50 runners: miles within 0.1, rank matches exactly
3. If discrepancies appear, check `data/gvrat-2026/leaderboard.json` against the raw CSV
4. Log any differences in a local file; escalate persistent deltas to the pipeline

A Cowork validation task can automate this — see [Cowork tasks](#cowork-tasks).

### Force-regenerate course.geojson

Only needed if the GPX file changes:

```bash
python -m pipeline.main --race gvrat-2026 --rebuild-course --dry-run
# Remove --dry-run to write the file
```

Then commit `data/gvrat-2026/course.geojson`.

### Update WordPress navigation

Add a link to `dashboard.gvrat.com` in the site nav. Do this only after the dashboard has been live and validated for several days. Retire the Google Sheet workflow at the same time.

---

## Cowork tasks

Three Claude Cowork workflows are available for human-in-the-loop operational tasks. None of these are part of the automated pipeline — they require you to initiate them.

### Onboarding (one-time)

Paste into Cowork:

> Read SPEC.md and BACKLOG.md in this folder. Walk through the open items in SPEC.md §9. For RunSignup tasks, use Claude in Chrome — I'm already logged in. For the descriptions.json port, my sheet is named "TC3 Master (2026 GVRAT)" and the relevant tab is "RAT". Pause for my approval before each write to disk. Don't push to GitHub — I'll review and push.

### Cutover validation (daily, first 1–2 weeks)

Set up as a `/schedule` task:

> Daily at 8:00am Central. Open dashboard.gvrat.com and the Ninja Tables page on gvrat.com. Compare the top 50 runners on each. For each runner present in both, check that miles match within 0.1 and rank matches exactly. Produce a one-paragraph summary: "All match" OR "N runners differ — listed below: [...]". Save to ~/Documents/gvrat-validation/YYYY-MM-DD.md. Stop after 2026-05-21 unless I extend it.

### Emergency API fallback

If the GitHub Action fails and the API is down, paste this into Cowork:

> The GitHub Action for gvrat-2026 failed this morning. As a fallback: open the RunSignup race director dashboard, go to Reports → Virtual/Challenge Activity Report, set Activity Start Date = 2026-05-01, Activity End Date = yesterday UTC, select both GVRAT events, download the CSV to ~/repo/_inputs/manual/activities-YYYY-MM-DD.csv. Repeat for the Participant Report (no date filter, Active status) to ~/repo/_inputs/manual/participants-YYYY-MM-DD.csv. Then run: `source .env && python -m pipeline.main --race gvrat-2026 --from-csv _inputs/manual/` from the repo directory. Show me the output summary before committing.

---

For full architecture details, data contracts, API client notes, and the session-by-session build history, see [SPEC.md](SPEC.md).

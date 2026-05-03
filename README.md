# GVRAT Dashboard

A statically-deployed leaderboard and course map for **The Great Virtual Race Across The States (GVRAT) 2026**. A Python pipeline fetches participant data from the RunSignup API once per day at 12:00 UTC (the fairness cutoff — the only moment when every runner globally has had the same number of complete calendar days), computes rankings and virtual character positions, and writes JSON files that a Next.js static frontend consumes. The result is deployed to Cloudflare Pages automatically on each commit, with no server infrastructure and no ongoing cost.

## How to run locally

For full architecture details and the session-by-session build plan, see [SPEC.md](SPEC.md).

### Pipeline (Python)

```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -e ".[dev]"
python -m pipeline.main --race gvrat-2026 --from-csv pipeline/tests/fixtures/
```

Before running against the live RunSignup API you need credentials — see SPEC.md §9 for the open items checklist.

### Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev       # local dev server
npm run build     # static export → frontend/out/
```

### Tests

```bash
pytest            # from project root
```

### Manual pipeline run (against live API)

```bash
source .env && .venv/bin/python -m pipeline.main --race gvrat-2026
```

### Emergency fallback (if API is down)

Download CSVs manually from RunSignup, then:

```bash
.venv/bin/python -m pipeline.main --race gvrat-2026 --from-csv path/to/csvs/
```

---

## Deployment

### Step 1: Push to GitHub

Make sure all changes are committed and pushed to the `main` branch.

### Step 2: Connect Cloudflare Pages

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com) → Workers & Pages → Create
2. Connect to Git → select the `gvrat-dashboard` repo
3. Build settings:
   - Framework preset: **Next.js (Static HTML Export)**
   - Build command: `cd frontend && npm ci && npm run build`
   - Build output directory: `frontend/out`
   - Root directory: `/`
4. Click **Save and Deploy**
5. Cloudflare gives you a URL like `gvrat-dashboard.pages.dev` — this is your staging URL

### Step 3: Add GitHub Secrets

Go to GitHub repo → Settings → Secrets and variables → Actions, and add:

| Name | Value |
|------|-------|
| `RUNSIGNUP_API_KEY` | your RunSignup v2 API key |
| `RUNSIGNUP_API_SECRET` | your RunSignup v2 API secret |

### Step 4: Test the workflow manually

1. Go to GitHub repo → Actions → **Daily Race Update** → Run workflow → Run workflow
2. Watch it complete — should take 3–5 minutes
3. Verify that `data/` files are updated in the resulting commit
4. Verify that Cloudflare Pages redeploys automatically after the commit

### Step 5: Verify the staging URL

Open `gvrat-dashboard.pages.dev` and confirm:

- Dashboard loads correctly
- Data matches local version
- Map renders with light tiles and gold route
- Leaderboard shows correct standings

### Step 6: Connect custom domain (when ready)

1. In Cloudflare Pages → your project → **Custom domains**
2. Add domain: `dashboard.gvrat.com`
3. Cloudflare auto-creates the DNS record (since gvrat.com is already on Cloudflare)
4. SSL certificate is automatic
5. Both `gvrat-dashboard.pages.dev` and `dashboard.gvrat.com` work going forward

### Daily operation (fully automated after setup)

| Time | Action |
|------|--------|
| 12:00 UTC | GitHub Action runs pipeline (~3–5 min) |
| 12:05 UTC | Fresh `leaderboard.json` and `meta.json` committed to `main` |
| 12:06 UTC | Cloudflare Pages detects commit, rebuilds frontend (~30 sec) |
| 12:07 UTC | Dashboard live with updated standings |

You do nothing. ✅

---

## Cowork operational tasks

See SPEC.md §7.5 for the three Cowork workflows: onboarding (API credentials, RunSignup IDs, descriptions.json), cutover validation, and the API-failure fallback procedure.

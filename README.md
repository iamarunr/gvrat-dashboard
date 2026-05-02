# GVRAT Dashboard

A statically-deployed leaderboard and course map for **The Great Virtual Race Across The States (GVRAT) 2026**. A Python pipeline fetches participant data from the RunSignup API once per day at 12:00 UTC (the fairness cutoff — the only moment when every runner globally has had the same number of complete calendar days), computes rankings and virtual character positions, and writes JSON files that a Next.js static frontend consumes. The result is deployed to Cloudflare Pages automatically on each commit, with no server infrastructure and no ongoing cost.

## How to run

For full setup instructions, architecture details, and the session-by-session build plan, see [SPEC.md](SPEC.md).

### Pipeline (Python)

```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -e ".[dev]"
python -m pipeline.main --race gvrat-2026 --from-csv pipeline/tests/fixtures/
```

Before running against the live RunSignup API you need credentials — see SPEC.md §9 for the open items checklist (RunSignup Race ID, Event IDs, API key/secret or OAuth refresh token).

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

## Cowork operational tasks

See SPEC.md §7.5 for the three Cowork workflows: onboarding (API credentials, RunSignup IDs, descriptions.json), cutover validation, and the API-failure fallback procedure.

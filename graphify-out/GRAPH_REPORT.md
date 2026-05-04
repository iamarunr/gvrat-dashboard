# Graph Report - gvrat-dashboard  (2026-05-04)

## Corpus Check
- 40 files · ~57,984 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 248 nodes · 303 edges · 35 communities (30 shown, 5 thin omitted)
- Extraction: 79% EXTRACTED · 21% INFERRED · 0% AMBIGUOUS · INFERRED: 63 edges (avg confidence: 0.76)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c3009b58`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 23|Community 23]]

## God Nodes (most connected - your core abstractions)
1. `build_leaderboard()` - 15 edges
2. `ApiSource` - 13 edges
3. `main()` - 12 edges
4. `parse_gpx()` - 11 edges
5. `Participant` - 9 edges
6. `parse_distance()` - 9 edges
7. `Activity` - 8 edges
8. `CsvSource` - 8 edges
9. `runner_files_env()` - 8 edges
10. `TestJennaDagger` - 8 edges

## Surprising Connections (you probably didn't know these)
- `main()` --calls--> `save_snapshot()`  [INFERRED]
  pipeline/main.py → pipeline/snapshots.py
- `wmap()` --calls--> `parse_gpx()`  [INFERRED]
  pipeline/tests/test_waypoints.py → pipeline/waypoints.py
- `RunSignupError` --uses--> `Participant`  [INFERRED]
  pipeline/runsignup.py → pipeline/models.py
- `ApiSource` --uses--> `Participant`  [INFERRED]
  pipeline/runsignup.py → pipeline/models.py
- `CsvSource` --uses--> `Participant`  [INFERRED]
  pipeline/ingestion/csv_source.py → pipeline/models.py

## Communities (35 total, 5 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.08
Nodes (19): load_overrides(), load_race_config(), build_course_geojson(), Build course.geojson from the race GPX file.  Output: one LineString for the rou, load_descriptions(), _build_meta(), main(), CLI entry point: python -m pipeline.main --race gvrat-2026 [--from-csv path/] [- (+11 more)

### Community 1 - "Community 1"
Cohesion: 0.09
Nodes (13): derive_home(), parse_distance(), Parse a distance string like '26.3 miles' or '10 km' into miles., Return 'US-{state}' for US runners, ISO country code otherwise., test_derive_home_au(), test_derive_home_gb(), test_derive_home_us(), test_derive_home_us_military() (+5 more)

### Community 2 - "Community 2"
Cohesion: 0.12
Nodes (20): BaseModel, Abstract Source protocol — both CsvSource and ApiSource satisfy this interface., Source, _int_or(), load_activities(), load_participants(), _parse_date(), CSV ingestion — reads RunSignup export CSVs from a directory. (+12 more)

### Community 3 - "Community 3"
Cohesion: 0.12
Nodes (16): Exception, ApiSource, _extract_participants_page(), _log_bib4_tally_verification(), _parse_activity(), _parse_participant(), RunSignup API client.  Activity tally unit — confirmed 2026-05-01:   result_spli, Fetch VR activity type definitions — confirms available activity types. (+8 more)

### Community 4 - "Community 4"
Cohesion: 0.08
Nodes (9): Tests for pipeline/runner_files.py., Day 1: Buzzard miles = 679/153 ≈ 4.44., Gingerbread Man (bib 9999) should have no runner file., Every active non-virtual participant in the fixture must have a file., bib 233 — Tommy Holder is in the fixture but has no activities., No activities on May 1 → one rest entry for May 1., TestBuzzardFile, TestFileCount (+1 more)

### Community 5 - "Community 5"
Cohesion: 0.19
Nodes (11): _assign_gender_ranks(), build_leaderboard(), compute_projected_finish(), Set genderRank on real runners (already sorted by miles desc)., Fallback stub when there are no real runners — gives GBM a safe base., Return (projectedFinish display string, projectedFinishDate ISO string).      Di, Aggregate activities, add virtual characters, rank runners, return LeaderboardOu, _zero_runner() (+3 more)

### Community 6 - "Community 6"
Cohesion: 0.2
Nodes (4): bib 4 — Jenna Dagger has 26.3 miles on May 1., CSV fixture has 'walk'; must appear as 'walk' in output., CSV fixture has Time column — must appear in output., TestJennaDagger

### Community 9 - "Community 9"
Cohesion: 0.36
Nodes (7): _activity_entry(), _normalize_type(), Write per-runner JSON files to data/{race_id}/runners/{bib}.json., Map activityType (CSV string or API numeric ID) to 'run' or 'walk'., Write per-runner JSON files; return the number of files written.      Writes dat, _rest_entry(), save_runner_files()

### Community 10 - "Community 10"
Cohesion: 0.29
Nodes (3): CsvSource, CsvSource — loads participants and activities from RunSignup-exported CSV files., Implements the Source protocol using CSV files exported from RunSignup.

## Knowledge Gaps
- **44 isolated node(s):** `Daily snapshot writer — copies leaderboard.json to snapshots/{asOfDate}.json.`, `CSV ingestion — reads RunSignup export CSVs from a directory.`, `Internal model — contains only the fields we extract from source data.     PII (`, `Strict allowlist — only these fields may appear in public JSON output.`, `Build course.geojson from the race GPX file.  Output: one LineString for the rou` (+39 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `main()` connect `Community 0` to `Community 3`, `Community 5`, `Community 9`, `Community 10`, `Community 15`?**
  _High betweenness centrality (0.229) - this node is a cross-community bridge._
- **Why does `runner_files_env()` connect `Community 0` to `Community 9`, `Community 4`, `Community 5`?**
  _High betweenness centrality (0.195) - this node is a cross-community bridge._
- **Why does `build_leaderboard()` connect `Community 5` to `Community 0`, `Community 1`, `Community 2`?**
  _High betweenness centrality (0.181) - this node is a cross-community bridge._
- **Are the 8 inferred relationships involving `build_leaderboard()` (e.g. with `main()` and `PublicRunner`) actually correct?**
  _`build_leaderboard()` has 8 INFERRED edges - model-reasoned connections that need verification._
- **Are the 3 inferred relationships involving `ApiSource` (e.g. with `Activity` and `Participant`) actually correct?**
  _`ApiSource` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Are the 10 inferred relationships involving `main()` (e.g. with `load_race_config()` and `load_overrides()`) actually correct?**
  _`main()` has 10 INFERRED edges - model-reasoned connections that need verification._
- **Are the 8 inferred relationships involving `parse_gpx()` (e.g. with `Waypoint` and `main()`) actually correct?**
  _`parse_gpx()` has 8 INFERRED edges - model-reasoned connections that need verification._
# Data Field Rules

## Always Verify Field Names Before Using Them

Before writing any condition or data reference in a prompt,
verify the exact field name from the actual JSON schema.

NEVER assume field names. Always check SPEC.md §3 or the 
actual leaderboard.json file first.

Wrong:
  if (runner.real_rank === 1)   ← assumed, may not exist

Right:
  if (runner.virtual === false && runner.rankDisplay === "#1")
  ← verified against actual leaderboard.json schema

## Prototype vs Implementation Gap

A visual prototype proves the DESIGN is correct.
It does NOT prove the data conditions are correct.

When a prototype uses hardcoded values:
  <div class="badge-gold">#1</div>

The implementation must use real data fields:
  const isLeader = runner.virtual === false 
                && runner.rankDisplay === "#1"

Always specify the exact field names, types, and 
values when writing implementation prompts.
Never let Claude Code guess which field to use.

## GVRAT Leaderboard Field Reference

Key fields in data/gvrat-2026/leaderboard.json runners:
  runner.virtual         boolean — true for GBM and Buzzard
  runner.virtualType     "gingerbread" | "buzzard" | null
  runner.rankDisplay     string — "#1", "#2" etc
  runner.rank            number — overall position
  runner.genderRank      number — rank within gender
  runner.miles           number — cumulative miles
  runner.compPercent     number — % of 679 miles complete
  runner.bib             number — runner bib number
  runner.gender          "M" | "F"
  runner.home            "US-TN", "GB", "AU" etc

## Design System Reference

Read DESIGN.md in the project root before making
ANY UI changes. It contains every color, font size,
component pattern, and layout rule.

Never invent new colors, fonts, or spacing values.
Always reference DESIGN.md tokens first.
New UI must match existing patterns exactly.
Update DESIGN.md if any design decision changes.
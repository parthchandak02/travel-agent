# Travel Agent — Product Goal

**North star:** Help a group decide *where* to go and *how* to spend their dates — with verified lodging, activities, and day-by-day plans — in under 15 minutes of reading, without booking anything for them.

**Clarity before commitment.** Not one itinerary — **2–5 real options**, each with **2–3 weekend shapes**, so the group can vote and then book.

## Minimum intake (gate before research)

| Field | Required |
|-------|----------|
| Start date **and time** | Yes |
| End date **and time** | Yes |
| Origin | Yes |
| Travelers (+ beds/bedrooms) | Yes |
| Exploration areas (2–5 seeds or region) | Yes |
| Budget, must-haves, avoid | Optional |

**Rule:** Echo one-paragraph trip spec → user approves → then research. See `references/intake-gate.md`.

## Success criteria

- 2–5 options, 3 plan variants each (full day schedules), 4+ lodgings each
- Scored 1–5 per rubric in `references/trip-explorer-schema.md`
- Compare table + plan cards on shareable HTML (mobile-friendly)
- Real reviews/prices cited — never invented
- JSON → re-render → redeploy (`scripts/publish-trip-explorer.sh`)
- Link to book; never book

## End-to-end flow

```
INTAKE → PARALLEL RESEARCH → trip-explorer.json → index.html → PUBLISH → USER PICKS → trip-map.html
```

Full spec: `references/product-goal.md`  
Orchestrator: `scripts/run-trip.sh`  
Validator: `node scripts/validate-trip-explorer.js <json>`

# Intake Gate — Phase 0

**Do not run parallel research until the user confirms this spec.**

## Required fields

Collect and confirm:

1. **Depart** — `YYYY-MM-DD HH:MM` + timezone (e.g. `2026-09-04 15:30 America/Los_Angeles`)
2. **Return** — `YYYY-MM-DD HH:MM` + timezone (target home arrival)
3. **Origin** — city/address; set `origin_lat` / `origin_lng` when known
4. **Travelers** — adults, children, `beds_min`, `bedrooms_preferred`, notes
5. **Exploration areas** — 2–5 named seeds OR one region ("Northern Sierra, 3–4 hr from Bay Area")
6. **Vehicle** — default `sedan`

## Optional fields

- Budget (lodging total or per night)
- Must-haves (swim, hike, town dining, pet-friendly, etc.)
- Avoid list (crowds, cliffs, long Friday drives)
- User preference rank (tie-breaker only)

## Confirmation template

Write `trip-spec.md` in the trip folder:

```markdown
# Trip spec — [slug]

**Confirmed:** [date]

[One paragraph: who, when (with times), from where, exploring X/Y/Z, 
must-haves, avoid, bed needs. No research until user approves this.]

- Depart: Fri Sep 4, 3:30 PM from Redwood City
- Return: Mon Sep 7, 6:00 PM to Redwood City
- Party: 3 adults, 2 beds / 2 BR preferred
- Areas: Bucks Lake, Downieville, Nevada City (preference order 5 > 4 > 1)
- Must: swimming + one big hike
- Avoid: Tahoe crowds
```

## JSON mapping (`meta` block)

```json
{
  "meta": {
    "title": "Labor Day Sierra Escape",
    "dates": "Sep 4–7, 2026",
    "depart_at": "2026-09-04T15:30:00-07:00",
    "return_at": "2026-09-07T18:00:00-07:00",
    "checkin": "2026-09-04",
    "checkout": "2026-09-07",
    "origin": "Redwood City, CA",
    "origin_lat": 37.4852,
    "origin_lng": -122.2364,
    "travelers": { "adults": 3, "beds_min": 2, "bedrooms_preferred": 2 },
    "vehicle": "sedan",
    "must_haves": ["swimming", "hike"],
    "avoid": ["Tahoe crowds"],
    "exploration_seeds": ["Bucks Lake", "Downieville", "Nevada City"]
  }
}
```

## After approval

1. `mkdir -p ~/Documents/Research/travel/{trip-slug}/`
2. Save `trip-spec.md`
3. Launch one subagent per exploration area (`references/parallel-research-protocol.md`)
4. On merge: `node scripts/validate-trip-explorer.js trip-explorer.json`
5. `bash scripts/run-trip.sh ~/Documents/Research/travel/{trip-slug}`

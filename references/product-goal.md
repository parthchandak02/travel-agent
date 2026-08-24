# Travel Agent — Product Goal & End-to-End Vision

**For agent intake.** Use this as the north star when extending `travel-agent` beyond the Labor Day Sierra prototype.

**Date:** 2026-08-24  
**Live prototype:** https://travel.parthchandak.info  
**Skill repo:** https://github.com/parthchandak02/travel-agent  
**Skill path:** `~/.hermes/skills/travel/travel-agent/`

---

## One-sentence goal

**Help a group decide *where* to go and *how* to spend their dates — with verified lodging, activities, and day-by-day plans — in under 15 minutes of reading, without booking anything for them.**

---

## The problem we solve

Trip planning fails when:

1. **Too many dimensions at once** — dates, drive time, beds, crowds, weather, activities, hotels
2. **No comparison surface** — friends argue from memory instead of a shared page
3. **Research is scattered** — Airbnb, AllTrails, Reddit, park sites, none in one place
4. **Wrong decision order** — hotels before anyone agrees on the weekend shape
5. **Agent output is walls of text** — not a visual, shareable decision tool

Our tool exists to produce **clarity before commitment**: 2–5 real options, each with 2–3 itinerary variants, scored and visualized, so the group can vote and then book.

---

## Minimum intake (what the user must provide)

| Field | Required | Example |
|-------|----------|---------|
| **Start** | Yes | `2026-09-04 15:30` (date + departure time) |
| **End** | Yes | `2026-09-07 18:00` (return date + target home time) |
| **Origin** | Yes | `Redwood City, CA` |
| **Travelers** | Yes | `3 adults` (+ beds/bedrooms if relevant) |
| **Exploration areas** | Yes | 2–5 seeds OR a region + radius | `Bucks Lake, Downieville, Nevada City` OR `Northern Sierra, 3–4 hr from Bay Area` |
| **Vehicle** | Default | `sedan` |
| **Budget** | Optional | `lodging <$200/night total` |
| **Must-haves** | Optional | `swimming, one big hike, 2 bedrooms` |
| **Avoid** | Optional | `Tahoe crowds, cliff jumping` |

**Gate rule (from best-in-class skills):** Do not research until intake is confirmed. Echo back a one-paragraph trip spec; user approves → then run parallel research.

---

## What “best options” means (scoring rubric)

An option is “best” only relative to the trip spec. Score each destination **1–5** on:

| Dimension | What we verify |
|-----------|----------------|
| Friday / arrival logistics | Drive time from origin at stated departure time + holiday traffic buffer |
| Monday / return logistics | Return drive fits end datetime |
| Lodging fit | Meets beds/bedrooms; real price for exact dates (not off-season cache) |
| Activity quality | At least one anchor experience (hike, water, town) with official URL + parking reality |
| Crowd / holiday resilience | Labor Day, July 4, etc. — early-start Plan B documented |
| Group fit | 3 adults ≠ 2-bed studio; score `bed_fit`: green / yellow / red |
| Scenic uniqueness | Is this trip *worth* the drive vs staying closer? |

**Overall rank** = weighted average; **user preference rank** is tie-breaker only (never override fragile logistics).

---

## End-to-end flow (what the tool does)

```
┌─────────────────────────────────────────────────────────────────┐
│ PHASE 0 — INTAKE GATE                                           │
│ Confirm dates/times, party, areas, constraints                    │
│ Output: trip-spec.md (one paragraph)                            │
└────────────────────────────┬────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ PHASE 1 — PARALLEL RESEARCH (1 subagent per exploration area)   │
│ CLIs: hotel-goat, airbnb, trvl, tripadvisor, alltrails,         │
│       wanderlust-goat, atlas-obscura + web for gaps             │
│ Each returns: trip-explorer-schema.json fragment                │
└────────────────────────────┬────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ PHASE 2 — SYNTHESIZE                                            │
│ Merge → trip-explorer.json                                      │
│ Rank options; write group_message (neutral, <180 words)         │
│ Path: ~/Documents/Research/travel/{trip-slug}/                  │
└────────────────────────────┬────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ PHASE 3 — RENDER DECISION PAGE                                  │
│ node scripts/render-trip-explorer.js → index.html               │
│ Auto: fill-day-plans.mjs, enrich-images.mjs                     │
└────────────────────────────┬────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ PHASE 4 — PUBLISH (optional)                                    │
│ bash scripts/publish-trip-explorer.sh → travel.parthchandak.info  │
└────────────────────────────┬────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ PHASE 5 — USER DECIDES (human)                                  │
│ Pick: destination + plan variant (A/B/C)                        │
└────────────────────────────┬────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ PHASE 6 — COMMIT MAP                                            │
│ json-to-tripkit.js → trip.yaml → trip-map.html                  │
│ Shareable navigation-ready single-trip map                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## User-facing experience (decision UX)

Two decisions, in order — never skip:

### Decision 1: Pick a place
- **Compare table** at a glance: drive, crowd risk, best-for one-liner, stay-from price, the catch
- Photo cards for mood; table for facts
- Persistent destination chips — switch without losing context

### Decision 2: Pick a weekend shape
- **Plan A / B / C cards** with day chips (`Sat lake · Sun hike · Mon canyon`)
- Full editorial day schedule only for selected plan
- Lodging, map, reviews **collapsed below** — tertiary

### After decision
- `trip-map.html` — TripKit interactive map for the chosen plan
- Group can book lodging themselves via linked URLs (we never book)

---

## Per-option deliverables (non-negotiable)

Each exploration area MUST include:

- [ ] Friday + Monday drive guide (hours, notes, traffic)
- [ ] **3 day-plan variants** (balanced, alternate emphasis, low-crowd/base-town)
- [ ] **4+ lodging candidates** with bed fit for the party
- [ ] **3+ activities** with official URL, maps link, lat/lng, parking, crowd level
- [ ] **2+ real reviews** (TripAdvisor CLI or cited web — never invented)
- [ ] **Images** (hero, gallery, activity thumbs — verified HTTP 200)
- [ ] **Holiday reality check** (parking targets, reservations, safety)
- [ ] Scores for all rubric dimensions

---

## When to use which backend

| User says… | Tool |
|------------|------|
| "Compare these 3 areas for Labor Day" | **trip-explorer** (this skill) |
| "Plan me a vacation anywhere under $3k" | **Windward** (`windward` CLI) |
| "We picked Option 5 Plan A — make a map" | **TripKit** (`npx tripkit`) |
| "What's near me to do Saturday afternoon" | **wanderlust-goat** + **atlas-obscura** |

---

## Success criteria (how we know it's working)

| Metric | Target |
|--------|--------|
| Time to first shareable page | < 30 min agent time for 3 options |
| Options per trip | 2–5 (not 1, not 10) |
| Plans per option | 3 variants with full day schedules |
| Lodging per option | 4+ with bed-fit line |
| User can decide without leaving page | Compare table + plan cards answer "where" and "what weekend" |
| No shouty CTAs on public page | `book_urgency` omitted unless user asks |
| Re-renderable | Edit JSON → re-run render → redeploy |
| Mobile group decision | Sticky chips + bottom dock; readable on one phone passed around |

---

## What we are NOT (scope boundaries)

- **Not a booking agent** — deep links only; user clicks to book
- **Not a flight planner** (unless user asks; use flight-goat / trvl)
- **Not open-ended "plan anywhere"** without seeds — use Windward for that
- **Not a live availability guarantee** — flag `verify_48h` for holiday trips
- **Not inventing reviews or prices** — cite sources; mark `needs_verification`

---

## Stretch goals (v2, not required for v1)

1. **Region mode** — user gives "within 4 hr of SF, lakes + hiking" → agent proposes 3 seeds, then runs normal flow
2. **Shortlist** — heart 2 options, compare only shortlist
3. **Delta row** — "Plan B vs A: hike moves to Saturday, +45 min drive"
4. **Weather strip** — trvl or Open-Meteo per day in itinerary header
5. **Per-person cost** — lodging + gas estimate in compare table
6. **WhatsApp handoff** — `group_message` + link auto-sent via Hermes notify

---

## Handoff prompt for the next agent

Copy this when starting a new trip:

```
You are the travel-agent orchestrator. Read:
- ~/.hermes/skills/travel/travel-agent/SKILL.md
- references/trip-explorer-schema.md
- references/parallel-research-protocol.md
- references/trip-explorer-design.md
- references/competitive-landscape.md

Goal: Help the group decide WHERE and HOW to spend [dates] with clarity before booking.

Intake:
- Start: [datetime + timezone]
- End: [datetime + timezone]
- Origin: [city]
- Travelers: [count + bed needs]
- Exploration areas: [list or region]
- Must-haves: [...]
- Avoid: [...]

Do NOT research until intake is confirmed.

Then:
1. Launch 1 parallel subagent per exploration area
2. Merge to trip-explorer.json
3. Render + publish to travel.parthchandak.info
4. Present compare link + recommendation in 3 bullets

Deliverables: index.html, trip-explorer.json, group_message (<180 words)
```

---

## Canonical file layout per trip

```
~/Documents/Research/travel/{trip-slug}/
  trip-spec.md          # confirmed intake
  trip-explorer.json    # source of truth
  index.html            # decision page
  trip.yaml             # after pick
  trip-map.html         # TripKit map
  ux-notes.md           # optional research
```

---

## Summary for Parth

**Goal:** Be the clearest **group decision tool** for weekend/trip planning — not the most options, not the most text, but the fastest path from "we have dates and rough areas" to "we all agree on place + plan A."

**Moat vs GitHub travel skills:** User-seeded parallel comparison + PP CLI verification + visual 2-step UX + one-command publish. Nobody else combines all four.

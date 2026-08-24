# Parallel Research Protocol

Use when the user supplies **2–5 destination options** (or asks you to generate them) and wants an end-to-end comparison with lodging, reviews, parking, and HTML output.

## When to activate

- Multi-option trip decision (e.g. "Option 5 vs 4 vs 1 for Labor Day")
- User wants HTML trip explorer, not just markdown tables
- Holiday weekend / parking-sensitive / booking-urgent trips
- "Research all options in parallel" or "launch subagents"

## Orchestrator responsibilities (parent agent)

1. **Intake gate** — confirm before spending tokens:
   - Exact dates (check-in Fri, check-out Mon)
   - Origin city + Friday departure time
   - Party size, beds needed, budget range
   - Vehicle type, water gear (kayaks/tubes/PFDs)
   - Lodging must-haves (kitchen, hot tub, walkable town)
   - User's ranked preference order if known

2. **Spawn parallel subagents** via `Task` tool — **one subagent per destination option**, max 5 concurrent.

3. **Synthesize** subagent JSON into `trip-explorer.json` and render HTML.

4. **Never fabricate** availability, prices, parking capacity, or review quotes.

## Subagent prompt template

Copy and fill `{OPTION_ID}`, `{OPTION_NAME}`, `{OPTION_BRIEF}`, dates, origin, party:

```text
You are a destination research subagent for the travel-agent skill.

## Assignment
Research ONLY this option. Return structured JSON matching references/trip-explorer-schema.md.
Do not research other destinations.

Option ID: {OPTION_ID}
Option name: {OPTION_NAME}
Seed itinerary: {OPTION_BRIEF}

## Trip context
- Dates: {CHECKIN} → {CHECKOUT} ({NIGHTS} nights)
- Origin: {ORIGIN} (Friday depart ~{DEPART_TIME})
- Travelers: {ADULTS} adults
- Lodging: minimum **2 beds** for 3 adults (Parth + fiancée + sister); **2 bedrooms preferred** but not required. Filter Airbnb `primary_line`, verify hotel room types on direct sites.
- Vehicle: {VEHICLE}
- Budget guidance: {BUDGET}
- Holiday context: {HOLIDAY_NOTE}

## Required outputs (JSON only at end)

### 1. Access validation
For every hike, swim spot, marina, rental, park:
- Official URL, status (confirmed / likely / unverified / not_recommended)
- Distance, difficulty, realistic duration
- Parking rules, fees, reservation requirements
- Labor Day crowding risk + target arrival time
- Backup if lot is full
- Safety flags (cliff jumping → downgrade; river hazards; fire/smoke)

### 2. Lodging (minimum 4 candidates)
Cross-search using CLIs where possible (see `references/printing-press-tools.md`):
- `hotel-goat-pp-cli hotels "{base}" {checkin} {checkout} --agent`
- `trvl hotels "{base}" --checkin {checkin} --checkout {checkout} --guests {adults} --format json`
- `airbnb-pp-cli airbnb-listing search "{base}" --checkin ... --checkout ... --adults {adults} --agent --select results.title,results.primary_line,results.per_night_price,results.url`
- `booking-com-pp-cli hotels list --query "{base}" --checkin ... --checkout ... --adults {adults} --json`
- `alltrails-pp-cli alltrails list "{trail}" --agent` for each hike
- `tripadvisor-pp-cli locations search --search-query "{place}" --agent`
- `wanderlust-goat-pp-cli near "{base}" --criteria "dinner after hiking" --minutes 20 --agent`
- Direct lodge/cabin sites (marina, county tourism)

Per lodging: name, platform, URLs, availability status, all-in 3-night total, per-person cost, beds, amenities, drive time to Sat/Sun activities, pros/cons, status (book_now / viable / eliminate / needs_verification), checked_at timestamp.

### 3. Reviews & editorial
- tripadvisor-pp-cli for top activities/lodging where API works
- Web search for recent blog posts, Reddit trip reports (last 12 months)
- Include 2–4 review snippets with source URL and date — real quotes only
- Image URLs from official sites, Wikimedia, or tourism boards (stable https)

### 4. Day plans (3 variants per option)
Build Plan A, B, C with different vibes:
- **Plan A** — balanced default (account for late Friday arrival)
- **Plan B** — water-first or hike-first alternate
- **Plan C** — low-crowd / weather-backup / relaxed pace

Each day block: start_time, activity, drive_min, parking_note, duration, meal, backup, links (official + Google Maps directions).

### 5. Scores (1–5 + one-line rationale each)
friday_drive, monday_return, lodging_value, crowd_resilience, water_quality, hiking_quality, scenic_uniqueness, town_food, safety_reliability, overall

### 6. Reality check
parking_targets, reservations_needed, book_by_dates, smoke_fire_notes, packing_notes

Return ONLY valid JSON. No markdown wrapper.
```

## Parent synthesis rules

| Subagent field | HTML section |
|----------------|--------------|
| `scores` | Comparison table + option card badges |
| `lodging[]` | Lodging filter grid |
| `day_plans[]` | Per-option accordion → plan tabs |
| `activities[]` | Activity cards with images |
| `reviews[]` | Review quotes with links |
| `reality_check` | Labor Day panel |

**Ranking:** Respect user's stated preference order as a tie-breaker, but override if research shows a option is logistically fragile (no lodging, closed access, extreme parking risk).

## Render command

```bash
node ~/.hermes/skills/travel/travel-agent/scripts/render-trip-explorer.js \
  trip-explorer.json \
  ~/Documents/Research/travel/{trip-slug}/index.html
```

## After user picks one option

1. Export chosen `day_plans[].days` into TripKit YAML (see `references/tripkit-bridge.md`)
2. Run `npx tripkit validate trip.yaml && npx tripkit trip.yaml trip.html` for single-option map view
3. Optionally run `windward` if the trip needs flight comparison (not typical for NorCal road trips)

## Subagent count guide

| Options | Subagents | Notes |
|---------|-----------|-------|
| 3 | 3 parallel | Ideal for Suchi's 5/4/1 case |
| 5 | 5 parallel | Full menu |
| 1 deep dive | 3 parallel | lodging + activities + dining split |

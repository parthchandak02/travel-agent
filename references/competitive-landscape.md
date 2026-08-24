# Competitive Landscape — Travel Agent Skills

How open-source travel skills compare, and what makes **travel-agent** the best fit for Parth's workflow.

## Landscape (GitHub, 2026)

| Project | Strength | Gap vs ours |
|---------|----------|-------------|
| [triply](https://github.com/a692570/triply) | Single-destination HTML brief, flights/hotels/advisory | No multi-option compare; one itinerary only |
| [Windward/Wayfarer](https://github.com/sohan-shingade/windward) | 4–5 budget-priced full trips from one prompt | No user seed options; opaque destination pick |
| [TripKit](https://github.com/piti/tripkit) | Beautiful single-trip interactive map | Post-decision only; no comparison UI |
| [skills-travel-planner](https://github.com/huanyuzhilv/skills-travel-planner) | Client PDF roadbooks, image pipeline | China-market focus; heavy Python deliver |
| [Travel-Planning-Skill](https://github.com/618034128/Travel-Planning-Skill) | Confirmation gate before planning | No HTML explorer; China rail focus |
| [cody-hutson/travel-planner](https://github.com/cody-hutson/travel-planner) | 9-agent roster, encrypted publish | Overkill for weekend trips; no PP CLIs |
| [apljacob/travel-agent](https://github.com/apljacob/travel-agent) | Elite planner methodology, reservations | No visual multi-option output |

## Our differentiators

1. **User-seeded options** — compare Suchi's Option 5/4/1, not random destinations
2. **Parallel subagents** — one researcher per option, merge to JSON
3. **3 plan variants per option** — A/B/C day swaps (water-first vs hike-first)
4. **Printing Press CLIs** — live hotel/airbnb/trail/review data, not scraped guesses
5. **Visual trip explorer** — photo cards, editorial itineraries, maps
6. **One-command publish** — `travel.parthchandak.info` via Cloudflare Pages
7. **TripKit handoff** — after pick, `trip-map.html` for navigation-ready map

## What we adopted from others

| Source | Adopted |
|--------|---------|
| TripKit | Post-pick YAML → interactive map |
| Windward | Multi-option framing (we use user seeds instead of LLM destinations) |
| Travel-Planning-Skill | Intake gate before parallel research |
| triply | Self-contained HTML, booking links wired |
| skills-travel-planner | `tripData.json` → render pipeline (our `trip-explorer.json`) |
| cody-hutson | Publish script pattern (ours is public static, not encrypted) |

## End-to-end agent workflow

```
1. INTAKE (Phase 0)
   Dates, origin, party, beds, vehicle, ranked option seeds
   → Do not research until confirmed

2. PARALLEL RESEARCH (Phase 1)
   Task subagent per option → JSON per trip-explorer-schema.md
   Each: 4+ lodging, 3 day plans, activities, reviews, scores

3. SYNTHESIZE (Phase 2)
   Merge → trip-explorer.json
   Rank; user preference is tie-breaker only

4. RENDER (Phase 3)
   node scripts/render-trip-explorer.js trip.json index.html
   Auto: fill-day-plans.mjs → enrich-images.mjs → template

5. PUBLISH (Phase 4)
   bash scripts/publish-trip-explorer.sh <trip-dir>
   → index.html + trip-map.html → travel.parthchandak.info

6. COMMIT (Phase 5, after user picks)
   node scripts/json-to-tripkit.js → trip.yaml
   npx tripkit validate && npx tripkit trip.yaml trip-map.html
```

## Quality bar (before publish)

- [ ] All 3 options have hero + gallery images
- [ ] All plan variants A/B/C have day schedules (fill-day-plans fills gaps)
- [ ] No `book_urgency` banner unless user asked
- [ ] Group message is neutral compare copy, not "BOOK TODAY"
- [ ] Lodging shows bed fit for 3 adults
- [ ] Recommended option has `trip-map.html` linked from hero

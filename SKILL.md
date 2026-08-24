---
name: travel-agent
description: "End-to-end multi-option trip planner with parallel subagent research, lodging/review verification, day-plan variants, and HTML trip-explorer output. Combines TripKit map rendering, Wayfarer multi-destination comparison, and 9 Printing Press CLIs (hotel-goat, airbnb, flight-goat, wanderlust-goat, tripadvisor, atlas-obscura, booking-com, hotel-tonight, trvl). Trigger: trip planning, itinerary options, Labor Day weekend, compare destinations, HTML trip page."
tags:
  - travel
  - trip-planning
  - hotels
  - flights
  - itinerary
  - airbnb
  - monterey
  - carmel
metadata:
  hermes:
    tags:
      - travel
      - trip-planning
      - hotels
      - flights
      - airbnb
      - itinerary
    category: travel
---

# Travel Agent — Multi-Option Trip Planner

End-to-end planner: user gives 2–5 destination seeds → parallel subagents research each → synthesize into **trip-explorer.json** → render **index.html** → user picks one → TripKit map for final itinerary.

## Installed render stack

| Tool | Purpose | Command |
|------|---------|---------|
| **TripKit** | Single-trip interactive map + day sidebar | `npx tripkit trip.yaml trip.html` |
| **Windward** (was Wayfarer) | 4–5 flight+hotel priced destination options | `windward "vacation for 3, budget 3k, labor day, lakes and hiking"` |
| **trip-explorer** (this skill) | Multi-option HTML comparison page | `node scripts/render-trip-explorer.js trip.json index.html` |

Install deps: `bash ~/.hermes/skills/travel/travel-agent/scripts/install-deps.sh`

Skills also at: `~/.claude/skills/tripkit/`, `~/.hermes/skills/travel/tripkit/`

## Printing Press tools (full matrix)

See `references/printing-press-tools.md` for install commands and per-phase CLI recipes.

**Tier 1 (every trip):** hotel-goat, trvl, airbnb, booking-com, tripadvisor, **alltrails**, wanderlust-goat, atlas-obscura

**Tier 2 (situational):** hotelist, hotel-tonight, flight-goat, roadside-america, travelclick, wanderlog

**Lodging rule for this group:** 3 adults → min **2 beds**, prefer **2 bedrooms**. Check Airbnb `primary_line`; verify hotels on direct sites.

## Workflow (orchestrator)

```
Phase 0: Intake gate
  Confirm dates, origin, party, budget, vehicle, lodging prefs, ranked option order

Phase 1: Parallel research (Task tool — one subagent per option)
  Load references/parallel-research-protocol.md
  Each subagent returns JSON per references/trip-explorer-schema.md

Phase 2: Synthesize
  Merge subagent JSON → trip-explorer.json
  Score + rank options (user preference is tie-breaker, not override for fragile logistics)
  Write to ~/Documents/Research/travel/{trip-slug}/

Phase 3: Render HTML
  node scripts/render-trip-explorer.js trip-explorer.json index.html

Phase 4: User picks option + day plan
  Convert to TripKit YAML → references/tripkit-bridge.md
  npx tripkit validate && npx tripkit trip.yaml trip-map.html
```

## Parallel subagent split

| Subagents | Assignment |
|-----------|------------|
| **1 per destination option** | Access, 4+ lodging, reviews, 3 day-plan variants, scores |
| **OR 3 workstreams** (single destination) | Hotels · Activities/parking · Dining/reviews |

**Max 5 concurrent** `Task` subagents. Each returns structured JSON only.

Subagent prompt template: `references/parallel-research-protocol.md`

## Deliverables per trip

1. **index.html** — multi-option trip explorer (primary)
2. **trip-explorer.json** — canonical data (editable, re-renderable)
3. **trip-map.html** — TripKit single-option map (after user commits)
4. **group_message** — under 180 words for WhatsApp

Output path: `~/Documents/Research/travel/{trip-slug}/` (dated filename if no slug).

## Per-option requirements

Each destination option MUST include:

- **Travel time guide** — Friday + Monday drives with traffic buffer
- **3 day-plan variants** (Plan A balanced, Plan B water/hike swap, Plan C low-crowd/backup)
- **4+ lodging candidates** — hotel-goat + trvl + airbnb + direct/marina sites
- **Real reviews** — TripAdvisor CLI + blog/Reddit URLs; never invent quotes
- **Images + official URLs** — every activity and lodging
- **Labor Day reality check** — parking targets, reservation deadlines, Plan B per activity
- **Scores 1–5** — all dimensions in trip-explorer-schema.md

## When to use Windward vs trip-explorer

| Scenario | Tool |
|----------|------|
| User has 2–5 **specific** destination seeds (Suchi's Option 5/4/1) | **trip-explorer** parallel subagents |
| User says "plan me a vacation anywhere under $X" | **windward** CLI |
| User picked one destination, wants map | **TripKit** |

## Parth's planning style (still applies)

Do NOT deliver a single fixed itinerary until user commits. Present:
- 2–5 destination options with scores
- 3 day-plan variants **within** each option
- 4+ lodging per top option
- Decision question last: "Which option + which plan?"

See existing section below for CLI patterns, hotel research, surprise trips.

---

# Travel Agent CLI Suite

## Quick Start — Credentials

Only ONE is truly required (TripAdvisor). The rest are optional upgrades.

| CLI | What to set | Where to get | Required? |
|-----|-------------|-------------|-----------|
| tripadvisor-pp-cli | `TRIPADVISOR_API_KEY` | https://www.tripadvisor.com/developers | **YES** |
| flight-goat-pp-cli | `FLIGHT_GOAT_API_KEY_AUTH` | https://flightaware.com/aeroapi/ | No — Google Flights work without |
| wanderlust-goat-pp-cli | `GOOGLE_PLACES_API_KEY` | Google Cloud > APIs > Places API | No — falls back gracefully |
| airbnb-pp-cli | Browser cookie (one-time) | Run: `airbnb-pp-cli auth login --chrome` | No — public search works |
| booking-com-pp-cli | Browser cookie (one-time) | Run: `booking-com-pp-cli auth login --chrome` | No — public search works |

**If you have zero API keys, trvl still works for everything.** It needs zero auth and covers flights + hotels + ground transport + weather + destination intel.

Credentials live in the Hermes secrets file only (see workspace gitguardian rule). Required env vars:

- `TRIPADVISOR_API_KEY` — required for TripAdvisor CLI
- `FLIGHT_GOAT_API_KEY_AUTH` — optional
- `GOOGLE_PLACES_API_KEY` — optional

# Travel Agent CLI Suite

## Inventory: Installed Tools

| CLI | Version | Use Case | Auth |
|-----|---------|----------|------|
| `trvl` | 1.19.1 | Google Flights, Google Hotels, 16+ ground transport, destination intel, price alerts, travel hacks. Most comprehensive single tool. | None |
| `flight-goat-pp-cli` | 2026.6.2 | Google Flights fare search, cheapest dates, explore nonstop destinations, Kayak long-haul routes, FlightAware AeroAPI | Optional (FLIGHT_GOAT_API_KEY_AUTH) |
| `hotel-goat-pp-cli` | 2026.7.1 | Google Hotels search, per-hotel pricing, filters (class, price, currency), wishlist, agent-native JSON | None |
| `airbnb-pp-cli` | 2026.7.1 | Airbnb/VRBO search, host-direct booking arbitrage (find direct booking sites), price watchlist | None (public); cookie for wishlists |
| `booking-com-pp-cli` | 2026.7.1 | Booking.com search, offline price history, wishlist drop alerts, multi-leg planning | None |
| `wanderlust-goat-pp-cli` | 2026.7.2 | Local recommendations fused across editorial, crowd, and local-language sources | Optional (GOOGLE_PLACES_API_KEY) |
| `tripadvisor-pp-cli` | 2026.7.1 | Tripadvisor Content API — reviews, ratings, top attractions | API key (REQUIRED) |
| `atlas-obscura-pp-cli` | 2026.7.1 | Hidden gems, road-trip corridor routing, saved trips, walkable clusters | None |
| `hotel-tonight-pp-cli` | 2026.7.1 | Last-minute hotel deals with price-history database | None |
| `pp-flighty-cli` | — | Flighty macOS — read tracked flights/stats (local SQLite); add flights via `flights track` (Flighty API, syncs all devices) | Read: offline; track: network + signed-in Flighty app |

Weekly update cron runs every Monday 6AM to refresh all CLIs.

## Decision Tree — Which Tool For What

### Verified Agent Patterns (Tested This Session)

These exact invocations produced clean, parseable JSON output:

```bash
# Hotel search by city + dates
hotel-goat-pp-cli hotels "<city>" YYYY-MM-DD YYYY-MM-DD --agent --select results.name,results.price_per_night,results.rating,results.booking_urls.primary

# trvl hotel search (use --format json)
trvl hotels "<city>" --checkin YYYY-MM-DD --checkout YYYY-MM-DD --guests 2 --format json

# Airbnb search (public SSR, no auth needed)
airbnb-pp-cli airbnb-listing search "<city>" --checkin YYYY-MM-DD --checkout YYYY-MM-DD --adults N --agent
```

### Hotel Research Methodology (Tested Workflow)

For thorough hotel research, run ALL of these and cross-reference:

1. **hotel-goat** on 3 separate locations (Carmel, Pacific Grove, Monterey) — each has different inventory
2. **trvl hotels** on the main destination with `--format json` for broader Google Hotels coverage
3. **Direct booking site** for top contenders — aggregate sites often show off-season rates. Peak summer pricing can be **2x** what aggregate sites report (verified: Horizon Inn showed $260-312 on Kayak but $520-570/night on their own booking system).
4. **Web search** for hotels that don't appear in Google Hotels (Green Gables, Hotel Carmel, Coachman's Inn were absent from hotel-goat results)

### Researching Specific Amenities (Hot Tubs, Views, Romantic Features)

The hotel-goat CLI returns pricing, ratings, and booking URLs but **does not surface amenity details** (hot tubs, ocean views, in-room jacuzzis, fireplaces). When the user asks about specific amenities, use this multi-phase workflow:

**Phase 1 — Get pricing via CLI (always start here)**
```bash
# Search the target location AND neighboring towns (inventory differs)
hotel-goat-pp-cli hotels "Carmel-by-the-Sea, CA" YYYY-MM-DD YYYY-MM-DD --agent --select results.name,results.price_per_night,results.rating,results.booking_urls.primary
hotel-goat-pp-cli hotels "Pacific Grove, CA" YYYY-MM-DD YYYY-MM-DD --agent --select results.name,results.price_per_night,results.rating,results.booking_urls.primary

# For specific named hotels, search by property name
hotel-goat-pp-cli hotels "Tally Ho Inn Carmel" YYYY-MM-DD YYYY-MM-DD --agent --select results.name,results.price_per_night,results.rating,results.booking_urls.primary
```

**Phase 2 — Check direct booking websites for amenity details**
- Use `web_extract` on the hotel's official website (booking URL from CLI)
- Look for: "amenities", "rooms", "services" pages specifically
- Search for: "hot tub", "spa tub", "whirlpool", "jacuzzi", "ocean view", "private balcony"

**Phase 3 — Web search for amenity confirmation**
- Search `"<hotel name>" hot tub` and `"<hotel name>" amenities`
- Cross-reference 3+ sources (hotel site, TripAdvisor, Booking.com, Google Hotels) — some listings are wrong
- Check for **conflicting information** (e.g., TravelWeekly says "Hot Tub" but Google Hotels says "No hot tub" — check the official amenity page to resolve)

**Phase 4 — Budget calculation**
- 3-night total = price_per_night × 3 (before taxes)
- Add ~15% for taxes/fees to get realistic total
- Flag hotels where pre-tax total alone exceeds budget

**Amenity types to distinguish:**
- **Shared hot tub**: outdoor spa on property, used by all guests (Tickle Pink Inn — Garden Spa Tub + Ocean Spa Tub)
- **Private in-room whirlpool tub**: jacuzzi tub inside the room/bathroom (Tally Ho Inn — every room; Green Gables Inn — select rooms)
- **No hot tub**: no whirlpool, spa tub, or jacuzzi on property (Seven Gables Inn, Carmel Green Lantern Inn)
- **Conflicting reports**: when sources disagree (Spindrift Inn lists hot tub on TravelWeekly but Google Hotels and official site don't confirm) — resolve via official amenity page

**Hotels that don't appear in Google Hotels:** Search individually by name. Some properties (Tickle Pink Inn, Green Gables Inn, Tally Ho Inn, The Hotel Carmel) may have no pricing data or appear with rating-only. When Google Hotels has no price, check the hotel's official website for rate ranges or use web search for "peak summer" pricing.

### Booking System Quirks (Discovered This Session)

- **Four Sisters Collection hotels** (Green Gables, Coachman's Inn): Their booking widget pre-fills dates but requires a full form submission to show prices. Cannot scrape availability programmatically via browser — call the hotel or use an OTA.
- **Hotel Carmel**: Booking system behind Imperva bot protection. Cannot access via browser automation.
- **Horizon Inn**: Uses rezStream booking engine. Direct availability search works via browser.
- **Airbnb-pp-cli `plan` command**: Returns empty results for smaller towns like Carmel. VRBO is temporarily disabled (Akamai). Not a reliable data source for non-major cities right now.

### Pitfalls
- **Peak season pricing can be 2x off-season estimates.** Always check direct booking systems for specific dates. Aggregate sites (Kayak, Momondo) cache off-season rates that are irrelevant for July-August stays.
- **trvl defaults to table format.** Always pass `--format json` for agent consumption. Without it the output is unparseable.
- **hotel-goat uses YYYY-MM-DD date positioning** (no `--checkin`/`--checkout` flags — just positional args): `hotel-goat-pp-cli hotels "<city>" 2026-07-30 2026-08-02`. trvl uses `--checkin`/`--checkout` flags.
- **hotel-goat `hotel show/reviews` subcommand does NOT accept `--checkin`/`--checkout` flags.** It uses property tokens only: `hotel-goat-pp-cli hotel show <property-token>`. Date flags cause exit code 2. Get the property-token from the `hotels` search output JSON.
- **hotel-goat --select paths must match actual response keys.** If you guess wrong, results come back empty. Start without `--select` to see the full key structure first.
- **Some hotels appear in Google Hotels with rating but NO price_per_night** (e.g., Tickle Pink Inn, Comfort Inn Carmel, Carmel Cottage Inn). This usually means Google lacks rate data rather than sold-out. Cross-check on the property's direct website or an OTA.
- **hotel-goat returns different inventory per location.** A hotel in Pacific Grove may appear when searching "Pacific Grove" but NOT when searching "Monterey". Always search all 3 locations when researching a multi-city area.
- **Extracting data from hotel-goat output without `--select`:** pipe through grep for just the fields you need: `grep -E '"name"|"price_per_night"|"rating"' | paste - - -`. The Trivago warning on stderr doesn't affect JSON parsing.
- **hotel-goat and trvl are Google Hotels scrapers** — they use Google's internal batchexecute protocol or SSR parsing. They may be rate-limited or blocked after many queries. Spread searches across both tools.

### Working Agent Patterns (Verified This Session)
These patterns produced clean, parseable output:
```
hotel-goat-pp-cli hotels "<city>" YYYY-MM-DD YYYY-MM-DD --agent --select results.name,results.price_per_night,results.rating,results.booking_urls.primary

trvl hotels "<city>" --checkin YYYY-MM-DD --checkout YYYY-MM-DD --guests 2 --format json
```

### Hotel Search
- **Need price comparison across providers?** → `trvl hotels "<city>" --checkin YYYY-MM-DD --checkout YYYY-MM-DD --format json`
- **Need filtered search (star rating, price cap)?** → `hotel-goat-pp-cli hotels "<city>" <date> <date> --agent --hotel-class 3-5 --max-price 300 --select results.name,results.price_per_night,results.rating`
- **Need Booking.com specific features?** → `booking-com-pp-cli search`
- **Last-minute deals?** → `hotel-tonight-pp-cli search`
- **Airbnb/VRBO with direct booking comparison?** → `airbnb-pp-cli airbnb-listing search "<city>" --checkin YYYY-MM-DD --checkout YYYY-MM-DD --adults N`

### Flight Search
- **Search flights** → `flight-goat-pp-cli flights <origin> <dest> <date> --agent`
- **Cheapest dates** → `flight-goat-pp-cli dates <origin> <dest> --from YYYY-MM-DD --to YYYY-MM-DD --agent`
- **Explore nonstop destinations** → `flight-goat-pp-cli explore <airport> --agent`
- **Multi-source (trvl)** → `trvl flights <origin> <dest> YYYY-MM-DD`

### Activity & Destination Planning
- **Things to do, hidden gems** → `atlas-obscura-pp-cli places search --query "<area>" --agent`
- **Road trip corridor routing** → `atlas-obscura-pp-cli route corridor "<city A>" "<city B>" --agent`
- **Local recommendations** → `wanderlust-goat-pp-cli search`
- **Tripadvisor reviews** → `tripadvisor-pp-cli locations search --search-query "<place>"`
- **Destination intel** → `trvl destination "<city>" --dates YYYY-MM-DD,YYYY-MM-DD`
- **Weather** → `trvl weather "<city>"`

## Venue & Attraction Research (Official Website Verification)

CLI tools like atlas-obscura and tripadvisor tell you *what exists*. When you need verified pricing, hours, reservation policies, and availability for a specific venue (spa, aquarium, tour, museum, park), go to the **official website directly**. Use this multi-phase workflow:

### Phase 1 — Gather Official Source Pages
`web_search` for venue name + terms like "pricing", "hours", "tickets", then `web_extract` from official pages (pricing page, FAQ, visitor info).

### Phase 2 — Cross-Reference Everything
Hours often differ between FAQ and the live booking system — the booking system is the operational source of truth. Pricing can be tiered: weekday vs weekend, golden-hour/twilight discounts, peak-summer vs shoulder. Always check the booking system for YOUR specific dates.

### Phase 3 — Navigate the Booking/Ticketing System
Use `browser_navigate` + `browser_snapshot` + `browser_click` to interact with the booking UI. If front-end links don't navigate in headless mode, use `browser_console` with `document.querySelector('a[href*="ticket"]')?.href` to discover the actual ticketing subdomain. Ticketing is often on `tickets.<venue>.org` or third-party providers (Zenoti for spas, Ticketmaster/Galaxy for museums).

### Phase 4 — Check Actual Availability
Date pickers show available dates in green/blue; greyed = sold out. FAQ phrase "Tickets now on sale through [date]" tells you the booking window. Spa/park timed-entry slots appear after selecting a date. Most systems show the calendar without requiring login.

### Phase 5 — Verify Reservation Policies
Confirm from FAQ/Terms: advance reservation required vs walk-in ok, cancellation window, last check-in/last entry time (often earlier than closing!), what's included in base admission, age restrictions, silence/phone policies.

### Phase 6 — Synthesize for User
Present as a scannable policy table + decision table comparing venues across trip days with booking urgency (Book NOW / advance rec'd / no rush).

### Pitfalls
- Hours on FAQ page often differ from the booking system — trust the booking system.
- Pricing on scrapers may be off-season. The booking system shows live rate for YOUR date.
- Summer weekend slots at popular venues sell out 1-3 weeks ahead — don't rely on walk-ins Jul-Aug.
- Some booking UIs require full JS that headless browsers can't execute. If "Loading..." hangs, check policies page or call venue.
- Some ticket portals redirect to login immediately — but the policy page usually states whether your dates are on sale.

### Price Tracking
- **Hotel price drops (Booking.com)** → `booking-com-pp-cli wishlist list` (after saving)
- **Airbnb price watch** → `airbnb-pp-cli watch add <url> --max-price N`
- **Flight price alerts** → `trvl watch flights <origin> <dest> --target N`

### Ground Transport (trvl)
- **Trains, buses, ferries** → `trvl ground "<origin>" "<dest>" --date YYYY-MM-DD`
- **Airport transfers** → `trvl airport-transfer "<airport>" "<hotel>"`

### Flight Tracking (Flighty macOS)

Read queries use local SQLite (offline). **Adding flights** uses `flights track` → Flighty private API → syncs to iPhone/watch. Do NOT write to SQLite directly.

- **Add a flight** → `pp-flighty-cli flights track CX660 --date 2026-07-21`
- **List tracked flights** → `pp-flighty-cli flights list`
- **Full flight detail** → `pp-flighty-cli flights get <flight-number>`
- **Active (non-archived) flights** → `pp-flighty-cli flights active`
- **Search flights by number/airport** → `pp-flighty-cli flights search "SFO"`
- **Layover/connections** → `pp-flighty-cli connections <flight-number>`
- **Airport lookup** → `pp-flighty-cli airports get SFO`
- **Flight tracking stats** → `pp-flighty-cli stats`
- **Check DB health** → `pp-flighty-cli doctor`

## Parth's Planning Style: Options Menu, Not One Itinerary

When planning for Parth, do NOT deliver a single fixed itinerary. He explicitly wants:
- **2-5 options per category** (hotels, activities, dinners) so he can pick and choose
- **3-5 day-by-day templates** (Plan A, B, C, D, E) with different vibes and budgets
- Modular thinking — each category is standalone; he composes the final weekend himself
- The decision-driving question goes last: one clear choice he needs to make before you start booking

Format: Present options in scannable tables or compact lists. Lead with price and what makes each option distinct.

Example structure:
```
## Hotel Options (Pick One)
| Option | Price/night | Hot tub | Vibe |
|--------|-------------|---------|------|
| Hotel A | $X | private | desc |

## Activity Options (Pick 1-2)
...

## Dinner Options (Pick 1-2)
...

## Schedule Templates (Pick One)
### Plan A — "[Name]" (Budget: $X)
Day-by-day timeline...
```

## Surprise Trip Planning: Emotional Centerpiece

For ANY surprise trip Parth plans (especially for Richa), include an emotional centerpiece — this is what makes the trip memorable, not the hotel or activities.

### Video Clips
- Prompt: "What is one specific strength in [name] that [they] should remember and believe in?"
- 6-8 people, 10-15 seconds each on their phone
- Parth records own 30-45 sec clip separately (specific, present-tense, not generic)
- Start collecting 10+ days before trip, finalize 3-4 days before

### Handwritten Letter (One Page, 3 Sections)
1. Three specific things noticed recently (not generic — "I saw you X" not "you work hard")
2. One concrete commitment during the stressful period (e.g. "Sunday 6-8PM is no-job-talk time")
3. One thing excited to build together in next 12 months unrelated to job/wedding

### Timing
- Give on the special evening (night 1 or night 2), after dinner, back at room
- Phones face-down. No watching their reaction anxiously — just be present.
- Do NOT give at arrival or in a restaurant.

### Group Discretion
If the surprise-ee (Richa) is in the same WhatsApp group where planning happens, stay vague or move detailed planning to private DMs. Do NOT spoil the surprise in the group.

## Parallel Research Pattern for Complex Trips

For multi-day trips with 3+ workstreams (hotels, activities, dining, emotional), use delegate_task with parallel sub-agents:

1. **Hotels** — CLI pricing + direct booking site checks. Run hotel-goat on 3 locations.
2. **Activities + Dining** — verify pricing on provider websites, check chicken-friendly menus (Richa only eats chicken, no other meat), check OpenTable availability
3. **Emotional Centerpiece** — video script, letter framework, timeline, calendar verification

Max 3 concurrent sub-agents. Each returns structured data. You synthesize into the options menu format.

## Common Trip Planning Workflow

```
Phase 1: Destination Intel
  trvl destination "<city>" --dates <range>

Phase 2: Hotel Search (compare 2-3 sources)
  trvl hotels "<city>" --checkin <date> --checkout <date> --stars 3 --format json
  hotel-goat-pp-cli hotels "<city>" <checkin> <checkout> --max-price 300 --agent

Phase 3: Activities & Hidden Gems
  atlas-obscura-pp-cli places search --query "<area> points of interest" --agent
  trvl events "<city>" --dates <range>

Phase 4: Fine-tune & Save
  hotel-goat-pp-cli wishlist add <property-token>
  airbnb-pp-cli watch add <url> --max-price N

Phase 5: Weather Check (48h before)
  trvl weather "<city>"
```

## Monterey/Carmel Quick Reference

This setup was built for Parth's surprise trip Jul 30 - Aug 2.

### Hotel Comparison
```bash
# trvl: check all providers
trvl hotels "Monterey California" --checkin 2026-07-30 --checkout 2026-08-01 --stars 3 --format json

# hotel-goat: specific filters
hotel-goat-pp-cli hotels "Carmel-by-the-Sea" 2026-07-30 2026-08-01 --max-price 400 --agent

# Direct booking check
airbnb-pp-cli cheapest '<airbnb-or-vrbo-url>' --checkin 2026-07-30 --checkout 2026-08-01
```

### Activities
```bash
# Hidden gems near Monterey
atlas-obscura-pp-cli places search --query "Monterey Bay hidden gems" --agent

# Destination intel
trvl destination "Monterey" --dates 2026-07-30,2026-08-02
```

### Weather Check (48h before departure)
```bash
trvl weather "Monterey"
```

## Tool-Specific Skills

Each CLI has its own `pp-*` skill with full command reference. Load them directly for detailed usage:
- `pp-hotel-goat` — Google Hotels search + wishlist
- `pp-airbnb` — Airbnb/VRBO host-direct arbitrage
- `pp-booking-com` — Booking.com price history + alerts
- `pp-wanderlust-goat` — Local recommendations
- `pp-tripadvisor` — Tripadvisor content API
- `pp-atlas-obscura` — Hidden gems + road trip corridor routing
- `pp-hotel-tonight` — Last-minute hotel deals

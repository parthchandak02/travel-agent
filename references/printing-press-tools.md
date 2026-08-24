# Printing Press Travel Tools

Full tool matrix for the travel-agent skill. Install missing CLIs:

```bash
npx -y @mvanhorn/printing-press-library install <name> --cli-only
# or batch:
bash ~/.hermes/skills/travel/travel-agent/scripts/install-deps.sh
```

Browse catalog: https://printingpress.dev/library/travel

## Tier 1 — use on every multi-option trip

| CLI | Skill | Use in workflow |
|-----|-------|-----------------|
| `hotel-goat-pp-cli` | `pp-hotel-goat` | Primary lodging search; per-OTA price breakdown |
| `trvl` | — | Hotels (JSON), weather, destination intel, ground transport |
| `airbnb-pp-cli` | `pp-airbnb` | Vacation rentals; filter `primary_line` for **2+ beds** |
| `booking-com-pp-cli` | `pp-booking-com` | Booking.com inventory + `hotels get` reviews/amenities |
| `tripadvisor-pp-cli` | `pp-tripadvisor` | Attraction reviews, ratings, location search |
| `alltrails-pp-cli` | `pp-alltrails` | Trail distance, difficulty, rating, conditions |
| `wanderlust-goat-pp-cli` | `pp-wanderlust-goat` | Dinner, coffee, local picks near base town |
| `atlas-obscura-pp-cli` | `pp-atlas-obscura` | Hidden gems, corridor routing between towns |

## Tier 2 — situational

| CLI | When to use |
|-----|-------------|
| `hotelist-pp-cli` | Rating-per-dollar ranking when hotel-goat returns too many options |
| `hotel-tonight-pp-cli` | Last-minute Labor Day gaps |
| `flight-goat-pp-cli` | Fly-in legs (not typical for NorCal road trips) |
| `roadside-america-pp-cli` | Quirky stops on Monday scenic drives |
| `travelclick-pp-cli` | Direct hotel CRS rates when property uses TravelClick |
| `wanderlog-pp-cli` | Import shared Wanderlog plans as starting seeds |

## Lodging filter (3 adults: Parth + fiancée + sister)

**Hard:** sleeps 3 · **minimum 2 beds** · **preferred 2 bedrooms**

```bash
# Airbnb — inspect primary_line for bed count
airbnb-pp-cli airbnb-listing search "<base>" --checkin YYYY-MM-DD --checkout YYYY-MM-DD --adults 3 --agent \
  --select results.title,results.primary_line,results.per_night_price,results.url,results.avg_rating_localized

# hotel-goat — then verify room config on direct booking site
hotel-goat-pp-cli hotels "<base>" YYYY-MM-DD YYYY-MM-DD --agent \
  --select results.name,results.price_per_night,results.rating,results.booking_urls.primary

# booking-com — full detail with amenities
booking-com-pp-cli hotels list --query "<base>" --checkin YYYY-MM-DD --checkout YYYY-MM-DD --adults 3 --json \
  --select '[].name,[].price,[].review_score,[].url'
```

Score lodging: `green` = 2BR+2bed, `yellow` = 2 beds / 1BR suite, `red` = 1 bed or sleeps <3.

## Per research phase — CLI commands

### Phase A: Trail / activity validation

```bash
alltrails-pp-cli alltrails list "<trail name>" --agent --select results.name,results.rating,results.length,results.difficulty,results.url
tripadvisor-pp-cli locations search --search-query "<trail or park>" --agent
atlas-obscura-pp-cli places search --query "<area> hiking swimming" --agent
trvl destination "<base town>" --dates YYYY-MM-DD,YYYY-MM-DD
```

### Phase B: Lodging (run all three sources per base town)

```bash
hotel-goat-pp-cli hotels "<town>" CHECKIN CHECKOUT --agent
trvl hotels "<town>" --checkin CHECKIN --checkout CHECKOUT --guests 3 --format json
airbnb-pp-cli airbnb-listing search "<town>" --checkin CHECKIN --checkout CHECKOUT --adults 3 --agent
booking-com-pp-cli hotels list --query "<town>" --checkin CHECKIN --checkout CHECKOUT --adults 3 --json
```

For small mountain towns, also search **neighboring bases** (e.g. Quincy when staying Bucks Lake).

### Phase C: Food & town backup

```bash
wanderlust-goat-pp-cli near "<base town>" --criteria "best dinner after hiking, not tourist trap" --minutes 20 --agent
wanderlust-goat-pp-cli near "<base town>" --criteria "grocery store" --minutes 15 --agent
```

### Phase D: Reviews cross-check

```bash
tripadvisor-pp-cli locations search --search-query "<lodging name>" --agent
# Web search: site:reddit.com "<trail name>" labor day parking
```

### Phase E: Drive / corridor (Monday scenic routes)

```bash
atlas-obscura-pp-cli route corridor "<origin city>" "<destination>" --agent
trvl ground "<origin>" "<dest>" --date YYYY-MM-DD
```

## Install status check

```bash
for c in hotel-goat-pp-cli trvl airbnb-pp-cli booking-com-pp-cli tripadvisor-pp-cli \
  alltrails-pp-cli wanderlust-goat-pp-cli atlas-obscura-pp-cli hotel-tonight-pp-cli hotelist-pp-cli; do
  command -v "$c" >/dev/null && echo "✓ $c" || echo "✗ $c (install via printing-press)"
done
```

## Credentials

See main `SKILL.md` Quick Start. Only TripAdvisor API key is required for tier-1 review search; everything else works keyless for public reads.

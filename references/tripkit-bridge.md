# TripKit Bridge

After the user picks one option from the trip explorer, convert the chosen `day_plans` entry into TripKit YAML for the interactive map renderer.

## When to use

- User says "let's do Option 5, Plan A"
- Need shareable single-trip map with day-colored routes
- Post-booking iteration (swap lodging, move hike day)

## Workflow

```bash
# 1. Write YAML from chosen plan (agent generates)
# 2. Validate + render
npx tripkit validate ~/Documents/Research/travel/{slug}/trip.yaml
npx tripkit ~/Documents/Research/travel/{slug}/trip.yaml ~/Documents/Research/travel/{slug}/trip-map.html
```

TripKit skill installed at:
- `~/.claude/skills/tripkit/`
- `~/.hermes/skills/travel/tripkit/`

## Mapping trip-explorer → TripKit

| trip-explorer | TripKit YAML |
|---------------|--------------|
| `meta.title` | `trip.title` |
| `meta.dates` | `trip.dates` |
| `meta.origin` + lat/lng | `trip.origin`, `trip.origin_lat/lng` |
| `day_plans[].days[]` | `days[]` |
| `activities[]` matched to day | `days[].stops[]` |
| `lodging[rank=1]` | `days[].lodging` |
| `activity.type` | `stops[].type` (hike/scenic/food/beach/activity) |
| `activity.image` | `stops[].image` |
| `activity.maps_url` | `stops[].navigate_url` |

## Day colors (defaults)

```yaml
# Day 1: #2e7db5  Day 2: #1b5e3b  Day 3: #c44b25  Day 4: #5b44b0
```

## Rules from TripKit skill

- Include `origin_lat`/`origin_lng` always
- One big hike per day max
- Day 1 light after long Friday drive
- Never fabricate confirmation numbers
- Run `tripkit validate` before render

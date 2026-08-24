# Trip Explorer — Design & Render Guide

Agents: follow this when building or polishing the HTML trip explorer.

**Design read:** Editorial travel comparison for a friend group — calm, magazine-style itinerary, forest green accent on warm stone. Not a bordered admin panel.

## UX flow (2-step decision)

1. **Step 1 — Destination** — Compare mode (default): photo cards + 3-column compare table. User picks among 3 destinations.
2. **Step 2 — Itinerary** — Weekend/detail mode: plan picker cards (A/B/C) with day-title chips, then editorial day articles for the selected plan only.
3. **Lodging is tertiary** — collapsed `<details>` after itinerary; top 2 stays visible, rest under “more stays”.

### Navigation model

| Element | Role |
|---------|------|
| **Sticky chrome bar** | Destination chips (short names: Bucks Lake, Downieville, Nevada City) — always visible after hero. Never trap user in one option. |
| **Compare mode** | Default. Photo cards + compare table + group message under table. |
| **Weekend mode** | Tap card, chip, or table row/column → one destination detail. Compare section hides. Switch destinations via chrome chips — no “back” button. |
| **Mobile dock** | Fixed bottom: “Compare” + “Trip map” (from `meta.trip_map_url`). Trip map link removed from hero. |
| **Hash routing** | `#compare`, `#opt-5`, `#opt-5/plan-b` — parsed on load and synced on navigation. |

### State

```js
{ mode: 'compare' | 'weekend', optionId, planId }
```

### Helper functions (template)

- `shortName(o)` — chip label from `base_towns[0]`
- `bestStay(o)` — cheapest lodging with `total_3_nights`
- `compareTable()` — Best for, Fri drive, Mon drive, crowd risk, Stay from, The catch
- `renderPlanCards(o, planId)` — 3 plan cards with day-title chips
- `renderDay()` — editorial day article
- `renderLodgingCollapsed(o)` — top 2 + more stays in `<details>`

### Detail section order

1. Plan picker cards (Step 2)
2. Editorial day articles (selected plan only)
3. Lodging (collapsed, tertiary)
4. Map & photos (collapsed `<details>`)
5. Reviews, Before you go, Activity reference (collapsed)
6. Inline stats + strengths/tradeoffs (footer of detail)

## Visual principles

1. **Borderless maturity** — whitespace, hairline dividers, soft shadows. No card-outline soup.
2. **Photos** — option cards, gallery strip, full-width day mastheads (16:9), small activity thumbs in collapsed reference.
3. **Self-contained** — single `index.html`; DM Sans + Instrument Serif; no build step.

## Day itinerary pattern (required)

Each `day_plans[].days[]` renders as an editorial day article:

```
Day 3                    ← accent kicker (sans, uppercase)
Saturday, Sep 5          ← serif headline
2 stops · ~1.5 hr driving ← muted summary (auto-computed)

[──────── 16:9 masthead image ────────]

9:00 AM    Feather Falls           ← time column + serif block title
           8.5 mi waterfall hike     ← sans body
           Drive · 45 min · On site · 5–6 hr · Parking · Trailhead by 7 AM
           Official site · Directions
           If this fills              ← 2px left accent rule (not “Plan B”)
           Shorter Bucks Lake walk
```

**Plan picker:** 3 cards with day-title chips (not underline tabs). Empty plans show vibe + “still being researched” message.

**Multiple blocks per day:** ordered `<ol class="schedule">` with hairline separators between blocks.

## Compare table rows

| Row | Source |
|-----|--------|
| Best for | `strengths[0]` or `tagline` |
| Fri drive | `drive_friday.hours` |
| Mon drive | `drive_monday.hours` |
| Crowd risk | `labor_day_risk` + note |
| Stay from | `bestStay(o)` total + name |
| The catch | `tradeoffs[0]` or risk note |

## Visual tokens

| Token | Value |
|-------|-------|
| Background | `#f0ede6` |
| Surface | `#ffffff` |
| Accent | `#1b5e3b` (links + active states — one accent only) |
| Hairline | `rgba(26,26,24,.08)` |
| Spacing | 8 / 16 / 24 / 40 / 64 px scale |
| Headlines | Instrument Serif |
| Body | DM Sans |

## CSS to avoid

- Bordered stat cards, activity 2-col card grids, dashed lodging outlines
- Green left-border timeline rails, emoji logistics rows
- Bordered alert boxes for backup blocks
- Pill/tab borders for plan variants
- Duplicate navigation (back buttons, hero trip-map link)
- Status communicated via border color instead of typography

## Image enrichment

`enrich-images.mjs` keys must match option `id` (`opt-5`, not `opt5`). Day images come from `day.image` or first block match.

## Render pipeline

```bash
node scripts/render-trip-explorer.js path/to/trip-explorer.json path/to/index.html
python3 -m http.server 5199 --directory path/to/trip-dir   # preview
bash scripts/publish-trip-explorer.sh path/to/trip-dir      # → travel.parthchandak.info
```

## Deploy

`bash scripts/publish-trip-explorer.sh <trip-dir>` → Cloudflare Pages project `travel` → `https://travel.parthchandak.info` (no auth).

Requires Cloudflare credentials in the Hermes secrets file.

## Agent QA checklist

Before publish, verify each section:

- [ ] Sticky chrome chips visible after hero; active chip in weekend mode
- [ ] Compare mode: cards + table + group message; detail hidden
- [ ] Weekend mode: compare hidden; plan cards before itinerary; chrome switches destinations
- [ ] Hash `#compare`, `#opt-5`, `#opt-5/plan-b` work on load and navigation
- [ ] Mobile dock: Compare + Trip map (hero has no map link)
- [ ] Backup blocks labeled “If this fills” (not “Plan B”)
- [ ] Lodging collapsed; top 2 + more stays
- [ ] Each day has masthead image when `day.image` set
- [ ] Plan A has full days; B/C show vibe or placeholder if empty
- [ ] Activities/reviews/map in collapsed `<details>` sections

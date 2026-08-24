# Trip Explorer — Design & Render Guide

Agents: follow this when building or polishing the HTML trip explorer.

**Design read:** Editorial travel comparison for a friend group — calm, magazine-style itinerary, forest green accent on warm stone. Not a bordered admin panel.

## UX principles

1. **One navigation** — photo option cards only. No sticky nav, no duplicate heroes.
2. **Itinerary is the hero** — day-by-day schedule is the centerpiece inside each option. Lodging before itinerary (book urgency); activities collapsed below as reference.
3. **Borderless maturity** — use whitespace, hairline dividers, and soft shadows. No card-outline soup, no emoji meta rows, no left-rail alert boxes.
4. **Photos** — option cards, gallery strip, full-width day mastheads (16:9), small activity thumbs in collapsed reference.
5. **Self-contained** — single `index.html`; DM Sans + Instrument Serif; no build step.

## Render pipeline

```bash
node scripts/render-trip-explorer.js path/to/trip-explorer.json path/to/index.html
python3 -m http.server 5199 --directory path/to/trip-dir   # preview
bash scripts/publish-trip-explorer.sh path/to/trip-dir      # → travel.parthchandak.info
```

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
           Plan B                    ← 2px left accent rule, not bordered alert
           Shorter Bucks Lake walk
```

**Plan switcher:** uppercase underline tabs (not bordered pills). Empty plans show vibe + “still being researched” message.

**Multiple blocks per day:** ordered `<ol class="schedule">` with hairline separators between blocks.

## Section order (per option detail)

1. Gallery strip
2. Inline stats row (no boxes)
3. Strengths / tradeoffs
4. Map (shadow, no border)
5. **Lodging** (ranked list, CTA buttons)
6. **Itinerary** (plan tabs + day articles) ← primary content
7. Activities (`<details>` collapsed when itinerary exists)
8. Reviews (serif pull quotes, no left border)
9. Before you go (soft warn surface, no left rail)

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
- Green left-border timeline rails, emoji logistics rows (🚗⏱🅿️)
- Bordered alert boxes for Plan B
- Pill/tab borders for plan variants
- Status communicated via border color instead of typography

## Image enrichment

`enrich-images.mjs` keys must match option `id` (`opt-5`, not `opt5`). Day images come from `day.image` or first block match.

## Deploy

`bash scripts/publish-trip-explorer.sh <trip-dir>` → Cloudflare Pages project `travel` → `https://travel.parthchandak.info` (no auth).

Requires Cloudflare credentials in the Hermes secrets file.

## Agent QA checklist

Before publish, verify each section:

- [ ] Option cards: active = bottom accent bar + shadow, not 3px ring
- [ ] Each day has masthead image when `day.image` set
- [ ] Plan A has full days; B/C show vibe or placeholder if empty
- [ ] Lodging shows bed fit line for every row
- [ ] Activities collapsed when itinerary populated
- [ ] No duplicate navigation elements

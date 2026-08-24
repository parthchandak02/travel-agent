# Trip Explorer — Design & Render Guide

Agents: follow this when building or polishing the HTML trip explorer.

## UX principles

1. **One navigation pattern** — large photo cards at the top. No duplicate sticky nav or second hero banners.
2. **Overview → detail** — landing shows all options; tap a card to drill in; "← All options" returns.
3. **Photos everywhere** — hero card, gallery strip, activity cards, lodging thumbs, day thumbnails.
4. **No clutter** — skip pills, score tables, and redundant badges. Show urgency once in the header.
5. **Self-contained** — single `index.html`; fonts/CDN only; no build step.

## Render pipeline

```bash
# 1. Research → trip-explorer.json (see trip-explorer-schema.md)
# 2. Enrich images (auto-runs on render; or manual):
node scripts/enrich-images.mjs path/to/trip-explorer.json

# 3. Render HTML
node scripts/render-trip-explorer.js path/to/trip-explorer.json path/to/index.html

# 4. Preview locally
python3 -m http.server 5199 --directory path/to/trip-dir

# 5. Deploy (Cloudflare Pages → travel.parthchandak.info)
bash scripts/publish-trip-explorer.sh path/to/trip-dir
```

## Image enrichment

`enrich-images.mjs` keys must match option `id` exactly (e.g. `opt-5`, not `opt5`).

Add curated URLs per trip in the `IMG` map:
- `hero` + `hero_credit` + `gallery[]` per option
- `acts` — substring match on activity names
- `lodge` — default lodging thumbnail

Prefer official tourism og:images, parks.ca.gov, MyHikes, waterfallhikes R2. Verify URLs return 200.

## Visual system

| Token | Value |
|-------|-------|
| Background | `#f0ede6` warm stone |
| Accent | `#1b5e3b` forest green |
| Serif headlines | Instrument Serif |
| Body | DM Sans |
| Cards | white, 14px radius, subtle border |

## Section order (per option detail)

1. Gallery strip
2. Drive / score stats (3 columns)
3. Strengths + tradeoffs (one line each)
4. Map (Leaflet, activity pins)
5. Activities (photo cards, 2-col grid)
6. Lodging (thumb + price + book link)
7. Day plans (tabs A/B/C)
8. Reviews (if any)
9. Holiday reality check

## Deploy

Static site only — no auth. Uses `~/.hermes/bin/deploy-cf-pages.sh` with project name `travel` → `travel.parthchandak.info`.

Requires Cloudflare credentials in the Hermes secrets file (see workspace gitguardian rule).

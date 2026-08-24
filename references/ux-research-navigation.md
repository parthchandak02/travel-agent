# UX Research — Trip Explorer Navigation (Aug 2026)

## Subagents run

| Agent | Model | Status |
|-------|-------|--------|
| Product designer | **Grok 4.6** (cursor-grok-4.6-high-fast) | ✅ Full spec returned |
| UX architect | **Claude Opus 4.8 Thinking** | ❌ Requires Perplexity Max tier (account is Pro) |
| UX architect (fallback) | Claude Sonnet 4.6 Thinking | See below |

## Grok 4.6 — core diagnosis

The page is a **beautiful article you fall into**, not a **2-axis decision tool** (place × weekend plan).

1. Tapping a card **erases the other two options** — trap door UX
2. **Lodging before itinerary** — wrong question order (7 rows before Plan A/B/C)
3. **9 combinations** (3×3) with no matrix — memory load
4. Plan tabs buried below map + hotels
5. `Plan B` backup label collides with Plan B tab name

## Grok — recommended architecture

```
PICK A PLACE  →  PICK A WEEKEND  →  details (lodging, map, reviews)
compare strip     plan A/B/C cards     collapsed by default
```

### Top 5 implementation changes (ranked)

1. **Stop hiding the chooser** — persistent destination switcher chips; hash `#opt-5`
2. **Itinerary before lodging** — plan cards + day articles first; lodging top 2 in `<details>`
3. **Compare strip** under photo cards — Best for, Fri/Mon drive, crowd risk, stay from, catch
4. **Plan A/B/C as weekend cards** — 4 day-title chips each, then expand selected plan
5. **Sticky chrome + mobile bottom bar** — `Compare places` · `Use this weekend`

## JSON schema additions (for agents)

```json
{
  "options": [{
    "compare_one_liner": "Lake + 410-ft waterfall",
    "day_plans": [{
      "summary_chips": ["Fri arrive", "Sat lake", "Sun hike", "Mon canyon"],
      "recommended": true
    }]
  }]
}
```

## Design doc overrides

Retire rules: "photo cards only, no sticky nav" and "lodging before itinerary."

New rules: **persistent switcher**, **plan choice → days → lodging**.

# travel-agent

**Goal:** Help a group decide *where* to go and *how* to spend their dates — in under 15 minutes of reading. See `GOAL.md`.

End-to-end multi-option trip planner for Cursor / Hermes agents.

## Quick start (orchestrator agent)

1. Read `references/intake-gate.md` — confirm spec with user
2. Parallel research per `references/parallel-research-protocol.md`
3. Merge → `trip-explorer.json`
4. `bash scripts/run-trip.sh ~/Documents/Research/travel/{trip-slug}/`

Live example: https://travel.parthchandak.info

## One command (after JSON exists)

```bash
bash scripts/run-trip.sh ~/Documents/Research/travel/my-trip/
# validate → render → tripkit map → publish to travel.parthchandak.info

bash scripts/run-trip.sh ~/Documents/Research/travel/my-trip/ --no-publish
# local only
```

## Validate only

```bash
node scripts/validate-trip-explorer.js trip-explorer.json
```

## Install

```bash
git clone https://github.com/parthchandak02/travel-agent.git
cp -r travel-agent ~/.hermes/skills/travel/travel-agent
cp -r travel-agent ~/.cursor/skills/travel-agent
bash ~/.hermes/skills/travel/travel-agent/scripts/install-deps.sh
```

## Structure

```
GOAL.md                               # Product north star
SKILL.md                              # Orchestration + CLI docs
references/
  product-goal.md                     # Full vision + handoff prompt
  intake-gate.md                      # Phase 0 — confirm before research
  parallel-research-protocol.md
  trip-explorer-schema.md
  trip-explorer-design.md
  competitive-landscape.md
scripts/
  run-trip.sh                         # validate → render → publish
  validate-trip-explorer.js
  render-trip-explorer.js
  publish-trip-explorer.sh
  json-to-tripkit.js
  fill-day-plans.mjs
  enrich-images.mjs
assets/trip-explorer-template.html
```

## Per-trip folder

```
~/Documents/Research/travel/{slug}/
  trip-spec.md          # confirmed intake
  trip-explorer.json
  index.html
  trip-map.html
```

## License

Apache-2.0

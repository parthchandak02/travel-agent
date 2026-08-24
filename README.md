# travel-agent

End-to-end multi-option trip planner for Cursor / Hermes agents.

Combines **Printing Press** travel CLIs, **parallel subagent research**, and a self-contained **HTML trip explorer** — plus TripKit map rendering after you pick an option.

## Features

- Compare 2–5 destination options side-by-side
- Parallel subagent protocol (one researcher per option)
- 3 day-plan variants per option (A/B/C)
- Lodging search across hotel-goat, trvl, Airbnb, Booking.com
- Trail validation via AllTrails + TripAdvisor
- Labor Day parking / reservation reality checks
- Renders `index.html` trip explorer; TripKit map for final itinerary

## Install

```bash
git clone https://github.com/parthchandak02/travel-agent.git
# Hermes
cp -r travel-agent ~/.hermes/skills/travel/travel-agent
# Cursor
cp -r travel-agent ~/.cursor/skills/travel-agent

bash ~/.hermes/skills/travel/travel-agent/scripts/install-deps.sh
```

Printing Press CLIs (tier 1):

```bash
npx -y @mvanhorn/printing-press-library install hotel-goat --cli-only
npx -y @mvanhorn/printing-press-library install airbnb --cli-only
npx -y @mvanhorn/printing-press-library install booking-com --cli-only
npx -y @mvanhorn/printing-press-library install tripadvisor --cli-only
npx -y @mvanhorn/printing-press-library install alltrails --cli-only
npx -y @mvanhorn/printing-press-library install wanderlust-goat --cli-only
npx -y @mvanhorn/printing-press-library install atlas-obscura --cli-only
```

## Quick test

```bash
node scripts/test-workflow.js ~/Documents/Research/travel/labor-day-sierra-2026
python3 -m http.server 5199 --directory ~/Documents/Research/travel/labor-day-sierra-2026
# open http://localhost:5199/index.html
```

## Structure

```
SKILL.md                              # Main orchestration + CLI docs
references/
  parallel-research-protocol.md       # Subagent prompts
  trip-explorer-schema.md             # JSON contract
  printing-press-tools.md             # PP CLI matrix
  tripkit-bridge.md                   # Single-option map export
assets/trip-explorer-template.html
scripts/
  render-trip-explorer.js
  test-workflow.js
  install-deps.sh
```

## Lodging defaults

3 adults → minimum **2 beds**, **2 bedrooms preferred**.

## License

Apache-2.0 (Printing Press CLIs have their own licenses)

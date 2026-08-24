#!/usr/bin/env bash
# Install travel-agent dependencies: TripKit CLI + Windward
set -euo pipefail

echo "→ TripKit (npx, no global install needed)"
command -v node >/dev/null || { echo "Node.js required for TripKit render"; exit 1; }

TRIPKIT_DIR="${HOME}/projects/travel-skills-study/tripkit"
if [[ ! -d "$TRIPKIT_DIR" ]]; then
  mkdir -p "$(dirname "$TRIPKIT_DIR")"
  git clone --depth 1 https://github.com/piti/tripkit.git "$TRIPKIT_DIR"
  (cd "$TRIPKIT_DIR" && npm install --silent)
fi

echo "→ TripKit agent skill"
mkdir -p "${HOME}/.hermes/skills/travel/tripkit" "${HOME}/.cursor/skills/tripkit"
cp -f "$TRIPKIT_DIR/agent/SKILL.md" "${HOME}/.hermes/skills/travel/tripkit/"
cp -f "$TRIPKIT_DIR/agent/questionnaire.yaml" "${HOME}/.hermes/skills/travel/tripkit/" 2>/dev/null || true
cp -f "$TRIPKIT_DIR/agent/SKILL.md" "${HOME}/.cursor/skills/tripkit/" 2>/dev/null || true
(cd "$TRIPKIT_DIR" && node convert.js install-skill 2>/dev/null || true)

echo "→ Windward (multi-destination flight planner + HTML viewer)"
if command -v pip3 >/dev/null; then
  pip3 install -q "${HOME}/projects/travel-skills-study/wayfarer" 2>/dev/null || \
    pip3 install -q "git+https://github.com/sohan-shingade/wayfarer.git"
fi

echo "✓ travel-agent stack ready"
echo "  Render: node ~/.hermes/skills/travel/travel-agent/scripts/render-trip-explorer.js trip.json out.html"
echo "  Map:    npx tripkit trip.yaml trip.html"
echo "  Flights: windward \"vacation for 3, budget 3k, labor day weekend, hiking and lakes\""

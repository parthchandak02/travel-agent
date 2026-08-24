#!/usr/bin/env bash
# Render trip-explorer.json → index.html and deploy to travel.parthchandak.info
# Usage: publish-trip-explorer.sh <trip-dir-or-json>
# Example: publish-trip-explorer.sh ~/Documents/Research/travel/labor-day-sierra-2026

set -euo pipefail

INPUT="${1:?Usage: publish-trip-explorer.sh <trip-dir-or-json>}"
SKILL_DIR="$(cd "$(dirname "$0")/.." && pwd)"

if [[ -d "$INPUT" ]]; then
  JSON="$INPUT/trip-explorer.json"
  OUT="$INPUT/index.html"
else
  JSON="$INPUT"
  OUT="$(dirname "$JSON")/index.html"
fi

[[ -f "$JSON" ]] || { echo "ERROR: missing $JSON" >&2; exit 1; }

echo "==> Render"
node "$SKILL_DIR/scripts/render-trip-explorer.js" "$JSON" "$OUT"

TRIP_DIR="$(dirname "$OUT")"
YAML="$TRIP_DIR/trip.yaml"
MAP="$TRIP_DIR/trip-map.html"

echo "==> TripKit map (recommended option)"
node "$SKILL_DIR/scripts/json-to-tripkit.js" "$JSON" "$YAML" || true
if [[ -f "$YAML" ]] && command -v npx >/dev/null; then
  npx tripkit validate "$YAML" 2>/dev/null || echo "WARN: tripkit validate skipped"
  npx tripkit "$YAML" "$MAP" 2>/dev/null || echo "WARN: tripkit render skipped — install: npm i -g tripkit"
fi

echo "==> Deploy to travel.parthchandak.info"
DEPLOY_DIR="$TRIP_DIR"
"$HOME/.hermes/bin/deploy-cf-pages.sh" travel "$DEPLOY_DIR"

echo ""
echo "Live: https://travel.parthchandak.info"

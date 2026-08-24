#!/usr/bin/env bash
# End-to-end trip pipeline: validate → render → tripkit → publish
# Usage: run-trip.sh <trip-dir> [--no-publish]
#
# Expects: trip-dir/trip-explorer.json
# Optional: trip-dir/trip-spec.md (intake confirmation)

set -euo pipefail

TRIP_DIR="${1:?Usage: run-trip.sh <trip-dir> [--no-publish]}"
NO_PUBLISH=false
[[ "${2:-}" == "--no-publish" ]] && NO_PUBLISH=true

SKILL_DIR="$(cd "$(dirname "$0")/.." && pwd)"
JSON="$TRIP_DIR/trip-explorer.json"

[[ -f "$JSON" ]] || { echo "ERROR: missing $JSON" >&2; exit 1; }

echo "==> Phase: Validate"
node "$SKILL_DIR/scripts/validate-trip-explorer.js" "$JSON"

echo "==> Phase: Render HTML"
node "$SKILL_DIR/scripts/render-trip-explorer.js" "$JSON" "$TRIP_DIR/index.html"

YAML="$TRIP_DIR/trip.yaml"
MAP="$TRIP_DIR/trip-map.html"
echo "==> Phase: TripKit (recommended option)"
node "$SKILL_DIR/scripts/json-to-tripkit.js" "$JSON" "$YAML" || true
if [[ -f "$YAML" ]] && command -v npx >/dev/null 2>&1; then
  npx -y tripkit validate "$YAML" 2>/dev/null || echo "WARN: tripkit validate skipped"
  npx -y tripkit "$YAML" "$MAP" 2>/dev/null || echo "WARN: tripkit render skipped"
fi

if [[ "$NO_PUBLISH" == true ]]; then
  echo "==> Skipping publish (--no-publish)"
  echo "Local: file://$TRIP_DIR/index.html"
  exit 0
fi

echo "==> Phase: Publish"
"$SKILL_DIR/scripts/publish-trip-explorer.sh" "$TRIP_DIR"

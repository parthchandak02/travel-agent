#!/usr/bin/env bash
# Render trip-explorer.json → index.html (+ TripKit map) and deploy the trip folder.
# Usage: publish-trip-explorer.sh <trip-dir-or-json>
#
# Deploy target comes from the environment or a git-ignored .env.local at the skill root
# (see .env.example):
#   TRAVEL_DEPLOY_CMD      custom deploy command, called as: $TRAVEL_DEPLOY_CMD <project> <dir>
#   TRAVEL_DEPLOY_PROJECT  Cloudflare Pages project name (default: travel)
#   TRAVEL_DEPLOY_URL      public URL to print after deploy (optional)
# Without TRAVEL_DEPLOY_CMD it runs: npx wrangler pages deploy <dir> --project-name <project>

set -euo pipefail

INPUT="${1:?Usage: publish-trip-explorer.sh <trip-dir-or-json>}"
SKILL_DIR="$(cd "$(dirname "$0")/.." && pwd)"

# Values already set in the environment win over .env.local
_cmd="${TRAVEL_DEPLOY_CMD:-}"; _proj="${TRAVEL_DEPLOY_PROJECT:-}"; _url="${TRAVEL_DEPLOY_URL:-}"
if [[ -f "$SKILL_DIR/.env.local" ]]; then
  # shellcheck disable=SC1091
  source "$SKILL_DIR/.env.local"
fi
TRAVEL_DEPLOY_CMD="${_cmd:-${TRAVEL_DEPLOY_CMD:-}}"
TRAVEL_DEPLOY_PROJECT="${_proj:-${TRAVEL_DEPLOY_PROJECT:-}}"
TRAVEL_DEPLOY_URL="${_url:-${TRAVEL_DEPLOY_URL:-}}"
DEPLOY_PROJECT="${TRAVEL_DEPLOY_PROJECT:-travel}"
DEPLOY_CMD="${TRAVEL_DEPLOY_CMD:-}"
DEPLOY_URL="${TRAVEL_DEPLOY_URL:-}"

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

# Optional password page: active only when the Pages project has a SITE_PASSWORD secret.
cp "$SKILL_DIR/assets/_worker.js" "$TRIP_DIR/_worker.js"

echo "==> Deploy ($DEPLOY_PROJECT)"
if [[ -n "$DEPLOY_CMD" ]]; then
  # Expand a leading ~ or $HOME written literally in .env.local
  DEPLOY_CMD="${DEPLOY_CMD/#\~/$HOME}"
  DEPLOY_CMD="${DEPLOY_CMD//\$HOME/$HOME}"
  "$DEPLOY_CMD" "$DEPLOY_PROJECT" "$TRIP_DIR"
else
  npx -y wrangler pages deploy "$TRIP_DIR" --project-name "$DEPLOY_PROJECT"
fi

echo ""
[[ -n "$DEPLOY_URL" ]] && echo "Live: $DEPLOY_URL" || echo "Deployed to Cloudflare Pages project: $DEPLOY_PROJECT"

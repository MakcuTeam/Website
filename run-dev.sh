#!/usr/bin/env bash
set -euo pipefail

# Run the Makcu web app locally (WSL/Linux helper)
# Usage: ./run-dev.sh           -> npm run dev
#        ./run-dev.sh ssl       -> npm run dev-ssl (experimental https)

cd -- "$(dirname -- "$0")"

# Sanity check: package.json must exist
if [[ ! -f package.json ]]; then
  echo "[error] package.json not found. Run this script from the Website repo root." >&2
  exit 1
fi

# Node version hint (Next.js 15 needs Node 18.17+)
if ! command -v node >/dev/null 2>&1; then
  echo "[error] Node.js not on PATH. Install Node 18+ (e.g., via nvm) and retry." >&2
  exit 1
fi

# Install deps if missing or if local next binary not present
if [[ ! -d node_modules || ! -x node_modules/.bin/next ]]; then
  echo "[info] Installing dependencies (npm install)..."
  npm install
fi

SCRIPT="dev"
if [[ "${1:-}" == "ssl" ]]; then
  SCRIPT="dev-ssl"
fi

echo "[info] Starting npm run ${SCRIPT} ..."
npm run "${SCRIPT}"


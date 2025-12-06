#!/usr/bin/env bash
set -euo pipefail

echo "========================================"
echo "  Building & Deploying MAKCU (WSL/Linux)"
echo "========================================"
echo

# Move to repo root (script location)
cd -- "$(dirname -- "$0")"
echo "Working directory: $(pwd)"
# Production-only build/deploy
DEPLOY_TARGET=prod

# Ensure nvm is available (expected in ~/.nvm); install if missing
if [ ! -s "$HOME/.nvm/nvm.sh" ]; then
  echo "nvm not found. Installing nvm..."
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
fi
# shellcheck disable=SC1090
. "$HOME/.nvm/nvm.sh"

# Use Node 20 (matches Vercel default)
nvm install 20 >/dev/null
nvm use 20

# Enable pnpm via corepack
corepack enable
corepack prepare pnpm@10.24.0 --activate

# Ensure Vercel CLI is installed
if ! command -v vercel >/dev/null 2>&1; then
  echo "Installing Vercel CLI..."
  npm install -g vercel
fi

echo "Node: $(node -v)"
echo "pnpm: $(pnpm -v)"
echo "vercel: $(vercel -v)"
echo

# Install dependencies
pnpm install

# Approve build scripts (sharp)
pnpm approve-builds --yes sharp || true

# Pull env/settings (needs vercel login or VERCEL_TOKEN)
vercel pull --yes --environment=production

# Build with Vercel (production)
vercel build --prod

echo
echo "Build complete. Artifacts in .vercel/output"

# Deploy prebuilt output to production
echo
echo "Deploying prebuilt build with Vercel (PRODUCTION)..."
vercel deploy --prebuilt --prod


#!/bin/bash
# test-with-local-lib.sh
#
# Runs all local-testing steps for ts/ts-example against the locally-built
# @vsirotin/ts-stop library.  Does NOT publish to the npm registry.
#
# Steps:
#   1. Remove node_modules (clean slate)
#   2. npm install (fetches all deps from the registry)
#   3. npm run publish:local (overwrites @vsirotin/ts-stop with the local build)
#   4. npm test (Jest smoke tests — verify app starts without errors)
#   5. npm run build (production bundle — verify Angular build succeeds)
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$SCRIPT_DIR/.."

cd "$PROJECT_DIR"

echo "🧹 Step 1 — Removing node_modules..."
rm -rf node_modules

echo "📦 Step 2 — Installing dependencies from registry..."
npm install

echo "🔗 Step 3 — Overwriting @vsirotin/ts-stop with local build..."
npm run publish:local

echo "🧪 Step 4 — Running Jest smoke tests..."
npm test

echo "🏗️  Step 5 — Building production bundle..."
npm run build

echo ""
echo "✅ All steps completed successfully!"

#!/bin/bash
# clear-ts-stop-lib-and-sdk.sh
#
# Clears the locally-installed @vsirotin/ts-stop and @vsirotin/ts-stop-sdk
# packages from this project's node_modules. Use this before
# install-ts-stop-lib-and-sdk.sh to ensure a clean state.
#
# Usage (from project directory):
#   bash dev-scripts/clear-ts-stop-lib-and-sdk.sh
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$SCRIPT_DIR/.."

echo "🧹 Clearing @vsirotin/ts-stop and @vsirotin/ts-stop-sdk from node_modules..."
rm -rf "$PROJECT_DIR/node_modules/@vsirotin/ts-stop"
rm -rf "$PROJECT_DIR/node_modules/@vsirotin/ts-stop-sdk"
echo "✅ Cleared @vsirotin/ts-stop and @vsirotin/ts-stop-sdk"
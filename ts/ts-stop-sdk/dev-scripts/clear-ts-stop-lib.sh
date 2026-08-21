#!/bin/bash
# clear-ts-stop-lib.sh
#
# Clears the locally-installed @vsirotin/ts-stop package from this project's
# node_modules. Use this before install-ts-stop-lib.sh to ensure a clean state.
#
# Usage (from project directory):
#   bash dev-scripts/clear-ts-stop-lib.sh
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "🧹 Clearing @vsirotin/ts-stop from node_modules..."
rm -rf "$PROJECT_DIR/node_modules/@vsirotin/ts-stop"
echo "✅ Cleared @vsirotin/ts-stop"
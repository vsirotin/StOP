#!/bin/bash
# Simulate installation of @vsirotin/ts-stop from the npm registry by copying
# the locally-built library into this project's node_modules.
# Run this AFTER `npm install` so that the local build overwrites the registry version.
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TS_STOP_DIR="$SCRIPT_DIR/../../ts-stop"
TARGET_DIR="$SCRIPT_DIR/../node_modules/@vsirotin/ts-stop"

echo "🔨 Building @vsirotin/ts-stop..."
(cd "$TS_STOP_DIR" && npm run build)

echo "📋 Installing local build into node_modules..."
rm -rf "$TARGET_DIR"
mkdir -p "$TARGET_DIR"
cp -r "$TS_STOP_DIR/lib" "$TARGET_DIR/lib"
cp "$TS_STOP_DIR/package.json" "$TARGET_DIR/package.json"

echo "✅ Local @vsirotin/ts-stop installed into ts-example/node_modules"

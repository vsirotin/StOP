#!/bin/bash
# Simulate installation of @vsirotin/ts-stop from the npm registry.
# Uses `npm pack` so that the tarball respects the `files` field in package.json,
# exactly as a real `npm install` from the registry would.
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TS_STOP_DIR="$SCRIPT_DIR/../ts/ts-stop"
TARGET_DIR="TMP/node_modules/@vsirotin/ts-stop"

echo "🔨 Building @vsirotin/ts-stop..."
(cd "$TS_STOP_DIR" && npm run build)

echo "📦 Packing @vsirotin/ts-stop..."
TARBALL=$(cd "$TS_STOP_DIR" && npm pack --quiet 2>/dev/null | tail -1)
TARBALL_PATH="$TS_STOP_DIR/$TARBALL"

echo "📋 Installing local build into node_modules..."
rm -rf "$TARGET_DIR"
mkdir -p "$TARGET_DIR"
tar -xzf "$TARBALL_PATH" -C "$TARGET_DIR" --strip-components=1
rm "$TARBALL_PATH"

# Remove compiled tests from deployment (not needed in distributed package)
rm -rf "$TARGET_DIR/lib/test"
rm -rf "$TARGET_DIR/lib/esm/test"

echo "✅ Local @vsirotin/ts-stop installed into TMP/node_modules"

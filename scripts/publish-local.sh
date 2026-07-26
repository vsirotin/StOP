#!/bin/bash
# Simulate installation of @vsirotin/ts-stop from the npm registry.
# Uses `npm pack` so that the tarball respects the `files` field in package.json,
# exactly as a real `npm install` from the registry would.
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MONOREPO_ROOT="$SCRIPT_DIR/.."
TS_STOP_DIR="$SCRIPT_DIR/../ts/ts-stop"
TARGET_DIR="TMP/node_modules/@vsirotin/ts-stop"

echo "🔨 Building @vsirotin/ts-stop..."
(cd "$TS_STOP_DIR" && npm run build)

echo "📋 Copying licensing and release notes files..."
cp "$MONOREPO_ROOT/LICENSE-COMMERCIAL.md" "$TS_STOP_DIR/"
cp "$MONOREPO_ROOT/LICENSE-PUBLIC.md" "$TS_STOP_DIR/"
cp "$MONOREPO_ROOT/release-notes.md" "$TS_STOP_DIR/"

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

# Clean up the copied files from ts-stop (keep it monorepo-root-only)
rm -f "$TS_STOP_DIR/LICENSE-COMMERCIAL.md"
rm -f "$TS_STOP_DIR/LICENSE-PUBLIC.md"
rm -f "$TS_STOP_DIR/release-notes.md"

echo "✅ Local @vsirotin/ts-stop installed into TMP/node_modules"

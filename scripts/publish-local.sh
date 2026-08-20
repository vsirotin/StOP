#!/bin/bash
# Simulate installation of @vsirotin/ts-stop (library) and @vsirotin/ts-stop-sdk
# from the npm registry.
# Uses `npm pack` so that each tarball respects the `files` field in package.json,
# exactly as a real `npm install` from the registry would.
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MONOREPO_ROOT="$SCRIPT_DIR/.."
LIB_DIR="$SCRIPT_DIR/../ts/ts-stop-lib"
SDK_DIR="$SCRIPT_DIR/../ts/ts-stop-sdk"
TARGET_DIR="$SCRIPT_DIR/../TMP/node_modules"

echo "🔨 Building @vsirotin/ts-stop (library)..."
(cd "$LIB_DIR" && npm run build)

# Library package keeps the well-known name @vsirotin/ts-stop
echo "📦 Packing @vsirotin/ts-stop..."
LIB_TARBALL=$(cd "$LIB_DIR" && npm pack --quiet 2>/dev/null | tail -1)

echo "📋 Installing @vsirotin/ts-stop into node_modules..."
rm -rf "$TARGET_DIR/@vsirotin/ts-stop"
mkdir -p "$TARGET_DIR/@vsirotin/ts-stop"
tar -xzf "$LIB_DIR/$LIB_TARBALL" -C "$TARGET_DIR/@vsirotin/ts-stop" --strip-components=1
rm "$LIB_DIR/$LIB_TARBALL"
rm -rf "$TARGET_DIR/@vsirotin/ts-stop/lib/test" "$TARGET_DIR/@vsirotin/ts-stop/lib/esm/test"

echo "🔨 Building @vsirotin/ts-stop-sdk..."
(cd "$SDK_DIR" && npm run build)

echo "📦 Packing @vsirotin/ts-stop-sdk..."
SDK_TARBALL=$(cd "$SDK_DIR" && npm pack --quiet 2>/dev/null | tail -1)

echo "📋 Installing @vsirotin/ts-stop-sdk into node_modules..."
rm -rf "$TARGET_DIR/@vsirotin/ts-stop-sdk"
mkdir -p "$TARGET_DIR/@vsirotin/ts-stop-sdk"
tar -xzf "$SDK_DIR/$SDK_TARBALL" -C "$TARGET_DIR/@vsirotin/ts-stop-sdk" --strip-components=1
rm "$SDK_DIR/$SDK_TARBALL"

# Ensure the SDK's dependency on the library resolves locally
ln -sfn "$(cd "$TARGET_DIR/@vsirotin/ts-stop" && pwd)" "$TARGET_DIR/@vsirotin/ts-stop-sdk/node_modules/@vsirotin/ts-stop" 2>/dev/null || true

echo "✅ Local packages installed into TMP/node_modules"
echo "   - @vsirotin/ts-stop"
echo "   - @vsirotin/ts-stop-sdk"

#!/bin/bash
# install-ts-stop-lib-and-sdk.sh
#
# Installs local (not-yet-published) builds of @vsirotin/ts-stop (library) and
# @vsirotin/ts-stop-sdk into this project's node_modules, simulating a real
# `npm install` from the registry. Each package is built, then packed with
# `npm pack` (respecting the `files` field) and extracted — the same artifacts
# that would be downloaded from NPM.
#
# Usage (from project directory):
#   bash dev-scripts/install-ts-stop-lib-and-sdk.sh
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"          # ts-stop-test-node
LIB_DIR="$(dirname "$PROJECT_DIR")/ts-stop-lib" # ts/ts-stop-lib
SDK_DIR="$(dirname "$PROJECT_DIR")/ts-stop-sdk" # ts/ts-stop-sdk

# --- 1. Build and pack the library ---
echo "🔨 Building @vsirotin/ts-stop (library)..."
(cd "$LIB_DIR" && npm run build)

echo "📦 Packing @vsirotin/ts-stop..."
LIB_TARBALL=$(cd "$LIB_DIR" && npm pack --silent 2>/dev/null | tail -1)

# --- 2. Build and pack the SDK ---
#     The SDK compiles against @vsirotin/ts-stop. Install the packed library
#     into the SDK's node_modules first (replacing the dev `file:` link) so the
#     SDK builds against exactly what would be published to NPM.
echo "🔨 Building @vsirotin/ts-stop-sdk..."
rm -rf "$SDK_DIR/node_modules/@vsirotin/ts-stop"
mkdir -p "$SDK_DIR/node_modules/@vsirotin/ts-stop"
tar -xzf "$LIB_DIR/$LIB_TARBALL" -C "$SDK_DIR/node_modules/@vsirotin/ts-stop" --strip-components=1
(cd "$SDK_DIR" && npm run build)

echo "📦 Packing @vsirotin/ts-stop-sdk..."
SDK_TARBALL=$(cd "$SDK_DIR" && npm pack --silent 2>/dev/null | tail -1)

# --- 3. Install the packed library into this project ---
echo "📋 Installing @vsirotin/ts-stop into node_modules..."
rm -rf "$PROJECT_DIR/node_modules/@vsirotin/ts-stop"
mkdir -p "$PROJECT_DIR/node_modules/@vsirotin/ts-stop"
tar -xzf "$LIB_DIR/$LIB_TARBALL" -C "$PROJECT_DIR/node_modules/@vsirotin/ts-stop" --strip-components=1

# --- 4. Install the packed SDK into this project ---
echo "📋 Installing @vsirotin/ts-stop-sdk into node_modules..."
rm -rf "$PROJECT_DIR/node_modules/@vsirotin/ts-stop-sdk"
mkdir -p "$PROJECT_DIR/node_modules/@vsirotin/ts-stop-sdk"
tar -xzf "$SDK_DIR/$SDK_TARBALL" -C "$PROJECT_DIR/node_modules/@vsirotin/ts-stop-sdk" --strip-components=1

# --- 5. Cleanup tarballs ---
rm -f "$LIB_DIR/$LIB_TARBALL" "$SDK_DIR/$SDK_TARBALL"

# --- 6. The packed SDK still declares "@vsirotin/ts-stop": "file:../ts-stop-lib".
#     Make it resolve to the packed library (same as the original
#     publish-local.sh approach).
mkdir -p "$PROJECT_DIR/node_modules/@vsirotin/ts-stop-sdk/node_modules/@vsirotin"
ln -sfn "$PROJECT_DIR/node_modules/@vsirotin/ts-stop" \
  "$PROJECT_DIR/node_modules/@vsirotin/ts-stop-sdk/node_modules/@vsirotin/ts-stop"

# --- 7. Verify the install actually produced the expected artifacts ---
test -f "$PROJECT_DIR/node_modules/@vsirotin/ts-stop/package.json"
test -f "$PROJECT_DIR/node_modules/@vsirotin/ts-stop-sdk/package.json"

echo "✅ @vsirotin/ts-stop and @vsirotin/ts-stop-sdk installed from local builds"
#!/bin/bash
# install-ts-stop-lib.sh
#
# Installs the local (not-yet-published) version of @vsirotin/ts-stop into this
# project's node_modules. It builds the library, creates an npm tarball with
# `npm pack` (respecting the `files` field in package.json), and extracts it —
# exactly as a real `npm install` from the registry would resolve the package.
#
# Usage (from project directory or workspace root):
#   bash dev-scripts/install-ts-stop-lib.sh
#   bash ts/ts-stop-sdk/dev-scripts/install-ts-stop-lib.sh
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
LIB_DIR="$(dirname "$PROJECT_DIR")/ts-stop-lib"

echo "🔨 Building @vsirotin/ts-stop (library)..."
(cd "$LIB_DIR" && npm run build)

echo "📦 Packing @vsirotin/ts-stop..."
LIB_TARBALL=$(cd "$LIB_DIR" && npm pack --silent 2>/dev/null | tail -1)

echo "📋 Installing @vsirotin/ts-stop into node_modules..."
rm -rf "$PROJECT_DIR/node_modules/@vsirotin/ts-stop"
mkdir -p "$PROJECT_DIR/node_modules/@vsirotin/ts-stop"
tar -xzf "$LIB_DIR/$LIB_TARBALL" -C "$PROJECT_DIR/node_modules/@vsirotin/ts-stop" --strip-components=1
rm -f "$LIB_DIR/$LIB_TARBALL"

# Verify the install actually produced the expected artifact
test -f "$PROJECT_DIR/node_modules/@vsirotin/ts-stop/package.json"

echo "✅ @vsirotin/ts-stop installed from local build"
#!/bin/bash
# test-with-local-lib.sh
#
# Copies the locally-built packages from TMP/node_modules
# to ts/ts-stop-test-node/node_modules for integration testing.
# Copies the SDK (which depends on the library) so that the test project
# validates the @vsirotin/ts-stop-sdk package.
#
# Prerequisites:
#   1. Run 'bash scripts/publish-local.sh' first to create TMP/node_modules/@vsirotin/*
#
# After this script:
#   2. Run 'cd ts/ts-stop-test-node && npm test' to validate the package
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TS_STOP_TEST_NODE_DIR="$SCRIPT_DIR/../ts/ts-stop-test-node"
SOURCE_SDK="$SCRIPT_DIR/../TMP/node_modules/@vsirotin/ts-stop-sdk"
SOURCE_LIB="$SCRIPT_DIR/../TMP/node_modules/@vsirotin/ts-stop"

# Verify the local packages exist
if [ ! -d "$SOURCE_SDK" ]; then
  echo "❌ Error: Local SDK package not found at $SOURCE_SDK"
  echo "   Run 'bash scripts/publish-local.sh' first to create the local build."
  exit 1
fi
if [ ! -d "$SOURCE_LIB" ]; then
  echo "❌ Error: Local library package not found at $SOURCE_LIB"
  echo "   Run 'bash scripts/publish-local.sh' first to create the local build."
  exit 1
fi

echo "🔗 Copying @vsirotin/ts-stop-sdk to ts-stop-test-node/node_modules..."
mkdir -p "$TS_STOP_TEST_NODE_DIR/node_modules/@vsirotin"
rm -rf "$TS_STOP_TEST_NODE_DIR/node_modules/@vsirotin/ts-stop-sdk"
cp -r "$SOURCE_SDK" "$TS_STOP_TEST_NODE_DIR/node_modules/@vsirotin/"

echo "🔗 Copying @vsirotin/ts-stop to ts-stop-test-node/node_modules..."
rm -rf "$TS_STOP_TEST_NODE_DIR/node_modules/@vsirotin/ts-stop"
cp -r "$SOURCE_LIB" "$TS_STOP_TEST_NODE_DIR/node_modules/@vsirotin/"

echo "✅ Packages copied successfully!"
echo ""
echo "Next: Run integration tests"
echo "  cd ts/ts-stop-test-node"
echo "  npm test"

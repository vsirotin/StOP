#!/bin/bash
# test-with-local-lib.sh
#
# Copies the locally-built @vsirotin/ts-stop package from TMP/node_modules
# to ts/ts-stop-local-test/node_modules for integration testing.
#
# Prerequisites:
#   1. Run 'bash scripts/publish-local.sh' first to create TMP/node_modules/@vsirotin/ts-stop
#
# After this script:
#   2. Run 'cd ts/ts-stop-local-test && npm test' to validate the package
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TS_STOP_LOCAL_TEST_DIR="$SCRIPT_DIR/../ts/ts-stop-local-test"
SOURCE_PACKAGE="$SCRIPT_DIR/../TMP/node_modules/@vsirotin/ts-stop"

# Verify the local package exists
if [ ! -d "$SOURCE_PACKAGE" ]; then
  echo "❌ Error: Local package not found at $SOURCE_PACKAGE"
  echo "   Run 'bash scripts/publish-local.sh' first to create the local build."
  exit 1
fi

echo "🔗 Copying @vsirotin/ts-stop to ts-stop-local-test/node_modules..."
mkdir -p "$TS_STOP_LOCAL_TEST_DIR/node_modules/@vsirotin"
rm -rf "$TS_STOP_LOCAL_TEST_DIR/node_modules/@vsirotin/ts-stop"
cp -r "$SOURCE_PACKAGE" "$TS_STOP_LOCAL_TEST_DIR/node_modules/@vsirotin/"

echo "✅ Package copied successfully!"
echo ""
echo "Next: Run integration tests"
echo "  cd ts/ts-stop-local-test"
echo "  npm test"

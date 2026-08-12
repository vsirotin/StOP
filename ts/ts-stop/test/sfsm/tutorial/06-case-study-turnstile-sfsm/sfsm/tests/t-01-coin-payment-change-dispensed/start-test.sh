#!/bin/bash
# start-test.sh — Re-run the UC-01 test (Coin Payment, change dispensed)
# Usage: bash start-test.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../../../../../../../.." && pwd)"
SDK_SCRIPTS="$PROJECT_ROOT/ts/ts-stop/scripts"

echo "=== UC-01: Coin Payment, change dispensed ==="
echo ""

echo "--- Extract compact FA from sfsm.ext.json ---"
node "$SDK_SCRIPTS/extract-sfsm.js" \
    "$SCRIPT_DIR/../../sfsm.ext.json" \
    "$SCRIPT_DIR/sfsm.json"

echo ""
echo "--- Run the FA ---"
node "$SDK_SCRIPTS/run-fa.js" \
    "$SCRIPT_DIR/sfsm.json" \
    "$SCRIPT_DIR/signals.txt" \
    "$SCRIPT_DIR/output-trace.txt" \
    "$SCRIPT_DIR/commands.json"

echo ""
echo "--- Output trace ---"
cat "$SCRIPT_DIR/output-trace.txt"

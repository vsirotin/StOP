#!/bin/bash
# start-test.sh — Re-run the <directory-name> test
# Usage: bash start-test.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
MODEL_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
TS_STOP="$(cd "$MODEL_DIR/../../../../../../../" && pwd)"
SDK_SCRIPTS="$TS_STOP/scripts"
TEST_LABEL="$(basename "$SCRIPT_DIR")"

echo "=== $TEST_LABEL ==="
echo ""

echo "--- 1. Validate sfsm.ext.json (suppress expected exit-state rule) ---"
node "$SDK_SCRIPTS/validate-ext-sfsm.js" \
    "$MODEL_DIR/sfsm.ext.json" \
    "$SCRIPT_DIR/validation-report.json" \
    --suppress 10

echo ""
echo "--- 2. Extract compact FA from sfsm.ext.json ---"
node "$SDK_SCRIPTS/extract-sfsm.js" \
    "$MODEL_DIR/sfsm.ext.json" \
    "$SCRIPT_DIR/sfsm.json"

echo ""
echo "--- 3. Generate commands.json from outcomes.json ---"
node "$SDK_SCRIPTS/gen-commands.js" \
    "$MODEL_DIR/sfsm.ext.json" \
    "$SCRIPT_DIR/outcomes.json" \
    "$SCRIPT_DIR/commands.json"

echo ""
echo "--- 4. Run the FA ---"
node "$SDK_SCRIPTS/run-fa.js" \
    "$SCRIPT_DIR/sfsm.json" \
    "$SCRIPT_DIR/signals.txt" \
    "$SCRIPT_DIR/output-trace.txt" \
    "$SCRIPT_DIR/commands.json"

echo ""
echo "--- Output trace (compare manually against business-use-cases-trace.md) ---"
cat "$SCRIPT_DIR/output-trace.txt"
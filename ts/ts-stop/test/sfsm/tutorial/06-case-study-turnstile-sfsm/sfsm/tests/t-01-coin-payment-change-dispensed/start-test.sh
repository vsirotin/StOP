#!/bin/bash
# start-test.sh — Re-run the UC-01 test (Coin Payment, change dispensed)
# Usage: bash start-test.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../../../../../../../.." && pwd)"
SDK_SCRIPTS="$PROJECT_ROOT/ts/ts-stop/scripts"
MODEL_DIR="$SCRIPT_DIR/../.."
CASE_STUDY_DIR="$MODEL_DIR/.."
TRACE_DOC="$CASE_STUDY_DIR/business-model/business-use-cases-trace.md"

echo "=== UC-01: Coin Payment, change dispensed ==="
echo ""

echo "--- 1. Validate sfsm.ext.json (suppress expected warnings) ---"
node "$SDK_SCRIPTS/validate-ext-sfsm.js" \
    "$MODEL_DIR/sfsm.ext.json" \
    "$SCRIPT_DIR/validation-report.json" \
    --suppress 6,10

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
echo "--- 5. Compare trace against expected UC-01 path ---"
node "$SDK_SCRIPTS/compare-trace.js" \
    "$TRACE_DOC" \
    "$SCRIPT_DIR/output-trace.txt" \
    --uc UC-01

echo ""
echo "--- Output trace ---"
cat "$SCRIPT_DIR/output-trace.txt"

#!/bin/bash
# run-tests.sh — Run autonomous SFSM tests for all use cases.
#
# This script:
# 1. Validates the extracted SFSM JSON with validate-fa.js
# 2. Runs each use case test with run-fa.js
# 3. Reports pass/fail for each test
#
# Usage:
#   bash run-tests.sh
#
# Exit codes:
#   0 — all tests passed
#   1 — one or more tests failed

set -e

# ── Configuration ───────────────────────────────────────────────────────────

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../../../../.." && pwd)"
TS_STOP_DIR="$PROJECT_ROOT/ts/ts-stop"
FA_JSON="$SCRIPT_DIR/../sfsm-drafter-example.json"
VALIDATE_FA="$TS_STOP_DIR/scripts/validate-fa.js"
RUN_FA="$TS_STOP_DIR/scripts/run-fa.js"

# ── Helper functions ────────────────────────────────────────────────────────

PASS=0
FAIL=0

report_pass() {
    echo "  ✓ PASS: $1"
    PASS=$((PASS + 1))
}

report_fail() {
    echo "  ✗ FAIL: $1"
    FAIL=$((FAIL + 1))
}

# ── Step 1: Validate the SFSM JSON ─────────────────────────────────────────

echo "=== Step 1: Validate SFSM JSON ==="
if node "$VALIDATE_FA" "$FA_JSON" "$SCRIPT_DIR/validation-report.json" 2>&1; then
    report_pass "Validation passed (no errors)"
else
    report_fail "Validation failed (see validation-report.json for details)"
    echo "  Note: Validation warnings about exit-state signal forwarding (Rule 10)"
    echo "  and duplicate signals (Rule 6) are expected in draft SFSMs."
    echo "  Errors (Rule 7: duplicate transitions) indicate design issues that"
    echo "  need to be fixed in the extended-transitions draft."
fi
echo ""

# ── Step 2: Run use case tests ─────────────────────────────────────────────

echo "=== Step 2: Run use case tests ==="

# Use case 0: System initialization
echo "--- Use case 0: System initialization ---"
UC0_DIR="$SCRIPT_DIR/use-case-0-system-initialization"
UC0_OUTPUT="$UC0_DIR/output-trace.txt"

if node "$RUN_FA" "$FA_JSON" "$UC0_DIR/signals.txt" "$UC0_OUTPUT" 2>&1; then
    echo "  Trace written to: $UC0_OUTPUT"
    report_pass "Use case 0 ran without errors"
else
    echo "  Partial trace written to: $UC0_OUTPUT"
    report_fail "Use case 0 failed (see output-trace.txt for details)"
fi
echo ""

# Use case 1: Happy path with coin and change
echo "--- Use case 1: Happy path with coin and change ---"
UC1_DIR="$SCRIPT_DIR/use-case-1-happy-path-coin-change"
UC1_OUTPUT="$UC1_DIR/output-trace.txt"
UC1_COMMANDS="$UC1_DIR/commands.json"

if node "$RUN_FA" "$FA_JSON" "$UC1_DIR/signals.txt" "$UC1_OUTPUT" "$UC1_COMMANDS" 2>&1; then
    echo "  Trace written to: $UC1_OUTPUT"
    report_pass "Use case 1 ran without errors"
else
    echo "  Partial trace written to: $UC1_OUTPUT"
    report_fail "Use case 1 failed (see output-trace.txt for details)"
fi
echo ""

# ── Summary ────────────────────────────────────────────────────────────────

echo "=== Summary ==="
echo "  Passed: $PASS"
echo "  Failed: $FAIL"
echo ""

if [ "$FAIL" -gt 0 ]; then
    echo "Some tests failed. Review the output traces and validation report."
    echo "Common issues in draft SFSMs:"
    echo "  - Rule 7 (duplicate transitions): same from-state + signal with different to-states"
    echo "  - Rule 10 (exit state signal forwarding): sub-FA exit forwards original signal, not command output"
    echo "  These issues need to be fixed in the extended-transitions draft."
    exit 1
else
    echo "All tests passed!"
    exit 0
fi
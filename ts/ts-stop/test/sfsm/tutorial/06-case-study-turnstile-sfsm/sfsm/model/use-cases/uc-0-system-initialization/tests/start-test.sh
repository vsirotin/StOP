#!/bin/bash
# Re-run the test for use case 0: System initialization
cd "$(dirname "$0")/.."
node ../../../../../../../ts/ts-stop/scripts/run-fa.js ../../turnstile-behavior.json run-01/signals.txt run-01/output-trace.txt run-01/commands.json
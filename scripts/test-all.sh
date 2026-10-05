#!/usr/bin/env bash
# Runs the test suite of every sub-project in ts/.
# Usage: scripts/test-all.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
TS_DIR="$REPO_ROOT/ts"

# All sub-projects of ts/, in dependency-ish order (lib -> sdk -> integrations).
PROJECTS=(
    "ts-stop-lib"
    "ts-stop-sdk"
    "ts-stop-test-node"
    "ts-stop-test-angular"
)

# Projects that must not block a commit (reported as WARN, not FAILED).
# Empty by default: every project in PROJECTS is mandatory.
OPTIONAL_PROJECTS=()

failed=()
skipped=()
optional_failed=()

for project in "${PROJECTS[@]}"; do
    project_dir="$TS_DIR/$project"

    if [[ ! -d "$project_dir" ]]; then
        echo "== SKIP  $project (directory not found)"
        skipped+=("$project")
        continue
    fi

    # Does the project define a "test" script?
    if ! grep -q '"test"[[:space:]]*:' "$project_dir/package.json" 2>/dev/null; then
        echo "== SKIP  $project (no 'test' script)"
        skipped+=("$project")
        continue
    fi

    echo ""
    echo "=================================================================="
    echo "== TEST  $project"
    echo "=================================================================="

    # ts-stop-lib / ts-stop-sdk: jest. Force single run, never watch.
    exit_code=0
    if [[ -f "$project_dir/jest.config.js" || -f "$project_dir/jest.config.ts" ]]; then
        (cd "$project_dir" && npm test --silent -- --ci --watchAll=false) || exit_code=$?
    else
        # Integration projects (plain node script, or `ng test`).
        (cd "$project_dir" && npm test --silent) || exit_code=$?
    fi

    if [[ $exit_code -ne 0 ]]; then
        is_optional=false
        for opt in ${OPTIONAL_PROJECTS[@]+"${OPTIONAL_PROJECTS[@]}"}; do
            [[ "$opt" == "$project" ]] && is_optional=true
        done
        if [[ "$is_optional" == true ]]; then
            echo "== WARN  $project failed (optional project, not blocking)"
            optional_failed+=("$project")
        else
            failed+=("$project")
        fi
    fi
done

echo ""
echo "=================================================================="
echo "== SUMMARY"
echo "=================================================================="
for p in "${PROJECTS[@]}"; do
    case " ${failed[*]-} " in
        *" $p "*) echo "  FAILED : $p" ;;
    esac
done
for p in "${skipped[@]-}"; do
    [[ -n "$p" ]] && echo "  SKIPPED: $p"
done
for p in "${optional_failed[@]-}"; do
    [[ -n "$p" ]] && echo "  WARN    : $p (optional, non-blocking)"
done

if [[ ${#failed[@]} -gt 0 ]]; then
    echo ""
    echo "RESULT: FAILED (${#failed[@]} project(s): ${failed[*]})"
    exit 1
fi

echo ""
echo "RESULT: ALL TESTS PASSED"
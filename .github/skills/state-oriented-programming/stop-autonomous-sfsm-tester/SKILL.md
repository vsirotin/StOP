---
name: stop-autonomous-sfsm-tester
description: Interactive Autonomous SFSM Tester according StOP (State-oriented Programming paradigm). Extracts an SFSM JSON definition from an extended-transitions draft, validates it, and tests it without environment (no simulators, no external devices). Use when a user asks to test, validate, or verify an SFSM draft autonomously.
metadata:
  author: vsirotin
  version: "0.2"
---

# Autonomous SFSM Tester

This skill tests an SFSM draft without any environment — no simulators, no external devices, no production code. It extracts the SFSM JSON from an extended-transitions draft document, validates its structure, and runs it through signal sequences to verify that the state machine behaves as expected.

---

## Prerequisites

A finished extended-transitions draft (written with the [stop-sfsm-drafter](../stop-sfsm-drafter/SKILL.md) skill or equivalent) must exist before this skill is applied. The draft must contain an "## Extended Transitions" section with transition lines in the SFSM transition format. If no draft is available, stop and ask the user to provide or create one first.

---

## Output Structure

The outputs of this skill are:

1. **SFSM JSON file** (`<system-name>-sfsm.json`) — The compact FA definition extracted from the draft.
2. **Validation report** (`validation-report.json`) — The output of `validate-fa.js`.
3. **Test traces** (`output-trace.txt` per use case) — The execution trace produced by `run-fa.js` for each use case.
4. **Test runner script** (`run-tests.sh`) — A shell script that runs validation and all use case tests.

---

## Step 1: Extract SFSM JSON from the Extended-Transitions Draft

### Goal

Extract all transition lines from the extended-transitions draft document, group them by FA name, strip the FA name prefix from state names to produce bare state names compatible with the SFSM engine, and write the result as a JSON file.

### Tool

The extraction is performed by the `extract-fa-from-draft.js` CLI script (located in `ts/ts-stop/scripts/`).

**Usage:**
```bash
node ts/ts-stop/scripts/extract-fa-from-draft.js <input.md> [output.json]
```

**What the script does:**
1. Reads the input markdown file.
2. Scans every line for transition arrays — lines that start with `[` and end with `]` and are valid JSON arrays with at least 3 elements.
3. Skips comment lines (`//`) and code-block delimiters.
4. Groups transitions by FA name — the prefix of the from-state before the first `:` (e.g., `"Turnstile:I"` → FA name `"Turnstile"`).
5. Strips the FA name prefix from state names (from-state and to-state) to produce bare state names (e.g., `"Turnstile:I"` → `"I"`, `"Weight Checker:E_Weight_Checked"` → `"E_Weight_Checked"`). Signal and command names are kept as-is.
6. Writes the grouped transitions as a JSON object, preserving the order in which FAs first appear in the draft.

### Workflow

1. **Locate the draft** — Identify the markdown file containing the extended-transitions draft.
2. **Run the extraction script** — `node ts/ts-stop/scripts/extract-fa-from-draft.js <draft.md> <output.json>`
3. **Verify the output** — Check the console summary for transition count, FA group count, and any parse warnings.
4. **Inspect the JSON** — Verify the root FA appears first, state names are bare, and naming conventions are followed.
5. **Present and confirm** — Ask the user if the extracted JSON correctly reflects the draft.

---

## Step 2: Validate the SFSM JSON

### Goal

Validate the extracted SFSM JSON against structural rules using the `validate-fa.js` CLI script. This step identifies design issues in the extended-transitions draft before runtime testing.

### Tool

The validation is performed by the `validate-fa.js` CLI script (located in `ts/ts-stop/scripts/`).

**Usage:**
```bash
node ts/ts-stop/scripts/validate-fa.js <fa.json> [output-report.json]
```

**What the script does:**
1. Loads the JSON file containing the FA definition.
2. Runs 14 structural validation rules (6 errors, 8 warnings).
3. Prints a human-readable report to stdout and optionally writes a JSON report to a file.

**Exit codes:**
- `0` — valid (no errors; warnings are allowed).
- `1` — validation errors found.

### Key Validation Rules

| Rule | Type | Description |
|---|---|---|
| **Rule 7** | Error | Duplicate transition: same from-state + signal with different to-states. Indicates the draft uses the same from-state for different paths — needs to be fixed. |
| **Rule 6** | Warning | Signal used by multiple FAs. Expected in stacked SFSMs where signals propagate through the hierarchy. |
| **Rule 10** | Warning | Exit state signal forwarding: when a sub-FA exits, the SFSM engine forwards the original signal, but the draft may expect the command's output signal to drive the next transition. This is the most common design issue in draft SFSMs. |
| **Rule 14** | Warning | Unreachable state: a state is used as a from-state but never appears as a to-state. |

### Workflow

1. **Run the validator** — `node ts/ts-stop/scripts/validate-fa.js <fa.json> <report.json>`
2. **Check for errors** — If there are Rule 7 errors (duplicate transitions), these must be fixed in the extended-transitions draft before proceeding.
3. **Review warnings** — Rule 6 warnings (duplicate signals) are expected. Rule 10 warnings (exit-state signal forwarding) indicate a design issue that may cause runtime failures in Step 3.
4. **Document issues** — Record all errors and significant warnings for the user to review.

### Quality Criteria for Validation

| Criterion | Check |
|---|---|
| **No errors** | The validation report has 0 errors (Rule 7 violations must be fixed). |
| **Warnings reviewed** | All Rule 10 warnings are documented as known design issues. |
| **Report saved** | The validation report is saved as a JSON file for reference. |

---

## Step 3: Test Use Cases with run-fa.js

### Goal

Run the SFSM through signal sequences that correspond to each use case, using the `run-fa.js` CLI script. Each use case is tested independently with its own signal file and optional command interpretation file.

### Tool

The testing is performed by the `run-fa.js` CLI script (located in `ts/ts-stop/scripts/`).

**Usage:**
```bash
node ts/ts-stop/scripts/run-fa.js <fa.json> <signals.txt> <output.txt> [commands.json]
```

**Parameters:**
- `fa.json` — The SFSM JSON file from Step 1.
- `signals.txt` — Text file with one signal per line (blank lines and `#` comments are ignored). Contains the external events for the use case.
- `output.txt` — Path for the output trace file.
- `commands.json` — (Optional) JSON file mapping command names to result signals. When provided, each command emitted by the FA is translated to a signal and fed back into the FA (the "command loop"). This simulates the component responses without actual hardware.

**Output format (trace file):**
```
from-state, signal, to-state
from-state, signal, to-state, command
```
One line per transition, with the command included when present.

### Signal File Structure

Each use case gets its own subdirectory under `examples/test/` containing:
- `signals.txt` — The external events (one signal per line).
- `commands.json` — (Optional) The command-to-signal mapping for the command loop.
- `output-trace.txt` — The generated trace (created by `run-fa.js`).

**Signal file conventions:**
- External events (user actions, sensor detections) are listed in the signals file.
- Internal command results (from component processing) are handled by the `commands.json` file.
- Each use case includes any setup signals needed to reach the correct starting state (e.g., use case 1 includes the initialization signal from use case 0).

**Commands.json conventions:**
- Each command maps to exactly one result signal (the happy-path outcome for the specific use case being tested).
- For use cases with different outcomes (e.g., invalid coin), a separate commands.json is used with the appropriate result signal.

### Test Runner Script

A `run-tests.sh` script automates the validation and all use case tests:

```bash
bash examples/test/run-tests.sh
```

The script:
1. Runs `validate-fa.js` on the SFSM JSON.
2. Runs `run-fa.js` for each use case with its signal file and commands.json.
3. Reports pass/fail for each test.
4. Prints a summary with common issue explanations.

### Workflow

1. **Create signal files** — For each use case, create a `signals.txt` with the external events and a `commands.json` with the command-to-signal mapping.
2. **Create run-tests.sh** — Write the test runner script that validates and runs all use cases.
3. **Run the tests** — Execute `run-tests.sh`.
4. **Inspect traces** — For each use case, inspect the `output-trace.txt` to verify the transitions match the expected flow.
5. **Identify failures** — If a test fails, the error message and partial trace indicate where the SFSM diverged from the expected behavior.
6. **Document issues** — Record all failures with their root causes (e.g., exit-state signal forwarding, duplicate transitions).

### Quality Criteria for Use Case Tests

| Criterion | Check |
|---|---|
| **No runtime errors** | Each use case runs to completion without "no transition for signal" errors. |
| **Final state correct** | The final state matches the expected end state for the use case. |
| **Trace matches expected flow** | The transition trace follows the expected path through the FA hierarchy. |
| **All use cases pass** | Every use case in the use-case document has a corresponding test that passes. |

### Common Issues in Draft SFSMs

1. **Exit-state signal forwarding (Rule 10)**: When a sub-FA exits, the SFSM engine forwards the original signal (the one that triggered the exit transition) to the parent. But the extended-transitions draft may expect the command's output signal to drive the next transition. This causes "no transition for signal" errors when the command's result signal doesn't match any transition from the parent's current state (which is the sub-FA name, not "I").

2. **Duplicate transitions (Rule 7)**: The same from-state + signal appears in multiple transitions with different to-states. This happens when the draft uses the same from-state (e.g., "I") for different paths (e.g., unlocked vs locked). The SFSM engine can only have one transition per from-state + signal pair.

3. **Parent state after sub-FA push**: After a sub-FA is pushed, the parent's state becomes the sub-FA name (e.g., "Weight Checker"). But the draft may use "I" as the from-state for all parent transitions. This causes mismatches when the sub-FA exits and the forwarded signal is processed by the parent in the sub-FA name state.

These issues need to be fixed in the extended-transitions draft (Step 3 of the `stop-sfsm-drafter` skill) and the SFSM re-extracted and re-tested.

---

## Style Rules

- The output JSON file uses 2-space indentation.
- FA groups appear in the order they first appear in the draft (root FA first).
- Transitions within each FA group appear in the order they appear in the draft.
- Signal files use `#` for comments. One signal per line.
- Commands.json maps command names to result signals (1:1 mapping per use case).
- Test subdirectories are named `use-case-<number>-<description>`.
- The `run-tests.sh` script prints a clear summary with pass/fail counts.

---

## Reference Examples

The turnstile example is available at:
- [SFSM JSON](examples/sfsm-drafter-example.json) — extracted from the [sfsm-drafter example](../stop-sfsm-drafter/sfsm-drafter-example.md)
- [Test directory](examples/test/) — signal files, commands.json, run-tests.sh, and output traces for use cases 0 and 1
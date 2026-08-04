---
name: stop-autonomous-sfsm-tester
description: Interactive Autonomous SFSM Tester according StOP (State-oriented Programming paradigm). Extracts an SFSM JSON definition from an extended-transitions draft, validates it, and tests it without environment (no simulators, no external devices). Use when a user asks to test, validate, or verify an SFSM draft autonomously.
metadata:
  author: vsirotin
  version: "0.1"
---

# Autonomous SFSM Tester

This skill tests an SFSM draft without any environment — no simulators, no external devices, no production code. It extracts the SFSM JSON from an extended-transitions draft document, validates its structure, and runs it through signal sequences to verify that the state machine behaves as expected.

---

## Prerequisites

A finished extended-transitions draft (written with the [stop-sfsm-drafter](../stop-sfsm-drafter/SKILL.md) skill or equivalent) must exist before this skill is applied. The draft must contain an "## Extended Transitions" section with transition lines in the SFSM transition format. If no draft is available, stop and ask the user to provide or create one first.

---

## Output Structure

The primary output is an SFSM JSON file (`<system-name>-sfsm.json`) containing the compact FA definition extracted from the draft. Additional outputs (validation reports, test traces) will be defined in later steps of this skill's development.

---

## Step 1: Extract SFSM JSON from the Extended-Transitions Draft

### Goal

Extract all transition lines from the extended-transitions draft document, group them by FA name, and write the result as a JSON file that can be loaded by the `Sfsm` engine and validated by the `FaValidator`.

### Tool

The extraction is performed by the `extract-fa-from-draft.js` CLI script (located in `ts/ts-stop/scripts/`).

**Usage:**
```bash
node ts/ts-stop/scripts/extract-fa-from-draft.js <input.md> [output.json]
```

**Parameters:**
- `input.md` — The markdown file containing the extended-transitions draft (e.g., `sfsm-drafter-example.md`).
- `output.json` — (Optional) Path for the output JSON file. If omitted, the output is written to `<input-basename>.json` in the same directory as the input file.

**What the script does:**
1. Reads the input markdown file.
2. Scans every line for transition arrays — lines that start with `[` and end with `]` and are valid JSON arrays with at least 3 elements (from-state, signal, to-state) and an optional 4th element (command).
3. Skips comment lines (`//`) and code-block delimiters (```).
4. Groups transitions by FA name — the prefix of the from-state before the first `:` (e.g., `"Turnstile:I"` → FA name `"Turnstile"`).
5. Writes the grouped transitions as a JSON object, preserving the order in which FAs first appear in the draft.

**Output format:**
```json
{
  "Turnstile": [
    ["Turnstile:I", "Service Component>Service Button pressed", "Turnstile:Locked"],
    ["Turnstile:Locked", "Coin Slot>Coin Inserted", "Payment Component"]
  ],
  "Payment Component": [
    ["Payment Component:I", "Coin Slot>Coin Inserted", "Coin Component"]
  ]
}
```

**Exit codes:**
- `0` — success.
- `1` — file not found, no transitions found, or parse error.

### Workflow

Follow these steps in order. Do not skip a step.

#### Step 1.1 — Locate the extended-transitions draft

Identify the markdown file containing the extended-transitions draft. This is typically the output of the `stop-sfsm-drafter` skill (e.g., `*-extended-transitions.md` or `sfsm-drafter-example.md`).

#### Step 1.2 — Run the extraction script

Run the `extract-fa-from-draft.js` script with the draft file as input:

```bash
node ts/ts-stop/scripts/extract-fa-from-draft.js <path-to-draft.md> [output.json]
```

If no output path is specified, the JSON file is created in the same directory as the input file, with the `.md` extension replaced by `.json`.

#### Step 1.3 — Verify the extraction output

Check the script's console output for:
- The number of transitions extracted.
- The number of FA groups found.
- The number of transitions per FA group.
- Any parse warnings (lines that looked like transitions but failed to parse).

If no transitions were found, or if the number of FA groups or transitions seems wrong, inspect the draft file to ensure the transitions are in the correct format (lines starting with `[` and ending with `]`, valid JSON arrays).

#### Step 1.4 — Inspect the output JSON

Open the generated JSON file and verify:
- The root FA (the system name) appears as the first key.
- Each FA group contains the expected transitions.
- State names follow the `<Component>:<State>` convention.
- Signals follow the `<Component>:<SignalDescription>` convention.
- Commands (4th element) follow the `<Component>.<commandName>` convention.

#### Step 1.5 — Present and confirm

Present the extraction summary to the user and ask: *"Does the extracted SFSM JSON correctly reflect the extended-transitions draft, or should anything be adjusted?"*

Apply any corrections (e.g., fix malformed transitions in the draft and re-run the script) and produce the final JSON file.

---

## Quality Criteria

Before presenting the extraction result, verify all of the following:

| Criterion | Check |
|---|---|
| **Transition count** | The number of extracted transitions matches the number of transition lines in the draft's Extended Transitions section. |
| **FA group count** | The number of FA groups matches the number of distinct from-state prefixes in the draft. |
| **No parse errors** | No lines that should be transitions were skipped due to parse errors. |
| **Root FA present** | The root FA (system name) appears as a key in the output JSON. |
| **Naming consistency** | State, signal, and command names in the JSON match the draft exactly. |
| **Output file valid** | The output file is valid JSON and can be loaded by `JSON.parse()`. |

---

## Style Rules

- The output JSON file uses 2-space indentation.
- FA groups appear in the order they first appear in the draft (root FA first).
- Transitions within each FA group appear in the order they appear in the draft.
- The output file name defaults to `<input-basename>.json` unless an explicit output path is provided.

---

## Reference Examples

The extracted JSON from the turnstile example is available at [sfsm-drafter-example.json](../stop-sfsm-drafter/sfsm-drafter-example.json), generated from [sfsm-drafter-example.md](../stop-sfsm-drafter/sfsm-drafter-example.md).
# StOP Tutorial. Chapter 4: Tools

## 4.1 Tools

Beyond the core `Sfsm` engine, the StOP SDK ships a handful of functions with corresponding CLI-scripts for working with FA definitions themselves.

StOP SDK ships with a few AI-skills, that can be useful by working with SFSMs. These skills are described in the paragraph 4.9 of this document.

### 4.2 Extended vs. compact format, and `reduceFA`

Every example so far has used the **compact** (runtime) format: a plain list of `[from, signal, to]` tuples or `[from, signal, to, command]` tuples. For larger FAs, an **extended** (declaration) format is available where every state, signal, and command can carry a human-readable `name`/`description`, and a `sender`/`receiver` — much more pleasant to read and maintain by hand, and to auto-generate documentation from.

The `reduceFA()` function converts an extended definition into the flat compact form that `Sfsm` actually consumes internally:

Passing an already-compact definition through `reduceFA()` returns it unchanged, so it is always safe to call.

### 4.3 `FaRunner` — driving an FA from code

`FaRunner` reads a signal sequence from a text file (one signal name per line, blank lines and `//` comments ignored) and feeds it, in order, into an `Sfsm` instance. It is the programmatic counterpart of the `run-fa` CLI script and is useful when you want to drive an SFSM from a test or another Node.js script without spawning a child process.

`runFromFile()` returns the complete execution trace — every transition taken, including joker fallbacks and stack push/pop events. 

 The full behaviour of `FaRunner` is covered by [FaRunner.test.ts](../../ts-stop/test/sfsm/FaRunner.test.ts).

### 4.4 `FaValidator` — validating an FA definition

`FaValidator` checks a compact or extended `FaDefinition` against a set of structural rules and returns a detailed list of errors and warnings. It is the engine behind the `validate-fa` CLI script and can also be used directly from code to catch definition mistakes before they reach the `Sfsm` engine:


The validator checks 14 rules: 6 structural errors (well-formed JSON, valid tree, no duplicate keys, no empty FAs, exactly one entry state per FA, no transitions from exit states), 2 structural warnings (duplicate FA names across the tree, duplicate signal names), 3 reference errors (each transition target exists, each sub-FA has at least one exit state, no duplicate from-state/signal pairs), and 3 semantic warnings (exit-state signal is forwarded by an ancestor, each sub-FA is referenced by its parent, no unreachable states).

 The full behaviour of `FaValidator` is covered by [FaValidator.test.ts](../../ts-stop/test/sfsm/FaValidator.test.ts).

### 4.5 The multi-FA compact format

Once an FA has children, the compact format lists **every** FA (root and all descendants) as separate top-level keys of the same object — the parent's `ts` list simply refers to a child by name as a transition target, exactly like `CoinCheck` in the example in chapter 2. The root FA is auto-detected as whichever key is never referenced as a target (3rd element) in any FA's transitions. Both this format and a single flat FA are accepted by `loadFA()` without any change to the calling code.

### 4.6 `updateCompactFA` / `updateFullFA` — evolving an FA definition without rewriting it

`updateCompactFA()` (and its extended-format counterpart `updateFullFA()`) apply a small, structured `FaUpdate` descriptor — `{ remove?: string[], add?: Record<string, ...> }` — to an existing FA definition and return a new one, without mutating the source. This is the mechanism the CLI tools `update-compact-fa` / `update-full-fa` use under the hood.

A particularly useful pattern: **turning a plain leaf state into a sub-FA**, so a device's behaviour becomes more detailed over time without touching the rest of the definition. Suppose our turnstile starts out trusting any coin unconditionally:

```json
{
  "Turnstile": [
    ["I",        "start", "locked"],
    ["locked",   "coin",  "unlocked"],
    ["unlocked", "push",  "locked"]
  ]
}
```

Later, we decide coins should actually be validated before unlocking. Instead of hand-editing this list, we describe the change as an update that (a) adds a new `CoinCheck` sub-FA, and (b) replaces the root so that `"coin"` now leads into it instead of straight to `"unlocked"`:

```typescript
import { updateCompactFA, FaDefinition, FaUpdate } from '@vsirotin/ts-stop/sfsm';

const update: FaUpdate = {
  add: {
    Turnstile: [
      ["I",          "start",  "locked"],
      ["locked",     "coin",   "CoinCheck"],
      ["CoinCheck",  "CC.ok",  "unlocked"],
      ["CoinCheck",  "CC.bad", "locked"],
      ["unlocked",   "push",   "locked"]
    ],
    CoinCheck: [
      ["I",        "coin",   "checking"],
      ["checking", "CC.ok",  "E_ok"],
      ["checking", "CC.bad", "E_bad"]
    ]
  }
};

const detailedTurnstileFa = updateCompactFA(simpleTurnstileFa as FaDefinition, update);
```

`simpleTurnstileFa` is untouched; `detailedTurnstileFa` now behaves exactly like the original for `start`/`push`, but pushes `CoinCheck` onto the stack on `"coin"` (rule 4 from the previous chapter) and only reaches `"unlocked"` once a `CC.ok` signal arrives — otherwise it falls back to `"locked"` on `CC.bad`. No existing consumer of the FA (nor the SFSM engine itself) needs to change for this to work.

A runnable version of this example is available as a unit test: [4-6-update-fa-add-detail.test.ts](../../ts-stop/test/sfsm/tutorial/4-6-update-fa-add-detail.test.ts). The full behaviour of `updateCompactFA` / `updateFullFA` (removing FAs, replacing existing ones, pruning dangling transitions, non-mutation of the source) is covered by [FaUpdater.test.ts](../../ts-stop/test/sfsm/FaUpdater.test.ts).

### 4.7 Loading FA definitions from files and URLs

You can use SFSM definition direct from code oder load them from external JSON files or URLs. 
By using SFSM from external files:

```typescript
const sfsm = new Sfsm('./turnstile-fa.json');   // Node.js only (uses fs)
```

The `loadFAFromFile()` and `loadFAFromURL()` helpers read a JSON file or fetch it from a URL  and return a `FaDefinition` object ready to be passed to `Sfsm.loadFA()`. Both accept extended or compact JSON and throw on a failed read/fetch or invalid JSON.

Two small helpers load a `FaDefinition` from outside the source code, so FA JSON files can live alongside the code that uses them (or be served remotely) instead of being inlined:

```typescript
import { Sfsm, loadFAFromFile, FaDefinition } from '@vsirotin/ts-stop/sfsm';

const sfsm = new Sfsm({ byMissingTransition: 'error' });
sfsm.loadFA(loadFAFromFile('./turnstile-fa.json'));   // Node.js only (uses fs)
```

```typescript
import { Sfsm, loadFAFromURL, FaDefinition } from '@vsirotin/ts-stop/sfsm';

const sfsm = new Sfsm({ byMissingTransition: 'error' });
sfsm.loadFA(await loadFAFromURL('https://example.com/turnstile-fa.json'));  // browser & Node.js ≥ 18
```

Both accept extended or compact JSON and throw on a failed read/fetch or invalid JSON. Their full behaviour is covered by [FaLoader.test.ts](../../ts-stop/test/sfsm/FaLoader.test.ts).

### 4.8 CLI tools and scripts

For one-off conversions and FA manipulations without writing code, the package ships several npm scripts (run from `ts/ts-stop`, after `npm run build`).

#### 4.8.1 `reduce-fa` — Convert extended FA to compact format

```bash
npm run reduce-fa -- <path-to-fa-file>
# writes <path-to-fa-file>-compact.json (or to stdout if no file extension)
```

Converts an **extended** (hand-authored) FA definition into the flat **compact** format used at runtime by `Sfsm.loadFA()`. Input can be either extended or compact; compact input passes through unchanged. Thin wrapper around `reduceFA()`, whose behaviour is covered by [FaReducer.test.ts](../../ts-stop/test/sfsm/FaReducer.test.ts).

#### 4.8.2 `update-compact-fa` / `update-full-fa` — Apply structured changes to FA definitions

```bash
npm run update-compact-fa -- --source=<path> --update=<path> [--result=<path>]
npm run update-full-fa    -- --source=<path> --update=<path> [--result=<path>]
```

Applies a small structured `FaUpdate` descriptor (JSON file with `remove` and/or `add` keys) to an existing FA definition, returning a modified copy without mutating the source. By default, `--result` outputs to `<source-basename>-updated.json` if omitted. Thin wrappers around `updateCompactFA()` / `updateFullFA()`, whose behaviour is covered by [FaUpdater.test.ts](../../ts-stop/test/sfsm/FaUpdater.test.ts).

#### 4.8.3 `json-to-drawio` — Convert compact FA JSON to UML state diagram

```bash
node scripts/json-to-drawio.js <input.json> <output.drawio>
```

Converts a compact SFSM JSON file into a professional draw.io (.drawio) UML state diagram. Features:
- **Hierarchical container layout**: Each FA rendered as a swimlane; sub-FAs as nested light-grey containers (100×60 px).
- **ELK.js hierarchical layout**: Professional automatic positioning of states within each FA using Eclipse Layout Kernel.
- **Vertical stacking**: Multiple FAs stacked without overlap with 30px spacing.
- **SFSM metadata preservation**: All state roles, FA names, signals, and commands embedded in cell styles for round-trip conversion.
- **Initial, plain, sub-FA, and exit states**: All SFSM state types rendered correctly with appropriate UML shapes.

Output diagram can be opened in draw.io, inspected visually, and subjected to small manual adjustments (state/container repositioning, style tweaks) to achieve visual perfection without affecting the underlying SFSM data.

#### 4.8.4 `drawio-to-json` — Extract compact FA JSON from UML diagram

```bash
node scripts/drawio-to-json.js <input.drawio> <output.json>
```

Reverse conversion: reads a draw.io diagram (preferably generated by `json-to-drawio.js`, but can parse hand-drawn diagrams with heuristic fallbacks) and extracts a compact SFSM JSON file. Parses the custom SFSM metadata (sfsmRole, sfsmFa, sfsmKey, sfsmSignal, sfsmCommand) from cell styles; if metadata is absent, applies shape-based heuristics (ellipses for states, swimlanes for sub-FAs, etc.).

Output is a valid compact-format FA ready for `Sfsm.loadFA()`.

#### 4.8.5 `compare-compact-jsons` — Validate diagram vs. JSON correspondence

```bash
node scripts/compare-compact-jsons.js <file-a.json> <file-b.json>
```

Intelligent comparison of two compact SFSM JSON files. Reports per-FA alignment: matching transitions, missing/extra transitions, mismatched targets or commands. Exits with code 0 if files are identical, non-zero if differences found. Designed for round-trip validation: after converting JSON → Diagram → JSON, this script confirms the resulting file matches the original exactly.

#### 4.8.6 `merge-fas` / `merge-fas-from-dir` — Combine FA definitions

```bash
node scripts/merge-fas.js <input1.json> <input2.json> ... --result=<output.json>
node scripts/merge-fas-from-dir.js <input-dir> --result=<output.json>
```

Combine multiple compact or extended FA definitions into a single multi-FA output file. Later input files override earlier ones with the same FA key. Useful for modular FA composition and testing multi-FA hierarchies.

#### 4.8.7 `validate-fa` — Validate an FA definition against structural rules

```bash
npm run validate-fa -- <path-to-fa.json> [output-report.json]
```

Validates a compact or extended FA definition against 14 structural rules (6 errors, 5 warnings) and prints a human-readable report to stdout. If `output-report.json` is given, the full `IValidationResult` (errors, warnings, valid flag) is written as JSON. Exits with code 0 if no errors were found, 1 otherwise. Useful in CI pipelines and as a pre-commit check. Thin wrapper around `FaValidator`, whose behaviour is covered by [FaValidator.test.ts](../../ts-stop/test/sfsm/FaValidator.test.ts).

#### 4.8.8 `run-fa` — Drive an FA through a signal sequence

```bash
node scripts/run-fa.js <fa.json> <signals.txt> [expected-trace.txt]
```

Loads a compact or extended FA definition, feeds it the signals from `signals.txt` (one per line, blank lines and `//` comments ignored), and prints the execution trace — one line per transition taken. If `expected-trace.txt` is given, the actual trace is compared against it line-by-line and the script exits with code 0 on match, 1 on mismatch. Thin wrapper around `FaRunner`, whose behaviour is covered by [FaRunner.test.ts](../../ts-stop/test/sfsm/FaRunner.test.ts) and [FaRunnerStacked.test.ts](../../ts-stop/test/sfsm/FaRunnerStacked.test.ts).

### 4.9 AI skills for diagram generation and validation

Three AI skills in the [ai-skills directory](../../ts/ts-stop/ai/skills) automate common diagram workflows:

- **`sfsm-json-to-uml-diagram`**: Wraps `json-to-drawio.js`. Use when you need to visualize an SFSM JSON definition as a professional draw.io UML state diagram. Generates hierarchical layout with nested sub-FAs and full metadata preservation. Note: the generated diagram is production-ready but may benefit from small manual repositioning of states or containers for optimal visual polish.

- **`sfsm-uml-diagram-to-json`**: Wraps `drawio-to-json.js`. Use when you need to extract or reverse-convert a draw.io state diagram back to compact SFSM JSON (e.g., after hand-editing the diagram, or starting from a collaborator's visual design).

- **`sfsm-compare-json-uml-diagram`**: Combines `drawio-to-json.js` and `compare-compact-jsons.js`. Use when you need to validate a draw.io diagram against its source JSON (or vice versa). Identifies every discrepancy—missing transitions, state mismatches, command errors—and reports them in a clear diff format. Accepts user-specified input/output paths, requesting them if not provided.
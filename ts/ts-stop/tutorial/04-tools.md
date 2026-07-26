# StOP Tutorial. Part 4: Tools

## 7. Tools

Beyond the core `Sfsm` engine, the StOP SDK ships a handful of functions with corresponding CLI-scripts for working with FA definitions themselves.

StOP SDK ships with a few AI-skills, that can be useful by working with SFSMs. These skills are described in the paragraph 7.6 of this document.

### 7.1 Extended vs. compact format, and `reduceFA`

Every example so far has used the **compact** (runtime) format: a plain list of `[from, signal, to]` tuples or `[from, signal, to, command]` tuples. For larger FAs, an **extended** (declaration) format is available where every state, signal, and command can carry a human-readable `name`/`description`, and a `sender`/`receiver` — much more pleasant to read and maintain by hand, and to auto-generate documentation from.

The `reduceFA()` function converts an extended definition into the flat compact form that `Sfsm.loadFA()` actually consumes internally:

```typescript
import { reduceFA, FaDefinition } from '@vsirotin/ts-stop/sfsm';

const compact = reduceFA(extendedTurnstileFa as FaDefinition);
```

Passing an already-compact definition through `reduceFA()` returns it unchanged, so it is always safe to call.

### 7.2 The multi-FA compact format

Once an FA has children, the compact format lists **every** FA (root and all descendants) as separate top-level keys of the same object — the parent's `ts` list simply refers to a child by name as a transition target, exactly like `CoinCheck` in the example below. The root FA is auto-detected as whichever key is never referenced as a target (3rd element) in any FA's transitions. Both this format and a single flat FA are accepted by `loadFA()` without any change to the calling code.

### 7.3 `updateCompactFA` / `updateFullFA` — evolving an FA definition without rewriting it

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

A runnable version of this example is available as a unit test: [07-update-fa-add-detail.test.ts](../../ts/ts-stop/test/sfsm/tutorial/07-update-fa-add-detail.test.ts). The full behaviour of `updateCompactFA` / `updateFullFA` (removing FAs, replacing existing ones, pruning dangling transitions, non-mutation of the source) is covered by [FaUpdater.test.ts](../../ts/ts-stop/test/sfsm/FaUpdater.test.ts).

### 7.4 Loading FA definitions from files and URLs

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

Both accept extended or compact JSON and throw on a failed read/fetch or invalid JSON. Their full behaviour is covered by [FaLoader.test.ts](../../ts/ts-stop/test/sfsm/FaLoader.test.ts).

### 7.5 CLI tools

For one-off conversions without writing any code, the package ships two npm scripts (run from `ts/ts-stop`, after `npm run build`):

```bash
# Extended → compact
npm run reduce-fa -- test/sfsm/test-data/turnstile-fa.json
# writes test/sfsm/test-data/turnstile-fa-compact.json

# Apply a FaUpdate file to a compact (or extended) FA file
npm run update-compact-fa -- --source=<path> --update=<path> [--result=<path>]
npm run update-full-fa    -- --source=<path> --update=<path> [--result=<path>]
```

By default, `--result` defaults to `<source-basename>-updated.json` when omitted. Both CLI scripts are thin wrappers around `reduceFA()` and `updateCompactFA()` / `updateFullFA()`, whose behaviour is covered by [FaReducer.test.ts](../../ts-stop/test/sfsm/FaReducer.test.ts) and [FaUpdater.test.ts](../../ts-stop/test/sfsm/FaUpdater.test.ts).

### 7.6 AI skills

AI-skills are placed in the [ai-skills directory](../../ts/ts-stop/ai/skills).
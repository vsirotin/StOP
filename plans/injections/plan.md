# Plan: Transitions & Commands Injection (StOPCLI)

Implementation plan for the draft in [`TMP/promts/transitions-command-injections.md`](../../TMP/promts/transitions-command-injections.md).

**Audience:** other agents that will implement this plan.
**Status:** plan only — nothing implemented yet.

---

## 0. Decisions already taken (do not re-litigate)

Settled with the workspace owner. Treat them as requirements.

| # | Decision |
|---|---|
| D1 | New standalone package `ts/ts-stop-lib-ext`, depending on `@vsirotin/ts-stop`. The core `ts-stop-lib` stays pure (it advertises "no Node.js or DOM dependencies", has **zero** runtime deps — do not break that). |
| D2 | **No RxJS, and no observables at all.** A `TRIGGER` is invoked *from the outside* of the implementation — the host may pass an RxJS `Subject`, a DOM event, or a plain function callback. Our code only ever sees a `registerTrigger(name, handler)` / `fireTrigger(name, payload)` seam. |
| D3 | Injection **scripts update JSON** (file/definition level), and a **new updatable hub class extends `TransceiverHub`** so an *already-loaded, already-running* SFSM can have transitions/commands changed live. |
| D4 | **No `eval`, no `TrustedScript`, no `Trusted Types`.** StOPCLI is interpreted from a hand-written AST over an **allow-list** of commands/expressions. Arbitrary JS is *not* supported. Deliberate deviation from draft §3/§5.4. |
| D5 | **TDD, phased with approval gates.** Phase 1 (FA definition + full update script) must be accepted before Phase 2 (interfaces), and Phase 2 before Phase 3 (implementation). Tests/interfaces may be adjusted after implementation, but *deliberately*, and the deviation must be reported. |

### Why D4 (rationale, needed to defend it in review)

The draft asked to read MDN `eval` and "carefully handle indirect calls to `eval` to avoid … security risks". That concern is well founded and cannot be fully mitigated:

- `TrustedScript` only takes effect in a **browser** with CSP `require-trusted-types-for 'script'`. **Node.js has no Trusted Types at all**, in any version. So it cannot be the cross-platform mechanism the draft requires ("works in browser as well as in Node.js").
- The draft's own quoted MDN example shows that indirect `eval` in sloppy mode leaks `var` to the surrounding scope and even to **global scope** (`eval?.("var c = 1;")` ⇒ `console.log(c) // 1`). A DSL executing user-supplied text has no safe sandbox available in Node.

So we keep the DSL's *shape* (named commands, `IF … THEN … ELSE …`, positional/named args, variables) but execute only allow-listed operations. `val x = 2 + 2` is parsed into an AST expression node and evaluated by our own evaluator — not by `eval`.

---



## 1. Current state of the codebase (facts the implementer needs)

### 1.1 Package layout

```
ts/ts-stop-lib          → @vsirotin/ts-stop      (core, pure, zero runtime deps)
ts/ts-stop-sdk          → @vsirotin/ts-stop-sdk  (Node CLI tools, depends on core)
ts/ts-stop-test-node    → private integration test
ts/ts-stop-test-angular → private integration test
scripts/test-all.sh     → runs every ts/* project's `npm test`; wired into scripts/make-commit.sh
```

### 1.2 Core internals that matter (`ts/ts-stop-lib/src/sfsm/`)

- `Sfsm.ts` — engine. `loadFA(definition)` builds a `FaResolver` and **resets** the stack to `[root@I]`. There is **no** API to mutate transitions on a live instance; that is exactly the gap D3 fills.
- `FaResolver.ts` — flattens a definition into `ResolvedFa {name, transitions, subFaNames, node, entryState}`. Its `index` is a `Map` built in the constructor.
- `TransceiverHub.ts` — routing hub: `commandRoutes: Map<string, ICommandReceiver>`, `signalSenders: ISignalSender[]`. `wireSfsm(sfsm, transceivers, signalSenders, commandReceivers)` is the factory. **This is the class to extend.**
- `FaUpdater.ts` — existing `updateCompactFA(source, {remove, add})` / `updateFullFA(...)`. Both **deep-clone** and return a new definition; they never mutate the source.
- `types.ts` — `Transition = [from, signal, to] | [from, signal, to, command]`; `FaUpdate {remove?: string[], add?: Record<string, FaNode|Transition[]>}`.
- `interfaces.ts` — `ISignalSender`, `ISignalReceiver`, `ICommandReceiver`, `ITransceiver`.
- Bases: `TransceiverBase`, `SignalSenderBase`, `CommandReceiverBase` — each validates a registered name and **throws** otherwise.
- Command flow: transition 4th element → `Sfsm` → `commandReceiver.receiveCommand(cmd, data)` → `TransceiverHub.receiveCommand` → per-command route. Unknown command ⇒ the hub **throws**.
- `Sfsm` already handles signal re-entrancy: a `receiveSignal` made while processing is **queued**, then drained. StOPCLI must not corrupt this.

### 1.3 Conventions to follow

- **Tests:** `describe`/`it`, English test titles, fixtures in `test/sfsm/test-data/*.json` loaded via `fs.readFileSync`. Import from `"../../src/sfsm"` (unit) or `"../../../src/sfsm"` (tutorial sub-dir).
- **Test naming (mandatory, from `.github/skills/testing/SKILL.md`):** `test_<subject_under_test>_<aspect>`, aspect ≤ 10 chars. Examples: `test_applyInject_live`, `test_evalExpr_arith`, `test_fireTrig_unkn`.
- **Coverage expectation (same skill):** all code paths, worst-case timeouts, broken/unavailable connections, missing/invalid env vars.
- **Cleanup:** delete temp artifacts after test runs; leave the tree as found.
- **Code style:** 4-space indent, explicit `public`/`private` on class members, JSDoc block on every exported symbol, single-quoted strings, `readonly` where applicable. See `TransceiverHub.ts` / `FaUpdater.ts`.
- **Every version carrier must be bumped together** (`.github/skills/post-task/SKILL.md`): `package.json`, `package-lock.json` (top-level **and** `packages[""].version`), `version.json`.

### 1.4 Naming conventions (tutorial ch. 3.3) — the draft's examples follow these

- states `<Fa>:<State>`, entry `<Fa>:I` or `I`, exits `E_*` / `<Fa>:E_*`
- signals `<Fa>><signal>`

## 2. Phase 1 — FA definition + full update script  ⛔ **GATE: owner accepts before Phase 2**

### 2.1 Injection script format

The draft's JSON sketch (§2) is syntactically broken — the `"commands"` object is never closed and `"signals"` is left as a dangling fragment. Define it properly:

```jsonc
{
  "fa": "TS",                       // target FA key; optional if inferable
  "remove": [ ["PU","BPU>Banknote change not needed","TS:Unlocked","TS.unlock"] ],
  "add-after": [ /* same tuple shape, inserted directly AFTER the matching tuple */ ],
  "update": [
    {
      "match":   ["PU","BPU>Banknote change not needed","TS:Unlocked","TS.unlock"],
      "set":     ["PU","BPU>Banknote change not needed","TS:Locked","TS.lock"],
      "signals": ["CPU>Change is not needed", "CCM>Change is done"]
    }
  ],
  "commands": {
    "TS.lock": ["writeLS('user-name', valueOf('user-name'))", "say 'Locked'"]
  }
}
```

Semantics to implement:

- **`remove`** — drop matching tuples from the FA.
- **`add-after`** — insert tuples immediately *after* the tuple they match. Order is semantically significant: the engine takes the first literal match before joker fallbacks.
- **`update`** — replace a matching tuple via `set`, and optionally attach/extend its `signals` list (see the open question below).
- **Idempotency:** applying the same script twice must be a no-op the second time. Add a test for it.

> **Open question for the owner (flag, do not guess silently):** the draft's `"signals": {...}` inside a transition has **no counterpart in the current library**. Today the 4th tuple element is a *single* command name; there is nowhere to store "this transition also emits signals X, Y". Decide between:
> - **(a)** extend the tuple to a 5th element `[from, signal, to, command, signals[]]` — invasive: touches `Transition` in `types.ts`, `FaResolver`, `Sfsm` matching, `FaValidator`, and the diagram tools;
> - **(b)** keep `signals` out of the tuple and let the injected **command body** emit them via the DSL's `sendSignal(...)` env function — no core change at all.
>
> This plan assumes **(b)** because it keeps `ts-stop-lib` untouched, but Phase 1 must confirm with the owner before coding.

### 2.2 Deliverables

1. `ts/ts-stop-lib-ext/package.json` — name `@vsirotin/ts-stop-ext`, `dependencies: { "@vsirotin/ts-stop": "^3.14.1" }`, devDeps mirroring `ts-stop-lib` (`jest`, `ts-jest`, `@types/jest`, `typescript`).
2. `ts/ts-stop-lib-ext/tsconfig.json` — CommonJS, same shape as `ts-stop-lib/tsconfig.json`.
3. `ts/ts-stop-lib-ext/jest.config.js` — copy `ts-stop-lib/jest.config.js`; `roots: ['<rootDir>/src','<rootDir>/test']`.
4. `src/injection/types.ts` — `InjectionScript`, `UpdateEntry`.
5. `src/injection/InjectionUpdater.ts` — pure, functional `applyInjection(fa, script): FaDefinition`. **Must not mutate its input** (mirror `FaUpdater`'s deep-clone contract); verify with `test_applyInject_noMutate`.
6. `test/test-data/turnstile-fa-compact.json` — copy from `ts-stop-lib/test/sfsm/test-data/`.
7. `test/injection.test.ts` — unit tests for the script semantics.
8. `scripts/apply-injection.js` — thin CLI wrapper matching the SDK's existing CLI style (see `ts-stop-sdk/scripts/update-fa.js`).

### 2.3 Acceptance criteria (Phase 1)

- [ ] Removing `["PU","BPU>Banknote change not needed",…]` leaves no tuple with that `(from, signal)`.
- [ ] `add-after` inserts at the right **index**, not merely somewhere in the array.
- [ ] `update` replaces the tuple and keeps tuple order stable.
- [ ] Applying the same script twice ⇒ deep-equal result (idempotent).
- [ ] The source `FaDefinition` is unmutated.
- [ ] The result loads cleanly into `new Sfsm(...)` and drives without `MissingTransitionPolicy` errors.
- [ ] `scripts/test-all.sh` passes with the new project appended to `PROJECTS`.


## 3. Phase 2 — Interfaces (design only, no implementation)  ⛔ **GATE: owner accepts before Phase 3**

> Keep these **simple**. The owner explicitly asked for plain minimal interfaces — no observables, no RxJS, no DI containers. Interfaces are expected to change after implementation; that is acceptable and should be reported, not hidden.

### 3.1 Trigger seam (D2)

Triggers are called from **outside**. The ext package only defines the seam:

```ts
/** Something that can fire a named trigger.
 *  Implemented by the host (RxJS Subject, DOM emitter, or a plain callback). */
export interface ITriggerSource {
    /** Register a handler for `name`. Returns an unsubscribe function. */
    onTrigger(name: string, handler: (payload?: unknown) => void): () => void;
}

/** Fire a trigger into the ext runtime. The host calls this; we do not own the source. */
export interface ITriggerFirer {
    fireTrigger(name: string, payload?: unknown): void;
}
```

Unit tests implement a trivial `TestTriggerBus` — **no RxJS anywhere in devDependencies**.

### 3.2 StOPCLI environment

```ts
/** Built-in functions the DSL may call. Every name here is allow-listed. */
export interface IStopCliEnv {
    valueOf(key: string): unknown;
    setValue(key: string, value: unknown): void;
    sendSignal(signal: string, data?: unknown): void;
    writeLS(key: string, value: string): void;
    readLS(key: string): string | undefined;   // undefined ⇒ "not set"
    /** Extra app-provided functions (AI engine, UI) merged into the scope. */
    readonly extra?: Record<string, (...args: unknown[]) => unknown>;
}
```

`sendSignal` must delegate to `Sfsm.receiveSignal`, which already queues re-entrant calls — do **not** reimplement queueing.

### 3.3 Updatable hub (D3)

```ts
/**
 * TransceiverHub extension that additionally owns the *live* FA definition and
 * the injected command registry, so transitions/commands can change while the
 * SFSM is running.
 */
export class UpdatableTransceiverHub extends TransceiverHub {
    constructor(sfsm: Sfsm, transceivers?: readonly ITransceiver[]);
    /** Apply an injection to the live definition and to the running engine. */
    applyInjection(script: InjectionScript): void;
    /** Read-only view of the current live definition (for tests/diagnostics). */
    getDefinition(): Readonly<FaDefinition>;
}
```

**Implementation hazards to call out for Phase 3** (the implementer must solve these, not paper over them):

1. `Sfsm.resolver` is `private`, and `FaResolver.index` is built once in its constructor. Re-pointing via `sfsm.loadFA(newDef)` **resets the stack to `[root@I]`**, silently discarding the current position. So `applyInjection` must **preserve and restore the stack**, or the core must grow a narrow `replaceDefinition(def, keepPosition)` API. **Recommendation: add that narrow API to `ts-stop-lib` rather than reach into privates from a subclass.** This is the single biggest design risk — resolve it in Phase 1, not Phase 3.
2. Adding a transition whose command has **no** registered receiver makes `TransceiverHub.receiveCommand` throw. Injections must either register a receiver or the hub must route injected commands to the CLI runtime.
3. An injection that removes the transition matching the *currently active* `(state, signal)` can leave the FA in a state with no outgoing path. Validate before applying; on violation, throw and leave the live model untouched (**atomic apply**).

---

## 4. Phase 3 — StOPCLI interpreter (AST, no eval)

### 4.1 Grammar to support

```
program     := line (',' line)*           // draft: trailing ',' means "follower of previous trigger"
line        := triggerDecl | commandCall | assign
triggerDecl := 'TRIGGER' name ('IF' expr 'THEN' block ('ELSE' block)?)? ','?
commandCall := ident argList
assign      := 'val' ident '=' expr
block       := '{' statement* '}'
expr        := literal | ident | call | binary | unary | paren
```

The draft's canonical example must parse:
```
TRIGGER aiAnswer IF(valueOf('write') == 'YES') THEN {writeLS(valueOf('user-lang')), sendSignal('CM>Change is not needed')}
aiSayThat 'You will say now with user on human language' valueOf('user-lang')
```
Note `writeLS(valueOf('user-lang'))` in the draft is **one argument**, not a key+value pair — flagged in §8.2.

### 4.2 Components

| File | Responsibility |
|---|---|
| `src/cli/lexer.ts` | tokens (ident, string, number, punct, keywords) |
| `src/cli/parser.ts` | tokens → AST; **throws with line/column** on malformed input |
| `src/cli/evaluator.ts` | AST → value, restricted to allow-listed ops |

## 5. Phase 4 — Acceptance scenario (chat-bot)

Implements draft §4.1–§4.2. **Illustrative examples are provided in this directory:**

- [`acceptance/01-initial-fa.json`](./acceptance/01-initial-fa.json) — greeting / answer / close, no injected behaviour
- [`acceptance/02-injection.json`](./acceptance/02-injection.json) — the injection adding name/LS/weather/farewell behaviour
- [`acceptance/03-expected-trace.txt`](./acceptance/03-expected-trace.txt) — expected signal-by-signal trace
- [`acceptance/README.md`](./acceptance/README.md) — how to run these through the CLI

Scenario walkthrough the tests must assert:

**Before injection** — the SFSM only greets, answers, and closes.

**After injection:**
1. On greeting, `readLS('user-name')`. If unset ⇒ ask for the name. If the answer is positive ⇒ `writeLS('user-name', …)` for future sessions. If the name is known ⇒ greet **with** the name.
2. Then ask what the user would like to talk about. If the answer is `"whether"` ⇒ call the predefined weather tool and report conditions.
3. On Close, say farewell ("Goodbye, see you next time!").

**Simulators must stay simple** (owner's instruction): a tiny `FakeAiEngine` exposing `ask(question): string` and `reportWeather(): string`, and a `FakeUi` with `onClose()`, backed by an in-memory `Map` standing in for Local Storage (`readLS`/`writeLS`). No browser, no jsdom, no real timers.

Acceptance criteria:
- [ ] Every step of §4.2 asserted individually.
- [ ] The negative branch ("name not set, user declines") covered — the `testing` skill requires all code paths.
- [ ] Re-running with the name already in LS greets **with** the name and does not re-ask.
- [ ] The scenario passes **twice**: once with the script applied via file-level JSON update, once via the live `UpdatableTransceiverHub.applyInjection` on a running SFSM — proving D3.
- [ ] Intermediate state (stack depth) asserted with `getCurrentStack()` at each step.

---

## 6. Wiring into the repo

1. Append `"ts-stop-lib-ext"` to `PROJECTS` in `scripts/test-all.sh`. Its `npm test` is mandatory (not in `OPTIONAL_PROJECTS`).
2. Consider adding `ts/ts-stop-lib-ext` to the local-integration loop documented in `ts-stop-lib/DEVELOPMENT.md` §5, alongside `ts-stop-sdk`, `ts-stop-test-node`, `ts-stop-test-angular`.
3. Per `.github/skills/post-task/SKILL.md`, after each accepted phase: bump **all** version carriers of the affected project, insert a release-notes entry at line 3, and append to root `commit-text-proposal.txt`. Commit only when explicitly asked.

---

## 7. Risks

| Risk | Mitigation |
|---|---|
| Mutating a live SFSM requires core (`ts-stop-lib`) changes | Resolve in Phase 1. Prefer a narrow public `replaceDefinition(def, keepPosition)` over subclass access to `private` fields. |
| Tuple-order semantics | `add-after` must be index-exact; assert position, not just membership. |
| `TRIGGER` semantics are loosely specified in the draft | Owner chose the simple external-callback seam (§3.1); tests use a trivial bus. No RxJS. |
| DSL grammar ambiguity in the draft | Parser must fail loudly with position; ask rather than invent. |
| `writeLS` arity in the draft example looks wrong | Flagged in §8.2 for owner confirmation. |
| Scope creep of `ts-stop-lib` | Every change to the core needs a justification line in the commit text; prefer ext-only solutions. |

---

## 8. Open questions for the owner

1. **`signals` on a transition** — extend the tuple to 5 elements (invasive, touches the core), or emit signals from the command body via `sendSignal()` (no core change)? *(Plan assumes the latter.)*
2. **`writeLS(valueOf('user-lang'))`** in the draft — a single argument, which reads like a *get*, not a set. Should it be `writeLS('user-name', valueOf('name'))`?
3. **Injection atomicity** — on an invalid script, throw and leave the running SFSM untouched? *(Assumed yes.)*
4. **Do `TRIGGER`s survive a re-injection**, or are triggers/commands replaced wholesale on each injection?

| `src/cli/StopCliRuntime.ts` | owns variables + `IStopCliEnv`; runs a line list |

### 4.3 Allow-list (security boundary)

- **Allowed functions:** only names present in `IStopCliEnv` (+ `extra`), resolved from an explicit map. An unknown identifier that looks like a call ⇒ throw, never fall through to a global.
- **Forbidden:** property access into `globalThis`, `constructor`, `__proto__`, `prototype`, `Function`, `eval`, `import`.
- **No `eval`/`new Function` anywhere in shipped code** — enforce with a test that greps the built `lib/` output so it cannot regress silently.

### 4.4 Acceptance criteria (Phase 3)

- [ ] Every DSL test name follows `test_<subject>_<aspect>`.
- [ ] Malformed script ⇒ thrown error naming line and column (test it).
- [ ] Unknown command / forbidden identifier ⇒ thrown error (test it).
- [ ] `val x = 2 + 2` then `valueOf('x')` ⇒ `4`.
- [ ] `IF … THEN … ELSE …` picks the right branch, including the false branch.
- [ ] Multi-line script with trailing `,` followers executes all followers in order.
- [ ] `sendSignal` from inside a command drives the SFSM correctly and does not corrupt the stack.
- [ ] Grep test: `lib/**/*.js` contains no `eval(` / `new Function(`.

---

---

- commands `<Fa>.<command>`

---

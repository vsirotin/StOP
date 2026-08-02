---
name: simulator-writer
description: Developer skill for writing hardware/physical-component simulators derived from a use-case document, plus their workflow integration tests. Covers interface derivation, simulator structure, dependency injection, test setup, and quality criteria. General rules apply to all languages; TypeScript-specific rules are marked with [TS]. Use when a user asks to implement simulators or workflow tests for use cases.
metadata:
  author: vsirotin
  version: "1.0"
---

# Simulator Writer

This skill produces a set of component simulators and workflow integration tests derived directly from a use-case document.

**Related skills (read before applying this skill):**
- [`typescript`](../typescript/SKILL.md) — TypeScript coding rules. Deviations are noted explicitly below.
- [`testing`](../testing/SKILL.md) — Test coverage expectations and naming conventions.

---

## Definitions

- **Simulator** — A software class that models the observable behaviour of one hardware or logical component named as an actor in the use cases. It contains no business logic beyond what the use cases describe.
- **Workflow test** — An integration test that executes one complete use case end-to-end by calling simulators in the order their steps appear in the use case document.

---

## Step 1 — Identify components

From the use-case document, extract every **named actor** that appears as the *subject* of a step sentence. Each such actor becomes exactly one simulator class.

Human actors (users, service workers) are **not** simulated. The workflow test code plays their role by calling the relevant simulator methods directly.

---

## Step 2 — Derive interfaces

For each component, derive its public interface from two sources:

| Source | Rule |
|--------|------|
| Steps where the component **receives** from another | These define the component's own interface methods (what others call on it). |
| Steps where the component **sends to** another | These define the downstream interfaces the component depends on (injected via constructor). |

**Naming:** Use the action vocabulary from the [`use-case-writer`](../use-case-writer/SKILL.md) skill to name interface methods. If a step says "sends to X", X's interface method is `receive(...)`. If a step says "validates and sends", the component does the validation internally — the method name on the downstream interface is still `receive(...)`, not `validate(...)`.

**Return values:** Interface methods return `void` by default. Use a non-void return type only when the caller must branch on the result (e.g. `dispense(): boolean` where `false` aborts the calling flow and triggers a service-state transition). Document the return semantics in a JSDoc comment on the interface.

> **TypeScript skill deviation — `Result<T>` pattern:** The `Result<T>` error-wrapping pattern is **not used** for simulators. Simulators model physical hardware that acts without returning structured errors. Error paths are modelled as different input data or configurable construction parameters.

---

## Step 3 — Define data types

Create minimal value-object types containing only attributes that the use cases explicitly mention. Do not add speculative fields.

[TS] Use `type` (not `interface`) for value objects. Mark all fields `readonly`.

---

## Step 4 — Implement simulators

Each simulator:

1. **Implements its own interface** (see Step 2).
2. **Receives all downstream component interfaces via constructor injection.** No simulator creates or locates its dependencies; the workflow test assembles the full system.
3. **Implements only the behaviour described in its use case steps.** Do not implement paths that do not appear in the use cases.
4. **Exposes observable state as public fields** (e.g. `isLocked`, `currentColor`, `storedItems`, `notificationCount`) so workflow tests can assert without knowledge of internals.
5. **Is configurable for test scenarios via construction parameters** when a component can produce multiple outcomes (e.g. `changeAvailable: boolean`). Do not use subclasses for scenario variation.

**No workflow engine.** Each simulator calls downstream interfaces directly in its method body. There is no event bus, orchestrator, or pub/sub mechanism.

**Cite the triggering use-case step** in a short inline comment on each method body (e.g. `// UC 1.2`).

> **TypeScript skill deviation — Logging:** The `log4ts` logging requirement is **toggled off** for simulators. Simulators are test infrastructure, not production components; logging adds noise without value.

---

## Step 5 — Implement the system builder

Create a single `SystemBuilder` file (or equivalent factory) in the workflow-tests directory. It assembles all simulators with their injected dependencies and returns a typed system object. Individual tests configure overrides (e.g. `changeAvailable: false`) by passing options to the builder.

This avoids duplicating wiring in every test file.

---

## Step 6 — Implement workflow tests

One test file per use case. Each test file contains one `it` block that:

1. Calls the builder to assemble the system.
2. Drives the flow by calling simulator methods in the order they appear in the use case steps.
3. Asserts all observable final states after the flow completes.

**Human actor steps** (steps where the user or service worker acts) are performed by the test code directly (e.g. calling `pushSensor.detectPush()`, `turnstile.pressServiceButton()`, `artifactBox.retrieve()`).

**Step-reference reuse** (e.g. "Steps 1.8–1.13" appearing inside another use case) is implemented by repeating the same calls in the test — not by calling the other test function.

[TS] Test naming follows the pattern from the `testing` skill: `test_uc<N>_fullFlow`.

---

## Quality Criteria

| Criterion | Check |
|---|---|
| **Interface fidelity** | Every interface method name and parameter type maps directly to a use-case step. No invented methods. |
| **Traceability** | Every use-case step where a simulator is the actor is covered by at least one line of simulator or test code. Every test step cites the use-case step it models. |
| **Autonomy** | No simulator imports or constructs another simulator class. All dependencies are received via constructor interfaces. |
| **Configurability** | All scenario variations (valid/invalid input, sufficient/insufficient resources) are driven by input data or construction parameters, not by subclassing. |
| **Observable state** | Every assertion in a workflow test reads a public field of a simulator, not a spy or mock return value. |
| **No speculative code** | Simulator methods implement only paths present in the use cases. No guard clauses for scenarios not described. |
| **All tests pass** | All workflow tests and all pre-existing tests in the project must pass after implementation. |

---

## File Layout

```
simulators/
  types.ts                     — value-object types (Coin, Banknote, Color, etc.)
  interfaces.ts                — all component interfaces
  <ComponentName>Sim.ts        — one file per simulator
  workflow-tests-direct/
    SystemBuilder.ts           — assembles and wires all simulators
    uc<N>-<kebab-title>.test.ts — one file per use case
```

---

## Reference Example

See `ts/ts-stop/tutorial/case-study-turnstile-sfsm/simulators/` for a complete worked example covering all 10 use cases of the Turnstile case study.

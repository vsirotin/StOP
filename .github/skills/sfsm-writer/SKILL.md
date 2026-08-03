---
name: sfsm-writer
description: Developer skill for deriving a Stacked Finite State Machine (SFSM) definition from a use-case document. Covers only Phase 1 — producing a compact, annotated draft of FA transitions traceable to use-case steps. Restructuring the draft into a real FA/sub-FA tree and strict-JSON validation is a later phase, out of scope here. Use when a user asks to start turning use cases into an SFSM/FA definition.
metadata:
  author: vsirotin
  version: "1.0"
---

# SFSM Writer (Phase 1 — Draft Transitions)

This skill produces a compact, human-readable, **annotated** draft of Stacked Finite State Machine (SFSM) transitions, derived step-by-step from a use-case document. It is the first of several phases that together turn a use-case document into a working `Sfsm` definition; later phases (validating the draft against tooling, and restructuring it into a real tree of FAs and sub-FAs with proper exit states) are **out of scope** for this skill.

**Related skills / material (read before applying this skill):**
- [`use-case-writer`](../use-case-writer/SKILL.md) — produces the input document this skill consumes, including the mandatory Initialization Use Case (`0.`).
- StOP tutorial: [Chapter 1 — Finite State Machines](../../../ts/ts-stop/tutorial/01-finite-state-machine.md), [Chapter 2 — Stacked Finite State Machines](../../../ts/ts-stop/tutorial/02-stacked-finite-state-machine.md), [Chapter 3 — Advanced Themes](../../../ts/ts-stop/tutorial/03-advanced-themes.md).

---

## Prerequisites

A finished use-case document (written with the `use-case-writer` skill or equivalent) must exist, and it must contain the Initialization Use Case (`0.`). If use case `0` is missing, stop and apply the `use-case-writer` skill's Initialization Use Case rule first — do not invent a startup trigger silently.

---

## Definitions (recap)

- **FA** — a finite automaton: a list of `[fromState, signal, toState]` or `[fromState, signal, toState, command]` transitions, plus a reserved entry state `"I"`.
- **SFSM** — a tree of FAs; a state that is itself the name of another FA is a sub-FA and gets pushed/popped on the engine's stack.
- **Signal** — sent *into* the SFSM by some real-world/simulated component (`sfsm.receiveSignal(...)`).
- **Command** — sent *out of* the SFSM to exactly one registered `ICommandReceiver`, as the 4th element of a transition. **Verified against the engine source** (`Sfsm.ts`, `ControllerHub.ts`): a transition carries **at most one command**, and a command name is routed to **exactly one** receiver (`ControllerHub` throws if two receivers claim the same command name). This hard 1:1 constraint drives the **Fan-out rule** below.

---

## Scope of Phase 1

Phase 1 output is a single Markdown file containing one fenced ` ```json ` code block: a top-level object `{ "<RootFaName>": [ ...transitions... ] }`, with `//` line comments citing the use-case step(s) each transition (or group of transitions) implements.

This is intentionally **not** strict JSON (comments are not valid JSON) and is **not** required to satisfy every engine constraint yet (e.g., it stays a single flat FA — no sub-FA extraction, no exit states). Both are addressed in a later phase. Do not attempt to load this draft into the `Sfsm` engine as-is.

**File location convention:** `<case-study-folder>/sfsm/<system-name>-sfsm-draft.md` (or equivalent), next to the `use-cases.md` it is derived from. See the reference example below.

---

## Step 1 — Identify components

Same technique as the `simulator-writer` skill's Step 1: every named actor that appears as the *subject* of a use-case step becomes one component. Human actors (user, service worker) are not components — their steps are external triggers only (see below).

---

## Step 2 — Classify every step

Walk the use cases in numeric order, starting with use case `0`. Classify each step as exactly one of:

| Class | Recognize by | Modeling |
|---|---|---|
| **A — Signal-transition step** | The actor's Transform produces a new Send to one or more receivers (an object or a named signal). | Produces one new FA transition per receiver — see **Fan-out rule**. |
| **B — Effect-only step** | The actor merely executes the physical effect of a command it already received, with no further outgoing Send (e.g., "the light indicator receives the unlocked signal and displays green"). | No new transition. Fold as a plain `//` comment directly after the transition that carried the triggering command — never invent a transition for it. |
| **C — External-world trigger step** | An active (external) actor's own initiative (the user, the service worker) — e.g. "the user inserts a coin", "the service worker presses the service button". | No transition of its own. It is the real-world cause of the *next* (passive-actor) step, which is the one that gets modeled. |

Never invent a transition, state, or signal for a step class that does not call for one — this keeps the draft strictly traceable to the source document (no speculative modeling).

---

## Step 3 — Naming conventions

- **State**: `<Component>:<activity>` (e.g. `WeightChecker:validating`), matching the convention already used in the reference example.
- **Signal**: `<SenderComponent>><eventName>` — always prefixed by the component that is the grammatical subject of the "sends"/"detects" clause. Reuse the use case's own wording for `eventName` when it names the signal explicitly (e.g. "an unlocked signal" → `unlocked`); invent a short camelCase name only when the use case leaves the signal unnamed (e.g. a plain object hand-off like "sends the coin").
- **Command**: a short verb phrase naming the work the destination component must now do (e.g. `validateWeight`, `dispenseChange`). No component prefix — `ControllerHub` routes commands by name, not by target state.
- Always cite the exact step number(s) a transition (or comment) implements, immediately above it, using the use case's own wording or a close paraphrase — never a bare, uncited transition.

---

## Fan-out rule

Because the engine allows exactly one command per transition and one receiver per command name, a step whose Send phase names **multiple receivers** is modeled as **one transition per receiver**, chained consecutively: the `toState` produced by transition *N* becomes the `fromState` of transition *N+1*.

- If the use case names **one** signal for all receivers (e.g. "sends an unlocked signal to the light indicator and to the timer"), reuse the **identical signal name** in every chained transition — the `fromState` always differs, so there is no ambiguity.
- If the use case names **distinct payloads** per receiver (e.g. "sends the coin to the tresor and a payment-finalized signal to the locking mechanism"), give each chained transition its own signal name.
- **Ordering is an implementation choice**, not fixed by the use case (a fan-out is conceptually simultaneous). Prefer the order that lets the FA return to an existing, already-used state at the *end* of the chain — see **Loop-closing rule**. State the chosen order and reasoning in a comment when it is not the same order the use case lists the receivers in.

---

## Loop-closing rule

When a use case's last effective transition returns the system to a state that already exists earlier in the same FA (e.g., "locks the rotating arm" naturally returns the turnstile to the same `locked` state the FA started this cycle in), **target that existing state name directly** instead of inventing a new one. This keeps the flat Phase-1 draft naturally cyclical (ready for the next use case) and previews the parent/child structure Phase 2 will formalize with real exit states.

---

## Workflow

1. Confirm use case `0` (Initialization) exists; if not, stop (see Prerequisites).
2. Extract the component list (Step 1).
3. Draft the entry transition(s) for use case `0` first.
4. Walk each subsequent use case in numeric order, classifying and modeling every step per Steps 2–3, the Fan-out rule, and the Loop-closing rule.
5. After each use case (or logical batch), show the running draft and flag explicitly any: fan-out ordering choice, invented signal/command name, or state reuse decision — these are modeling judgment calls, not facts pulled verbatim from the use case, and the user should confirm or correct them.
6. Do not attempt sub-FA extraction, exit states, or strict-JSON cleanup — flag such needs as "deferred to Phase 2" rather than solving them here.

---

## Quality Criteria

| Criterion | Check |
|---|---|
| **Traceability** | Every transition and every effect-only comment cites the exact use-case step number(s) it implements. No uncited transition. |
| **No speculative modeling** | No transition, state, or signal exists that isn't required by a Class A step. Class B and C steps never get their own transition. |
| **Fan-out fidelity** | Every step with 2+ Send receivers is modeled as one chained transition per receiver, never as a single transition with more than one command. |
| **Naming consistency** | State, signal, and command names follow the conventions in Step 3 throughout the whole draft, not just the newly added part. |
| **No duplicate transitions** | No two transitions share the same exact `(fromState, signal)` pair. |
| **Modeling choices flagged** | Every fan-out ordering, invented name, or state-reuse decision is called out to the user for confirmation, not silently assumed. |
| **Phase boundary respected** | The draft does not attempt sub-FA extraction, exit states, or strict-JSON validity — those are explicitly deferred to Phase 2. |

---

## Reference Example

See [`sfsm-example.md`](../../../ts/ts-stop/tutorial/case-study-turnstile-sfsm/sfsm/sfsm-example.md) for a worked draft of the Turnstile case study, covering use case `0` (initialization) and use case `1` (happy path with coin and change).

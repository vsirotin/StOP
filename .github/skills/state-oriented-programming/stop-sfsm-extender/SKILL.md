---
name: stop-sfsm-extender
description: >-
  Extends an existing SFSM (Stacked Finite State Machine) definition with new
  or updated FAs / sub-FAs given a semiformal draft. Covers normalization of
  the draft into the compact SFSM notation, validation with the SDK scripts,
  derivation of a use-case-based test catalog, scripted behaviour tests, and
  dummy implementations of the new commands. Hands over to the integrator
  skill for wiring the new commands into real components.
metadata:
  author: vsirotin
  version: "1.0"
---

# SFSM Extension

This skill extends an **existing SFSM (Stacked Finite State Machine)** — the
"behavior core" of a system — with new or updated FAs and sub-FAs, starting
from a **semiformal draft** of the new behaviour. It covers the full path from
draft to validated, tested SFSM with dummy command implementations. The
subsequent wiring of the commands to real components is out of scope; it is
performed by the `stop-sfsm-integrator` skill.

> **Terminology used in this document**
>
> - **SFSM / FA** — a *Stacked Finite State Machine*; a tree of *Finite
>   Automata*. When a sub-FA appears as a target state of another FA, the
>   engine *pushes* it onto the stack; reaching an exit state (`E_...`)
>   *pops* it and forwards the triggering signal to the parent FA.
> - **Compact notation** — transitions as `[from, signal, to]` or
>   `[from, signal, to, command]`, grouped per FA under the FA name.
> - **Extended draft notation** — a semiformal notation used in drafts, where
>   a transition may additionally annotate the *result signal(s)* a command
>   sends after completing its business logic, e.g.
>   `["I", "X>go", "S", "X.doIt" -> "X>done"]` or with a choice of results
>   `..."X.decide" -> "X>ok", "X>failed"`. These annotations are **not** part
>   of the compact format; they are a specification for the command
>   implementations.
> - **SDK** — the SFSM SDK package with its `scripts/` (validators, `run-fa`)
>   and `tutorial/` directories.

---

## Prerequisites

Before starting, the user must provide:

1. **Paths** to:
   - the **Root SFSM** file (compact notation) to be extended,
   - the **semiformal draft** of the new/updated behaviour,
   - the **directory for behaviour tests** of the SFSM (with an existing
     scripted-test example, if any),
   - the **directory for plans and issues**,
   - the **directory with SFSM tutorials** and the SDK scripts directory,
   - the directory for temporary agent files.
2. The **mapping** between SFSM components and system components (which
   transceiver will own which signals/commands), if already known.
3. Recommendations on naming conventions used by the project, if any.

If any of this information is missing, request it from the user before
proceeding.

## Approach

Extension is a complex, iterative task. It is broken into six steps; each
step must be completed and verified before the next begins. Write a **plan
document** in the *directory for plans and issues* before starting, and keep
it updated while working.


### Step 1 — Normalize the draft and convert it to the compact notation

1. **Fix spelling and naming** of the draft (drafts typically contain typos):
   signals, states, and commands must follow the project conventions. Typical
   conventions: commands namespaced `<FaName>.<command>`; states of an FA
   namespaced `<FaName>: <state>` (when referenced across FAs); signals
   `<Sender>><signal>`; exactly one entry state `I` per FA; exit states
   prefixed `E_`. Record every normalization in a table (draft name →
   canonical name) in the plan document.
2. **Map the extended draft notation to the compact format**: remove the
   `command -> "result signal"` annotations. They become the *contract* for
   the command implementations (Step 5). A command may have one or several
   possible result signals (the implementation chooses).
3. **Check common FA rules**: every state used as a transition source has an
   incoming transition or is the entry state; no unreachable dead ends unless
   explicitly intended; every signal that a sub-FA must react to has a
   transition; wildcard sources (`*`) are used deliberately (they match in
   any state of the FA and may shadow more specific transitions depending on
   rule order — first match wins).
4. **Push semantics (critical).** When a transition targets a sub-FA name,
   the engine pushes the sub-FA and *forwards the triggering signal* into it.
   The sub-FA's **entry transition must therefore trigger on the same signal
   that caused the push**. If the draft makes the sub-FA wait for a different
   signal (e.g. a command result), the forwarded signal finds no handler,
   bubbles down the stack and typically unwinds the machine via the root's
   fallback transition. In that case, restructure: move the push-time command
   into the sub-FA's entry transition, optionally via an intermediate
   "preparing" state that waits for the command result. Verify every push in
   the model against this rule.
5. Write the resulting compact FAs into the Root SFSM (or replace the
   outdated variants of existing FAs). If a removed command/signal is no
   longer used anywhere, plan to remove its registration from the owning
   transceiver in Step 5.

### Step 2 — Validate with the SDK scripts

1. Run the FA validator (e.g. `validate-fa.js <root-sfsm.json>`) on the
   updated Root SFSM. If a whole-SFSM structure validator
   (`validate-whole-sfsm.js`) is applicable to the project's file format, run
   it as well.
2. **Analyse every warning**; do not ignore them silently. Typical warnings
   and their tolerance reasoning:
   - *Signal used by multiple FAs* — expected for the push/pop forwarding
     pattern (parent and sub-FA both react to the same forwarded signal) and
     for root-level fallback pushes. Tolerable.
   - *Exit-state signal not handled by an ancestor* — expected for terminal
     paths (apology/error pages, "session over"): the forwarded signal
     bubbles down to the root's fallback transition (e.g. a wildcard reset)
     and the machine resets. Tolerable **if** the terminal behaviour is
     intended. Verify at least one such path behaviourally (Step 4).
   - *Structural errors* (unreachable states, unknown targets, …) — never
     tolerable; fix or discuss with the user.
3. Record the validation result and the tolerance reasoning for each warning
   class in the plan document. If a finding cannot be justified, discuss it
   with the user before proceeding.


### Step 3 — Create the test catalog

1. Derive the catalog from the draft's use cases / scenarios (drafts usually
   list them informally, e.g. `S01: Start -> X -> Y`). For each scenario
   define: purpose, the exact signal sequence, and the expected end state.
2. Cover at least: one full happy path through each new FA; every exit state
   of every new FA (each `E_...` must be reached by at least one scenario);
   every pause/resume, refresh, or recovery cycle; every terminal
   (apology/error) path; reuse of existing sub-FAs from the new context.
3. Write the catalog as `<test-dir>/<new-fa-dir>/test-catalog.md`, including
   the notation of shared scenario fragments (e.g. an abbreviation for the
   "start" sequence) and the execution semantics (see Step 4).

### Step 4 — Scripted SFSM tests

1. Model the tests after the existing scripted-test example in the behaviour
   test directory (typically: per-scenario `signals.txt` + golden
   `expected-trace.txt`, a golden generator script, and a spec that runs
   `run-fa.js` per scenario and compares the traces).
2. **Runner signal semantics (critical).** Understand how the runner treats
   commands before writing signal lists. The typical `run-fa` behaviour
   without a command interpreter: **each emitted command consumes the next
   signal from the list** and feeds it into the FA. Consequences:
   - The signal list is the exact sequence of signals the FA observes; each
     line usually plays two roles: result of the previous transition's
     command, and trigger of the next transition.
   - If a scenario **ends** on a command-bearing transition, append one
     trailing neutral signal (one that the root's fallback transition catches
     without side effects) so the final command has something to consume and
     the run completes with a **full trace**. Prefer complete runs (exit 0)
     over truncated partial traces, so the golden shows the final pop/unwind
     steps.
3. **Review every generated golden trace manually** before approving it:
   - the state path follows the intended scenario;
   - every push is followed by the sub-FA's entry transition on the forwarded
     signal (Step 1, item 4);
   - every exit pops the sub-FA and the parent (or root fallback) handles or
     intentionally ignores the forwarded signal;
   - commands in the trace match the transition table.
   If a trace deviates, fix the model (not the trace) and regenerate.
4. Run the tests; all must pass. If a test fails and cannot be fixed within
   3 attempts, discuss with the user.

### Step 5 — Implement the new commands as dummies

1. For every **new command**, add a dummy implementation with a `TODO:`
   comment describing the real business logic, in the transceiver/event
   processor that owns it per the component mapping. Dummies send the result
   signal(s) from the extended-notation annotations so the SFSM can already
   run end-to-end. For commands with several possible results, the dummy
   sends the happy-path result (documented in the `TODO`).
2. For every **new signal**, register it with exactly one sender; for every
   new command, register it with exactly one receiver. Remove registrations
   of commands/signals that became unused in Step 1.
3. Commands that produce a signal consumed by the SFSM itself must send it
   **asynchronously** (after the current transition is committed) — follow
   the existing pattern in the project's transceivers.
4. Wire new transceivers into the system's hub/processor bootstrap.
5. Run the whole unit test suite; everything must stay green.

### Step 6 — Completion

1. Update the plan document: steps done, validation warnings and their
   tolerance reasoning, deviations from the draft (with reasons), and the
   list of created/changed files.
2. Hand over to the `stop-sfsm-integrator` skill for replacing the dummies
   with real components.
3. Execute the project's post-task checklist (version bump, release notes,
   commit proposal), if defined.

## Common pitfalls (from experience)

- **Push with mismatched entry signal** — the most dangerous defect: the
  machine silently unwinds on the forwarded signal. Always verify pushes in
  golden traces.
- **Trailing command without a following signal** — the run aborts and the
  final transition line is lost from the trace; append a neutral signal.
- **Command results sent synchronously** — the SFSM may not have committed
  the current transition yet; send results asynchronously.
- **Typos in drafts** — normalize first, never "fix" them inside the compact
  file ad hoc; keep the mapping table for review.
- **Exit-state naming inconsistency** — a draft may use several spellings of
  the same exit concept (`E_SHOW_...` vs `E_SHOWING_...`); unify them.


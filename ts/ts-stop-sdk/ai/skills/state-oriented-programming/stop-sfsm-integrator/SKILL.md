---
name: stop-sfsm-integrator
description: >-
  Integrates an existing SFSM (Stacked Finite State Machine) definition into a
  running system. Guides the wiring of the SFSM to real system components via
  signal senders, command receivers, and transceivers; drives the integration
  through four incremental stages, from an initialization check to a full
  end-to-end integration test with the real components.
metadata:
  author: vsirotin
  version: "1.1"
---

# SFSM Integration

This skill integrates an **SFSM (Stacked Finite State Machine)** — produced by
the modelling process — into a host system. The SFSM is the "behavior core" of
the application; integration wires it to the real system components that send
it signals and act on the commands it issues, and verifies the wiring with
tests.

> **Terminology used in this document**
>
> - **SFSM / FA** — a *Stacked Finite State Machine*; a tree of *Finite
>   Automata* (FAs). One root FA at the top, and any number of nested **sub-FAs**
>   underneath it. When a sub-FA appears as a target state of another FA, the
>   engine *pushes* it onto the stack; reaching an exit state *pops* it and
>   hands control (and the triggering signal) back to the parent FA.
> - **Component** — a unit of the SFSM (in the `sfsm.ext.json` / compact
>   definition) that groups related states, signals, and commands.
> - **Signal Sender** (`ISignalSender`) — emits signals *into* the SFSM.
> - **Command Receiver** (`ICommandReceiver`) — reacts to commands that come
>   *from* the SFSM.
> - **Transceiver** (`ITransceiver` / `TransceiverBase`) — a unit that plays
>   both roles: it can both send signals to and receive commands from the SFSM.
> - **TransceiverHub** — the wiring hub that connects every signal sender and
>   command receiver to one `Sfsm` instance (normally created by `wireSfsm`).
> - **BATs** — *Behaviour Acceptance Tests* for the integrated SFSM.
> - **SDK** — the `@vsirotin/ts-stop` package, used to extract and merge compact
>   SFSM definitions.

---

## Prerequisites

Before starting, the user must provide:

1. **Paths** to:
   - the `Integrated SFSM` directory (the SFSM definition and its tests),
   - the `Root SFSM` file (the existing SFSM into which the new definition
     will be merged),
   - the `Directory for communicators` (signal senders, command receivers,
     transceivers, etc.),
   - the `Directory for Behaviour Acceptance Tests` (BATs) for the SFSM,
   - the `Directory with SFSM Tutorials`,
   - the `Directory for plans and issues` related to this integration,
   - the `Directory for temporary agent's files and agent's logs`.
2. The **mapping** between the SFSM components and the system components.
3. **Recommendations** for where newly generated files and directories should
   be placed, if any.

If any of this information is missing, request it from the user before
proceeding.

## Approach

Integrating an SFSM into a system is a complex, iterative task. It is broken
down into four essential technical steps, each of which must be completed and
verified before the next begins:

1. **SFSM initialization** — prepare the definition for integration
   (including handling the case where it is a sub-FA of an existing SFSM).
2. **Preparing a draft integration test with component simulators** — prove
   the wiring against simulated system components.
3. **Sequentially replacing the component simulators with the real
   components** — swap each simulator for its real counterpart, verifying after
   every swap.
4. **Full integration test with the real components** — run the remaining
   acceptance tests against the fully wired, real system.

## Mental model

Correct integration requires a deep understanding of:

- the SFSM definition as produced by the **SToP SDK** modelling process, and
- the outcome of the **previous modelling steps** (the business model, use-case
  traces, and the resulting SFSM model).

You should therefore **first read all tutorials** in the `Directory with SFSM
Tutorials`, and **then analyse the SFSM definition and its tests** in the
`Integrated SFSM` directory. Only then start planning the integration.

## Planning

Because integration can take a long time and span multiple iterations, careful
planning and coordination with all involved parties are essential.

Begin with a thorough analysis of:

- the SFSM definition and its components, and
- the target system's architecture.

This analysis surfaces potential challenges and dependencies early. Use its
results to create a **detailed integration plan**, which must be placed in the
`Directory for plans and issues`.

The information provided by the user should be recorded **by default** in the
file `user-instructions.md` in the `Directory for plans and issues`. If any
required information is missing, request it from the user before proceeding.

## Technical steps

### Step 1 — SFSM initialization

The integrated SFSM may turn out to be a **sub-FA** of an SFSM that already
exists in the project. In that case a renaming may be required (for example, to
namespace states, signals, and commands with the FA's name; see the naming
conventions in the tutorials). If the renaming is needed — rather than merely
proposed — **make a proposal and confirm it in a dialog with the user**.

If the integrated SFSM is a sub-FA, it must also be clarified **how it will be
"called" from the parent FA** (which target state activates it, and which
signals reach it). This typically requires an **update of the parent FA**.
Make a proposal for this update and confirm it with the user.

### Step 2 — Prepare a draft integration test with component simulators

1. **Analyse the component mapping.** Before generating any code, study how the
   integrated SFSM components map to the system components. Determine, in
   detail:
   - how each system component should **react to commands** from the SFSM, and
   - which system components should **send signals** into the SFSM.

2. **Resolve missing system components.** If some system components are not yet
   implemented, propose how they should be implemented and discuss this with
   the user:
   - For **simple** behaviors (for example, reading data from browser local
     storage), the implementation can live directly inside a *transceiver*.
   - For **more complex** behaviors, create dedicated new components.

   Discuss all of this with the user and record the decisions in the plan
   document in the `Directory for plans and issues`.

3. **Choose the first integration test.** Decide which integration test to
   implement first by analysing the existing tests for the integrated SFSM
   (in the `test` subdirectory of the `Integrated SFSM` directory). Start with
   the **simplest happy-path test** that covers the SFSM's main functionality.
   Then discuss with the user which test to implement next.

4. **Generate communicator drafts.** Generate drafts containing the function
   signatures for the required **transceivers and signal senders** (see the
   concrete example in chapter 3 of the tutorials, document
   `03-advanced-themes.md`, paragraph
   `## 3.2 Signal Senders, Command Receivers, Controllers, and the Transceiver
   Hub`). Place them in the `Directory for communicators`, and record the list
   of generated files in the plan document in the `Directory for plans and
   issues`.

5. **Generate component simulators.** For complex components (those not
   integrated into transceivers), generate **component simulators** and place
   them in the `simulators` subdirectory of the `Directory for Behaviour
   Acceptance Tests`.

6. **Merge the SFSM into the root.** Using the SDK tools, extract the **compact
   version** of the integrated SFSM and insert (merge) it into the `Root SFSM`
   file. Use the `@vsirotin/ts-stop` package for this task.

7. **Generate the integration test draft.** Generate a draft of the integration
   test that uses the component simulators, and place it in the `test`
   subdirectory of the `Directory for Behaviour Acceptance Tests`.

8. **Run and verify.** Run the test and confirm that it passes. If it does not
   pass and you cannot fix it, discuss how to fix it with the user.

### Step 3 — Sequentially replace the component simulators with the real components

After Step 2 completes successfully, you have a working integration test that
uses component simulators. Now:

1. **Replace the simulators one at a time** with the corresponding real
   components.
   - The test itself may need to be **updated** to reflect the changed
     environment (for example, a simple simulator is replaced by a real
     web component).
   - In some cases a **mock** is appropriate — for example, to simulate a call
     to a web API. When using a mock, keep in mind that **the goal is a correct
     integration, not testing itself**: the mock must match the real component
     exactly.
2. **Run the integration test after every replacement** and confirm it passes.
   If it does not pass and you cannot fix it, discuss how to fix it with the
   user.
3. When **all** simulators have been replaced, run the integration test again
   and confirm it passes.
   - If it does **not** pass and you cannot fix it, discuss it with the user.
   - If it **passes**, generate a **script for manual testing** of the
     integrated SFSM with the real components, and place it in the `Directory
     for plans and issues`.
4. Wait for the **user to confirm** that the integrated SFSM works correctly
   with the real components before starting the next step.

### Step 4 — Full integration test with the real components

Repeat Step 3 for the **remaining** tests of the integrated SFSM.

After all tests pass, generate a **script for manual testing** of the integrated
SFSM with the real components and place it in the `Directory for plans and
issues`.

The integration is considered complete once the **user confirms** that the
integrated SFSM works correctly with the real components.



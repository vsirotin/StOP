---
name: use-case-writer
description: Interactive Use Case Writer. Given an existing user story, elicits missing details through structured questioning and produces a complete, traceable, professionally written use-case document following the project's established structure and style. Use when a user asks to write, draft, or create use cases for a user story.
metadata:
  author: vsirotin
  version: "1.5"
---

# Use Case Writer

This skill produces a complete, traceable use-case document derived from an existing user story. The result is unambiguous for human readers and AI coding agents.

---

## Prerequisites

A finished user story (written with the `user-story-writer` skill or equivalent) must exist before this skill is applied. If no user story is available, stop and ask the user to provide or create one first.

---

## Initialization Use Case

Every use-case document for a stateful system must include exactly one **Initialization Use Case**, numbered `0`, placed before use case 1. It describes how the system moves from "not yet running" into the operational condition in which use case 1 begins — mirroring the reserved entry state `"I"` of a Stacked Finite State Machine and the mandatory transition out of it (see the StOP tutorial, [chapter 1.2](../../../ts/ts-stop/tutorial/01-finite-state-machine.md#12-defining-the-turnstile-with-the-stop-library)).

- Title: "System initialization" (or a title reflecting the domain-specific startup action).
- Steps are numbered `0.1`, `0.2`, … and follow the same ITS, active/passive-actor, and citation rules as every other use case. This is the sole exception to the "use cases start at 1" numbering rule.
- The user story rarely describes this action explicitly, since it is easy to take a running system for granted. If the initialization trigger is not stated and cannot be safely inferred from the user story, stop and ask the user how the system starts (e.g., *"How does this system move from off/idle into its first operational state — who or what triggers it?"*) before drafting use case 0.
- Use case 0 is exempt from the "Steps X.Y–X.Z" reuse convention: since it always runs first and exactly once, no other use case ever needs to cite it.

---

## Output Structure

The document must open with a back-link to its source user story:

```
Base user story: [<System Name>: User Story](<user-story-filename>.md)
```

The body is an ordered list of use cases. Each use case follows this layout:

```
<N>. <Title>:
    <N>.<S>  <Actor> <action in active voice, present tense>.
    <N>.<S+1>  <Actor> <action>.
    ...
```

**Numbering rules:**
- Use cases are numbered sequentially from 1 with no gaps, except for the mandatory Initialization Use Case, which is always numbered `0` and precedes use case 1 (see **Initialization Use Case** above).
- Steps within a use case are numbered `<use-case-number>.<step-number>` starting from 1, sequentially with no gaps.
- When a use case reuses steps from another use case, cite them as `Steps <N>.<S>–<N>.<E>` on a line by itself, then continue with new steps if needed.

**Step-reference rules:**
- Before citing `Steps X.Y–X.Z`, verify that every referenced step is semantically valid in the new context. A step that contradicts the purpose of the borrowing use case must not be included; adjust the range or rephrase.

---

## Step Construction Rules — Input, Transform, Send (ITS)

Every step must describe exactly one instance of the extended Input–Transform–Send (ITS) pattern. Never split one ITS instance across two steps, and never combine two ITS instances into one step.

**Input** — the trigger for the step. Exactly one of:
- Receiving an object from the external world (e.g., a coin inserted by the user). Valid only when the step's actor is itself part of the external world (a human, an external system), per **Active vs. Passive Actors** below.
- Receiving an object from another element in the system.
- Receiving a signal from another element in the system.
- Detecting an event in the external world through a sensor.
- Detecting a timeout from a timer. A timer can only be detected if some actor started it in an earlier step (see indirect rule 2 below).
- No input — the step is a direct, uninterrupted continuation of the same actor's own immediately preceding step (e.g., dispatching a second output of a decision already made in that step). This continuation is valid only while no other actor's step intervenes. As soon as a different actor's step appears, the sequence is broken: a later step by the first actor is no longer "the same object continuing" and needs its own genuine Input, or the additional output must instead be folded into the interrupting-free step's own Send phase (see the multiple-receivers rule under **Send** below).

Every step's trigger is therefore always exactly one of: an exclusive description of an event in the external world (only for external-world actors), or one step in an uninterrupted sequence performed by the same object.

**Transform** — what the actor does with what it received. Exactly one of:
- Creating an object or a signal.
- Transforming an object into new object(s) — including extending or reducing elements and changing an object's state.
- Removing an object from the system.
- No transformation (pure pass-through).

Validating data and deciding the outcome are the same transform, not two. Never write a generic "validates" step followed by a separate "decides" step; merge them into one step whose text states the specific outcome for that use case (see indirect rule 3).

**Send** — naming only the receiver(s) of a created, transformed, or forwarded object or signal. Never describe the sending/delivery mechanism (queues, buses, events, protocols, etc.); that machinery is out of scope for use cases. A step may have no Send phase when its result is consumed only internally by the next step of the same actor.

One step's Send phase may name several receivers, each with its own object or signal (e.g., "…sends the coin to the tresor and a payment-finalized signal to the locking mechanism."). This is the only correct way for one actor's single Transform to reach more than one receiver: splitting it into separate Send steps interrupted by another actor's reaction is invalid, because the second Send step would no longer be an uninterrupted continuation of the first (see the Input rule above).

**Indirect rules:**
1. If a step's input object or signal was NOT produced by the immediately preceding step of the same use case, the step must explicitly cite the number of the step that produced it (e.g., "…sends a change-required signal, per the decision in step 1.4, to the change dispenser."). Exception: when a single step's Send phase names multiple receivers at once (see **Send** above), every one of those receivers' own Receive steps needs no citation — even the ones that are not immediately preceded by the shared Send step — because that one Send step is already the unambiguous, explicitly named source for all of them.
2. A step that detects a timeout must cite the number of the step where the corresponding timer was started (e.g., "…the timer for the unlocked state (started at step 1.10) detects…"). Every timer referenced in a timeout step must have an explicit "starts" step somewhere upstream in the document before it can be cited.
3. When a transform's outcome depends on its input (e.g., a validated coin can be valid-with-change, valid-without-change, or invalid), each use case states its own specific outcome as a single step. Do not model this as a shared generic step ending in a separate per-branch decision step.

---

## Active vs. Passive Actors

Only actors from the external world (humans, external systems) are active: a use case may take their initiative as given, without a prior message, because "the user inserts a coin" or "the service worker presses the button" needs no further explanation. Every other actor — every system component, sensor, indicator, timer, or mechanism — is passive. In a technical system nothing is ever received "suddenly": a passive actor does nothing until another actor's Send phase explicitly names it as the receiver of a signal or object, and its own step must show it receiving that named signal or object as its Input.

**Rule:** a passive actor's step is never triggered by textual adjacency alone or by a descriptive reference to another actor's condition. A phrase such as "now that the arm has unlocked" or "now that the push sensor has detected the user" is NOT sufficient by itself — it does not show an actual message being sent and received. Instead, every trigger must be modeled as an explicit Send/Receive pair:
- The producing step's Send phase must name the passive actor as receiver of a specific signal or object (e.g., "…sends a passage signal to the locking mechanism.").
- The receiving actor's own step must state that it receives that named signal or object (e.g., "The locking mechanism receives the passage signal and locks the rotating arm.").
- Cite the originating step number only when that Send is NOT the immediately preceding step of the same use case (per indirect rule 1); otherwise no citation is needed.
- Never leave a passive actor's step as a bare, uncaused statement, and never substitute a "now that X" description for an actual Send/Receive step pair.

**No implicit knowledge of the outside world:** an actor's Send phase may only name a receiver it is explicitly defined to know about (its role — e.g., a checker knows the change dispenser, an indicator, a timer, the locking mechanism). An actor never acts on, or refers to, a condition or actor it has no defined relationship with; all awareness of the rest of the system arrives exclusively through received signals or objects.

**Fan-out to multiple receivers:** when a single Transform result must be observed by more than one passive actor (e.g., an unlock event that must both light the indicator and start a timer, or a service-state transition that must both light the indicator and sound the alarm), name every receiver in the ONE step that performs the Transform and Send (e.g., "The locking mechanism sends an unlocked signal to the light indicator and to the timer for the unlocked state."). Each receiver still gets its own explicit Receive step afterward, and none of them needs a citation back to the shared Send step (see indirect rule 1). Never split a single actor's fan-out across multiple Send steps interrupted by another actor's reaction — once a different actor's step intervenes, a later "second send" by the first actor is no longer an uninterrupted continuation and has no valid trigger. Never collapse two or more receivers into one shared, send-less trigger phrase either.

**Reusable-range self-containment:** no step inside a range cited elsewhere as `Steps X.Y–X.Z` may cite a step number outside that range. Design such a range to begin with a passive actor's Receive step that names only the signal or object it receives (never the sender), so the range reads correctly regardless of which use case reuses it. Keep the use-case-specific Send step that produces that signal in each reusing use case's own unique prefix, immediately before its citation of the shared range — since it is then the immediately preceding step, it needs no numeric citation of its own.

---

## Assumption & Resource-Commitment Ordering

A step that moves an object to an irreversible destination (permanent storage, deletion, dispatch to an external system, etc.) is a **commit step** for that object. Committing an object is only safe once every check that could still invalidate the transaction has passed.

Before finalizing the document, for every commit step ask: *does any other use case in this document need to return or reverse this same object on a failure or insufficient-resource path?* If yes:

1. The commit step must be ordered strictly after every verification, allocation, or availability check whose failure would require reversing it. Reorder the happy-path steps so the commit step is last, once all such checks have confirmed success — the numbering and referenced use cases must be updated accordingly.
2. If reordering fully resolves the conflict without changing the meaning of any use case, apply it silently and continue.
3. If reordering does not resolve the conflict — the user story is silent, ambiguous, or contradictory about what should happen to the object on failure — stop drafting. Ask the user (the spec owner) to resolve it, stating explicitly: which step commits the object irreversibly, which use case/step needs to reverse it, and why the two cannot currently coexist. Do not guess or silently invent a resolution to a genuine specification gap.

---

## Workflow

Follow these steps in order. Do not skip a step.

### Step 1 — Parse the user story

Read the provided user story and extract:

- All named structural elements (visible and hidden).
- All actors (primary user, operators, service workers, timers, external systems).
- All states and modes mentioned in the Behavioral Overview.
- All error paths, edge cases, and timeout scenarios.

Produce an internal checklist — do not show it to the user unless asked.

### Step 2 — Identify use case candidates

From the checklist, derive the full set of use cases needed to cover the user story:

- Use case `0`: the mandatory Initialization Use Case (see **Initialization Use Case** above). Ask the user for the startup trigger if the user story does not state it.
- One use case per distinct happy path (combinations of inputs or actors that lead to a successful outcome).
- One use case per distinct error path.
- One use case per distinct timeout or service-state transition.

Present the list of use case titles to the user and ask: *"Does this list cover everything, or are there cases to add, remove, or rename?"*

Wait for confirmation before proceeding.

### Step 3 — Elicitation round

For each confirmed use case, identify any steps where the user story is silent on the detail needed to write concrete, atomic steps. Ask the user only about genuine gaps — target no more than 5 questions total across all use cases. If you have enough information, skip this step.

### Step 4 — Assumption and ordering consistency check

Before drafting, walk through every commit step (see **Assumption & Resource-Commitment Ordering**) across all confirmed use cases. Identify any case where an object is committed irreversibly in a shared/reused step sequence before a later use case needs to return or reverse it. Reorder as needed, or — if reordering cannot resolve a genuine gap in the user story — ask the user to resolve it before continuing.

### Step 5 — Draft and confirm

Write the full use-case document following the **Output Structure** above, with every step conforming to the **Step Construction Rules (ITS)**, the **Active vs. Passive Actors** rule, and the ordering fixes from Step 4. Before presenting the draft, check that every timer used in a timeout step has an explicit prior "starts" step, that every step whose input is not the immediately preceding step cites the originating step number, that every passive actor's trigger is an explicit named Send/Receive pair (never a "now that X" description substituting for one), and that fan-out to multiple receivers is named within the one step that performs the Transform rather than split across separate Send steps interrupted by another actor. Present it to the user and ask: *"Does this capture all cases correctly, or should anything be adjusted?"*

Apply corrections and produce the final version.

---

## Style Rules

- Write in present tense ("The coin-receiver registers…", "The user inserts…").
- Use the active voice. The subject of every step sentence is the named actor.
- Use the exact component and actor names from the user story's Structure Overview. Do not paraphrase.
- Titles are short noun phrases describing the scenario (e.g., "Happy path with coin and change", "False coin — user collects within time").
- Do not add prose explanations between steps. Steps only.
- Follow the ITS pattern in every step (see Step Construction Rules). Name only the receiver(s) in a Send phase; never mention how the object or signal travels.
- Cite an originating step number whenever a step's input is not the immediately preceding step, except when it is one of several receivers named together in a single Send phase (fan-out sends split across separate steps, timeouts referencing their timer's start step).
- Do not add a "Preconditions" or "Postconditions" block unless explicitly requested.

---

When using action verbs, try to follow the [Action Vocabulary](../user-story-writer/action-vocabulary.md) whenever possible. Use unlisted verbs only when no entry fits.
---

## Reference Examples
Use the [example](use-cases-example.md) as a reference for style, structure, and level of detail.

---

## Quality Criteria

Before presenting any draft, verify all of the following:

| Criterion | Check |
|---|---|
| **Professional wording** | No informal language. Active voice and present tense throughout. Domain-appropriate terminology consistent with the user story. |
| **Completeness** | Every happy path, error path, timeout, and service-state transition from the user story has at least one corresponding use case. |
| **Human + AI readability** | Each step is self-contained and unambiguous. A developer or coding agent can derive the exact system behaviour from the step text alone. |
| **Consistency** | Actor names, component names, and state names match the user story exactly. No synonyms or abbreviations that differ from the user story's terminology. |
| **Traceability** | Every element, actor, and scenario named in the user story appears in at least one use case step. No use case step references elements not present in the user story. |
| **ITS atomicity** | Each step describes exactly one Input–Transform–Send instance (see Step Construction Rules). Validation and its outcome are merged into a single transform, never split into a generic "validates" step plus a separate "decides" step. |
| **Actor attribution** | Every step explicitly names the performing actor. Pronouns ("it", "the system") are not used. |
| **Send phrasing** | The Send phase of a step names only the receiver(s). It never describes the delivery/messaging mechanism. |
| **Trigger validity** | Every step's Input is exactly one of: an event in the external world (only when the actor is itself external), an uninterrupted continuation of the same actor's immediately preceding step, or an explicitly received signal/object that an earlier step's Send phase sent to it by name. A continuation broken by another actor's intervening step is never treated as valid. |
| **Multi-receiver sends** | When one Transform's result must reach more than one receiver, all receivers are named together in the ONE step that performs the Transform and Send. Fan-out is never split across separate Send steps interrupted by another actor's own reaction step. |
| **Step-citation validity** | Every step whose input is not the immediately preceding step of the same use case (timeouts, and Send steps not covered by the multi-receiver exception above) explicitly cites the originating step number. |
| **Timer prerequisites** | Every timer referenced in a timeout-detection step has an explicit "starts" step earlier in the document. |
| **Ordering & assumption consistency** | No step commits an object irreversibly before all verification/allocation steps whose failure would require reversing it have completed successfully. Every failure or insufficient-resource branch that must return an object does so through an object that a shared prior step has not already committed elsewhere. |
| **Initialization present** | The document contains exactly one Initialization Use Case, numbered `0`, preceding use case 1, describing how the system reaches the state in which use case 1 begins. |
| **Active vs. passive actors** | Every passive (non-external-world) actor's step receives an explicitly named signal or object that some earlier step's Send phase sent to it by name — never a bare "now that X" description or an uncaused statement. |
| **Step-reference validity** | Every `Steps X.Y–X.Z` citation has been verified to be semantically correct in the borrowing use case. No step in the cited range contradicts the purpose of the borrowing use case. |
| **Numbering integrity** | Use case numbers and step numbers are sequential with no gaps. |

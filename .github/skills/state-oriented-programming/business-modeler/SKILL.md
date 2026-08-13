---
name: business-modeler
description: Interactive Business Modeler according to BPMN (Business Process Model and Notation) standard. Given an existing user story, elicits missing details through structured questioning and produces a complete, traceable, professionally written business model artifacts.
metadata:
  author: vsirotin
  version: "1.0"
---


## Prerequisites

User should provide the paths for:
- the `user story` file (e.g., `turnstile/user-story.md`)
- the `directory for output files` (e.g., `turnstile/business-model`)

When this information is not provided, request it from the user before proceeding.

---

## Output Structure

The output directory contains the following files:

```
- business-use-cases.md       # Use cases definition according to BPMN standard.
- swimlanes.md                # Swimlane definitions according to BPMN standard.
- state-machine.md            # State machine definition according to BPMN standard.
- business-use-cases-trace.md # Traceability: one signal→state path per use case entry point.
```

## Workflow overview

Step 1: Creation of business-use-cases.md
Step 2: Creation of swimlanes.md
Step 3: Creation of state-machine.md (initial draft with main states)
Step 4: Finalize state-machine.md by expanding composite states into sub-states
Step 5: Creation of business-use-cases-trace.md

> **Important:** Steps 3 and 4 both write to the same file `state-machine.md`. The final document must contain exactly **one** list of all states and **one** state machine definition. Step 3 produces an initial draft; Step 4 rewrites it in place to produce the complete, unified version.

## Workflow details

### Step 1: Creation of business-use-cases.md

#### Action
Use the information from paragraph `Behavioral Overview` in the `user story` to identify and define the business use cases. If the user story file does not contain a `Behavioral Overview` or `Structure Overview` section, inform the user and ask them to provide this information before proceeding. 

Each use case should have:
- a name, 
- a description, 
- list the actors (external objects, e.g. humans) 
- list of involved internal objects.

The description should be a concise description of input, important steps and output of the use case.

Internal objects are the objects from paragraph `Structure Overview` in the `user story` that are involved in the use case.

#### Output Format

By writing of result into file `business-use-cases.md` use the following format like:

```markdown
# UC-<number started with 01>: <use case name>
## Description
<description of the use case>
## Actors
- <actor 1>
- <actor 2>
## Internal objects
- <internal object 1>
- <internal object 2>
```

For example, for the turnstile user story, some business use cases could be defined as follows:

```markdown
# UC-01: Coin Payment, change needed
## Description
The user inserts a valid coin into the coin slot. The turnstile validates the coin, dispenses change if needed, and unlocks the rotating arm for passage and switches the light indicator from red to green. The user retrieves the change from the artifact-box and passes through the turnstile. The push sensor sends a signal to the turnstile and it automatically locks the arm and switches the light indicator back to red.
## Actors
- User
## Internal objects
- Coin slot
- Coin-receiver
- Weight-checker
- Form-checker
- Change dispenser
- Locking mechanism
- Light indicator
- Push sensor

# UC-02: Coin Payment, coin have bad weight
## Description
The user inserts an invalid coin (bad weight)into the coin slot. The turnstile validates the coin, returns it to the user, and remains locked. Light indicator stays red. Sound indicator emits a warning signal.
## Actors
- User
## Internal objects
- Coin slot
- Coin-receiver
- Weight-checker
- Locking mechanism
- Light indicator
- Sound indicator
```

#### Quality check
1. Check if all business cases together are enough to cover the functionality described in paragraph `Behavioral Overview` of the `user story` and so can be used by acceptance test team to verify the system.
2. Check if all internal objects from paragraph `Structure Overview` that participate in behaviors described in `Behavioral Overview` are assigned to at least one use case.
3. Check if all use cases are described in a concise and clear way.
4. Check if all use cases have a unique name and number.
5. Check if all use cases have a description, actors, and internal objects.

When the quality check is passed, proceed to Step 2. Otherwise, ask the user to clarify the use case definitions and repeat Step 1. If after two clarification rounds the quality check still fails, present the best current output to the user with a summary of unresolved issues and ask whether to proceed or abort. 

### Step 2: Creation of swimlanes.md

#### Action

Use the information from paragraph `Behavioral Overview` in the `user story` to identify and try to define the swimlanes according BPMN standard. Divide the internal objects listed in paragraph `Structure Overview` into swimlanes, using paragraph `Behavioral Overview` to understand each object's behavioral role.

#### Output Format

By writing of result into file `swimlanes.md` use the following format like:

```markdown
# Swimlane <sub-process name>

This swimlane contains the objects, that <selection criteria> is responsible for.

<object name> - <role of the object in the sub-process>
```


For example, for the turnstile user story, some swimlanes could be defined as follows:

```markdown

# Swimlane User interaction

This swimlane contains objects that user directly touches or perceives.

coin slot - The slot where the user inserts coins to pay for access.
```
 #### Quality check

Check if: 
1. All objects from paragraph `Behavioral Overview` are assigned to swimlanes. 
2. If some object is assigned to two or more swimlanes, check if it is justified.

When the quality check is passed, proceed to Step 3. Otherwise, ask the user to clarify the swimlane definitions and repeat Step 2.

### Step 3: Creation of state-machine.md (initial draft)

#### Action
Use the information from paragraph `Behavioral Overview` in the `user story` and the swimlanes defined in Step 2 to identify and define the main states of the system according to BPMN standard. This draft will be rewritten in Step 4, so keep composite states as single entries for now.

#### Output Format

Write the result into file `state-machine.md` using the following format:

```markdown
# State Machine <system name>

## 1. States

- <state 1> - <description of the state>
- <state 2> - <description of the state>
- ...

## 2. Events

- <event 1> - <description of the event>
- <event 2> - <description of the event>
- ...

## 3. State machine (textual representation)

STATE <state 1>
    ON <event 1> -> <state 2>
    ON <event 2> AND <event 3> -> <state 3>
    ...

```

For example, for the turnstile user story, the initial draft could look like:

```markdown
# State Machine Turnstile

## 1. States
- Locked - The turnstile is locked and does not allow passage.
- Payment Processing - A payment artifact is being validated.
- Unlocked - The turnstile is unlocked and allows passage.
- Service State - The turnstile is out of service awaiting maintenance.

## 2. Events
- Coin inserted - The user inserts a coin into the coin slot.
- Banknote inserted - The user inserts a banknote into the banknote slot.
- Payment accepted - The artifact is valid; change dispensed if needed.
- Payment rejected - The artifact is invalid and has been returned.
- Insufficient change - Valid payment but change unavailable.
- User passed through - Push sensor detected passage.
- Hardware fault detected - An internal hardware fault occurred.
- Service button pressed - Service worker pressed the service button.

## 3. State machine (textual representation)
STATE Locked
    ON Coin inserted -> Payment Processing
    ON Banknote inserted -> Payment Processing
    ON Hardware fault detected -> Service State
STATE Payment Processing
    ON Payment accepted -> Unlocked
    ON Payment rejected -> Locked
    ON Insufficient change -> Service State
    ON Hardware fault detected -> Service State
STATE Unlocked
    ON User passed through -> Locked
    ON Unlocked state timeout -> Locked
    ON Hardware fault detected -> Service State
STATE Service State
    ON Service button pressed -> Locked
```

#### Quality check (Step 3)
1. An **initial state** is identified (the state the system is in before any external event occurs).
2. Every state listed in **section 1** has a corresponding `STATE` block in **section 3**, and vice versa.
3. Every `STATE` block has **at least one outgoing transition** (no unintentional dead ends).
4. Every state except the initial state has **at least one incoming transition** (no unreachable states).
5. Every behavior described in `Behavioral Overview` of the user story is traceable to **at least one path** through the state machine.

When the quality check passes, proceed to Step 4. Otherwise fix the draft and re-check.

### Step 4: Finalize state-machine.md by expanding composite states

#### Action
Rewrite `state-machine.md` to expand every composite state into its sub-states. The result is a **single, unified document** — do **not** add new sections or separate headings for sub-states. Instead, update sections `1. States`, `2. Events`, and `3. State machine (textual representation)` in place so they each contain all states and all events together.

**How to identify and expand a composite state:**

For each transition in the state machine, examine its trigger signal:
- If the signal is generated by a **single** object from `Structure Overview` → the transition is **atomic**. Keep it as-is.
- If the signal is the **end result of a chain of objects** (each object receives a signal, processes it, and passes a new signal to the next) → the signal is **composite**. The state that contains this transition must be replaced by a sub-state hierarchy.

**How to replace a composite transition:**
1. Remove the composite transition from the parent state.
2. Create one sub-state per object in the chain.
3. Wire sub-states with the intermediate signals between objects.
4. The parent state's incoming event becomes the first sub-state's entry event.
5. The composite signal becomes the exit event of the last sub-state (now atomic).

For example: in state `Payment Processing`, the transition `ON CoinValid → Unlocked` is triggered by a composite signal — it requires `weight-checker` to signal `form-checker`, which then signals the outcome. Replace `Payment Processing` with sub-states `Weight Check → Form Check`, where each sub-state is entered and exited by the single object responsible for it. In contrast, the transition `ON Coin inserted` is triggered by `coin-receiver` alone (the coin slot is passive) — it is atomic and stays unchanged.

Apply this analysis recursively to all transitions. If you are unsure whether a signal is composite, ask the user before proceeding.

**Stopping criterion:** Stop expanding a state when every transition leaving it is triggered by a signal generated by a single object from `Structure Overview`. At that point the state is atomic and no further decomposition is needed.

After expansion, the updated sections `1. States` and `3. State machine (textual representation)` in `state-machine.md` should list **all** states flat (main states and sub-states alike) with no separate sub-sections per state. For example:

```markdown
## 1. States
- Locked - The turnstile is locked and does not allow passage.
- Payment Processing - A payment artifact is being validated.
- Coin Validation - The inserted coin is being checked for weight and form.
- Weight Check - The coin weight is being validated by the weight-checker.
- Form Check - The coin form is being validated by the form-checker.
- ...
- Unlocked - The turnstile is unlocked and allows passage.
- Service State - The turnstile is out of service awaiting maintenance.

## 3. State machine (textual representation)
STATE Locked
    ON Coin inserted -> Payment Processing
    ON Banknote inserted -> Payment Processing
    ON Hardware fault detected -> Service State
STATE Payment Processing
    ON Coin inserted -> Coin Validation
    ON Banknote inserted -> Banknote Validation
STATE Coin Validation
    ON Coin inserted -> Weight Check
STATE Weight Check
    ON Weight valid -> Form Check
    ON Weight invalid -> Coin Return
STATE Form Check
    ON Form valid AND change needed AND change available -> Change Dispensing
    ON Form valid AND no change needed -> Unlocked
    ON Form valid AND change not available -> Service State
    ON Form invalid -> Coin Return
...
STATE Unlocked
    ON User passed through -> Locked
    ON Unlocked state timeout -> Locked
STATE Service State
    ON Service button pressed -> Locked
```

#### Quality check
1. The file contains exactly one `## 1. States` section and one `## 3. State machine (textual representation)` section.
2. Every state listed in section 1 has a corresponding `STATE` block in section 3.
3. Every event listed in section 2 appears in at least one `ON` transition.
4. Every `STATE` block's target states exist in section 1.

When the quality check passes, proceed to Step 5.

---

### Step 5: Creation of business-use-cases-trace.md

#### Action
For each use case in `business-use-cases.md`, trace every distinct entry point through the state machine as an alternating `State --[Signal]--> State` path and write the result into `business-use-cases-trace.md`.

**Rules:**
1. **Every entry point:** If a use case can be triggered by different initial signals or reached from different starting states, produce one separate path per entry point.
2. **No shortcuts:** Use only states and signals that exist in `state-machine.md`. Every `--[Signal]-->` must correspond to a defined `ON` transition in the state machine.
3. **Start from the initial state** unless the use case explicitly describes a scenario that begins from a different state (e.g., a hardware fault occurring while the turnstile is `Unlocked`).

#### Output Format

Write the result into file `business-use-cases-trace.md` using the following format:

```markdown
# Business Use Cases — Traceability

This file traces each use case from business-use-cases.md as a path through the
state machine defined in state-machine.md.

---

## UC-<number>: <use case name>

[Path label, e.g. "Via coin payment:" — only when multiple paths exist]

```
<State>
  --[Signal]-->
<State>
  --[Signal]-->
<State>
```
```

#### Failure handling
If a use case cannot be traced because the state machine is missing a required state or transition:
1. Update `state-machine.md` to add the missing element.
2. Re-run the Step 4 quality check.
3. Repeat at most **3 times** across all use cases. If gaps remain after 3 rounds, present the unresolved use cases to the user with a summary of what is missing and ask whether to proceed or abort.

#### Quality check
1. Every use case in `business-use-cases.md` has at least one path in `business-use-cases-trace.md`.
2. Every state and signal in every path exists in `state-machine.md`.
3. Each path forms a valid walk through the state machine: each `--[Signal]-->` is a defined `ON` transition from the preceding state.

When the quality check passes, the skill is complete.






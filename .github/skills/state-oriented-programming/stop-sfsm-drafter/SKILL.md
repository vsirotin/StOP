---
name: stop-sfsm-drafter
description: Interactive SFSM Drafter according StOP (State-oriented Programming paradigm). Transforms an existing user story and use cases into an SFSM draft document containing an FA-structure, extended transitions, and command descriptions. Use when a user asks to draft, create, or generate an SFSM from existing use cases and a user story.
metadata:
  author: vsirotin
  version: "0.2"
---

# SFSM Drafter

This skill produces an SFSM draft document (extended transitions) derived from an existing user story and use-case document. The result is a hierarchical FA-structure, a list of extended transitions, and event/command descriptions — unambiguous for human readers and AI coding agents alike.

---

## Prerequisites

A finished user story (written with the [stop-user-story-writer](../stop-user-story-writer/SKILL.md) skill or equivalent) and a finished use-case document (written with the [stop-use-case-writer](../stop-use-case-writer/SKILL.md) skill or equivalent) must exist before this skill is applied. If either is missing, stop and ask the user to provide or create them first.

---

## Output Structure

The document must open with a title and back-links to its source user story and use cases:

```
# <System Name> Extended Transitions

Base user story: [<System Name>: User Story](<user-story-filename>.md)
Base use cases: [<System Name>: Use Cases](<use-cases-filename>.md)
```

The body contains the following sections, in this order:

1. **FA-structure** — A hierarchical component tree derived from the user story's Structure Overview. This tree is the architectural backbone of the SFSM: each group is a candidate Finite Automaton (FA), and the nesting defines the parent–child (stack) relationships between FAs.
2. **Event and Command Descriptions** — A catalog of all events (external signals entering the SFSM) and commands (actions the SFSM sends to components), with the possible result signals each command can produce.
3. **Extended Transitions** — The use-case steps, each commented out and annotated with the SFSM transitions it generates, following the transformation rules.

---

## Step 1: FA-structure — Transforming the Structure Overview

### Goal

Transform the flat list of visible and hidden elements from the user story's "## Structure Overview" into a hierarchical component tree that reflects the system's business and physical architecture. This tree is the foundation for the entire SFSM: each group in the tree is a candidate FA, and the nesting defines the parent–child (stack) relationships between FAs.

### Input

The "## Structure Overview" section of the user story, which contains:
- A flat bullet list of **visible elements** (what the user sees/touches).
- A flat bullet list of **hidden elements** (what operates internally).
- Optional descriptive context (e.g., "a physical enclosure containing a rotating arm").

### Output Format

The FA-structure is rendered as an indented tree inside a `code` block, using the following conventions:

```code
<System Name>
- <Group Name>
- - <Sub-Group Name>
- - - <Element Name>
- - - <Element Name>
- - <Sub-Group Name>
- - - <Element Name>
...
- <Group Name>
- - <Element Name>
...
```

**Formatting rules:**
- The root of the tree is the system name (as used in the user story title).
- Each indentation level is represented by repeating `- ` (dash + space) once per depth level: level 1 uses `- `, level 2 uses `- - `, level 3 uses `- - - `, and so on.
- Group names use Title Case and should be descriptive of the business or physical purpose they represent (e.g., "Payment Component", "Coin Component", "Lock Component").
- Element names are taken from the user story's Structure Overview and normalized to Title Case (e.g., "a coin slot" → "Coin Slot", "a timer for the artifact-box" → "Timer for Artifact Box", "a coin-receiver" → "Coin Receiver").
- Every element from the Structure Overview must appear exactly once in the tree. No element may be omitted, duplicated, or invented.

### Transformation Rules

1. **Collect all elements.** Gather every element from both the visible and hidden lists in the Structure Overview. This is the complete set of leaf nodes for the tree. No element may be left out.

2. **Group by business and physical nature.** Divide all known elements into groups based on their business function and physical relationship. Elements that collaborate to achieve a common business goal belong in the same group. Ask: *what does this element do, and which other elements does it work with to accomplish that?* For example:
   - Elements that together process coin payments (slot, receiver, checkers) form a "Coin Component" group.
   - Elements that together control physical access (lock, push sensor, timer) form a "Lock Component" group.
   - Elements that together provide user feedback (light, sound) form an "Indicator Component" group.

3. **Create groups of groups.** Where multiple groups share a higher-level business purpose, combine them into a super-group. Ask: *do these groups collectively serve a broader function?* For example:
   - "Coin Component" and "Banknote Component" both handle payment input → they nest under a "Payment Component" super-group.
   - "Output Component" and "Indicator Component" both serve user-facing interaction → they nest under a "User Interface Component" super-group.

4. **Nest until the tree is complete.** Continue grouping until every element has a place in the tree and the hierarchy is no deeper than necessary. Avoid over-nesting: if a group contains only a single element, flatten it — the element becomes a direct child of the parent group — unless the single element has its own internal complexity that warrants a separate FA in later steps.

5. **Preserve all elements.** Every element from the Structure Overview must appear as a leaf in the tree. No element may be dropped, merged, or renamed beyond Title Case normalization.

6. **Do not invent new elements.** The tree contains only elements listed in the Structure Overview. If the grouping reveals a missing element that the use cases reference but the Structure Overview does not list, stop and ask the user whether the element should be added to the user story first.

### Workflow

Follow these steps in order. Do not skip a step.

#### Step 1.1 — Parse the Structure Overview

Read the user story's "## Structure Overview" and extract:
- All visible elements (with their exact names).
- All hidden elements (with their exact names).
- Any descriptive context sentence (e.g., "a physical enclosure containing a rotating arm").

Produce an internal checklist of all elements. Do not show it to the user unless asked.

#### Step 1.2 — Cross-check with use cases

Read the use-case document and verify that every component and actor referenced in the use-case steps appears in the Structure Overview. If the use cases reference an element not listed in the Structure Overview, stop and ask the user to resolve the discrepancy before continuing.

#### Step 1.3 — Draft the grouping

Following the Transformation Rules above:
1. Assign each element to a primary group based on its business and physical nature.
2. Identify super-groups that combine related primary groups by their shared higher-level purpose.
3. Build the indented tree representation following the Output Format.

#### Step 1.4 — Present and confirm

Present the draft FA-structure to the user and ask: *"Does this component tree correctly reflect the system's business and physical architecture, or should any groupings be adjusted?"*

Apply any corrections and produce the final FA-structure.

---

## Step 2: Event and Command Descriptions

### Goal

Catalog all events (external signals entering the SFSM) and commands (actions the SFSM sends to components) that are discovered during the transformation of use cases into extended transitions (Step 3). This section is built incrementally — new entries are added as each use-case step is processed.

### Output Format

Each component that generates events or receives commands gets its own subsection:

```
### <Component Name>
Event: <eventName>(<parameters>) -> send "<Component Name>:<signal name>"

Command: <commandName> can send:
- "<Component Name>:<signal name>" if <condition>
- "<Component Name>:<signal name>" if <condition>
```

**Formatting rules:**
- **Events** describe signals that originate from outside the SFSM (user actions, sensor detections, timer expirations). The format is: `Event: <methodName>(<parameters>) -> send "<Component>:<Signal>"`
- **Commands** describe actions the SFSM sends to components. A command may produce multiple possible result signals depending on the outcome. The format is: `Command: <commandName> can send:` followed by a bullet list of possible signals.
- Signal names use the format `<Component Name>:<signal description>` (e.g., "Weight Checker>WeightCanNeedChange", "Coin Slot>Coin Inserted").
- Command names use the format `<Component Name>.<commandName>` (e.g., "Weight Checker.checkWeight").

### Rules for Adding Events and Commands

1. **Events** are added when a use-case step describes an external actor (user, service worker) interacting with a visible element, or when a sensor/timer detects an external occurrence. The event describes the signal that enters the SFSM from this interaction.

2. **Commands** are added when a use-case step describes a component performing a processing action (validating, deciding, dispensing, displaying, locking, starting). The command describes the action and all possible result signals it can produce.

3. **Multiple outcomes**: When a command's result depends on its input (e.g., a coin can be valid or invalid), list each possible outcome as a separate bullet with its condition. Do not model this as a generic "validates" command followed by a separate "decides" command — merge validation and decision into one command with multiple possible results.

4. **Incremental building**: The Event and Command Descriptions section is built incrementally as use-case steps are processed. When a step reveals a new event or command, add it to this section. When a step uses an already-documented event or command, no new entry is needed.

---

## Step 3: Extended Transitions — Transforming Use Cases

### Goal

Transform each use-case step into SFSM transitions, following the transformation rules. The result is a code block containing the commented-out use-case steps interleaved with the generated transitions and rule annotations.

### Input

The use-case document, processed step by step. Each use case is numbered (0, 1, 2, …) with steps numbered `<use-case>.<step>` (e.g., 1.4, 1.5).

### Output Format

The extended transitions are rendered inside a `code` block. Each use-case step is:
1. Copied verbatim and prefixed with `//` (commented out).
2. Followed by the SFSM transitions it generates (if any).
3. Followed by `//-- Rule X: <explanation>` annotations (first occurrence of a rule includes the full explanation; subsequent occurrences use just `//-- Rule X`).

Example:
```code
//    1.3 The weight-checker validates the weight of the coin and sends it to the form-checker.
["Weight Checker:I", "Coin Slot>Coin Inserted", "Weight Checker:E_Weight_Checked", "Weight Checker.checkWeight"]
//-- Rule 4: After completing its task the components to report result to parent use state with name >Component name>:E_*

["Coin Component:I", "Weight Checker>WeightCanNeedChange", "Form Checker"]
//-- Rule 2
```

**Transition format:** `["<from-state>", "<signal>", "<to-state>"]` or `["<from-state>", "<signal>", "<to-state>", "<command>"]`

**State naming conventions:**
- Entry state: `<Component>:I` (e.g., "Turnstile:I", "Weight Checker:I")
- Regular states: `<Component>:<StateName>` (e.g., "Turnstile:Locked", "Turnstile:Unlocked")
- Exit states: `<Component>:E_<Description>` (e.g., "Weight Checker:E_Weight_Checked", "Locking Mechanism:E_Unlocked")

**Signal naming conventions:**
- External events: `<Component>:<EventDescription>` (e.g., "Coin Slot>Coin Inserted", "Push Sensor>Passage")
- Component results: `<Component>:<ResultDescription>` (e.g., "Weight Checker>WeightCanNeedChange", "Locking Mechanism>Unlocked")

**Command naming conventions:**
- `<Component>.<commandName>` (e.g., "Weight Checker.checkWeight", "Locking Mechanism.unlock")

### Transformation Rules

**Rule 1 — External events are not converted into transitions.**
When a use-case step describes an action by an external actor (user, service worker) in the external world, no transition is generated. The step is commented out and annotated with Rule 1. However, if the step reveals a new event (e.g., a user inserting a coin, a service worker pressing a button), an Event entry is added to the Event and Command Descriptions section.

**Rule 2 — Simple state transition or delegation without commands.**
When a component receives a signal and transitions to a new state without executing a command, this is a simple transition. This also covers **delegation**: when a parent component receives a signal it cannot process in a business sense, it delegates to the appropriate child component. The parent knows only the names and capabilities of its child components, not their internal structure. The transition target is the child component name (which the SFSM engine pushes as a sub-FA).

**Rule 3 — Component starts in initial state.**
When a sub-FA is entered (pushed onto the stack), it starts in its initial state `I`. The from-state for the first transition in a newly entered sub-FA is `<Component>:I`.

**Rule 4 — Component exits with E_* state to report result to parent.**
When a leaf component completes its task (validating, checking, dispensing, etc.), it transitions to an exit state `<Component>:E_<Description>` and optionally executes a command. The command produces a result signal in the format `<Component>:<ResultDescription>`, which is sent to the parent. The parent then processes this result signal (typically delegating to the next child or exiting itself).

When an intermediate (non-leaf) component has completed all its sub-tasks, it also exits with an E_* state to report its result to the parent. If the component has no processing logic of its own (a pass-through orchestrator), it exits without a command, and the signal it received from its last child is forwarded to the parent.

**Rule 5 — Cross-branch routing.**
When a result signal needs to reach a component in a different branch of the FA-structure tree, it propagates up through each parent (each parent exiting with an E_* state per Rule 4) until it reaches a common ancestor. The common ancestor then routes the signal to the target branch by transitioning to the appropriate child component (Rule 2). This is how signals cross from one subsystem (e.g., Payment Component) to another (e.g., Access Component).

**Rule 6 — Already-covered steps.**
When a use-case step is already fully covered by transitions generated for a previous step (e.g., a fan-out receiver that was handled as part of the sender's routing), no new transitions are generated. The step is commented out and annotated with Rule 6, noting which previous step's transitions cover it.

### Workflow

Follow these steps in order. Do not skip a step.

#### Step 3.1 — Copy use cases into the code block

Copy each use case (title and all steps) into the `code` block, prefixing every line with `//`. Process use cases in order (0, 1, 2, …), and within each use case, process steps in order.

#### Step 3.2 — Process each step line by line

For each commented-out step, determine which transformation rule(s) apply and generate the corresponding transitions. Insert the transitions directly below the commented step. Add `//-- Rule X` annotations after each transition.

As you process each step, check whether it reveals new events or commands. If so, add them to the Event and Command Descriptions section (Step 2).

#### Step 3.3 — Present and confirm

Present the complete extended transitions to the user and ask: *"Do these transitions correctly capture the use-case flow, or should any transitions be adjusted?"*

Apply any corrections and produce the final version.

---

## Quality Criteria

Before presenting any draft, verify all of the following:

| Criterion | Check |
|---|---|
| **FA-structure completeness** | Every element from the Structure Overview (visible and hidden) appears exactly once in the tree. |
| **FA-structure no inventions** | No element appears in the tree that was not listed in the Structure Overview. |
| **FA-structure business coherence** | Each group contains elements that share a common business or physical purpose. |
| **FA-structure hierarchy depth** | The tree is no deeper than necessary. Single-element sub-groups are flattened unless justified. |
| **FA-structure naming** | Element names match the user story's Structure Overview, normalized to Title Case. Group names are descriptive and in Title Case. |
| **FA-structure use-case alignment** | Every component referenced in the use cases has a corresponding node in the tree. |
| **Transition completeness** | Every use-case step is either converted into transitions or annotated with a rule explaining why no transitions are needed (Rules 1, 6). |
| **Transition traceability** | Every transition can be traced back to a specific use-case step. |
| **State naming** | States follow the `<Component>:<State>` convention. Entry states use `I`, exit states use `E_<Description>`. |
| **Signal naming** | Signals follow the `<Component>:<SignalDescription>` convention. External events and component results are distinguishable. |
| **Command naming** | Commands follow the `<Component>.<commandName>` convention. |
| **Event/command completeness** | Every event referenced in a transition has an entry in the Event and Command Descriptions section. Every command referenced in a transition has an entry with all possible result signals. |
| **Cross-branch routing** | When a signal crosses branches, it propagates up through parents to a common ancestor, which routes it to the target branch (Rule 5). |
| **Fan-out handling** | When a step sends to multiple receivers, the first receiver is handled within the same branch, then the result propagates up and across to the other receiver(s). Already-covered receivers are annotated with Rule 6. |

---

## Style Rules

- Write group names in Title Case, using descriptive nouns that reflect the group's business purpose.
- Normalize element names from the user story to Title Case. Drop leading articles ("a", "an", "the") and convert hyphenated names to spaced Title Case.
- The FA-structure tree uses `- ` (dash + space) for each indentation level, repeated per depth.
- Do not add prose explanations inside the tree code block. The tree is purely structural.
- In the Extended Transitions code block, prefix every use-case line with `//`.
- After each transition, add `//-- Rule X` on its own line. First occurrence of a rule includes the full explanation; subsequent occurrences use just the rule number.
- Leave a blank line between the last transition of one step and the `//` comment of the next step, for readability.
- In the Event and Command Descriptions section, use `###` headings for each component, and bullet lists for multiple command outcomes.

---

## Reference Examples

Use the [example](sfsm-drafter-example.md) as a reference for style, structure, and level of detail.
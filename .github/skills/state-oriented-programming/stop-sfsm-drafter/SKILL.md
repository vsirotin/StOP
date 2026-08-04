---
name: stop-sfsm-drafter
description: Interactive SFSM Drafter according StOP (State-oriented Programming paradigm). Transforms an existing user story and use cases into an SFSM draft document containing an FA-structure, extended transitions, and command descriptions. Use when a user asks to draft, create, or generate an SFSM from existing use cases and a user story.
metadata:
  author: vsirotin
  version: "0.1"
---

# SFSM Drafter

This skill produces an SFSM draft document (extended transitions) derived from an existing user story and use-case document. The result is a hierarchical FA-structure, a list of extended transitions, and command descriptions — unambiguous for human readers and AI coding agents alike.

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
2. *(Additional sections — extended transitions, command descriptions — will be defined in later steps of this skill's development.)*

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

## Quality Criteria

Before presenting any draft FA-structure, verify all of the following:

| Criterion | Check |
|---|---|
| **Completeness** | Every element from the Structure Overview (visible and hidden) appears exactly once in the tree. |
| **No inventions** | No element appears in the tree that was not listed in the Structure Overview. |
| **Business coherence** | Each group contains elements that share a common business or physical purpose. The grouping is driven by what the elements do together, not by surface similarity of names. |
| **Hierarchy depth** | The tree is no deeper than necessary. Single-element sub-groups are flattened unless justified by internal complexity. |
| **Naming consistency** | Element names match the user story's Structure Overview, normalized to Title Case. Group names are descriptive, in Title Case, and reflect the business purpose of their children. |
| **Use-case alignment** | Every component referenced in the use cases has a corresponding node in the tree. No use-case actor is left unplaced. |

---

## Style Rules

- Write group names in Title Case, using descriptive nouns that reflect the group's business purpose (e.g., "Payment Component", "Coin Component", "Lock Component").
- Normalize element names from the user story to Title Case. Drop leading articles ("a", "an", "the") and convert hyphenated names to spaced Title Case (e.g., "a coin-receiver" → "Coin Receiver", "a timer for the artifact-box" → "Timer for Artifact Box").
- The tree uses `- ` (dash + space) for each indentation level, repeated per depth.
- Do not add prose explanations inside the tree code block. The tree is purely structural.
- Do not annotate elements as "visible" or "hidden" in the tree — the Structure Overview already records this distinction, and the FA-structure is a unified architectural view.

---

## Reference Examples

Use the [example](sfsm-drafter-example.md) as a reference for style, structure, and level of detail.

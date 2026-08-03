---
name: use-case-writer
description: Interactive Use Case Writer. Given an existing user story, elicits missing details through structured questioning and produces a complete, traceable, professionally written use-case document following the project's established structure and style. Use when a user asks to write, draft, or create use cases for a user story.
metadata:
  author: vsirotin
  version: "1.0"
---

# Use Case Writer

This skill produces a complete, traceable use-case document derived from an existing user story. The result is unambiguous for human readers and AI coding agents.

---

## Prerequisites

A finished user story (written with the `user-story-writer` skill or equivalent) must exist before this skill is applied. If no user story is available, stop and ask the user to provide or create one first.

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
- Use cases are numbered sequentially from 1 with no gaps.
- Steps within a use case are numbered `<use-case-number>.<step-number>` starting from 1, sequentially with no gaps.
- When a use case reuses steps from another use case, cite them as `Steps <N>.<S>–<N>.<E>` on a line by itself, then continue with new steps if needed.

**Step-reference rules:**
- Before citing `Steps X.Y–X.Z`, verify that every referenced step is semantically valid in the new context. A step that contradicts the purpose of the borrowing use case must not be included; adjust the range or rephrase.

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

- One use case per distinct happy path (combinations of inputs or actors that lead to a successful outcome).
- One use case per distinct error path.
- One use case per distinct timeout or service-state transition.

Present the list of use case titles to the user and ask: *"Does this list cover everything, or are there cases to add, remove, or rename?"*

Wait for confirmation before proceeding.

### Step 3 — Elicitation round

For each confirmed use case, identify any steps where the user story is silent on the detail needed to write concrete, atomic steps. Ask the user only about genuine gaps — target no more than 5 questions total across all use cases. If you have enough information, skip this step.

### Step 4 — Draft and confirm

Write the full use-case document following the **Output Structure** above. Present it to the user and ask: *"Does this capture all cases correctly, or should anything be adjusted?"*

Apply corrections and produce the final version.

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
| **Atomicity** | Each step contains exactly one observable action or system reaction. Compound actions are split into separate steps unless physically inseparable. |
| **Actor attribution** | Every step explicitly names the performing actor. Pronouns ("it", "the system") are not used. |
| **Step-reference validity** | Every `Steps X.Y–X.Z` citation has been verified to be semantically correct in the borrowing use case. No step in the cited range contradicts the purpose of the borrowing use case. |
| **Numbering integrity** | Use case numbers and step numbers are sequential with no gaps. |

---

## Style Rules

- Write in present tense ("The coin-receiver registers…", "The user inserts…").
- Use the active voice. The subject of every step sentence is the named actor.
- Use the exact component and actor names from the user story's Structure Overview. Do not paraphrase.
- Titles are short noun phrases describing the scenario (e.g., "Happy path with coin and change", "False coin — user collects within time").
- Do not add prose explanations between steps. Steps only.
- Do not add a "Preconditions" or "Postconditions" block unless explicitly requested.

---

When using action verbs, try to follow the [Action Vocabulary](../user-story-writer/action-vocabulary.md) whenever possible. Use unlisted verbs only when no entry fits.
---

## Reference Examples
Use the [example](use-cases-example.md) as a reference for style, structure, and level of detail.

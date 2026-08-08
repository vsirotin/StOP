---
name: user-story-writer
description: Interactive User Story Writer according StOP (State-oriented Programming paradigm). Elicits requirements through structured questioning, finds a similar known-domain example, and produces a concise, professional user story following the project's established structure and style. Use when a user asks to write, draft, or create a user story.
metadata:
  author: vsirotin
  version: "1.0"
---


# User Story Writer

This skill produces a concise, professional user story that is understandable by humans and AI coding agents alike.

---

## Output Structure

Every user story must contain **exactly** these sections, in this order:

1. **Behavioral Overview** — What the system does from the user's perspective. Use plain, professional language. Cover the core use cases, edge cases, error paths, and any automated state transitions. No implementation details. Target length: 3–8 sentences.

2. **Structure Overview** — The physical or logical structure of the system. Split into **visible elements** (what the user sees/touches) and **hidden elements** (what operates internally). Use bullet lists for both.

Do **not** add sections beyond these two. Do **not** include implementation notes, tech stack, or acceptance criteria unless explicitly requested.

When using action verbs, try to follow the [Action Vocabulary](action-vocabulary.md) whenever possible. Use unlisted verbs only when no entry fits.
---

---

## Workflow

Follow these steps strictly, in order. Do not skip a step.

### Step 1 — Initial elicitation

Ask the user the following questions (you may combine them in one message):

1. **Domain** — In one sentence, what is this system about?
2. **Primary actor** — Who is the main user interacting with the system?
3. **Core purpose** — What is the single most important thing this system enables the actor to do?
4. **Key states or modes** — Does the system have distinct states or operating modes? If so, name them.
5. **Edge cases / error handling** — What happens when something goes wrong (invalid input, resource exhaustion, hardware fault, timeout)?
6. **Structural elements** — List the physical or logical parts. Which are visible to the user? Which are internal?
7. **Actors beyond the primary user** — Are there other actors (operators, service workers, external systems)?

Wait for the user's answers before proceeding. If the user's answers are too brief to continue (e.g. fewer than 4 questions answered with meaningful detail), ask targeted follow-up questions before moving to Step 2. Do not proceed to Step 2 with insufficient information.

### Step 2 — Identify a similar known-domain example

Based on the user's answers, identify a real-world analogue — a well-known system from a similar domain that shares the same interaction pattern (e.g. "this resembles a vending machine", "this is similar to an ATM", "this behaves like a subway gate"). State the analogy explicitly and ask the user: *"Does this analogy fit your system, or is there a better one?"*

Use the analogy only to prompt targeted clarifying questions about gaps, not to silently populate the story with assumed details.

### Step 3 — Clarification round

Ask only the questions that remain unanswered after Step 1. Focus on gaps that would make the story ambiguous or incomplete. Target: no more than 3 follow-up questions. If you have enough information, skip this step.

### Step 4 — Draft and confirm

Write a draft user story following the **Output Structure** above. Present it to the user and ask: *"Does this capture the full picture, or should anything be adjusted?"*

Apply any corrections and produce the final version.

---

## Quality Criteria

Before presenting any draft, verify all of the following:

| Criterion | Check |
|---|---|
| **Professional wording** | No informal language. Active voice where possible. Domain-appropriate terminology. |
| **Completeness** | Happy path, error paths, edge cases, and all actor types are covered. |
| **Human + AI readability** | Unambiguous. A developer or coding agent can derive system behaviour from the text alone. |
| **Consistency** | No contradictions between Behavioral Overview and Structure Overview. Actors and elements are named consistently throughout. |
| **Brevity** | No redundant sentences. Every sentence adds information not present elsewhere. |

---

## Style Rules

- Write in present tense ("The system allows…", "The operator restarts…").
- Use the active voice unless passive voice is clearly more natural.
- Name each structural element exactly once in the Structure Overview; reuse the same name in the Behavioral Overview.
- Visible and hidden element lists use a flat bullet format (no sub-bullets).
- Do not use phrases like "it should", "it must", "the system shall" — state behaviour as fact.

## Reference Examples
Use the [example](user-story-example.md) as a reference for style, structure, and level of detail.

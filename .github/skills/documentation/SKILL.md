---
name: documentation
description: Documentation rules for the Aiavivo project. Covers README.md structure, per-sub-project DEVELOPMENT.md template, when/how to update documentation after code changes, and handling of sub-projects with no code yet.
metadata:
  author: vsirotin
  version: "1.0"
---

# Documentation Rules

These rules govern how documentation is created and maintained across all sub-projects in this workspace.

---

## Rules

### 1. README.md is minimal

`README.md` at the workspace root contains **only**:

- A short overview of the project (2–5 sentences).
- A table of sub-projects with a one-line description for each and a link to the sub-project's `DEVELOPMENT.md`.
- Links to documents in `docs/` with a one-line description of each.

Do **not** include build instructions, environment setup, or API documentation in `README.md`. That content belongs in the sub-project's `DEVELOPMENT.md`.

---

### 2. Every sub-project has a DEVELOPMENT.md

---

### 3. DEVELOPMENT.md template

Each `DEVELOPMENT.md` must contain the following sections, **in this order**:

1. **Project description** — What does this sub-project do? What role does it play in the overall architecture (see `docs/common-architecture.md`)?

2. **How to build** — Command(s) to build or package the sub-project for deployment.

3. **Unit testing** — Command(s) to run unit tests locally.

4. **Automatic local integration testing** — Command(s) to run integration tests locally (typically with mocks). If not applicable, state why.

---

### 4. Think before updating documentation

After every code change, ask: *"Do any of the sections in the affected sub-project's DEVELOPMENT.md need to be updated?"* Go through the template sections (Rule 3) and check each one. If yes, update it in the same task.


---

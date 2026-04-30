---
name: common-development
description: Common rules for code development that apply across all project types (libraries, CLI tools, services, etc.). Covers development workflow, requirements clarity, bug-fix workflow, logging, coding style, testing discipline, version management, and commit conventions.
metadata:
  author: vsirotin
  version: "1.4"
---

# Common Development Rules

These rules apply to **all** code development activities in this project, regardless of whether the target is a library, CLI tool, or service.

---

## Development Workflow

Every new feature or bug-fix must follow these steps in order:

1. **Understand requirements and plan tests.** Before writing any code, understand the requirements and propose which tests are needed at which stages (see the staging pipeline in `docs/common-architecture.md`). Test planning must be pragmatic — avoid overtesting. Unit tests are needed in most cases. Instructions for manual testing should only be written for very important features.

2. **Develop tests.** Write the tests before or alongside the implementation (TDD for bugs — see Rule 2 below).

3. **Develop code.** Implement the feature or fix.

4. **Run local automatic tests.** First run the tests that are directly relevant to the changes. Then run **all** unit tests in the project — they must all pass before proceeding.

5. **Think about documentation.** Ask: *"Do any sections in the sub-project's DEVELOPMENT.md need updating? Does README.md or docs/common-architecture.md need updating?"* Be pragmatic — do not over-document.

6. **Update documentation.** Apply the [documentation](../documentation/SKILL.md) skill if updates are needed.

7. **Post-task checklist.** Apply the [post-task](../post-task/SKILL.md) skill (version bump, release notes, commit text proposal).

---

## Rules

### 1. Requirements must be clear and feasible

Functional and technical requirements must be provided in an understandable and feasible form before implementation begins. If requirements are ambiguous, ask the user for clarification.

### 2. Bug-fix workflow (TDD)

When fixing a bug, always follow this order:

1. Write a unit test that **fails** because of the bug.
2. Run the test to **confirm it fails**.
3. Fix the code.
4. Run the test to **confirm it passes**.
5. Report the result.

### 3. Logging by default

All functions must include logging. If the specification does not describe logging, use best practices for the language (e.g. a `@logged` decorator for entry/exit, structured log fields for errors).

### 4. Consistent coding style

Use best practices of the programming language, but maintain a common, consistent style across the entire project. Do not mix conventions within one codebase.

### 5. Document environment dependencies

If a function uses data from environment variables or files, this must be mentioned in the function's documentation.

### 6. Unit test coverage expectations

If technically possible, unit tests should contain test cases for:

- **All code paths** — every branch in the tested function (decisions made with `if`, `switch`, match, etc.).
- **Timeout worst cases** — worst-case timeout scenarios for language constructs like `await` on internal calls.
- **Broken or unavailable connections** — worst cases for unavailable or broken external connections. If mocking is not easy, consider proposing a manual test (e.g. the user manually breaks the internet connection and runs a test script). Propose this when the programming language, frameworks, and tools support it.
- **Missing or invalid environment variables** — worst cases for unavailable or wrongly-valued environment variables used internally.

### 7. Test function naming convention

Use the following naming pattern for test functions:

```
test_<subject_under_test>_<aspect>
```

- `<subject_under_test>` — what is being tested (for unit tests of a single function, use the function name).
- `<aspect>` — short abbreviation for the tested aspect (up to 10 characters), e.g. `timeout`, `no_conn`, `bad_env`.

### 8. Group unit tests into sub-directories

When a project has many unit tests (more than 5), try to group them into sub-directories by topic or module.

### 9. All unit tests must pass

After completing development, all unit tests in the project must be processed with success.

### 10. Clean up temporary test artifacts

After running tests, delete any temporary directories or files created during the test run (e.g. output or download directories produced in `dist/` by integration tests). Leave the project tree in the same state it was before the tests ran.

### 11. Stop on unsolvable problems

If you see suddenly that you cannot solve some problem, stop the development and ask me.

### 12. Stop on long bug-fix loops

If you try to fix the same bug too long (more than 20 iterations), stop the development and ask me.

### 13. Post-task checklist

After completing a task that makes essential changes, apply the [post-task](../post-task/SKILL.md) skill (version bump, release notes, commit text proposal).

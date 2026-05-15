---
name: post-task
description: Post-task checklist that runs after every agent task that makes essential changes to code, documentation, scripts, or configuration. Covers version bumping, release-notes update, and commit-text proposal. Applied automatically — the agent does not need to be asked.
metadata:
  author: vsirotin
  version: "1.3"
---

# Post-Task Checklist

This skill is applied after every task that makes essential changes to code, documentation, scripts, or configuration files. The agent must execute these steps before reporting completion.

**Prerequisites and execution order:** Rules must be followed in sequence (1 → 2 → 3 → 4 → 5). Each rule has a stated prerequisite — if that prerequisite fails, stop and fix it before proceeding. Do not skip ahead or batch steps.

---

## Rules

### 1. Verify the build

If the changed sub-project has a build step (e.g. `npm run build`, `tsc`, `cargo build`), run it in the terminal and confirm it exits with code 0.
- If the build fails, fix the errors first before continuing to Rule 2.
- Do not proceed to Rule 2 or beyond if the build does not compile.

### 2. Run the full test suite

Run all automated tests for the changed sub-project (e.g. `npm test`, `cargo test`, `pytest`) and confirm they all pass (exit code 0).
- If any tests fail, fix them before continuing to Rule 3.
- Do not bump the version, update release notes, or write a commit text when tests are failing.

### 3. Update version

Follow these sub-steps in order:

1. **Determine the version bump** using semantic versioning rules:
   - Bump `patch` (e.g. `1.0.0 → 1.0.1`) for a bug fix or invisible internal change.
   - Bump `minor` (e.g. `1.0.1 → 1.1.0`) for a user-visible feature or improvement.
   - Bump `major` (e.g. `1.1.0 → 2.0.0`) for a breaking or significant architectural change.
2. **Increment `build`** by 1 regardless of which version segment was bumped.
3. **Update `version.json`** with the new version, new build number, and current datetime in ISO 8601 format.
4. **Remember the new version** for use in Rules 2 and 3.
5. **Sync package manifests**: if the sub-project contains a file that carries its own version field (e.g. `"version"` in `package.json`, `version` in `Cargo.toml`, `version` in `pyproject.toml`), update that field to match the new version.

### 4. Update release notes

Insert the new version entry **at the beginning** (after the header, at line 3) in `release-notes.md`. If the file does not exist, create it and add the new version entry as the first item. Include the remembered version number and a short explanation of the version update. Latest release appears first, oldest releases appear last. Do not reorder or overwrite previous entries. Update `datetime` to the current date and time in ISO 8601 format.

### 5. Write commit text proposal

Update **only** the workspace-root file: `commit-text-proposal.txt` (in the workspace root directory where this skill file is located, not in sub-project directories).

Rewrite its content with the following format:

```
<prefix>: Project: <project>. Version: <current version>. <short label for update>.
```

**Parameters:**
- `<prefix>` (optional): See prefix table below (e.g., `feat`, `fix`, `dist`).
- `<project>`: Full sub-project path from workspace root (e.g., `telegram/telegram-lib` or `telegram/telegram-cli`).
- `<current version>`: The version from the changed sub-project's `src/version.yaml` after Rule 1.
- `<short label for update>`: Concise description of what changed (2-10 words).

**Multi-sub-project updates:** If the same commit affects multiple sub-projects, mention **only the main/primary sub-project** that drove the changes.

Prefixes:

| Prefix      | Meaning                                                        |
|-------------|----------------------------------------------------------------|
| `test`      | Update `test/*` files                                          |
| `dist`      | Changes to submodules, version bumps, updates to `package.json`|
| `minor`     | Small changes                                                  |
| `doc`       | Updates to documentation                                       |
| `fix`       | Bug fixes                                                      |
| `bin`       | Update binary scripts associated with the project              |
| `refactor`  | Refactor of existing code                                      |
| `nit`       | Small code review changes mainly around style or syntax        |
| `feat`      | New features                                                   |

**Examples:**

```
fix: Project: telegram/telegram-lib. Version 1.0.12. Closes #9, fix path issue.
nit: Project: telegram/telegram-lib. Version 1.3.12. Swap let for const.
doc: Project: telegram/telegram-lib. Version 2.3.15. Added usage section to README.md.
```


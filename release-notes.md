# Project StOP (State Oriented Programming). Release notes 
## Version: 3.11.0 build 102
feat: ts-stop + .github/skills — Improved stop-sfsm-modeller skill and tooling: (1) standardized fully-qualified command names in both behavior and structure (Weight-checker.weightCheck); (2) added sub-FA push/pop design-pattern section with a step-by-step stack table; (3) documented that the components-tree format is skill-specific and not interchangeable with the library's extended FaNode format; (4) added gen-commands.js script that auto-generates commands.json from the model + an outcomes selection file, eliminating hand-written command mappings; (5) added --suppress flag to validate-ext-sfsm.js for expected partial-model warnings (Rule 6, Rule 10); (6) clarified signal mapping (business events vs. SFSM signals) in Step 2.3. Removed compare-trace.js (automated trace comparison was too brittle for naming differences). Updated sfsm.ext.json, start-test.sh, package.json. 248 tests passing.

## Version: 3.10.0 build 101
feat: ts-stop + .github/skills — Applied the stop-sfsm-modeller skill to the turnstile case study: created sfsm.ext.json (extended SFSM model with component hierarchy, events, commands, and transitions for UC-01). Created two new CLI scripts: extract-sfsm.js (extracts compact FA from the components-tree sfsm.ext.json format) and validate-ext-sfsm.js (validates the extended SFSM model: FA validation + structure-behavior cross-check). Registered both in package.json (bin and scripts). Successfully tested UC-01 (Coin Payment, change dispensed): 4 FAs, 16 transitions, final state Locked, trace matches expected flow. Removed TODO/planned-tooling notes from SKILL.md Steps 2.2 and 2.3, replaced with the actual implemented commands. 248 tests passing.

## Version: 3.9.2 build 100
doc: .github/skills — Rewrote stop-sfsm-modeller/SKILL.md for grammar, professional wording, and clarity for humans and AI-agents. Fixed JSON syntax errors in the sfsm.ext.json format example (wrapper-object convention, valid brackets/commas, complete key-value pairs). Clarified the transformation workflow (Steps 1, 2, 2.1–2.3, 3a, 3b), the event→signal and command naming conventions, and the cross-component (sibling) communication pattern via the parent. Noted validate-ext-sfsm.js and extract-sfsm.js as planned tooling with interim workarounds (validate-whole-sfsm.js and reduce-fa.js). Standardized on American English spelling.

## Version: 3.9.1 build 99
doc: Skill stop-sfsm-modeller — Updated transformation process.

## Version: 3.9.0 build 98
feat: Rule 12 by FaValidator deactivated.

## Version: 3.8.0 build 97
feat: .github/skills/business-modeler — Added Step 5 (business-use-cases-trace.md): per-UC signal→state traceability with all-entry-point coverage, no-shortcut rule, 3-round failure recovery, and quality check. Updated business model output for turnstile tutorial.

## Version: 3.7.1 build 96
doc: .github/skills — Improved stop-sfsm-modeller skill: (1) Rule 12 validation errors can be ignored for non-last use cases since missing states may appear in later use cases, (2) log entries now require timestamps with seconds in ISO 8601 format, (3) transitions within each FA group in behavior.json must be sorted by from-state name (entry state I first, then alphabetical).

## Version: 3.7.0 build 95
feat: ts-stop + .github/skills — Restructured development process: merged steps 3 (SFSM draft) and 4 (Autonomous SFSM test) into single step 3 (SFSM modeling). Created stop-sfsm-modeller skill that combines structure modeling and behavior modeling with incremental use-case processing, validation, testing, and visualization. Added validate-whole-sfsm.js script for two-phase validation. Added 3 new transformation rules (Rule 7-9). Updated 05-development-process.md with new 5-step process.

## Version: 3.6.1 build 94
test: ts-stop — Added "repeated deep push/pop cycles" test to Sfsm.test.ts (extended format) and Sfsm.compact.test.ts (compact format). Uses a 3-level FA hierarchy (A → B → C) and runs a 6-step deep cycle 3 times: push B, push C, pop C, re-push C (must reset to I), pop C, pop B. Verifies that sub-FAs always re-enter at their entry state I when pushed again after being popped, and that the log signal pattern is identical across cycles (deterministic repetition). 249 tests total passing.

## Version: 3.6.1 build 93
test: ts-stop — Rewrote Sfsm.log.test.ts, Sfsm.test.ts, Sfsm.compact.test.ts, FaReducer.test.ts, and FaLoader.test.ts to use embedded SFSM definitions and a minimal RecordingReceiver instead of external simulators and ControllerHub. Added Sfsm.compact.test.ts (compact multi-FA format, parallel to Sfsm.test.ts). Removed all describe.skip blocks — no skipped tests remain. Each file now has a header comment explaining what it tests. Tests cover: logging, single-FA transitions, exit states, stacked FAs (push/pop), bubble-up, missing-transition/missing-data policies, signal re-entrancy, $-suffix data forwarding, compact-format log metadata, reduceFA round-trip, and loadFAFromFile/loadFAFromURL integration. 247 tests total passing.

## Version: 3.6.0 build 91
feat: ts-stop + .github/skills — Extended stop-autonomous-sfsm-tester skill with Step 2 (Validate SFSM JSON with validate-fa.js) and Step 3 (Test use cases with run-fa.js). Updated extract-fa-from-draft.js to strip FA name prefixes from state names, producing bare state names compatible with the SFSM engine. Created test infrastructure: signal files, commands.json, and run-tests.sh for use cases 0 and 1. Test results: use case 0 (System initialization) passed, use case 1 (Happy path with coin and change) failed due to exit-state signal forwarding design issue (Rule 10) — the SFSM engine forwards the original signal when a sub-FA exits, but the draft expects the command's output signal to drive the next transition. Documented common issues and quality criteria in the skill.

## Version: 3.5.0 build 90
feat: ts-stop + .github/skills — Added extract-fa-from-draft.js CLI script that extracts SFSM JSON from an extended-transitions draft markdown file. Scans for transition lines, groups them by FA name (from-state prefix before ":"), and outputs a JSON file ready for validation and testing. Registered in package.json (bin and scripts). Added stop-autonomous-sfsm-tester skill (Step 1: Extract SFSM JSON from extended-transitions draft). Tested with turnstile example: 45 transitions in 14 FA groups extracted successfully.

## Version: 3.4.1 build 89
feat: .github/skills — Extended stop-sfsm-drafter skill with Step 2 (Event and Command Descriptions) and Step 3 (Extended Transitions transformation rules). Added Rules 1-6 for transforming use-case steps into SFSM transitions, including cross-branch routing (Rule 5) and already-covered steps (Rule 6). Processed use-case steps 1.4-1.17 in the turnstile example with full event/command descriptions for Form Checker, Change Dispenser, Locking Mechanism, Light Indicator, Timer for Unlocked State, and Push Sensor.

## Version: 3.4.0 build 88
feat: .github/skills — Added stop-sfsm-drafter skill (Step 1: FA-structure transformation). Transforms the flat Structure Overview from a user story into a hierarchical component tree by grouping elements by business and physical nature, then creating groups of groups. Includes transformation rules, workflow, quality criteria, and a turnstile example. Completed the FA-structure paragraph in the turnstile case study extended-transitions document.

## Version: 3.3.0 build 87
feat: ts-stop + .github/skills — Added simulator-writer skill and full turnstile simulator set (15 simulator classes, 10 workflow tests, all passing). Extended jest and tsconfig to cover tutorial directory.

## Version: 3.2.6 build 86
doc: ts-stop — Rewrote turnstile case study use cases per use-case-writer skill: fixed numbering gaps, applied action vocabulary (validate, display, send, receive, decide, notify), split compound actions into atomic steps, added missing use cases (invalid banknote, insufficient change, hardware fault, unlocked state timeout), and ensured full traceability with the user story.

## Version: 3.2.5 build 85
doc: .github/skills — Added action vocabulary table to use-case-writer skill.

## Version: 3.2.4 build 84
doc: .github/skills — Added use-case-writer skill for interactive, traceable use case elicitation from a user story.

## Version: 3.2.3 build 83
doc: ts-stop — Improved turnstile case study user story: professional wording, consistent element naming, corrected form-checker scope (coins not banknotes), fixed grammar, and aligned with user-story-writer skill quality criteria.

## Version: 3.2.2 build 82
doc: .github/skills — Added user-story-writer skill for interactive, structured user story elicitation.

## Version: 3.2.1 build 81
doc: Project: ts-stop — Tutorials restructured.

## Version: 3.2.0 build 80
feat: ts-stop — Added FaValidator class (src/sfsm/tools/runner/FaValidator.ts) for validating compact/extended FA definitions against 14 structural rules (11 from spec + 3 pragmatic additions). New validate-fa.js CLI script. 32 unit tests covering all rules using abstract FA names. 191 tests passing.

## Version: 3.1.0 build 79
feat: ts-stop — Added FaRunner and CommandInterpreter classes (src/sfsm/tools/runner/) for driving an Sfsm through a signal sequence with optional command-to-signal translation. New run-fa.js CLI script for running FAs from the command line. Rewrote tutorial chapter 2 (Stacked Finite State Machines) with a CheckCoin sub-FA example extending the chapter 1 turnstile. 159 tests passing.

## Version: 3.0.0 build 78
Project structure and some essential classes will be refactored.

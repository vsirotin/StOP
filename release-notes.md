# Project StOP (State Oriented Programming). Release notes 
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

## Version: 2.4.2 build 77
dist: ts-stop — Fix: Licensing files (LICENSE-COMMERCIAL.md, LICENSE-PUBLIC.md) and release-notes.md now properly included in npm package. Updated package.json "files" array and publish-local.sh to copy licensing files from monorepo root before packing. Updated DEVELOPMENT.md deployment workflow documentation.

## Version: 2.4.1 build 76
docs: ts-stop — Minor: Updated DEVELOPMENT.md deployment testing documentation and .npmignore to exclude compiled test directories (lib/test/, lib/esm/test/). Tests are now built but not deployed to npm. Updated local testing workflow to use TMP/node_modules instead of ts-example.

## Version: 2.4.0 build 75
feat: ts-stop — Add SFSM diagram generation and validation tools. New scripts: json-to-drawio.js converts compact SFSM JSON to hierarchical draw.io UML diagrams with ELK.js layout; drawio-to-json.js extracts compact SFSM JSON from diagrams (lossless round-trip); compare-compact-jsons.js performs intelligent comparison of SFSM JSON files with detailed diff reporting. Diagrams feature hierarchical container-based structure with vertical stacking, light grey sub-FA containers (100×60 px), and full SFSM metadata preservation. All 202 tests passing.

## Version: 2.3.1 build 74
doc: Tutorial.md — removed both remaining references to the obsolete Z_06-StOP-SFSM-Definition.md (§5's processing-rules note and §8.1's "complex turnstile example" link), rewording each sentence to stand on its own.

## Version: 2.3.0 build 73
feat: ts-stop — Sfsm now auto-detects namespaced entry/exit state names per FA, alongside the classic bare forms: entry state is "I" or ends with ".I" (e.g. "TS.I"); exit state starts with "E_" or contains ".E_" (e.g. "TS.E_ok"). New `ResolvedFa.entryState` in FaResolver; `Sfsm` uses it instead of a hardcoded 'I' when pushing stack frames, and its exit check now also matches the namespaced form. Purely additive — all 197 previous tests pass unchanged. Tutorial.md gained §8 "Best practices" / §8.1 "Name conventions" plus illustrative test 08-namespaced-state-names.test.ts. 202 tests passing.

## Version: 2.2.2 build 72
dist: new agent SKILL.md files in .github/skills/: sfsm-json-to-uml-diagram (SFSM FA JSON, compact or extended, → draw.io UML state diagram, defining the canonical sfsmRole/sfsmFa/sfsmKey style-token notation), sfsm-uml-diagram-to-json (reverse: draw.io diagram → compact-format JSON, with heuristic fallback for hand-drawn diagrams), and sfsm-compare-json-uml-diagram (diff a compact-format JSON FA definition against a draw.io diagram without modifying either file).

## Version: 2.2.1 build 71
doc: ts-stop — Tutorial.md gained chapters 4-7: "What is a Stacked Finite State Machine (SFSM)?", "How stacked states are processed" (processing rules rewritten against Sfsm.ts, correcting the stale wording from the old Z_06 doc), "Signal Senders, Command Receivers, Controllers, and the Controller Hub", and "Utilities" (reduceFA, multi-FA compact format, loadFAFromFile/loadFAFromURL, CLI tools, updateCompactFA/updateFullFA with a new example promoting a plain state into a sub-FA). New illustrative tests 04-stacked-finite-state-machine.test.ts, 06-controllers-and-controller-hub.test.ts, 07-update-fa-add-detail.test.ts. 197 tests passing.

## Version: 2.2.0 build 70
feat: ts-stop — add Joker concept to the SFSM engine. New SfsmOptions.jokerSignal / jokerState (default '*'): a joker-signal transition [state, '*', toState] matches any signal for that state, and a joker-state transition ['*', signal, toState] matches that signal from any state — both only as a fallback behind exact, literal transitions. New Sfsm.joker.test.ts (10 tests). Tutorial.md gained chapter 3 "Jokers: wildcard signals and states" with power-failure (joker-signal) and maintenance-mode (joker-state) examples plus illustrative tests 03-joker-signal.test.ts / 03-joker-state.test.ts. 184 tests passing.

## Version: 2.1.1 build 69
doc: docs/Tutorial/Tutorial.md — numbered chapters (1., 2., 2.1) and added a "type-safe alternative" subsection showing how to define FA transitions against string-literal union types with a small generic helper, catching state/signal typos at compile time. New illustrative test: 02-type-safe-fa-definition.test.ts. 168 tests passing.

## Version: 2.1.0 build 68
feat: ts-stop — replaced ExternalWorldHub with ControllerHub + new SignalSender/CommandReceiver abstract base classes (Controllers). Components now self-declare their signal/command names via getSignalNames()/getCommandNames() instead of repeating them at the registration call site. All SFSM test simulators refactored to extend SignalSender. 164 tests passing (ControllerHub.test.ts replaces ExternalWorldHub.test.ts).

## Version: 2.0.1 build 67
doc: ts-stop — new Tutorial.md intro chapter "What is a Finite Automaton?" (adapted from obsolete Z_05 doc, re-authored against the current Sfsm engine since the old MatrixBasedStateMachine FA layer is removed); illustrative unit test added in test/sfsm/tutorial/; fixed stale src/fa references in DEVELOPMENT.md and dead tutorial link in ts-stop/README.md.

## Version: 2.0.0 build 66
Version 2.0.0 started

## Version: 1.13.2 build 65
bin: ts-stop — fix published package to list scripts explicitly in files field (exclude publish-local.sh); remove unused ts-stop/scripts/publish-local.sh; rewrite ts-example/scripts/publish-local.sh to use npm pack+tar instead of raw cp.

## Version: 1.13.1 build 64
test: ts-example — add FaMerger, FaReducer, FaUpdater, Sfsm.compact integration tests importing from @vsirotin/ts-stop; update publish-local.sh to copy scripts/.

## Version: 1.13.0 build 63
feat: ts-stop — add merge-fas-from-dir script to recursively merge all FA files from a directory; reorganize merge-fas test data into input/ subdirectory; add bin field to package.json for CLI tool distribution; update DEVELOPMENT.md documentation.

## Version: 1.12.1 build 62
test: ts-stop — merge-fas CLI integration tests + realistic split test data (part1/part2/part3/expectation.json). Post-task SKILL.md updated: run full tests rule added, rules renumbered 1–5.

## Version: 1.12.0 build 61
feat: ts-stop — add merge-fas CLI to reduce and merge multiple FA files into one compact output; already-compact inputs are kept as-is; duplicate FA keys log warnings and last file wins.

## Version: 1.11.1 build 60
doc: ts-stop and ts-example moved to packages/ directory. Project restructuring for monorepo setup. Root-level README.md updated with new paths and monorepo overview. 
## Version: 1.11.0 build 59
dist: ts/ts-stop — Add dual licensing model (Apache 2.0 for free use, Commercial License for organizations with 10+ employees or $10K+ annual revenue). License field updated in package.json.

## Version: 1.10.0 build 58
feat: ts-stop — reduce-fa CLI now formats transition arrays inline for compact readability. Jest extension configured with virtual folders for ts-stop and ts-example projects. TypeScript rootDir explicitly set in tsconfig.json.

## Version: 1.9.3 build 57
doc: ts-example — add README.md with project goal, links to DEVELOPMENT.md and ts-stop.

## Version: 1.9.2 build 56
feat: ts-stop — add README.md and LICENSE to published package; improve README wording; update publish-local scripts to copy all published files.

## Version: 1.9.1 build 55
fix: ts-example — Jest tests now working: fix jest.config.js (setupFilesAfterEnv), add moduleNameMapper for @vsirotin/ts-stop subpaths, use new jest-preset-angular setup API; remove incorrect file: dep from package.json.

## Version: 1.9.0 build 54
fix: ts-stop v0.7.0 — add `browser` export condition for `./sfsm` sub-path to exclude Node-only `FaLoader` from browser bundles (fixes esbuild production build).

## Version: 1.8.0 build 53
feat: Minimal Angular 17 browser demo in ts/ts-example. Two panels: FA turnstile (FiniteStateMachine) and SFSM turnstile (Sfsm, compact FA, banknote payment). ./sfsm sub-path export added to ts-stop package.json. DEVELOPMENT.md rewritten with 10-step developer workflow.

## Version: 1.7.0 build 52
feat: updateCompactFA / updateFullFA library functions and update-compact-fa / update-full-fa CLI scripts. FaUpdate type. 20 new unit tests; 297 tests passing.

## Version: 1.6.0 build 51
feat: ExternalWorldHub — standard wiring component for connecting external-world devices to the SFSM. New ISignalSender interface. registerSignalSender/registerCommandReceiver fluent API with explicit name lists for precise runtime error reporting. CommandRouter (test-only) removed. All simulators refactored to implement ISignalSender. 16 new unit tests; 266 tests passing.

## Version: 1.5.2 build 50
feat: loadFAFromURL helper (browser & Node.js, fetch-based) with 8 mocked unit tests. 261 tests passing.

## Version: 1.5.1 build 49
feat: loadFAFromFile helper, reduce-fa CLI script, and Utilities section in tutorial doc. 253 tests passing.

## Version: 1.5.0 build 48
feat: SFSM compact multi-FA format support + `reduceFA` utility. `FaResolver` extended for auto-root-detection in flat `Record<string, Transition[]>` definitions. `FaReducer.ts` added to strip extended metadata to compact. 246 tests passing.

## Version: 1.4.3 build 47
doc: SFSM step 6 — replaced pseudo-code API section in 05-StOP-SFSM-Definition.md with real TypeScript API (Sfsm class, interfaces, options, usage example); log format rewritten as a table; DEVELOPMENT.md updated with sfsm module structure.

## Version: 1.4.2 build 46
fix: SFSM engine — stackBefore captured before bubble-up splice (log accuracy); rule label correctly identifies '2.2.2.1' vs '2.1'. Added 18 new edge-case tests (policy, stack inspection, loadFA reset, log correctness). 197 total tests passing.

## Version: 1.4.1 build 45
test: SFSM step 3 — banknote path (BPP) and sequential-transaction tests added. 36 SFSM tests passing (was 23).

## Version: 1.4.0 build 44
feat: SFSM engine implementation step 1+2 — API interfaces, type definitions, FaResolver, Sfsm engine class (stubs → full engine), smart simulators, test skeleton, and 23 passing tests. Turnstile FA JSON extracted to docs and test-data. js-yaml added.

## Version: 1.3.1 build 43
refactor: Restructured source code organization - moved core library classes from src/ to src/fa/ and corresponding tests from test/ to test/fa/. Maintains backward compatibility through re-exports in src/index.ts. All 152 tests passing.

## Version: 1.3.0 build 42
feat: Added unreachable-state validation (ERROR-STOP-08) and skipValidation constructor parameter (default false). 8 new tests; 4 existing tests corrected to satisfy the new validation.

## Version: 1.2.0 build 41
feat: Added dangling-reference validation (ERROR-STOP-03..06) and output-signal cycle detection (ERROR-STOP-07) in FiniteStateMachine constructor. All existing error messages prefixed with ERROR-STOP-01/02. 9 new tests added; 1 existing edge-case test updated.

## Version: 1.1.0 build 40
feat: Added output-signal state validation in FiniteStateMachine constructor. States implementing IStateWithOutputSignal without outgoing transitions now throw a clear configuration error at construction time. Converted 5 skipped (xtest) tests to active throw-tests; added 2 new positive tests; fixed 3 pre-existing tests whose configurations were invalid.

## Version: 1.0.1 build 39
Fixed unit tests, CI workflow, and documentation to match project standards.

## Version: 1.0.0 build 38

## Version: 1.0.0 build 3
Refactoring of project for production version.
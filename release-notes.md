# Project ts-stop. Release notes 
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
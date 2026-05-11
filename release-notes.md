# Project frontend. Release notes 
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
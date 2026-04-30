# Project frontend. Release notes 
## Version: 1.2.0 build 41
feat: Added dangling-reference validation (ERROR-STOP-03..06) and output-signal cycle detection (ERROR-STOP-07) in FiniteStateMachine constructor. All existing error messages prefixed with ERROR-STOP-01/02. 9 new tests added; 1 existing edge-case test updated.

## Version: 1.1.0 build 40
feat: Added output-signal state validation in FiniteStateMachine constructor. States implementing IStateWithOutputSignal without outgoing transitions now throw a clear configuration error at construction time. Converted 5 skipped (xtest) tests to active throw-tests; added 2 new positive tests; fixed 3 pre-existing tests whose configurations were invalid.

## Version: 1.0.1 build 39
Fixed unit tests, CI workflow, and documentation to match project standards.

## Version: 1.0.0 build 38

## Version: 1.0.0 build 3
Refactoring of project for production version.
# TypeScript StOP Library Development

## Project description

This is the core TypeScript implementation of the StOP (State-Oriented Programming) library. It provides a robust framework for building finite state machines with support for:
- Traditional string-based or enum-based state machines
- Matrix-based state transitions for intuitive visualization
- State actions (entry/exit hooks)
- Output signals (auto-triggering transitions)
- Default states for handling invalid signals

The library is consumed by test examples in `test/` and by the `js-example` sub-project.

## How to build

```bash
npm run build
```

This builds both CommonJS and ES modules to the `lib/` directory.

## Unit testing

```bash
# Install and publish library locally (required for tests to resolve imports)
npm run publish:local

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

**Important:** Run `npm run publish:local` after making changes to source code, as tests import from `@vsirotin/ts-stop` which requires the library to be available in `node_modules/@vsirotin/ts-stop/`.

## Automatic local integration testing

Integration testing is performed through the Jest test suite in `test/`. The test scenarios include:
- Finite state machine behavior validation
- Matrix-based state transitions
- State actions and output signals
- Turnstile examples (basic, realistic, with signals)

Run `npm run test:coverage` to generate a coverage report.

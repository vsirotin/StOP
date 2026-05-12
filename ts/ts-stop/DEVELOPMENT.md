# TypeScript StOP Library Development

## Project description

This is the core TypeScript implementation of the StOP (State-Oriented Programming) library. It provides a robust framework for building finite state machines with support for:
- Traditional string-based or enum-based state machines
- Matrix-based state transitions for intuitive visualization
- State actions (entry/exit hooks)
- Output signals (auto-triggering transitions)
- Default states for handling invalid signals
- **Stacked Finite State Machine (SFSM)** — a stack-based engine for hierarchical, multi-component FA processing

The library is consumed by test examples in `test/fa/` and `test/sfsm/`, and by the `ts-example` sub-project.

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




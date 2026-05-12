# TypeScript StOP Library Development

## Project description

This is the core TypeScript implementation of the StOP (State-Oriented Programming) library. It provides a robust framework for building finite state machines with support for:
- Traditional string-based or enum-based state machines
- Matrix-based state transitions for intuitive visualization
- State actions (entry/exit hooks)
- Output signals (auto-triggering transitions)
- Default states for handling invalid signals
- **Stacked Finite State Machine (SFSM)** — a stack-based engine for hierarchical, multi-component FA processing

The library is consumed by test examples in `test/fa/` and `test/sfsm/`, and by the `js-example` sub-project.

## Project structure

- `src/fa/` — Core finite state machine implementation classes (FA layer)
- `src/sfsm/` — Stacked Finite State Machine engine (SFSM layer)
  - `interfaces.ts` — `ICommandReceiver`, `ISignalReceiver`
  - `types.ts` — `FaDefinition`, `FaNode`, `Transition`, `SfsmOptions`, `LogEntry`
  - `FaResolver.ts` — Parses FA JSON (extended or compact) into a flat indexed structure; auto-detects root in multi-key compact definitions
  - `FaReducer.ts` — `reduceFA()`: strips metadata from extended definitions to produce compact flat format
  - `FaLoader.ts` — `loadFAFromFile()`: reads and parses an FA JSON file (Node.js only)
  - `Sfsm.ts` — Engine class: stack management, signal queue, rule processing, logging
  - `index.ts` — Re-exports all public symbols
- `test/fa/` — Unit and integration tests for the FA layer, including Turnstile examples
- `test/sfsm/` — Unit and integration tests for the SFSM engine
  - `simulators/` — Smart device simulators (TurnstileDevice, CoinAcceptor, Changer, etc.)
  - `test-data/` — FA definition JSON files used by tests

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

## SFSM utilities

### Convert an extended FA file to compact format

```bash
# Build first (required)
npm run build

# Reduce an extended FA JSON to compact format
npm run reduce-fa -- <path/to/extended-fa.json>
```

Output is written to `<basename>-compact.json` in the same directory as the input file.

**Example:**

```bash
npm run reduce-fa -- test/sfsm/test-data/turnstile-fa.json
# Reduced FA written to: test/sfsm/test-data/turnstile-fa-compact.json
```

### Load an FA from a file in code (Node.js)

Use `loadFAFromFile` to read and parse an FA JSON file without manually calling `fs.readFileSync`:

```typescript
import { Sfsm, loadFAFromFile } from '@vsirotin/ts-stop/sfsm';

const sfsm = new Sfsm({ byMissingTransition: 'error' });
sfsm.setCommandReceiver(myRouter);
sfsm.loadFA(loadFAFromFile('./my-fa.json'));
```

Both extended and compact formats are accepted by `loadFA()` without any change to the calling code.

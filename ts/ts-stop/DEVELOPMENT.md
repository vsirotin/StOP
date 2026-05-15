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

## Project structure

- `src/fa/` — Core finite state machine implementation classes (FA layer)
- `src/sfsm/` — Stacked Finite State Machine engine (SFSM layer)
  - `interfaces.ts` — `ICommandReceiver`, `ISignalReceiver`
  - `types.ts` — `FaDefinition`, `FaNode`, `Transition`, `SfsmOptions`, `LogEntry`
  - `FaResolver.ts` — Parses FA JSON (extended or compact) into a flat indexed structure; auto-detects root in multi-key compact definitions
  - `FaReducer.ts` — `reduceFA()`: strips metadata from extended definitions to produce compact flat format
  - `FaMerger.ts` — `mergeFAs()`: reduces multiple definitions and merges them into one compact multi-FA map with duplicate-key warnings
  - `FaLoader.ts` — `loadFAFromFile()` (Node.js only) and `loadFAFromURL()` (browser & Node.js ≥ 18)
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

> **Note:** `npm run publish:local` builds the library and installs it into
> `ts-stop/node_modules/@vsirotin/ts-stop/` so that the Jest test suite can
> resolve the `@vsirotin/ts-stop` import.  It no longer copies files to
> `ts-example/` — that is now handled by `ts-example`'s own `publish:local`
> script.

## SFSM utilities

### Convert an extended FA file to compact format

```bash
# Build first (required)
npm run build

# Reduce an extended FA JSON to compact format
npm run reduce-fa -- <path/to/extended-fa.json>

```

e.g.
```bash
npm run reduce-fa -- test/sfsm/test-data/turnstile-fa.json
``` 

Output is written to `<basename>-compact.json` in the same directory as the input file.

**Example:**

```bash
npm run reduce-fa -- test/sfsm/test-data/turnstile-fa.json
# Reduced FA written to: test/sfsm/test-data/turnstile-fa-compact.json
```

### Merge multiple FA files into one compact output

```bash
# Build first (required)
npm run build

# Reduce each input (if needed) and merge all FAs to one compact file
npm run merge-fas -- --result=<path/to/result.json> <file1[,file2,...]> [file3 ...]
```

Rules:
- If an input is already compact, it is used unchanged.
- If duplicate FA keys exist across files, the last file wins and a warning is printed.

**Example:**

```bash
npm run merge-fas -- --result=test/sfsm/test-data/merge-fas/result.json \
  test/sfsm/test-data/merge-fas/part1.json,test/sfsm/test-data/merge-fas/part2.json \
  test/sfsm/test-data/merge-fas/part3.json
```

### Load an FA from a file in code (Node.js)

```typescript
import { Sfsm, loadFAFromFile } from '@vsirotin/ts-stop/sfsm';

const sfsm = new Sfsm({ byMissingTransition: 'error' });
sfsm.setCommandReceiver(myRouter);
sfsm.loadFA(loadFAFromFile('./my-fa.json'));
```

### Load an FA from a URL (browser & Node.js)

```typescript
import { Sfsm, loadFAFromURL } from '@vsirotin/ts-stop/sfsm';

const sfsm = new Sfsm({ byMissingTransition: 'error' });
sfsm.setCommandReceiver(myRouter);
sfsm.loadFA(await loadFAFromURL('https://example.com/my-fa.json'));
```

Both extended and compact formats are accepted by `loadFA()` without any change to the calling code.

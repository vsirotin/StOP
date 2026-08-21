# StOP SDK (`@vsirotin/ts-stop-sdk`) — Development

This is the developer-facing SDK for support of the StOP (State-Oriented Programming) software development paradigm. It provides the tutorials, skills for AI-Agents andCLI tools for creating, validating and using in production Stacked Finite Machines (SFSMs).

## 1. Project description

The SDK contains the non-core developer content of StOP:
- **Tutorial** (`tutorial/`) — 5 chapters
- **AI-agent skills** (`ai/skills/`) — 3 skills
- **CLI tools** (`scripts/`) — FA processing and validation utilities
- **Node-only helpers** — `loadFAFromFile`, `loadFAFromURL` (in `src/`)
- **Tests** — CLI and Node integration tests

The core library (`Sfsm` engine, pure FA utilities, component bases) is provided by
`@vsirotin/ts-stop` (see `ts/ts-stop-lib/`).

## 2. Development-Dependencies

The SDK declares `@vsirotin/ts-stop` as a dependency in `package.json`:

```json
"dependencies": {
  "@vsirotin/ts-stop": "file:../ts-stop-lib"
}
```

During development this uses a `file:` reference to the local `ts/ts-stop-lib`.
The CLI scripts resolve the library via `require('@vsirotin/ts-stop/sfsm')`.

## 3. How to build

```bash
cd ts/ts-stop-sdk
npm run build
```

This compiles the Node-only `src/` into `lib/`.

## 4. Unit testing

```bash
cd ts/ts-stop-sdk

# Run tests
npm test

# Run tests with coverage report
npm run test:coverage
```

The test suite covers the CLI tools (`run-fa`, `validate-fa`, `merge-fas`,
`merge-fas-from-dir`) and the Node-only helpers (`loadFAFromFile`,
`loadFAFromURL`).

## 5. Local integration testing

To test with the local (not already published) version of `ts-stop-lib` (without publishing):

1. Clear node_modules/@vsirotin/ts-stop manual or with script (from project directory):

```bash
bash dev-scripts/clear-ts-stop-lib.sh
```
2. Install local version of @vsirotin/ts-stop  with script (from project directory):

```bash
bash ts/ts-stop-sdk/dev-scripts/install-ts-stop-lib.sh
```
3. Process unit test (see section 4)

## 6. Publishing

To publish (manually):

```bash
cd ts/ts-stop-sdk
npm publish --access public
```
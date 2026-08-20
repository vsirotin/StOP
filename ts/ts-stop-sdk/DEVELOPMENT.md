# StOP SDK (`@vsirotin/ts-stop-sdk`) — Development

This is the developer-facing SDK of the StOP (State-Oriented Programming) project. It provides the CLI tools, tutorials, AI-agent skills, and Node-only helpers, and it **depends on the core library** `@vsirotin/ts-stop` which ships in a separate package.

## 1. Project description

The SDK contains the non-core developer content of StOP:
- **CLI tools** (`scripts/`) — FA processing and validation utilities
- **Node-only helpers** — `loadFAFromFile`, `loadFAFromURL` (in `src/`)
- **Tutorial** (`tutorial/`) — 5 chapters
- **AI-agent skills** (`ai/skills/`) — 3 skills
- **Tests** — CLI and Node integration tests

The core library (`Sfsm` engine, pure FA utilities, component bases) is provided by
`@vsirotin/ts-stop` (see `ts/ts-stop-lib/`).

## 2. Dependencies

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

## 5. Publishing

The `@vsirotin/ts-stop-sdk` package is Node-only. The `package.json` `"files"`
array controls what gets published:
- `lib/` — compiled Node-only helpers
- `scripts/` — CLI tools
- `ai/skills/` — AI skills
- `tutorial/` — markdown documentation
- `LICENSE-COMMERCIAL.md`, `LICENSE-PUBLIC.md` — dual licensing
- `release-notes.md` — changelog

To publish (manually):

```bash
cd ts/ts-stop-sdk
bash ../../scripts/publish-local.sh     # build + local pack
npm publish --access public
```

## 6. Local integration testing

See `ts/ts-stop-test-node/` for a minimal consumer that validates the
`@vsirotin/ts-stop-sdk` package after deployment.
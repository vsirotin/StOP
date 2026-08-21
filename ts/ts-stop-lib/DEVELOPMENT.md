# StOP Library — Development

This is the cross-platform core library of the StOP (State-Oriented Programming) SDK. It provides the Stacked Finite State Machine (SFSM) engine and pure FA utility functions. It has no Node.js or DOM dependencies.

## 1. Project description

The library contains the platform-independent building blocks of StOP:
- **Stacked Finite State Machine (SFSM)** — a stack-based engine for hierarchical, multi-component FA processing
- **FA utilities** — reduce, merge, update, resolve, validate
- **Component bases** — transceivers, signal senders/receivers, command receivers
- **Wiring hub** — `TransceiverHub` / `wireSfsm`

## 2. How to build

```bash
cd ts/ts-stop-lib
npm run build
```

This builds both CommonJS (`lib/`) and ES modules (`lib/esm/`), producing the `@vsirotin/ts-stop` package.

## 3. Unit testing

```bash
cd ts/ts-stop-lib

# Run tests
npm test

# Run tests with coverage report
npm run test:coverage
```

The test suite uses embedded FA definitions and fixtures from `test/sfsm/test-data/`. There are no tests that require Node-only helpers (those live in the SDK).

## 4. Platforms

The library is compiled and deployed for:

- **Node.js** — CommonJS output in `lib/`
- **Browser** — ES module output in `lib/esm/`
- **ESM** — ES module entry `module` field and `import` export condition

## 5. Publishing

To publish:

1. Build und test the library (see above).

2. Be sure, that local integration test in partner projects: - ts/ts-stop-sdk (see `ts/ts-stop-sdk/DEVELOPMENT.md`).,
- ts/ts-stop-test-node (see `ts/ts-stop-test-node/DEVELOPMENT.md`),
- ts/ts-stop-test-angular (see `ts/ts-stop-test-angular/DEVELOPMENT.md`)

are passing with the new version of the library.

3. Update the version in `package.json` and commit the change.

4. Publish the package to npm:

```bash
npm publish --access public
```

---

## 6. Related packages

The CLI tools, tutorials, and AI skills that ship with StOP are published separately
under the `@vsirotin/ts-stop-sdk` package (see `ts/ts-stop-sdk/DEVELOPMENT.md`).
# StOP Development

This guide covers building, testing, and deploying the TypeScript implementation of StOP, which is split into four sub-projects under `ts/`.

## 1. Project structure

| Path                        | npm package              | Purpose                                                            |
|-----------------------------|--------------------------|--------------------------------------------------------------------|
| `ts/ts-stop-lib`            | `@vsirotin/ts-stop`       | Cross-platform core library (CJS Node + ESM Browser)               |
| `ts/ts-stop-sdk`            | `@vsirotin/ts-stop-sdk`   | CLI tools, tutorials, AI skills, Node-only helpers (depends on lib)|
| `ts/ts-stop-test-node`      | — (private)              | Node integration smoke-test of the SDK                             |
| `ts/ts-stop-test-angular`   | — (private)              | Angular smoke-test of the library                                  |

## 2. The library (`ts/ts-stop-lib`)

Pure `Sfsm` engine and FA utilities with no Node.js or DOM dependencies.

```bash
cd ts/ts-stop-lib
npm run build        # CJS -> lib/, ESM -> lib/esm/
npm test             # jest unit tests
```

Publish:

```bash
cd ts/ts-stop-lib
npm run build
npm publish --access public
```

## 3. The SDK (`ts/ts-stop-sdk`)

Depends on the library and adds CLI tools, tutorials, AI skills and `loadFAFromFile`.

```bash
cd ts/ts-stop-lib
npm run build        # SDK consumes the library, so build it first

cd ../ts-stop-sdk
npm ci               # resolves @vsirotin/ts-stop via file:../ts-stop-lib
npm run build        # Node-only lib/
npm test             # jest CLI + Node tests
```

Publish:

```bash
cd ts/ts-stop-sdk
npm run build
npm publish --access public
```

## 4. Local validation before the NPM deployment

### Step 1: Build and pack locally

```bash
bash scripts/publish-local.sh
```

*(Run from the workspace root.)*

This builds and packs both `@vsirotin/ts-stop` and `@vsirotin/ts-stop-sdk`
into `TMP/node_modules/@vsirotin/*`.

### Step 2: Update the Node test project

```bash
bash scripts/test-with-local-lib.sh
```

This copies the locally-built packages into `ts/ts-stop-test-node/node_modules`.

### Step 3: Run Node integration tests

```bash
cd ts/ts-stop-test-node
npm test
```

The `test-imports.js` script validates that the SDK resolves, re-exports the
core library and Node helpers, and ships its CLI tools, tutorial, and AI skills.

### Step 4: Run Angular integration test (optional)

```bash
cd ts/ts-stop-lib
npm run build

cd ../ts-stop-test-angular
npm install
npm run build
```

A successful build confirms the cross-platform library bundles and runs inside
Angular with no Node-only dependencies.

## 5. Release notes

Each sub-project has its own `release-notes.md` and `version.json`.

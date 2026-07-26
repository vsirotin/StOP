# TypeScript StOP Library Development

## 1. Project description

This is the core TypeScript implementation of the StOP (State-Oriented Programming) SDK. It provides a robust framework for building finite state machines, centered on:
- **Stacked Finite State Machine (SFSM)** — a stack-based engine for hierarchical, multi-component FA processing


## 2. How to build

```bash
cd ts/ts-stop
npm run build
```

This builds both CommonJS and ES modules to the `lib/` directory.

## 3. Unit testing

# Run tests
```bash
cd ts/ts-stop
npm test
```

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
```bash
cd ts/ts-stop
npm run test:coverage
```

## 4. SFSM tools

See [04-tools.md](../../tutorial/04-tools.md) 

## 5. Testing new version locally before NPM deployment

### Step 1: Create a local npm package

```bash
bash scripts/publish-local.sh
```

*(Run from the workspace root directory)*

This script:
- Builds the `@vsirotin/ts-stop` library (`npm run build`)
- Creates a tarball using `npm pack` (respects the `"files"` array in `package.json` exactly as npm will)
- Installs the tarball into `TMP/node_modules/@vsirotin/ts-stop`

### Step 2: Prepare test package for ts-stop-local-test

```bash
bash scripts/test-with-local-lib.sh
```

*(Run from the workspace root directory)*

This script:
1. Verifies the local package exists in `TMP/node_modules/@vsirotin/ts-stop` (created by Step 1)
2. Copies the package to `ts/ts-stop-local-test/node_modules/@vsirotin/ts-stop`
3. Prints instructions for running integration tests

✅ **After this step, the package is ready for integration testing via ts-stop-local-test.**

### Step 3: Run integration tests

```bash
cd ts/ts-stop-local-test

# Run import and deployment validation tests
npm test
```

This runs the `test-imports.js` script which validates:
- ✅ Main export: `import { Sfsm } from '@vsirotin/ts-stop'`
- ✅ Submodule export: `import { FaDefinition } from '@vsirotin/ts-stop/sfsm'`
- ✅ All 7 CLI tools present
- ✅ Tutorial directory deployed
- ✅ AI skills directory deployed

**If all checks pass, the package is ready for NPM deployment.**

### Step 4: Verify package structure visually (Optional)

After running Steps 1-2, inspect the deployed package:

```bash
cd ts/ts-stop-local-test/node_modules/@vsirotin/ts-stop

# Check the version
cat package.json | grep '"version"'

# View directory structure
ls -la
```

Expected structure:

```
lib/
├── esm/
│   ├── sfsm/                 (12 files)
│   ├── src/
│   └── index.js
├── sfsm/                     (48 files)
├── src/
├── index.d.ts
├── index.js
└── ... (type definitions, source maps)

scripts/
├── reduce-fa.js              (5 core tools)
├── merge-fas.js
├── merge-fas-from-dir.js
├── update-fa.js
├── json-to-drawio.js         (3 diagram tools)
├── drawio-to-json.js
└── compare-compact-jsons.js

ai/skills/                    (3 AI skills)
├── sfsm-json-to-uml-diagram/
├── sfsm-uml-diagram-to-json/
└── sfsm-compare-json-uml-diagram/

tutorial/                     (4 chapters + images)
├── 01-finite-state-machine.md
├── 02-stacked-finite-state-machine.md
├── 03-advanced-themes.md
├── 04-tools.md
└── images/

README.md
LICENSE-COMMERCIAL.md
LICENSE-PUBLIC.md
release-notes.md
package.json
```



### FYI: Included documentation and licensing files

The following files from the monorepo root are included in the npm package:
- `README.md` — automatically included by npm
- `LICENSE-COMMERCIAL.md` — dual licensing for commercial use
- `LICENSE-PUBLIC.md` — public license option
- `release-notes.md` — changelog

These are configured in `ts/ts-stop/package.json` under the `"files"` array and are part of every published version.

**Verification:**
```bash
npm view @vsirotin/ts-stop dist.tarball
tar -tzf <tarball-url> | grep -E '(LICENSE|release-notes)'
```### Step 5: Deployment to NPM registry

Before publishing, ensure the licensing and release notes files are in the package directory:

```bash
cd ts/ts-stop

# Copy licensing and release notes from monorepo root
cp ../LICENSE-COMMERCIAL.md .
cp ../LICENSE-PUBLIC.md .
cp ../release-notes.md .

# Publish to npm
npm publish --access public

# Clean up (keep these files in monorepo root only, not in ts-stop)
rm LICENSE-COMMERCIAL.md LICENSE-PUBLIC.md release-notes.md
```

This publishes the package to the npm registry. The `package.json` "files" array controls what gets deployed:
- `lib/` — compiled library (CommonJS + ES modules)
- `scripts/` — CLI tools (7 scripts)
- `ai/skills/` — AI skills for various tasks
- `tutorial/` — markdown documentation
- `LICENSE-COMMERCIAL.md`, `LICENSE-PUBLIC.md` — dual licensing
- `release-notes.md` — changelog

**Note:** The `publish-local.sh` script handles this copying automatically for local testing. For real NPM publication, you must do it manually. 

## 6. Local integration testing with ts-stop-local-test

The `ts/ts-stop-local-test/` project is a minimal consumer that validates the `@vsirotin/ts-stop` package after deployment:

### Purpose
- Verify package imports work correctly (main export + submodule exports)
- Check all CLI tools are included
- Validate tutorial and AI skills directories are deployed
- Catch bundler/integration issues before publishing

### How to use

```bash
cd ts/ts-stop-local-test

# Install dependencies (links local ts-stop via "file:" protocol)
npm install

# Run import tests
npm test
```

The test verifies:
- ✅ Main export: `import { Sfsm } from '@vsirotin/ts-stop'`
- ✅ Submodule export: `import { FaDefinition } from '@vsirotin/ts-stop/sfsm'`
- ✅ All 7 CLI tools present
- ✅ Tutorial directory deployed
- ✅ AI skills directory deployed

If `npm test` passes, the package is ready for your application integration.




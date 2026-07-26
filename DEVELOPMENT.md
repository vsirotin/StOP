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

### Step 2: Run consumer tests with the local package

```bash
bash scripts/test-with-local-lib.sh
```

*(Run from the workspace root directory)*

This script:
1. Removes `TMP/node_modules` for a clean slate
2. Installs dependencies from the npm registry (fresh baseline)
3. Overwrites `@vsirotin/ts-stop` with the local build (via `publish-local.sh`)
4. Runs Jest smoke tests
5. Builds the production bundle

✅ **If all steps pass, the package is ready for NPM deployment.**

### Step 3: Verify deployment files visually

After running `publish-local.sh`, inspect the installed package in `node_modules` to see exactly what was deployed:

 Open cd TMP/node_modules/@vsirotin/ts-stop

1. Check the installed version TMP/node_modules/@vsirotin/ts-stop/package.json

2. Check the installed files and directories:

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

package.json
```



### FYI: Handle licensing and documentation files

The root-level files (README.md, LICENSE, LICENSE-COMMERCIAL.md, LICENSE-PUBLIC.md, release-notes.md) are located in the monorepo root, not in `ts/ts-stop/`. 

**Standard npm behavior:**
- `README.md` and `LICENSE` at the package root are **automatically included** by npm (no need to list in `"files"`)
- Other documentation files need explicit handling during deployment

**For your custom deployment process:**
1. Ensure README.md and LICENSE are at the root of the `@vsirotin/ts-stop` package directory
2. Copy or include the following files in the published package:
   - `LICENSE-COMMERCIAL.md` (dual licensing for commercial use)
   - `LICENSE-PUBLIC.md` (public license option)
   - `release-notes.md` (changelog)

You can verify these are included by checking the tarball after deploying to npm:
```bash
npm view @vsirotin/ts-stop  # View published package info
```

### Step 6: Check tarball integration

Manually verify the installed package works:

```bash
# After running test-with-local-lib.sh, check what's in node_modules
ls -la TMP/node_modules/@vsirotin/ts-stop/

# Run one of the CLI tools to verify scripts are accessible
cd ts-example
npx reduce-fa --help
npx json-to-drawio --help
```

If all these steps pass, **the package is production-ready for NPM deployment.** 



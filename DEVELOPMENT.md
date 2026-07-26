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

Before deploying to NPM, verify that the package can be installed and used correctly by testing it locally with the `ts-example` consumer project. This simulates exactly how the package will behave when downloaded from the npm registry.

### Step 1: Create a local npm package

```bash
cd /path/to/StOP
bash scripts/publish-local.sh
```

This script:
- Builds the `@vsirotin/ts-stop` library (`npm run build`)
- Creates a tarball using `npm pack` (respects the `"files"` array in `package.json` exactly as npm will)
- Installs the tarball into `ts-example/node_modules/@vsirotin/ts-stop`

### Step 2: Run consumer tests with the local package

```bash
cd /path/to/StOP
bash scripts/test-with-local-lib.sh
```

This script:
1. Removes `ts-example/node_modules` for a clean slate
2. Installs dependencies from the npm registry (fresh baseline)
3. Overwrites `@vsirotin/ts-stop` with the local build (via `publish-local.sh`)
4. Runs Jest smoke tests
5. Builds the production bundle

✅ **If all steps pass, the package is ready for NPM deployment.**

### Step 3: Verify deployment files visually

After running `publish-local.sh`, inspect what files are actually being deployed:

```bash
# List package contents in detail (tarball is created during publish-local.sh)
cd ts/ts-stop
tar -tzf vsirotin-ts-stop-*.tgz | sort

# View specific categories:
# — CLI scripts
tar -tzf vsirotin-ts-stop-*.tgz | grep "^package/scripts/"

# — Compiled library (Node.js CommonJS and ES modules)
tar -tzf vsirotin-ts-stop-*.tgz | grep "^package/lib/[a-z]" | head -20

# — Check total file count
tar -tzf vsirotin-ts-stop-*.tgz | wc -l
```

**What should be included:**
- ✓ `package/lib/` (compiled CommonJS and ES modules)
- ✓ `package/scripts/*.js` (CLI tools: reduce-fa, merge-fas, json-to-drawio, drawio-to-json, compare-compact-jsons, etc.)
- ✓ `package/package.json`

**What should NOT be included:**
- ✗ `package/src/` (source TypeScript, only compiled lib/)
- ✗ `package/test/` (tests, only compiled tests for reference)
- ✗ `package/node_modules/`
- ✗ `package/ai/skills/` (development documentation only)
- ✗ `package/tutorial/` (development documentation only)
- ✗ `package/.vscode/` (excluded by .npmignore)

### Step 4: Handle licensing and documentation files

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

### Step 5: Check tarball integration

Manually verify the installed package works:

```bash
# After running test-with-local-lib.sh, check what's in node_modules
ls -la ts-example/node_modules/@vsirotin/ts-stop/

# Run one of the CLI tools to verify scripts are accessible
cd ts-example
npx reduce-fa --help
npx json-to-drawio --help
```

If all these steps pass, **the package is production-ready for NPM deployment.** 



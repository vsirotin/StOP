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

After running `publish-local.sh`, inspect the installed package in `node_modules` to see exactly what was deployed:

```bash
# Check the installed version
cd ts-example/node_modules/@vsirotin/ts-stop
cat package.json | grep '"version"'

# View directory structure with file counts
ls -lh

# List top-level directories and their contents
echo "=== Package structure ===" && \
ls -lhd */ && \
echo "" && \
echo "=== lib/ directory ===" && \
find lib -type d -maxdepth 2 | sort && \
echo "" && \
echo "=== scripts/ directory ===" && \
ls -lh scripts/

# Count files by category
echo "" && \
echo "=== File counts ===" && \
echo "Total files in lib/: $(find lib -type f | wc -l)" && \
echo "Total files in scripts/: $(ls -1 scripts/ | wc -l)" && \
echo "Total files in package: $(find . -type f ! -path './node_modules/*' | wc -l)"
```

**Expected output structure:**
```
lib/                  # Compiled code (CommonJS and ES modules)
  esm/                # ES module versions (X files)
  sfsm/               # sfsm exports (X files)
  src/                # src folder reference (X files)
  test/               # Compiled tests (X files)
  index.d.ts          # Type definitions
  index.js            # Main export
  
scripts/              # CLI tools
  reduce-fa.js
  merge-fas.js
  merge-fas-from-dir.js
  update-fa.js
  json-to-drawio.js          # NEW: diagram generation
  drawio-to-json.js          # NEW: diagram extraction
  compare-compact-jsons.js   # NEW: diagram validation
  
package.json          # Package metadata
README.md             # (if manually added during deployment)
LICENSE               # (if manually added during deployment)
LICENSE-COMMERCIAL.md # (if manually added during deployment)
LICENSE-PUBLIC.md     # (if manually added during deployment)
release-notes.md      # (if manually added during deployment)
```

**Verification checklist:**
- ✓ Version number matches `2.4.0` in package.json
- ✓ `lib/` contains compiled CommonJS and ES modules
- ✓ `scripts/` contains all 7 CLI tools (including 3 diagram tools)
- ✓ No `src/` directory (source code, only compiled versions deployed)
- ✓ No `.vscode/`, `ai/`, `tutorial/` directories
- ✓ No test source files (`.test.ts`, `.spec.ts` — only compiled `.js` versions in `lib/test/`)

### Step 4: Alternative: List using tarball directly

If you want to see what files are in the tarball before installation:

```bash
cd ts/ts-stop

# List all files
tar -tzf vsirotin-ts-stop-*.tgz | sort

# View summary by category
echo "=== Scripts ===" && \
tar -tzf vsirotin-ts-stop-*.tgz | grep "^package/scripts/" && \
echo "" && \
echo "=== Lib (first 20 files) ===" && \
tar -tzf vsirotin-ts-stop-*.tgz | grep "^package/lib/[^/]*\\.js" | head -20 && \
echo "... (and more compiled files)" && \
echo "" && \
echo "=== Total files ===" && \
tar -tzf vsirotin-ts-stop-*.tgz | wc -l
```

### Step 5: Handle licensing and documentation files

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
ls -la ts-example/node_modules/@vsirotin/ts-stop/

# Run one of the CLI tools to verify scripts are accessible
cd ts-example
npx reduce-fa --help
npx json-to-drawio --help
```

If all these steps pass, **the package is production-ready for NPM deployment.** 



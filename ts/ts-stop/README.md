# @vsirotin/ts-stop

State Oriented Programming library for TypeScript

## Installation

### From NPM (when published)
```bash
npm install @vsirotin/ts-stop
```

### Local Installation for Another Project

If you want to use this package in another project without publishing to NPM:

#### Step 1: Build and Pack the Library
```bash
# In the ts-stop directory
cd /path/to/StOP/ts/ts-stop
npm run build
npm pack
```

This creates a file `vsirotin-ts-stop-0.0.1.tgz` in the ts-stop directory.

#### Step 2: Install in Your Project

Choose one of these methods:

**Method 1: Install from Tarball (Recommended)**
```bash
# In your project directory
npm install /Users/viktorsirotin/VSCodeProjects/StOP/ts/ts-stop/vsirotin-ts-stop-0.0.1.tgz
```

**Method 2: Install from Directory**
```bash
# In your project directory
npm install /path/to/StOP/ts/ts-stop
```

**Method 3: Add to package.json**
```json
{
  "dependencies": {
    "@vsirotin/ts-stop": "file:/path/to/StOP/ts/ts-stop"
  }
}
```
Then run `npm install`.

#### Step 3: Update After Changes

When you make changes to the ts-stop library:

```bash
# In the ts-stop directory
npm run build
npm pack

# In your project directory
npm install /path/to/StOP/ts/ts-stop/vsirotin-ts-stop-0.0.1.tgz --force
```

Or if using Method 2 or 3:
```bash
# In your project directory
npm install --force
```

## Usage

```typescript
import { FiniteStateMachine, DefaultState } from '@vsirotin/ts-stop';

// Example: Simple State Machine
const states = [/* your states */];
const signals = [/* your signals */];
const transitions = [/* your transitions */];
const startState = states[0];

const machine = new FiniteStateMachine(
  states,
  signals,
  transitions,
  startState
);

// Process signals
machine.processSignal(someSignal);
```

## Development

### Build
```bash
npm run build          # Build both CommonJS and ESM versions
npm run build:cjs      # Build CommonJS version only
npm run build:esm      # Build ESM version only
```

### Test
```bash
npm test               # Run tests
npm run test:coverage  # Run tests with coverage
```

### Clean
```bash
npm run clean          # Remove build artifacts
```

### Package
```bash
npm run pack           # Build and create tarball for distribution
```

## Package Structure

After building, the package contains:

```
lib/
├── index.js           # CommonJS entry point
├── index.d.ts         # TypeScript declarations
├── index.d.ts.map     # TypeScript declaration source map
├── index.js.map       # JavaScript source map
├── esm/               # ES Modules
│   └── index.js       # ESM entry point
└── [other modules with .js, .d.ts, and .map files]
```

The package includes:
- **CommonJS** modules in `lib/` for Node.js compatibility
- **ESM** (ES Modules) in `lib/esm/` for modern JavaScript
- **TypeScript declarations** (`.d.ts`) for type checking
- **Source maps** for debugging

## Using the Package Locally

To use this package in another project without publishing to NPM:

### Method 1: Direct Installation
```bash
# From your target project directory
npm install /path/to/StOP/ts/ts-stop
```

### Method 2: Using the Packed Tarball
```bash
# In ts-stop directory
npm run pack

# In your target project directory
npm install /path/to/StOP/ts/ts-stop/vsirotin-ts-stop-0.0.1.tgz
```

### Method 3: Using package.json
In your target project's `package.json`:
```json
{
  "dependencies": {
    "@vsirotin/ts-stop": "file:../StOP/ts/ts-stop"
  }
}
```
Then run `npm install`.

## License

MIT

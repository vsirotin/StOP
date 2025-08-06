# TypeScript Example Development

This project demonstrates usage of the [@vsirotin/ts-stop](../ts-stop) TypeScript library using **local package publishing**.

## Quick Start

```bash
# Install dependencies (including local ts-stop package)
npm install

# Update to latest local ts-stop version
npm run update:local

# Build the example
npm run build

# Run the example
npm run start

# Build and run in one step
npm run dev

# Clean build artifacts
npm run clean
```

## Development Strategy

### Local Package Consumption
This example uses the **local published version** of ts-stop:

1. **ts-stop library** publishes to this project's `node_modules/@vsirotin/ts-stop@0.0.1`
2. **Standard imports** work: `import { StopLibrary } from '@vsirotin/ts-stop'`
3. **Real package behavior** - simulates published npm package
4. **Version updates** via `npm run update:local`

## Project Structure
```
ts-example/
├── src/           # TypeScript source
│   └── index.ts   # Main example code
├── dist/          # Build output
│   └── index.js   # Compiled JavaScript
├── node_modules/  # Dependencies
│   └── @vsirotin/
│       └── ts-stop/  # Local published library (v0.0.1)
└── package.json   # Project configuration
```

## Available Scripts
- `npm run build` - Compile TypeScript to JavaScript
- `npm run start` - Run the compiled example
- `npm run dev` - Build and run in one step
- `npm run clean` - Remove build artifacts
- `npm run update:local` - Get latest local ts-stop version

## Dependencies

### Library Dependency
This example uses the **locally published** ts-stop package:
```typescript
import { StopLibrary, createStopInstance, transformState } from '@vsirotin/ts-stop';
```

### Development Flow
1. **ts-stop library** runs `npm run publish:local`
2. **Library installed** to `node_modules/@vsirotin/ts-stop@0.0.1`
3. **Standard imports** work like any npm package
4. **Update library** via `npm run update:local`

## Library Updates

### Getting Latest Version
When ts-stop library changes:
```bash
npm run update:local
```

This script:
- Calls `npm run publish:local` in ts-stop project
- Updates the local `node_modules/@vsirotin/ts-stop` package
- Ensures you have the latest development version

### Manual Update
Alternatively, from ts-stop directory:
```bash
cd ../ts-stop && npm run publish:local
```

## What the Example Demonstrates

### 1. Library Instantiation
```typescript
// Using class constructor
const stopInstance1 = new StopLibrary();

// Using factory function  
const stopInstance2 = createStopInstance("Custom message");
```

### 2. State Processing
```typescript
const initialState = { name: "Demo", version: "1.0.0", active: true };
const processedState = stopInstance2.processState(initialState);
```

### 3. State Transformation
```typescript
const transformedState = transformState(initialState, (state) => ({
    ...state,
    transformed: true,
    language: "TypeScript"
}));
```

## Building

### Requirements
- **TypeScript 5.0+** (installed as devDependency)
- **Node.js 18+** (to run compiled output)
- **@vsirotin/ts-stop@0.0.1** (local published version)

### Build Process
1. **TypeScript compiler** (`tsc`) compiles `src/index.ts`
2. **Output** goes to `dist/index.js` (CommonJS)
3. **Import resolution** finds `@vsirotin/ts-stop` in `node_modules`

## Running

### Prerequisites
The ts-stop library **must be published locally** first:
```bash
cd ../ts-stop && npm run publish:local
```

### Execution
```bash
npm run dev
```

Expected output:
```
=== TypeScript StOP Example ===
Instance 1: Hello from StOP TypeScript Library!
Instance 2: Custom message

=== State Processing Demo ===
Initial state: { name: "Demo", version: "1.0.0", active: true }
Processed state: { name: "Demo", version: "1.0.0", active: true, processed: true }

=== State Transformation Demo ===
Transformed state: {
  name: "Demo",
  version: "1.0.0", 
  active: true,
  transformed: true,
  language: "TypeScript",
  transformedAt: "2025-08-06T12:34:56.789Z"
}

=== TypeScript Example Completed ===
```

## Development Tips

### 1. Library Development Workflow
```bash
# Terminal 1: ts-stop development
cd ../ts-stop
npm run test:watch

# Terminal 2: Publish and test example
npm run publish:local
cd ../ts-example && npm run dev
```

### 2. Library Updates
After changes in ts-stop:
```bash
npm run update:local  # Gets latest ts-stop
npm run dev           # Test with new version
```

### 3. Version Consistency
- **Always uses**: `@vsirotin/ts-stop@0.0.1`
- **Local published**: Not from npm registry
- **Real package behavior**: Simulates production usage

## Used By
- **Global build script**: [`../../build-all.sh`](../../build-all.sh)
- **Global test script**: [`../../test-all.sh`](../../test-all.sh)  
- **CI/CD pipeline**: [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml)

## Related Projects
- **Library**: [`../ts-stop/`](../ts-stop) - The TypeScript StOP library
- **JavaScript Example**: [`../js-example/`](../js-example) - Shows JavaScript interop
- **Kotlin Examples**: [`../../kotlin/`](../../kotlin) - JVM implementations
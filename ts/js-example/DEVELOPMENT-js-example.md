# JavaScript Example Development

This project demonstrates usage of the [@vsirotin/ts-stop](../ts-stop) TypeScript library from **pure JavaScript** using **local package publishing**.

## Quick Start

```bash
# Install dependencies (including local ts-stop package)
npm install

# Update to latest local ts-stop version
npm run update:local

# Run the example
npm run start

# Alternative: dev command (same as start)
npm run dev

# Clean artifacts (no-op for pure JavaScript)
npm run clean
```

## Development Strategy

### Local Package Consumption
This example uses the **locally published version** of ts-stop:

1. **ts-stop library** publishes to this project's `node_modules/@vsirotin/ts-stop@0.0.1`
2. **Standard CommonJS imports** work: `const { StopLibrary } = require('@vsirotin/ts-stop')`
3. **Real package behavior** - simulates published npm package
4. **Version updates** via `npm run update:local`

## Project Structure
```
js-example/
├── src/           # JavaScript source
│   └── index.js   # Main example code (pure JavaScript)
├── node_modules/  # Dependencies
│   └── @vsirotin/
│       └── ts-stop/  # Local published library (v0.0.1)
└── package.json   # Project configuration
```

## Available Scripts
- `npm run start` - Run the JavaScript example
- `npm run dev` - Run the example (alias for start)
- `npm run update:local` - Get latest local ts-stop version
- `npm run clean` - No-op (nothing to clean in pure JavaScript)

## Dependencies

### Library Dependency
This example uses the **locally published** ts-stop package:
```javascript
const { StopLibrary, createStopInstance, transformState } = require('@vsirotin/ts-stop');
```

### Development Flow
1. **ts-stop library** runs `npm run publish:local`
2. **Library installed** to `node_modules/@vsirotin/ts-stop@0.0.1`
3. **Standard CommonJS requires** work like any npm package
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
```javascript
// Using class constructor
const stopInstance1 = new StopLibrary();

// Using factory function  
const stopInstance2 = createStopInstance("Custom message");
```

### 2. State Processing
```javascript
const initialState = { name: "Demo", version: "1.0.0", active: true };
const processedState = stopInstance2.processState(initialState);
```

### 3. State Transformation
```javascript
const transformedState = transformState(initialState, (state) => ({
    ...state,
    transformed: true,
    language: "JavaScript"
}));
```

## Running

### Prerequisites
The ts-stop library **must be published locally** first:
```bash
cd ../ts-stop && npm run publish:local
```

### Execution
```bash
npm run start
```

Expected output:
```
=== JavaScript StOP Example ===
Instance 1: Hello from StOP TypeScript Library!
Instance 2: Hello from JavaScript Example!

=== State Processing Demo ===
Initial state: { name: "JavaScript Demo", version: "1.0.0", active: true }
Processed state: { name: "JavaScript Demo", version: "1.0.0", active: true, processed: true }

=== State Transformation Demo ===
Transformed state: {
  name: "JavaScript Demo",
  version: "1.0.0", 
  active: true,
  transformed: true,
  language: "JavaScript",
  transformedAt: "2025-08-06T12:34:56.789Z"
}

=== JavaScript Example Completed ===
```

## Development Tips

### 1. Library Development Workflow
```bash
# Terminal 1: ts-stop development
cd ../ts-stop
npm run test:watch

# Terminal 2: Publish and test example
npm run publish:local
cd ../js-example && npm run start
```

### 2. Library Updates
After changes in ts-stop:
```bash
npm run update:local  # Gets latest ts-stop
npm run start         # Test with new version
```

### 3. JavaScript vs TypeScript
- **No compilation needed** - Pure JavaScript runs directly
- **Uses CommonJS** - `require()` instead of `import`
- **Same functionality** - All ts-stop features work in JavaScript
- **Type safety** - Available via JSDoc comments (optional)

### 4. Version Consistency
- **Always uses**: `@vsirotin/ts-stop@0.0.1`
- **Local published**: Not from npm registry
- **Real package behavior**: Simulates production usage

## IDE Support

### VS Code IntelliSense
TypeScript definitions from the ts-stop package provide:
- **Auto-completion** for library methods
- **Parameter hints** and documentation
- **Type checking** (if using `// @ts-check`)

### Optional Type Checking
Add to the top of `src/index.js` for basic type checking:
```javascript
// @ts-check
```

## No Build Process

This is **pure JavaScript** - no compilation, transpilation, or build steps needed:
- ✅ **Direct execution** with Node.js
- ✅ **No TypeScript compiler** required
- ✅ **No build artifacts** to clean
- ✅ **Immediate feedback** - just run and test

## Used By
- **Global build script**: [`../../build-all.sh`](../../build-all.sh)
- **Global test script**: [`../../test-all.sh`](../../test-all.sh)  
- **CI/CD pipeline**: [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml)

## Related Projects
- **Library**: [`../ts-stop/`](../ts-stop) - The TypeScript StOP library
- **Kotlin Examples**: [`../../kotlin/`](../../kotlin) - JVM implementations

## Advantages of JavaScript Example

1. **✅ Simplicity**: No build process, runs directly
2. **✅ Compatibility**: Shows library works in pure JavaScript
3. **✅ Performance**: No compilation overhead during development
4. **✅ Accessibility**: Demonstrates usage for JavaScript-only projects
5. **✅ Real-world**: Many projects still use plain JavaScript
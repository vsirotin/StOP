# TypeScript StOP Library Development

## Quick Start

```bash
# Install dependencies
npm install

# Build the library (CommonJS + ESM)
npm run build

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Publish to local node_modules for examples
npm run publish:local

# Clean build artifacts
npm run clean
```

## Development Strategy

### Local Package Development Workflow
This library uses a **local publishing strategy** to simulate real npm package usage:

1. **Build the library** → Creates `dist/` with CommonJS + ESM
2. **Publish locally** → Installs to examples' `node_modules` as `@vsirotin/ts-stop@0.0.1`
3. **Examples import** → Use standard package imports: `import { StopLibrary } from '@vsirotin/ts-stop'`
4. **Iterate** → Make changes, rebuild, republish locally

### Available Scripts
- `npm run build` - Build both CommonJS and ESM
- `npm run build:cjs` - Build CommonJS only
- `npm run build:esm` - Build ES modules only
- `npm test` - Run Jest tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate coverage report
- `npm run publish:local` - Publish to examples' node_modules
- `npm run clean` - Remove build artifacts

### Local Publishing Process

#### 1. Publish Library to Examples
```bash
npm run publish:local
```

This script:
- Builds the library if needed
- Copies the package to `../js-example/node_modules/@vsirotin/ts-stop/`
- Updates version to `0.0.1` in target locations

#### 2. Examples Use Published Version
Examples can then import normally:
```typescript
import { StopLibrary, createStopInstance } from '@vsirotin/ts-stop';
```

#### 3. Update and Republish
After making changes:
```bash
# Make your changes to src/
npm run build
npm run publish:local
# Examples now use updated version
```

## Project Structure
```
ts-stop/
├── src/           # TypeScript source
├── test/          # Jest tests
├── dist/          # Build output (CommonJS)
├── dist/esm/      # Build output (ES modules)
├── coverage/      # Test coverage reports
└── package.json   # Package configuration (version 0.0.1)
```

## Development Workflow

### 1. Make Changes
Edit files in `src/`

### 2. Test Changes
```bash
npm test
```

### 3. Build and Publish Locally
```bash
npm run publish:local
```

### 4. Test Examples
```bash
cd ../js-example && npm start
```

### 5. Iterate
Repeat steps 1-4 until satisfied

## Version Management
- **Current version**: `0.0.1` (development)
- **Future versions**: Will be published to npm registry
- **Local development**: Always uses version `0.0.1`

## Testing
- **Framework**: Jest with ts-jest
- **Coverage**: HTML reports in `coverage/`
- **Watch mode**: `npm run test:watch`
- **Examples testing**: Run examples after `publish:local`

## Build Output
- **CommonJS**: `dist/index.js` (for Node.js, JavaScript examples)
- **ES Modules**: `dist/esm/index.js` (for modern bundlers)
- **Type Definitions**: `dist/index.d.ts`

## Used By Examples
- **js-example**: Imports from `node_modules/@vsirotin/ts-stop`
- **Published via**: `npm run publish:local` script
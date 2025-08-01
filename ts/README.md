# TypeScript StOP Projects

This directory contains TypeScript-based projects for State Oriented Programming (StOP).

## Structure

- `packages/ts-stop/` - The main TypeScript library (@vsirotin/ts-stop)
- `packages/ts-example/` - TypeScript example using the library
- `packages/js-example/` - JavaScript example using the library

## Building

### Build All Projects
```bash
npm run build
```

### Build Individual Projects
```bash
npm run build:lib        # Build the library only
npm run build:ts-example # Build TypeScript example
npm run build:js-example # Build JavaScript example
```

### Running Examples
```bash
# TypeScript example
cd packages/ts-example
npm run dev

# JavaScript example
cd packages/js-example
npm start
```

## Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the library first:
   ```bash
   npm run build:lib
   ```

3. Build and run examples:
   ```bash
   npm run build:ts-example
   npm run build:js-example
   ```

## Package Information

- **@vsirotin/ts-stop**: Core TypeScript library for State Oriented Programming
- **@vsirotin/ts-example**: TypeScript demonstration of library usage
- **@vsirotin/js-example**: JavaScript demonstration of library usage

All packages are part of a monorepo managed with npm workspaces.

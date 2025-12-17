# @vsirotin/ts-stop

State Oriented Programming library for TypeScript.

DEvelopment in progress.

## Installation

### From NPM 
```bash
npm install @vsirotin/ts-stop
```



## Usage

See documentation on https://github.com/vsirotin/StOP/blob/4d8c2d42601e35453c08a74a7eda75ddc1725e4e/README.md


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


## License

MIT

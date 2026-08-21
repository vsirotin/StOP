[![npm](https://img.shields.io/npm/v/@vsirotin/ts-stop?sort=semver&logo=npm)](https://www.npmjs.com/package/@vsirotin/ts-stop)
[![npm type definitions](https://img.shields.io/npm/types/@vsirotin/ts-stop?logo=typescript)](https://www.npmjs.com/package/@vsirotin/ts-stop)
[![npm](https://img.shields.io/npm/dt/@vsirotin/ts-stop?logo=npm)](http://npm-stat.com/charts.html?package=@vsirotin/ts-stop)
[![npm](https://img.shields.io/npm/dw/@vsirotin/ts-stop?logo=npm)](http://npm-stat.com/charts.html?package=@vsirotin/ts-stop)


![badge-nodejs](https://img.shields.io/badge/platform-jsNode-F8DB5D.svg?style=flat)
![badge-browser](https://img.shields.io/badge/platform-jsBrowser-F8DB5D.svg?style=flat)

# StOP - State Oriented Programming

State Oriented Programming (StOP) is a programming paradigm that focuses on explicit state management and transformation.

The TypeScript/JavaScript implementation of StOP is split into **4 sub-projects** under `ts/`:

## Project structure

- **`ts/ts-stop-lib/`** — the cross-platform core library, published as **`@vsirotin/ts-stop`**.
  Contains the pure `Sfsm` engine and FA utilities with no Node.js or DOM dependencies.
  Builds for Node.js (CJS) and Browser (ESM).
- **`ts/ts-stop-sdk/`** — the Software Development Kit, published as **`@vsirotin/ts-stop-sdk`**.
  Depends on `@vsirotin/ts-stop`. Contains CLI tools, tutorials, AI-agent skills, and Node-only helpers (`loadFAFromFile`).
- **`ts/ts-stop-test-node/`** — a minimal Node.js integration project that validates the actual SDK version before deployment.
- **`ts/ts-stop-test-angular/`** — a simple Angular application that verifies the actual library version loads and works in a browser framework.

## Development

See development rules for each sub-project in file  DEVELOPMENT.md in project sub-directory.

## License

Projects have different licensing options. See details in LICENSE*.md files in each sub-project directory.


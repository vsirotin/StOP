[![npm](https://img.shields.io/npm/v/@vsirotin/ts-stop-sdk?sort=semver&logo=npm)](https://www.npmjs.com/package/@vsirotin/ts-stop-sdk)

![badge-nodejs](https://img.shields.io/badge/platform-jsNode-F8DB5D.svg?style=flat)

# StOP SDK — `@vsirotin/ts-stop-sdk`

The **Software Development Kit** for **State Oriented Programming (StOP)** — a programming paradigm that focuses on explicit state management and transformation.

This package contains the developer-facing content of the StOP SDK, and depends on the cross-platform core library [`@vsirotin/ts-stop`](https://www.npmjs.com/package/@vsirotin/ts-stop).

## What's included

- **Tutorial** (`tutorial/`) — 5 chapters
- **AI-agent skills** (`ai/skills/`) — 3 skills
- **CLI tools** (Node.js, `scripts/`)
  - reduce-fa, merge-fas, merge-fas-from-dir, update-fa, run-fa, validate-fa,
    extract-fa-from-draft, validate-whole-sfsm, extract-sfsm, validate-ext-sfsm,
    gen-commands, json-to-drawio, drawio-to-json, compare-compact-jsons
- **Node-only library helpers** — `loadFAFromFile` (uses `fs`)
- **Tests** — CLI and Node integration tests

## Install

```bash
npm install @vsirotin/ts-stop-sdk
```

This installs the SDK together with its dependency `@vsirotin/ts-stop`.

## Development

See [DEVELOPMENT.md](./DEVELOPMENT.md) for build, test, and publishing instructions.

## License

**[Apache 2.0](./LICENSE-PUBLIC.md)** 
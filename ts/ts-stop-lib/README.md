[![npm](https://img.shields.io/npm/v/@vsirotin/ts-stop?sort=semver&logo=npm)](https://www.npmjs.com/package/@vsirotin/ts-stop)
[![npm type definitions](https://img.shields.io/npm/types/@vsirotin/ts-stop?logo=typescript)](https://www.npmjs.com/package/@vsirotin/ts-stop)
[![npm](https://img.shields.io/npm/dt/@vsirotin/ts-stop?logo=npm)](http://npm-stat.com/charts.html?package=@vsirotin/ts-stop)
[![npm](https://img.shields.io/npm/dw/@vsirotin/ts-stop?logo=npm)](http://npm-stat.com/charts.html?package=@vsirotin/ts-stop)

![badge-nodejs](https://img.shields.io/badge/platform-jsNode-F8DB5D.svg?style=flat)
![badge-browser](https://img.shields.io/badge/platform-jsBrowser-F8DB5D.svg?style=flat)

# StOP Library — `@vsirotin/ts-stop`

The cross-platform TypeScript/JavaScript core library of **State Oriented Programming (StOP)**.

State Oriented Programming (StOP) is a programming paradigm that focuses on explicit state management and transformation.

This package contains the pure, platform-independent library for building **Stacked Finite State Machines (SFSM)**. It has **no Node.js or DOM dependencies**, so it can be used in:

- **Node.js** (CommonJS via `require`)
- **Browsers** (ES modules via `import`)
- Any bundler (Webpack, Vite, Rollup, esbuild)

## What's included

- `Sfsm` — the stacked finite state machine engine
- FA utilities: `reduceFA`, `mergeFAs`, `updateCompactFA`, `updateFullFA`, `FaResolver`
- Runner utilities: `FaRunner`, `CommandInterpreter`, `FaValidator`
- Component bases: `TransceiverBase`, `SignalSenderBase`, `SignalReceiverBase`, `CommandReceiverBase`, `TransceiverHub`, `wireSfsm`
- All core types: `FaDefinition`, `FaNode`, `Transition`, `SfsmOptions`, `LogEntry`, etc.

> **Note:** Node-only helpers such as `loadFAFromFile` (uses `fs`) are provided by the separate SDK package `@vsirotin/ts-stop-sdk`.

## Install

```bash
npm install @vsirotin/ts-stop
```

## Quick start

```typescript
import { Sfsm } from '@vsirotin/ts-stop';

const turnstile = {
    Turnstile: [
        ['I', 'start', 'locked'],
        ['locked', 'coin', 'unlocked'],
        ['unlocked', 'push', 'locked']
    ]
};

const sfsm = new Sfsm(turnstile);
sfsm.receiveSignal('start');
console.log(sfsm.getHeadState()); // 'locked'
```

## Development

See [DEVELOPMENT.md](./DEVELOPMENT.md) for build and test instructions.

## License

This project is dual-licensed:

- **[Apache 2.0](./LICENSE-PUBLIC.md)** — Free for open-source, academic, and small commercial use
- **[Commercial License](./LICENSE-COMMERCIAL.md)** — For organizations with 10+ employees or projects with $10,000+ annual revenue

**Quick Summary:**
- ✅ Free for individuals and small teams (< 10 employees)
- ✅ Free for non-commercial and low-revenue projects (< $10K/year)
- 📧 Commercial licensing available — contact the author (don't worry, the commercial terms are reasonable :-)
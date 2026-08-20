# ts-stop-test-angular — Development

A minimal Angular application used as a smoke-test for the StOP cross-platform
library `@vsirotin/ts-stop`.

## Purpose

The library `@vsirotin/ts-stop` is a pure, framework-agnostic TypeScript library
that also ships an ES-module build (`lib/esm/`). This Angular app proves that the
published/bundled library can be consumed from a modern browser framework
without issues and that its actual version can be read at runtime.

## Prerequisites

- Node.js and npm
- Angular CLI (or run via `npx @angular/cli`)

## Build the library first

```bash
cd ts/ts-stop-lib
npm install
npm run build    # produces lib/ (CJS) and lib/esm/ (ESM)
```

## Install and run this app

```bash
cd ts/ts-stop-test-angular
npm install      # links ../ts-stop-lib via "file:" dependency
npm run build    # success → the library loaded and bundled without errors
```

## What success means

- `npm run build` completes without bundler/import errors
- The served page shows the library version exported by the library (`VERSION`)
- The `Sfsm` engine can be driven from a constructible FA definition

## Release notes

See [release-notes.md](./release-notes.md).
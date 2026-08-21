# ts-stop-test-angular — Development

A minimal Angular application used as a smoke-test for the StOP cross-platform
library `@vsirotin/ts-stop`.

## 1.Purpose

The library `@vsirotin/ts-stop` is a pure, framework-agnostic TypeScript library
that also ships an ES-module build (`lib/esm/`). This Angular app proves that the
published/bundled library can be consumed from a modern browser framework
without issues and that its actual version can be read at runtime.

## 2. Prerequisites

- Node.js and npm
- Angular CLI (or run via `npx @angular/cli`)

## 3. Build the library first

```bash
cd ts/ts-stop-lib
npm install
npm run build    # produces lib/ (CJS) and lib/esm/ (ESM)
```

## 4. Local integration testing

To test with the local (not already published) version of `ts-stop-lib` (without publishing):

1. Clear node_modules/@vsirotin/ts-stop manual or with script (from project directory):

```bash
bash dev-scripts/clear-ts-stop-lib.sh
```
2. Install local version of @vsirotin/ts-stop  with script (from project directory):

```bash
bash ts/ts-stop-sdk/dev-scripts/install-ts-stop-lib.sh
```
3. Start the Angular app (from project directory):

```bash
npm start
```
You schould see the Angular app running in your browser at `http://localhost:4200/` and the actual version of the library displayed on the page.
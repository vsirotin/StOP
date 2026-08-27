# ts-stop-test-angular

A simple **Angular application** (newest Angular version) whose goal is to verify
that the actual installed version of the StOP cross-platform library
`@vsirotin/ts-stop` (built in `ts/ts-stop-lib`) can be loaded without problems
from `npm`, and to display its version.

## What it verifies

- `import { Sfsm } from '@vsirotin/ts-stop'` resolves in the browser (bundled by Angular)
- The engine can be instantiated and driven (`new Sfsm(...)`, `receiveSignal('start')`)
- The library's actual version (`VERSION`) is read and displayed

## Project layout

```
app/main.ts     Angular bootstrap entry
app/app.ts      App component that imports the library and reports its version
index.html      Browser entry page
package.json    Project manifest (depends on @vsirotin/ts-stop)
.ng-workspace.json
```

## Local workflow

```bash
cd ts/ts-stop-test-angular

# Install dependencies (links the local library via "file:" protocol)
npm install

# Build the app
npm run build

# Serve (Angular CLI dev server)
ng serve
```

The library is resolved as a `file:` dependency during development so that the
latest local build is tested:

```json
"dependencies": {
  "@vsirotin/ts-stop": "^3.14.0"
}
```

Before running, build the library so it has a `lib/` output:

```bash
cd ts/ts-stop-lib
npm run build
```

## Development

See [DEVELOPMENT.md](./DEVELOPMENT.md).
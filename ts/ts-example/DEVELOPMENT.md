# Angular Example Development

## Project description

This sub-project is a minimal **Angular 17** browser application that demonstrates
practical usage of the [@vsirotin/ts-stop](../ts-stop) library in a browser context.

It shows two independent demos that run automatically on startup:

| Demo | Module used | Scenario |
|------|-------------|----------|
| FA Demo | `@vsirotin/ts-stop` (`fa`) | Simple coin turnstile via `FiniteStateMachine` |
| SFSM Demo | `@vsirotin/ts-stop/sfsm` | Banknote turnstile via `Sfsm` + compact FA |

## Developer workflow

### Local-testing workflow (develop library → test in browser with local build)

The goal of this workflow is to verify that the locally-built library integrates
correctly in a real browser application before publishing it to the npm registry.

**Step 1 — Remove node_modules** *(clean slate)*

```bash
rm -rf node_modules
```

**Step 2 — Install Angular dependencies from the registry**

```bash
npm install
```

**Step 3 — Overwrite `@vsirotin/ts-stop` with the locally-built version**

Builds `../ts-stop` and copies the output into `node_modules/@vsirotin/ts-stop/`,
simulating what `npm install @vsirotin/ts-stop` would do with a published package:

```bash
npm run publish:local
```

**Step 4 — Run Jest smoke tests**

Verifies that the application initialises without errors:

```bash
npm test
```

**Step 5 — Start the development server**

```bash
npm start
```

**Step 6 — Open the app in the browser**

Navigate to <http://localhost:4200>.  
Both demo panels appear immediately — no user interaction required.

After changing the library source, repeat steps 3 and 5 (the dev server
hot-reloads automatically once `node_modules` is updated).

> **Shortcut:** Run all steps 1–4 in one command:
> ```bash
> npm run test:local
> ```

---

### Global-publishing workflow (validate against the published npm package)

The goal of this workflow is to verify the app works with the officially
published version of `@vsirotin/ts-stop`.

**Step 1 — Publish the library to npm**

Make sure you are logged in to the npm registry first:

```bash
npm login
```

Then publish from the `ts-stop` directory:

```bash
cd ../ts-stop && npm publish
```

**Step 2 — Remove local node_modules**

```bash
cd ../ts-example && rm -rf node_modules
```

**Step 3 — Install from the npm registry**

```bash
npm install
```

**Step 4 — Run Jest smoke tests**

```bash
npm test
```

**Step 5 — Build the production bundle**

```bash
npm run build
```

The production build is written to `dist/ts-example/`.

**Step 6 — Serve the production build and run manual tests**

```bash
npx http-server dist/ts-example -p 4200
```

**Step 7 — Open the production build in the browser**

Navigate to <http://localhost:4200> and verify both demo panels render correctly.

---

## Unit testing

The application has a Jest-based smoke test suite that verifies the component
starts without errors and produces the expected output.

```bash
npm test
```

Tests are located in `src/app/app.component.spec.ts`.  
They instantiate `AppComponent` directly (no Angular TestBed needed) and assert:

- The component can be created without throwing.
- The FA demo produces the correct state sequence after startup.
- The SFSM demo log is non-empty and contains the required fields.
- The turnstile device is locked after the passage signal.

---

## Project structure

```
ts-example/
  angular.json            Angular workspace configuration
  jest.config.js          Jest configuration
  package.json            Dependencies (Angular 17 + @vsirotin/ts-stop)
  setup-jest.ts           jest-preset-angular initialisation
  tsconfig.json           TypeScript base config (Angular-compatible)
  tsconfig.app.json       TypeScript config for the application build
  tsconfig.spec.json      TypeScript config for Jest tests
  scripts/
    publish-local.sh      Builds ts-stop and copies it into node_modules
    test-with-local-lib.sh  Runs all local-testing steps (steps 1–4) in sequence
  src/
    index.html            HTML shell
    main.ts               Bootstrap (bootstrapApplication)
    styles.css            Global styles
    app/
      app.component.ts    Standalone AppComponent — all demo logic inline
      app.component.spec.ts  Jest smoke tests
```

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

### Local-publishing workflow (develop library → test in browser)

Use this workflow while actively developing the `ts-stop` library.

**Step 1 — Publish the library locally**

Builds `ts-stop` and copies the output into `ts-example/node_modules/`:

```bash
cd ../ts-stop && npm run publish:local
```

**Step 2 — Install Angular dependencies** *(first time only, or after `node_modules` was deleted)*

```bash
cd ../ts-example && npm install
```

**Step 3 — Start the development server**

```bash
npm start
```

**Step 4 — Open the app in the browser**

Navigate to <http://localhost:4200>.  
Both demo panels appear immediately — no user interaction required.

After changing the library source, repeat steps 1 and 3 (the dev server
hot-reloads automatically once `node_modules` is updated).

---

### Global-publishing workflow (validate against the public npm package)

Use this workflow to verify the app works with the officially published version.

**Step 5 — Publish the library to npm**

```bash
cd ../ts-stop && npm publish
```

**Step 6 — Delete the local node_modules**

```bash
cd ../ts-example && rm -rf node_modules
```

**Step 7 — Install from npm registry**

```bash
npm install
```

**Step 8 — Build the production bundle**

```bash
npm run build
```

The production build is written to `dist/ts-example/`.

**Step 9 — Serve the production build and run user tests**

```bash
npx http-server dist/ts-example -p 4200
```

**Step 10 — Open the production build in the browser**

Navigate to <http://localhost:4200> and verify both demo panels render correctly.

## Project structure

```
ts-example/
  angular.json          Angular workspace configuration
  package.json          Dependencies (Angular 17 + @vsirotin/ts-stop)
  tsconfig.json         TypeScript base config (Angular-compatible)
  tsconfig.app.json     TypeScript config for the application build
  src/
    index.html          HTML shell
    main.ts             Bootstrap (bootstrapApplication)
    styles.css          Global styles
    app/
      app.component.ts  Standalone AppComponent — all demo logic inline
```


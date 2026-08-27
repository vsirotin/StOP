# ts-stop-test-node

A minimal **Node.js integration test project** that validates the actual published
version of the StOP SDK package `@vsirotin/ts-stop-sdk` (which depends on the
cross-platform core library `@vsirotin/ts-stop`).

Its goal is to verify that a freshly built/deployed SDK can be loaded without
problems from Node.js, and that it carries its expected content.

## How to use

```bash
cd ts/ts-stop-test-node

# Install dependencies (links the local SDK via "file:" protocol)
npm install

# Run the import / deployment validation tests
npm test
```

The test verifies:
- `@vsirotin/ts-stop-sdk` resolves and re-exports the core library (`Sfsm`, `FaRunner`)
- Node-only helpers are present (`loadFAFromFile`)
- CLI tools ship in `scripts/`
- `tutorial/` directory ships
- `ai/skills/` directory ships
- the package version is readable from `package.json`

If `npm test` passes, the SDK package is ready for real application integration.

## Development

See [DEVELOPMENT.md](./DEVELOPMENT.md).
# ts-stop-test-node — Development

A minimal Node.js integration test project for the StOP SDK.

## Purpose

`ts-stop-test-node` consumes the `@vsirotin/ts-stop-sdk` package (which pulls in the
`@vsirotin/ts-stop` library) and verifies it can be loaded from Node.js without
problems. It acts as a deployment smoke-test before the SDK is published to NPM.

## Local workflow

The SDK must be built and locally linked first:

```bash
# 1. Build + pack the SDK (and its lib dependency)
bash scripts/publish-local.sh

# 2. Link the local SDK into this project (via file: dependency)
cd ts/ts-stop-test-node
npm install
```

Then run the import test:

```bash
cd ts/ts-stop-test-node
npm test
```

Expected output (all checks green):

```
✅ SDK exports Sfsm (re-exported from @vsirotin/ts-stop)
✅ SDK exports loadFAFromFile (Node-only helper)
✅ SDK exports FaRunner
✅ SDK package found (version 3.14.0)
✅ All CLI tools present in SDK scripts/
✅ SDK tutorial directory present
✅ SDK ai/skills directory present
```

## Checked dependencies

| Package               | Role                                    |
|-----------------------|-----------------------------------------|
| `@vsirotin/ts-stop-sdk`| The SDK under test                       |
| `@vsirotin/ts-stop`    | The core library (SDK dependency)        |

## Release notes

See [release-notes.md](./release-notes.md).
# ts-stop-test-node — Development

A minimal Node.js integration test project for the StOP SDK.

## 1. Purpose

`ts-stop-test-node` consumes the `@vsirotin/ts-stop-sdk` package (which pulls in the
`@vsirotin/ts-stop` library) and verifies it can be loaded from Node.js without
problems. It acts as a deployment smoke-test before the SDK is published to NPM.

## 2. Local integration testing

Please note: VS Code Explorer may not immediately reflect changes made by the scripts. Therefore, if you are using VS Code, please check removing and creation new subdirectories in the `node_modules` folder with the file system explorer (or terminal).

To test with the local (not already published) versions of `ts-stop-lib` and `ts-stop-sdk` (without publishing):

1. Clear node_modules/@vsirotin/ts-stop and node_modules/@vsirotin/ts-stop-sdk manual or with script (from project directory):

```bash
cd ts/ts-stop-test-node
bash dev-scripts/clear-ts-stop-lib-and-sdk.sh
```
2. Install local version of @vsirotin/ts-stop  and @vsirotin/ts-stop-sdk with script (from project directory):

```bash
bash dev-scripts/install-ts-stop-lib-and-sdk.sh
```
3. Process unit test 

```bash
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



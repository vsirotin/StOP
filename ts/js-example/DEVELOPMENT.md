# JavaScript Example Development

## Project description

This sub-project demonstrates practical usage of the [@vsirotin/ts-stop](../ts-stop) TypeScript library from **pure JavaScript**. It showcases how the TypeScript library can be consumed by JavaScript code through local package publishing, simulating real npm package consumption patterns.

The example demonstrates:
- Library instantiation from JavaScript
- State processing capabilities
- State transformation workflows
- Integration with the locally published ts-stop package

## How to build

```bash
# Install dependencies (including local ts-stop package)
npm install
```

**Prerequisites:** The ts-stop library must be published locally first:
```bash
cd ../ts-stop && npm run publish:local
```

After publishing ts-stop, this project can be built and run:
```bash
npm run start
```

## Unit testing

This is a JavaScript example project with no unit tests. The demonstration of library functionality is contained in `src/index.js` which executes when running `npm run start`.

To run the example:
```bash
npm run start
```

Expected output shows:
- Instance creation from the StOP library
- State processing demonstration
- State transformation examples

## Automatic local integration testing

Integration testing is performed by running the example itself:

```bash
npm run start
```

This executes the main example code which demonstrates:

1. **Library Instantiation**
   ```javascript
   const stopInstance = createStopInstance("Custom message");
   ```

2. **State Processing**
   ```javascript
   const initialState = { name: "Demo", version: "1.0.0", active: true };
   const processedState = stopInstance.processState(initialState);
   ```

3. **State Transformation**
   ```javascript
   const transformedState = transformState(initialState, (state) => ({
       ...state,
       transformed: true,
       language: "JavaScript"
   }));
   ```

**Alternative dev commands:**
- `npm run dev` - Same as `npm run start`
- `npm run clean` - Clean build artifacts (no-op for pure JavaScript)

## Project Structure

```
js-example/
├── src/           # JavaScript source
│   └── index.js   # Main example code (pure JavaScript)
├── node_modules/  # Dependencies
│   └── @vsirotin/
│       └── ts-stop/  # Local published library
└── package.json   # Project configuration
```

## Local Package Consumption Strategy

This example uses the **locally published version** of ts-stop:
- ts-stop library publishes to `node_modules/@vsirotin/ts-stop`
- Standard CommonJS imports: `const { StopLibrary } = require('@vsirotin/ts-stop')`
- Simulates real npm package behavior
- Version updates via `npm run publish:local` in ts-stop
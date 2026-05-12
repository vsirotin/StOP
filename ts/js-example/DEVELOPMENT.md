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

# TypeScript StOP Library Development

## Project description

This is the core TypeScript implementation of the StOP (State-Oriented Programming) library. It provides a robust framework for building finite state machines, centered on:
- **Stacked Finite State Machine (SFSM)** — a stack-based engine for hierarchical, multi-component FA processing

The library is consumed by test examples in `test/sfsm/`, and by the `ts-example` sub-project.

## How to build

```bash
cd ts/ts-stop
npm run build
```

This builds both CommonJS and ES modules to the `lib/` directory.

## Unit testing

# Run tests
```bash
cd ts/ts-stop
npm test
```

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
```bash
cd ts/ts-stop
npm run test:coverage
```


## SFSM utilities

### Convert an extended FA file to compact format

```bash
# Build first (required)
npm run build

# Reduce an extended FA JSON to compact format
npm run reduce-fa -- <path/to/extended-fa.json>

```

e.g.
```bash
npm run reduce-fa -- test/sfsm/test-data/turnstile-fa.json
``` 

Output is written to `<basename>-compact.json` in the same directory as the input file.

**Example:**

```bash
npm run reduce-fa -- test/sfsm/test-data/turnstile-fa.json
# Reduced FA written to: test/sfsm/test-data/turnstile-fa-compact.json
```

### Merge multiple FA files into one compact output

```bash
# Build first (required)
npm run build

# Reduce each input (if needed) and merge all FAs to one compact file
npm run merge-fas -- --result=<path/to/result.json> <file1[,file2,...]> [file3 ...]
```

**Note on `--` syntax:** The first `--` tells npm to pass all following arguments directly to the script. This is standard npm convention, not a duplication.

Rules:
- If an input is already compact, it is used unchanged.
- If duplicate FA keys exist across files, the last file wins and a warning is printed.

**Example:**

```bash
npm run merge-fas -- --result=test/sfsm/test-data/merge-fas/result.json \
  test/sfsm/test-data/merge-fas/input/part1.json,test/sfsm/test-data/merge-fas/input/part2.json \
  test/sfsm/test-data/merge-fas/input/part3.json
```

### Merge all FA files from a directory (recursive)

```bash
# Build first (required)
npm run build

# Recursively find and merge all .json FA files from a directory
npm run merge-fas-from-dir -- --input-dir=<path/to/dir> --result=<path/to/result.json>
```

This script recursively scans the input directory for all `.json` files, sorts them alphabetically, and merges them into a single compact output file.

**Example:**

```bash
npm run merge-fas-from-dir -- --input-dir=test/sfsm/test-data/merge-fas/input --result=test/sfsm/test-data/merge-fas/merged-result.json
```

Rules:
- All `.json` files in the input directory and subdirectories are discovered and sorted alphabetically.
- If an input is already compact, it is used unchanged.
- If duplicate FA keys exist across files, the last file (by alphabetical order) wins and a warning is printed.

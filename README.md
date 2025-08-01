# StOP - State Oriented Programming

[![CI](https://github.com/vsirotin/StOP/actions/workflows/ci.yml/badge.svg)](https://github.com/vsirotin/StOP/actions/workflows/ci.yml)

Explanation, basic implementation with some programming languages and examples of the concept of State Oriented Programming (StOP).

🚧 **Under Construction** 🚧

## Quick Start

### Build All Projects
```bash
./build-all.sh
```

### Test All Projects
```bash
./test-all.sh
```

### Run Examples
```bash
# TypeScript Examples
cd ts/packages/ts-example && npm run dev
cd ts/packages/js-example && npm start

# Kotlin/Java Examples  
cd kotlin && ./gradlew runExamples
```

## Project Structure

- **`ts/`** - TypeScript workspace with library and examples
- **`kotlin/`** - Kotlin workspace with library and examples  
- **`docs/`** - Documentation and architecture guides
- **`.github/`** - GitHub Actions CI/CD workflows

## Libraries

- **TypeScript**: `@vsirotin/ts-stop` - NPM package
- **Kotlin**: `com.vsirotin.kotlin-stop` - Maven/Gradle artifact

## Documentation

See [docs/README.md](docs/README.md) for detailed documentation and [docs/architecture.md](docs/architecture.md) for architecture overview.

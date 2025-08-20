# StOP - State Oriented Programming


State Oriented Programming (StOP) is a programming paradigm that focuses on explicit state management and transformation. This repository provides implementations and examples in multiple programming languages.

<div align="center">
  <img src="docs/images/StateRole.png" alt="StOP" width="30%"/>
</div>


<div align="center">
  <span style="color: red; font-weight: bold; font-size: 18px;">⚠️ Attention! The project is currently under construction in an intensive development phase! ⚠️</span>
</div>

## Project Overview

This repository contains StOP implementations in multiple languages with working examples:

### Libraries
- **TypeScript**: [`@vsirotin/ts-stop`](ts/ts-stop) - Modern JavaScript/TypeScript implementation
- **Kotlin**: [`com.vsirotin.kotlin-stop`](kotlin/kotlin-stop) - JVM implementation with Java interop

### Examples  
- **JavaScript Example**: [`ts/js-example`](ts/js-example) - Shows JavaScript interop  
- **Kotlin Example**: [`kotlin/kotlin-example`](kotlin/kotlin-example) - Kotlin native usage
- **Java Example**: [`kotlin/java-example`](kotlin/java-example) - Java interop from Kotlin library

## Quick Start

### Build All Projects
```bash
./build-all.sh
```

### Test All Projects (Unit Tests + Examples)
```bash
./test-all.sh
```

### Generate Documentation Diagrams  
```bash
./generate-plantuml.sh
```

## Project Structure

```
StOP/
├── ts/                    # TypeScript workspace
│   ├── ts-stop/          # TypeScript library
│   └── js-example/       # JavaScript example
├── kotlin/               # Kotlin workspace
│   ├── kotlin-stop/      # Kotlin library
│   ├── kotlin-example/   # Kotlin example
│   └── java-example/     # Java example
├── docs/                 # Documentation and diagrams
└── .github/              # CI/CD workflows
```

## Development

For detailed development instructions, see [`DEVELOPMENT.md`](DEVELOPMENT.md).

Each sub-project can be developed independently - see individual project documentation:
- **TypeScript Library**: [`ts/ts-stop/DEVELOPMENT-ts-stop.md`](ts/ts-stop/DEVELOPMENT-ts-stop.md)
- **Kotlin Library**: [`kotlin/kotlin-stop/DEVELOPMENT-kotlin-stop.md`](kotlin/kotlin-stop/DEVELOPMENT-kotlin-stop.md)

## Documentation

- **Architecture**: [`docs/`](docs/) - Diagrams and technical documentation
- **Development Guide**: [`DEVELOPMENT.md`](DEVELOPMENT.md) - Global development setup
- **Sub-project Guides**: Each library/example has its own `DEVELOPMENT-*.md`

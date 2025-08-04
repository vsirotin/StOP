# StOP Documentation

Welcome to the State Oriented Programming (StOP) documentation.

## Overview

State Oriented Programming (StOP) is a programming paradigm that focuses on explicit state management and transformation. This repository provides implementations and examples in multiple programming languages.

## Documentation Structure

- **`README.md`** - This overview document
- **`architecture.md`** - Detailed architecture documentation
- **`diagram-example.md`** - Example of using diagrams in documentation
- **`DRAWIO_SETUP.md`** - Instructions for setting up and using draw.io
- **`diagrams/`** - Draw.io source files (*.drawio)
- **`images/`** - Exported diagram images (*.png)

## Current Status

🚧 **Under Construction** 🚧

This project is currently in active development. The basic "Hello World" implementations are complete, but the full StOP functionality is still being developed.

## Implementations

### TypeScript Implementation
- **Library**: `@vsirotin/ts-stop`
- **Location**: `ts/packages/ts-stop/`
- **Examples**: TypeScript and JavaScript examples available
- **Build System**: NPM with workspaces

### Kotlin Implementation  
- **Library**: `com.vsirotin.kotlin-stop`
- **Location**: `kotlin/kotlin-stop/`
- **Examples**: Kotlin and Java examples available
- **Build System**: Gradle with Kotlin DSL

## Getting Started

### Prerequisites
- Node.js 18+ and NPM 9+ (for TypeScript projects)
- Java 22+ (for Kotlin/Java projects)
- Gradle 8.10+ (for Kotlin/Java projects)

### Quick Build
```bash
# Build everything
./build-all.sh

# Or build individually:
# TypeScript projects
cd ts && npm install && npm run build

# Kotlin projects  
cd kotlin && ./gradlew buildAll
```

### Running Examples

#### TypeScript Examples
```bash
cd ts/packages/ts-example
npm run dev

cd ts/packages/js-example  
npm start
```

#### Kotlin/Java Examples
```bash
cd kotlin

# Kotlin example
./gradlew :kotlin-example:run

# Java example
./gradlew :java-example:run

# All examples
./gradlew runExamples
```

## Project Structure

```
StOP/
├── ts/                    # TypeScript workspace
│   ├── packages/
│   │   ├── ts-stop/      # TypeScript library
│   │   ├── ts-example/   # TypeScript example
│   │   └── js-example/   # JavaScript example
│   └── package.json      # Workspace configuration
├── kotlin/               # Kotlin workspace  
│   ├── kotlin-stop/      # Kotlin library
│   ├── kotlin-example/   # Kotlin example
│   ├── java-example/     # Java example
│   └── build.gradle.kts  # Workspace configuration
├── docs/                 # Documentation
├── build-all.sh         # Common build script
└── README.md            # Project overview
```

## Development Roadmap

- [x] Basic project structure
- [x] "Hello World" implementations
- [x] Build system configuration
- [x] Example applications
- [ ] Core StOP functionality
- [ ] Advanced state transformations
- [ ] Performance optimizations
- [ ] Comprehensive documentation
- [ ] Unit tests
- [ ] Integration tests

## Contributing

This project is in early development. Contributions and feedback are welcome!

## License

MIT License - see LICENSE file for details.

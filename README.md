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

### Generate Documentation Diagrams
```bash
./generate-plantuml.sh
```

### Run Examples
```bash
# TypeScript Examples
cd ts/ts-example && npm run dev
cd ts/js-example && npm start

# Kotlin/Java Examples  
cd kotlin && ./gradlew runExamples
```

## Project Structure

```
StOP/
├── ts/                    # TypeScript workspace
│   ├── ts-stop/          # TypeScript library
│   ├── ts-example/       # TypeScript example
│   └── js-example/       # JavaScript example
├── kotlin/               # Kotlin workspace  
│   ├── kotlin-stop/      # Kotlin library
│   ├── kotlin-example/   # Kotlin example
│   └── java-example/     # Java example
├── docs/                 # Documentation
│   ├── diagrams/         # Draw.io source files
│   ├── plantuml/         # PlantUML source files
│   └── images/           # Generated images
└── .github/              # CI/CD workflows
```

## Libraries

- **TypeScript**: `@vsirotin/ts-stop` - Located in `ts/ts-stop/`
- **Kotlin**: `com.vsirotin.kotlin-stop` - Located in `kotlin/kotlin-stop/`

## Documentation

### Architecture Diagrams
The project uses multiple diagramming tools:

- **[Draw.io](https://draw.io)** - For architecture and flow diagrams
- **[PlantUML](https://plantuml.com)** - For UML diagrams (state machines, sequence diagrams)

### Viewing Diagrams
- **Source files**: `docs/diagrams/` (draw.io) and `docs/plantuml/` (PlantUML)
- **Generated images**: `docs/images/`
- **Documentation**: See `docs/diagram-example.md`

### Creating Diagrams
1. **Draw.io**: Create `.drawio` files in `docs/diagrams/`, export to `docs/images/`
2. **PlantUML**: Create `.puml` files in `docs/plantuml/`, run `./generate-plantuml.sh`

For detailed setup instructions:
- **Draw.io setup**: `docs/DRAWIO_SETUP.md`
- **PlantUML setup**: `docs/PLANTUML_SETUP.md`

## Development

### Prerequisites
- **Node.js 18+** and **NPM 9+** (for TypeScript projects)
- **Java 22+** (for Kotlin/Java projects)
- **Gradle 8.10+** (installed via wrapper)
- **PlantUML** (optional, for diagram generation)

### Build System
- **TypeScript**: NPM workspaces with dual builds (ESM + CommonJS)
- **Kotlin**: Gradle multi-project with Kotlin DSL
- **Documentation**: Automated diagram generation in CI/CD

### CI/CD
GitHub Actions automatically:
- Builds all projects on every push
- Runs all examples to verify functionality  
- Generates PlantUML diagrams
- Verifies build artifacts and documentation structure

### Getting Started
1. **Clone the repository**
2. **Install dependencies**: `./build-all.sh`
3. **Generate diagrams**: `./generate-plantuml.sh`
4. **Run tests**: `./test-all.sh`
5. **View documentation**: `docs/diagram-example.md`

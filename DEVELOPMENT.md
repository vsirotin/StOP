# StOP Development Guide

This guide covers global development setup and cross-project concerns.

## Prerequisites

### Required Tools
- **Node.js 18+** and **NPM 9+** (for TypeScript projects)
- **Java 21+** (for Kotlin/Java projects)  
- **Gradle 8.10+** (via wrapper - `./gradlew`)

### Optional Tools
- **PlantUML** (for diagram generation)
- **VS Code** with extensions:
  - TypeScript and JavaScript Language Features
  - Extension Pack for Java
  - PlantUML extension

## Global Build Scripts

### `./build-all.sh`
Builds all libraries and examples in dependency order:
1. TypeScript library (`ts/ts-stop`)
2. TypeScript example (`ts/ts-example`) 
3. JavaScript example (no build needed)
4. Kotlin library (`kotlin/kotlin-stop`)
5. Kotlin example (`kotlin/kotlin-example`)
6. Java example (`kotlin/java-example`)

### `./test-all.sh`  
Runs all unit tests and example verification:
1. **Unit Tests**: Library test suites
2. **Example Tests**: Runs examples to verify functionality

### `./generate-plantuml.sh`
Generates documentation diagrams from PlantUML sources.

## Individual Project Development

Each sub-project is self-contained and can be developed independently:

### TypeScript Projects
- **Library**: [`ts/ts-stop/DEVELOPMENT-ts-stop.md`](ts/ts-stop/DEVELOPMENT-ts-stop.md)
- **Examples**: See respective directories

### Kotlin/Java Projects  
- **Library**: [`kotlin/kotlin-stop/DEVELOPMENT-kotlin-stop.md`](kotlin/kotlin-stop/DEVELOPMENT-kotlin-stop.md)
- **Examples**: See respective directories

## CI/CD

GitHub Actions automatically:
- Builds all projects on every push
- Runs unit tests and example verification
- Generates documentation diagrams
- Validates cross-project dependencies

See [`.github/workflows/ci.yml`](.github/workflows/ci.yml) for details.

## Project Dependencies

```
ts-stop (TypeScript library)
├── ts-example (depends on ts-stop source)
└── js-example (depends on ts-stop build)

kotlin-stop (Kotlin library)  
├── kotlin-example (depends on kotlin-stop)
└── java-example (depends on kotlin-stop)
```

## Common Development Tasks

### Adding a New Language Implementation
1. Create workspace directory: `<language>/`
2. Create library: `<language>/<language>-stop/`
3. Create example: `<language>/<language>-example/`
4. Add to `build-all.sh` and `test-all.sh`
5. Update CI workflow
6. Create `DEVELOPMENT-<language>-stop.md`

### Modifying Build Process
1. Update individual project scripts first
2. Update global scripts (`build-all.sh`, `test-all.sh`)
3. Update CI workflow
4. Test locally before pushing
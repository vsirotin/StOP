# Kotlin StOP Projects

This directory contains Kotlin-based projects for State Oriented Programming (StOP).

## Structure

- `kotlin-stop/` - The main Kotlin library (com.vsirotin.kotlin-stop)
- `kotlin-example/` - Kotlin example using the library
- `java-example/` - Java example using the Kotlin library

## Building

### Build All Projects
```bash
./gradlew buildAll
```

### Build Individual Projects
```bash
./gradlew :kotlin-stop:build        # Build the library only
./gradlew :kotlin-example:build     # Build Kotlin example
./gradlew :java-example:build       # Build Java example
```

### Running Examples
```bash
# Kotlin example
./gradlew :kotlin-example:run

# Java example  
./gradlew :java-example:run

# Run all examples
./gradlew runExamples
```

### Clean All Projects
```bash
./gradlew cleanAll
```

## Development

1. Build the library first:
   ```bash
   ./gradlew :kotlin-stop:build
   ```

2. Run examples:
   ```bash
   ./gradlew :kotlin-example:run
   ./gradlew :java-example:run
   ```

3. Publish library locally (for testing):
   ```bash
   ./gradlew :kotlin-stop:publishToMavenLocal
   ```

## Library Information

- **Group ID**: com.vsirotin
- **Artifact ID**: kotlin-stop
- **Version**: 1.0.0
- **Java Compatibility**: Java 11+
- **Kotlin Compatibility**: Kotlin 1.9.20+

## Features

The Kotlin StOP library provides:

- Basic state processing capabilities
- Type-safe state transformations
- Extension functions for enhanced usability
- StateContainer for structured state management
- Interoperability with Java

All projects use Gradle with Kotlin DSL for build configuration.

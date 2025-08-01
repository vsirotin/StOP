# GitHub Actions CI/CD

This directory contains GitHub Actions workflows for automated building and testing.

## Available Workflows

### `ci.yml` - Continuous Integration
Automatically runs on every push to `main` and `develop` branches, and on pull requests to `main`.

**What it does:**
1. **TypeScript Build & Test**: Builds all TypeScript packages and runs examples
2. **Kotlin/Java Build & Test**: Builds all Kotlin projects and runs examples  
3. **Integration Test**: Runs the complete build script and verifies artifacts

**Requirements:**
- Node.js 18+
- Java 22+
- Ubuntu latest runner

## Local Testing

Before pushing, you can test the same commands locally:

```bash
# Test the complete build
./build-all.sh

# Test all examples
./test-all.sh

# Test individual components
cd ts && npm ci && npm run build
cd kotlin && ./gradlew buildAll
```

## Status Badges

Add these to your main README.md:

```markdown
[![CI](https://github.com/vsirotin/StOP/actions/workflows/ci.yml/badge.svg)](https://github.com/vsirotin/StOP/actions/workflows/ci.yml)
```

## Troubleshooting

- **Java version issues**: Make sure all Gradle configs use Java 22
- **Node.js cache issues**: The workflow uses npm ci for reliable installs
- **Gradle cache**: Gradle packages are cached for faster builds
- **Timeouts**: Examples have 30-second timeouts to prevent hanging

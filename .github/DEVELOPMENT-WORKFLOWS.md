# GitHub Actions & CI/CD

This directory contains GitHub Actions workflows and CI/CD configuration for the StOP project.

## Continuous Integration (ci.yml)

The `ci.yml` workflow provides automated testing and validation for the StOP project across multiple languages and platforms.

### Purpose

- **Automated Testing**: Runs unit tests for TypeScript and Kotlin libraries
- **Cross-Platform Validation**: Tests on Ubuntu, macOS, and Windows
- **Multi-Language Support**: Validates both TypeScript/JavaScript and Kotlin/Java implementations
- **Quality Assurance**: Ensures code changes don't break existing functionality

### Triggers

The CI workflow runs on:
- **Push** to `main` branch
- **Pull Requests** targeting `main` branch
- **Manual trigger** via GitHub Actions interface

### What It Does

1. **Environment Setup**
   - Configures Node.js for TypeScript projects
   - Sets up JDK for Kotlin/Java projects
   - Installs dependencies for all sub-projects

2. **Build Process**
   - Compiles TypeScript libraries
   - Builds Kotlin libraries
   - Validates all example projects

3. **Testing**
   - Runs Jest tests for TypeScript implementation
   - Executes JUnit tests for Kotlin implementation
   - Validates example projects functionality

4. **Validation**
   - Checks code formatting
   - Validates project structure
   - Ensures cross-language compatibility

### Usage

The CI runs automatically - no manual intervention required. View results in the **Actions** tab of the GitHub repository.

---

*Additional GitHub configuration and documentation will be added to this directory as the project evolves.*
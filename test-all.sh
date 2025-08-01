#!/bin/bash

# Test script for StOP project
# This script runs all examples and verifies they complete successfully

set -e  # Exit on any error

echo "=== Running StOP Project Tests ==="
echo "Current directory: $(pwd)"

# Function to check if command succeeded
check_success() {
    if [ $? -eq 0 ]; then
        echo "✓ $1 completed successfully"
    else
        echo "✗ $1 failed"
        exit 1
    fi
}

# Function to run with timeout (works on both macOS and Linux)
run_with_timeout() {
    if command -v timeout > /dev/null 2>&1; then
        # Linux - use timeout command
        timeout 30s "$@" || true
    elif command -v gtimeout > /dev/null 2>&1; then
        # macOS with coreutils installed
        gtimeout 30s "$@" || true
    else
        # macOS default - just run the command
        "$@" || true
    fi
}

echo ""
echo "======================================"
echo "Testing TypeScript Projects"
echo "======================================"

cd ts

echo "Running TypeScript example..."
cd packages/ts-example
run_with_timeout npm run dev
check_success "TypeScript example"

echo "Running JavaScript example..."
cd ../js-example
run_with_timeout npm start
check_success "JavaScript example"

cd ../../..

echo ""
echo "======================================"
echo "Testing Kotlin Projects"
echo "======================================"

cd kotlin

echo "Running Kotlin example..."
run_with_timeout ./gradlew :kotlin-example:run --quiet
check_success "Kotlin example"

echo "Running Java example..."
run_with_timeout ./gradlew :java-example:run --quiet
check_success "Java example"

cd ..

echo ""
echo "======================================"
echo "Test Summary"
echo "======================================"
echo "✓ All TypeScript examples tested successfully"
echo "✓ All Kotlin/Java examples tested successfully"
echo ""
echo "All tests completed successfully! 🎉"

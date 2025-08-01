#!/bin/bash

# StOP - State Oriented Programming
# Common build script for all projects

echo "=== Building StOP Projects ==="
echo "Current directory: $(pwd)"

# Check if we're in the correct directory
if [ ! -f "README.md" ] || [ ! -d "ts" ] || [ ! -d "kotlin" ]; then
    echo "Error: Please run this script from the StOP project root directory"
    exit 1
fi

# Function to print section headers
print_section() {
    echo ""
    echo "======================================"
    echo "$1"
    echo "======================================"
}

# Function to check command result
check_result() {
    if [ $? -eq 0 ]; then
        echo "✓ $1 completed successfully"
    else
        echo "✗ $1 failed"
        exit 1
    fi
}

# Build TypeScript projects
print_section "Building TypeScript Projects"
cd ts

echo "Installing TypeScript dependencies..."
npm install
check_result "npm install"

echo "Building TypeScript library..."
npm run build:lib
check_result "TypeScript library build"

echo "Building TypeScript example..."
npm run build:ts-example
check_result "TypeScript example build"

echo "Building JavaScript example..."
npm run build:js-example
check_result "JavaScript example build"

cd ..

# Build Kotlin projects
print_section "Building Kotlin Projects"
cd kotlin

echo "Building Kotlin library..."
./gradlew :kotlin-stop:build
check_result "Kotlin library build"

echo "Building Kotlin example..."
./gradlew :kotlin-example:build
check_result "Kotlin example build"

echo "Building Java example..."
./gradlew :java-example:build
check_result "Java example build"

cd ..

print_section "Build Summary"
echo "✓ All TypeScript projects built successfully"
echo "✓ All Kotlin projects built successfully"
echo "✓ All Java projects built successfully"
echo ""
echo "To run examples:"
echo "  TypeScript: cd ts/packages/ts-example && npm run dev"
echo "  JavaScript: cd ts/packages/js-example && npm start"
echo "  Kotlin:     cd kotlin && ./gradlew :kotlin-example:run"
echo "  Java:       cd kotlin && ./gradlew :java-example:run"
echo ""
echo "Build completed successfully! 🎉"

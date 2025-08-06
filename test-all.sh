#!/bin/bash
set -e

echo "🧪 Testing all StOP projects..."

# TypeScript Library Unit Tests
echo "🧪 Running TypeScript library tests..."
cd ts/ts-stop && npm test
cd ../..

# TypeScript Example
echo "🧪 Running TypeScript example..."
cd ts/ts-example && npm run start
cd ../..

# JavaScript Example  
echo "🧪 Running JavaScript example..."
cd ts/js-example && npm run start
cd ../..

# Kotlin/Java Tests
echo "🧪 Running Kotlin tests..."
cd kotlin && ./gradlew test
cd ..

# Kotlin/Java Examples
echo "🧪 Running Kotlin example..."  
cd kotlin && ./gradlew :kotlin-example:run
cd ..

echo "🧪 Running Java example..."
cd kotlin && ./gradlew :java-example:run  
cd ..

echo "✅ All tests and examples completed successfully!"

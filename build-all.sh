#!/bin/bash
set -e

echo "🚀 Building all StOP projects..."

# TypeScript Library
echo "📦 Building TypeScript library..."
cd ts/ts-stop && npm install && npm run build
cd ../..

# TypeScript Example  
echo "📦 Building TypeScript example..."
cd ts/ts-example && npm install && npm run build
cd ../..

# JavaScript example needs no build
echo "✅ JavaScript example needs no build (pure JS)"

# Kotlin/Java Projects
echo "📦 Building Kotlin projects..."
cd kotlin && ./gradlew build
cd ..

echo "✅ All projects built successfully!"

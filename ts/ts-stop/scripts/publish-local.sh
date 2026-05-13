#!/bin/bash
set -e

echo "📦 Publishing ts-stop locally..."

# Build
npm run build

# Copy to ts-stop node_modules so the test suite can import @vsirotin/ts-stop
echo "📋 Installing to ts-stop node_modules..."
rm -rf node_modules/@vsirotin/ts-stop
mkdir -p node_modules/@vsirotin/ts-stop
cp -r lib package.json README.md LICENSE node_modules/@vsirotin/ts-stop/

echo "✅ Local publishing completed!"

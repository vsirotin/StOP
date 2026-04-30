#!/bin/bash
set -e

echo "📦 Publishing ts-stop locally..."

# Build if needed
npm run build

# Copy to js-example  
echo "📋 Installing to js-example..."
rm -rf ../js-example/node_modules/@vsirotin/ts-stop
mkdir -p ../js-example/node_modules/@vsirotin/ts-stop
cp -r lib package.json ../js-example/node_modules/@vsirotin/ts-stop/

# Copy to ts-stop node_modules for tests
echo "📋 Installing to ts-stop node_modules..."
rm -rf node_modules/@vsirotin/ts-stop
mkdir -p node_modules/@vsirotin/ts-stop
cp -r lib package.json node_modules/@vsirotin/ts-stop/

echo "✅ Local publishing completed!"
echo "📦 Installed @vsirotin/ts-stop@0.0.1 to examples"
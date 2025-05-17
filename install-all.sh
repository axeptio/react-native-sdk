#!/bin/bash

echo "📦 Installing dependencies in root..."
yarn install || { echo "❌ yarn install failed in root"; exit 1; }

echo "📦 Installing dependencies in example/"
cd example || { echo "❌ example/ directory not found"; exit 1; }
yarn install || { echo "❌ yarn install failed in example/"; exit 1; }

echo "✅ All dependencies installed successfully."

#!/usr/bin/env bash

set -euo pipefail

EXAMPLE_DIR="example"
ENV_FLAG_FILE=".env.setup"

# Ensure the example directory exists
if [[ ! -d "$EXAMPLE_DIR" ]]; then
  echo "❌ Directory '$EXAMPLE_DIR' not found. Are you in the right project root?"
  exit 1
fi

# Check if already setup
if [[ -f "$EXAMPLE_DIR/$ENV_FLAG_FILE" ]]; then
  echo "✅ Environment already set up. Skipping..."
  exit 0
fi

echo "🔍 Checking environment for example app..."

# Check for required tools
command -v yarn >/dev/null || { echo "❌ Yarn not found"; exit 1; }
command -v node >/dev/null || { echo "❌ Node.js not found"; exit 1; }

# Check for Android/iOS folders
[[ -d "$EXAMPLE_DIR/android" ]] || { echo "❌ Missing android/ in $EXAMPLE_DIR"; exit 1; }
[[ -d "$EXAMPLE_DIR/ios" ]] || { echo "❌ Missing ios/ in $EXAMPLE_DIR"; exit 1; }

# Move into example directory
cd "$EXAMPLE_DIR"

# Install dependencies if needed
if [[ ! -d node_modules ]]; then
  echo "📦 Installing Yarn dependencies..."
  yarn install
else
  echo "📦 Dependencies already installed."
fi

# Run pod install (macOS only)
if [[ "$(uname)" == "Darwin" && -f ios/Podfile ]]; then
  echo "📱 Running pod install with npx..."
  npx pod-install
fi

# Ensure env setup marker is written
touch "$ENV_FLAG_FILE"
echo "✅ Setup complete."

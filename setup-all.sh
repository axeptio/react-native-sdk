#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
EXAMPLE_DIR="$ROOT_DIR/example"
ENV_FLAG_FILE="$EXAMPLE_DIR/.env.setup"
XCODE_ENV_FILE="$EXAMPLE_DIR/ios/.xcode.env"

echo "🔍 Checking environment for the full workspace..."

# Check for required tools
command -v yarn >/dev/null || { echo "❌ Yarn not found"; exit 1; }
command -v node >/dev/null || { echo "❌ Node.js not found"; exit 1; }

# --- Install dependencies in root ---
echo "📦 Installing dependencies in root..."
cd "$ROOT_DIR"
yarn install || { echo "❌ yarn install failed in root"; exit 1; }

# --- Install dependencies in example ---
if [[ ! -d "$EXAMPLE_DIR" ]]; then
  echo "❌ Directory '$EXAMPLE_DIR' not found. Are you in the right project root?"
  exit 1
fi
cd "$EXAMPLE_DIR"
yarn install || { echo "❌ yarn install failed in example/"; exit 1; }
cd "$ROOT_DIR"

# --- Force assembleRelease for react-native-google-mobile-ads ---
EXAMPLE_ANDROID_DIR="$EXAMPLE_DIR/android"
if [ -f "$EXAMPLE_ANDROID_DIR/gradlew" ]; then
  echo "🛠️  Building :react-native-google-mobile-ads:assembleRelease..."
  cd "$EXAMPLE_ANDROID_DIR"
  ./gradlew :react-native-google-mobile-ads:assembleRelease || {
    echo "❌ Gradle build failed for :react-native-google-mobile-ads:assembleRelease"
    exit 1
  }
  cd "$ROOT_DIR"
else
  echo "❌ gradlew not found in $EXAMPLE_ANDROID_DIR"
  exit 1
fi

# --- Install Pods in root/ios if exists ---
if [ -d "ios" ]; then
  echo "🍏 Installing CocoaPods in ios/"
  cd ios
  if [ -f "Podfile" ]; then
    pod install --repo-update || { echo "❌ pod install failed in ios/"; exit 1; }
  else
    echo "ℹ️  No Podfile found in ios/, skipping pod install."
  fi
  cd "$ROOT_DIR"
else
  echo "ℹ️  No root ios/ directory found, skipping pod install in ios/"
fi

# --- Install Pods in example/ios if exists ---
if [ -d "$EXAMPLE_DIR/ios" ]; then
  echo "🍏 Installing CocoaPods in example/ios/"
  cd "$EXAMPLE_DIR/ios"
  if [ -f "Podfile" ]; then
    pod install --repo-update || { echo "❌ pod install failed in example/ios/"; exit 1; }
  else
    echo "ℹ️  No Podfile found in example/ios/, skipping pod install."
  fi
  cd "$ROOT_DIR"
else
  echo "ℹ️  No example/ios/ directory found, skipping pod install in example/ios/"
fi

# --- Xcode .xcode.env setup (macOS only, for example app) ---
if [[ "$(uname)" == "Darwin" && -d "$EXAMPLE_DIR/ios" ]]; then
  if [ ! -f "$XCODE_ENV_FILE" ]; then
    echo "🛠️ Setting up .xcode.env with node path for Xcode integration..."
    echo "export NODE_BINARY=$(command -v node)" > "$XCODE_ENV_FILE"
    echo "✅ .xcode.env created at $XCODE_ENV_FILE"
  else
    echo "✅ .xcode.env already exists at $XCODE_ENV_FILE"
  fi
fi

# --- Env setup marker for example app ---
if [ ! -f "$ENV_FLAG_FILE" ]; then
  touch "$ENV_FLAG_FILE"
  echo "✅ Environment marker written to $ENV_FLAG_FILE"
else
  echo "✅ Environment already marked as set up: $ENV_FLAG_FILE"
fi

echo "🎉 All JS and native dependencies for root and example are installed and set up!"

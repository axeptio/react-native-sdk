#!/bin/bash

set -e

echo "📦 Installing dependencies in root..."
yarn install || { echo "❌ yarn install failed in root"; exit 1; }

echo "📦 Installing dependencies in example/"
cd example || { echo "❌ example/ directory not found"; exit 1; }
yarn install || { echo "❌ yarn install failed in example/"; exit 1; }
cd ..

if [ -f /usr/bin/xcodebuild ]; then

  # Install Pods in root/ios if exists
  if [ -d "ios" ]; then
    echo "🍏 Installing CocoaPods in ios/"
    cd ios
    pod install --repo-update || { echo "❌ pod install failed in ios/"; exit 1; }
    cd ..
  else
    echo "ℹ️  No root ios/ directory found, skipping pod install in ios/"
  fi

  # Install Pods in example/ios if exists
  if [ -d "example/ios" ]; then
    echo "🍏 Installing CocoaPods in example/ios/"
    cd example/ios
    pod install --repo-update || { echo "❌ pod install failed in example/ios/"; exit 1; }
    cd ../..
  else
    echo "ℹ️  No example/ios/ directory found, skipping pod install in example/ios/"
  fi
  
  echo "✅ All JavaScript and iOS native dependencies installed successfully."
fi

echo "✅ All JavaScript dependencies installed successfully, no iOS."

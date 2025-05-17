#!/bin/bash

echo "🧹 Cleaning React Native workspace..."

# 1. Kill Metro packagers
echo "⛔️ Killing any running Metro bundlers or packagers..."
pkill -f "react-native/cli.js" 2>/dev/null
pkill -f "node.*metro" 2>/dev/null

# 2. Remove node_modules, lock files, caches
echo "🗑 Removing node_modules, lock files, and yarn cache..."
rm -rf node_modules example/node_modules ios/Pods .expo .expo-shared .turbo
rm -f yarn.lock package-lock.json example/yarn.lock example/package-lock.json
yarn cache clean --all
npm cache clean --force

# 3. Watchman and Metro cache clear
echo "🧼 Clearing Metro & Watchman caches..."
watchman watch-del-all 2>/dev/null
rm -rf /tmp/metro-* /tmp/haste-map-* example/tmp/metro-* example/tmp/haste-map-*

# 4. Android clean (only if gradlew exists)
if [ -d "android" ] && [ -f "android/gradlew" ]; then
  echo "🧽 Cleaning Android build..."
  cd android
  ./gradlew clean
  cd ..
fi

if [ -d "example/android" ] && [ -f "example/android/gradlew" ]; then
  if [ -d "example/node_modules/@react-native/gradle-plugin" ]; then
    echo "🧽 Cleaning Android build (example)..."
    cd example/android
    ./gradlew clean
    cd ../..
  else
    echo "⚠️ Skipping Gradle clean in example/android: plugins missing (expected after deleting node_modules)"
  fi
fi

# 5. iOS clean (only if Xcode project exists)
if [ -d "ios" ] && (ls ios/*.xcodeproj 1> /dev/null 2>&1 || ls ios/*.xcworkspace 1> /dev/null 2>&1); then
  echo "🧽 Cleaning iOS build..."
  cd ios
  xcodebuild clean
  rm -rf ~/Library/Developer/Xcode/DerivedData/*
  cd ..
fi

if [ -d "example/ios" ] && (ls example/ios/*.xcodeproj 1> /dev/null 2>&1 || ls example/ios/*.xcworkspace 1> /dev/null 2>&1); then
  echo "🧽 Cleaning iOS build (example)..."
  cd example/ios
  xcodebuild clean
  rm -rf ~/Library/Developer/Xcode/DerivedData/*
  rm -rf build
  cd ../..
fi

echo "✅ Done! Now run:"
echo "   yarn install && cd example && yarn install"
echo "Then: npx react-native start"

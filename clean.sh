#!/bin/bash

echo "🧹 Cleaning React Native workspace..."

# 1. Kill Metro packagers
echo "⛔️ Killing any running Metro bundlers or packagers..."
pkill -f "react-native/cli.js" 2>/dev/null
pkill -f "node.*metro" 2>/dev/null

# 2. Remove node_modules, lock files, caches
echo "🗑 Removing node_modules, lock files, and yarn/npm cache..."
rm -rf node_modules example/node_modules ios/Pods .expo .expo-shared .turbo
rm -f yarn.lock package-lock.json example/yarn.lock example/package-lock.json
yarn cache clean --all
npm cache clean --force

# 3. Watchman, Metro, and Babel cache clear
echo "🧼 Clearing Metro, Babel, & Watchman caches..."
watchman watch-del-all 2>/dev/null
rm -rf $TMPDIR/metro-* $TMPDIR/haste-map-* /tmp/metro-* /tmp/haste-map-* example/tmp/metro-* example/tmp/haste-map-*
rm -rf .babel.* example/.babel.*
rm -rf .expo example/.expo

# 4. Android clean (only if gradlew exists)
if [ -d "android" ] && [ -f "android/gradlew" ]; then
  echo "🧽 Cleaning Android build..."
  cd android
  ./gradlew clean
  rm -rf .gradle build
  cd ..
fi

if [ -d "example/android" ] && [ -f "example/android/gradlew" ]; then
  if [ -d "example/node_modules/@react-native/gradle-plugin" ]; then
    echo "🧽 Cleaning Android build (example)..."
    cd example/android
    ./gradlew clean
    rm -rf .gradle build
    # Remove AARs and APKs/libs
    rm -rf app/libs/*
    rm -rf app/build/outputs
    cd ../..
  else
    echo "⚠️ Skipping Gradle clean in example/android: plugins missing (expected after deleting node_modules)"
  fi
fi

# 4b. Uninstall app from all connected Android devices
APP_PACKAGE="com.axeptiosdkexample"
if command -v adb >/dev/null 2>&1; then
  echo "📱 Uninstalling $APP_PACKAGE from all Android devices/emulators..."
  adb devices | awk 'NR>1 && $1 {print $1}' | xargs -I{} adb -s {} uninstall $APP_PACKAGE || true
else
  echo "⚠️ adb not found, skipping Android uninstall."
fi

# 5. iOS clean
function ios_clean() {
  local dir="$1"
  if [ -d "$dir" ]; then
    echo "🧽 Cleaning iOS build in $dir..."
    cd "$dir"
    # Clean Pods, build, and cache
    rm -rf Pods Podfile.lock build
    pod cache clean --all 2>/dev/null
    xcodebuild clean 2>/dev/null
    cd - >/dev/null
  fi
}

# Clean main ios directory
ios_clean "ios"
# Clean example ios directory
ios_clean "example/ios"

# Remove Xcode derived data and other cache
echo "🧼 Removing Xcode DerivedData, xcuserdata, and other iOS caches..."
rm -rf ~/Library/Developer/Xcode/DerivedData/*
rm -rf ~/Library/Caches/CocoaPods/*
rm -rf ~/Library/Developer/Xcode/Archives/*
rm -rf ~/Library/Developer/Xcode/iOS\ DeviceSupport/*
rm -rf ~/Library/Developer/XCPGDevices/*
find . -name 'xcuserdata' -type d -prune -exec rm -rf {} +

# Optionally clean Swift Package caches (uncomment if needed)
# rm -rf ~/Library/Caches/org.swift.swiftpm
# rm -rf ~/Library/Developer/Xcode/DerivedData/SourcePackages

echo "✅ Done! Now run:"
echo "   yarn install && cd example && yarn install"
echo "Then: npx react-native start --reset-cache"

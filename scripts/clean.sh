#!/bin/bash

echo "🧹 Cleaning React Native workspace..."

# 1. Kill Metro packagers
echo "⛔️ Killing any running Metro bundlers or packagers..."
pkill -f "react-native/cli.js" 2>/dev/null
pkill -f "node.*metro" 2>/dev/null

# 2. Remove node_modules, lock files, caches
echo "🗑 Removing node_modules, lock files, and yarn/npm cache..."
rm -rf node_modules example-expo/node_modules ios/Pods .expo .expo-shared
rm -f yarn.lock
yarn cache clean --all
npm cache clean --force

# 3. Watchman, Metro, and Babel cache clear
echo "🧼 Clearing Metro, Babel, & Watchman caches..."
watchman watch-del-all 2>/dev/null
TMP_CACHE_DIR="${TMPDIR:-/tmp}"
rm -rf "${TMP_CACHE_DIR%/}"/metro-* "${TMP_CACHE_DIR%/}"/haste-map-* /tmp/metro-* /tmp/haste-map-*
rm -rf .babel.*
rm -rf .expo example-expo/.expo

# 4. Android clean (only if gradlew exists)
if [ -d "android" ] && [ -f "android/gradlew" ]; then
  echo "🧽 Cleaning Android build..."
  cd android
  ./gradlew clean
  rm -rf .gradle build
  cd ..
fi


# 4b. Uninstall app from all connected Android devices
APP_PACKAGE="com.axeptio.example"
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
ios_clean "example-expo/ios"

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
echo "   yarn install && cd example-expo && npm install"
echo "Then: cd example-expo && npx expo start --clear"

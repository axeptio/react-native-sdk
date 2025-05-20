#!/usr/bin/env bash
set -e

echo "=== Diagnose RNGoogleMobileAds TurboModule ==="

EXAMPLE_DIR="example"
PKG="react-native-google-mobile-ads"
JS_MODULE="RNGoogleMobileAdsModule"
APP_ID="com.axeptiosdkexample"

cd "$(dirname "$0")"

echo
echo "🔍 1. Checking if $PKG is installed in example/node_modules ..."
if [ -d "$EXAMPLE_DIR/node_modules/$PKG" ]; then
  echo "✅ $PKG is present in $EXAMPLE_DIR/node_modules"
else
  echo "❌ $PKG is NOT present in $EXAMPLE_DIR/node_modules"
  echo "➡️  Run: cd $EXAMPLE_DIR && yarn add $PKG"
  exit 1
fi

echo
echo "🔍 2. Checking versions (should be only one):"
yarn why $PKG || true

echo
echo "🔍 3. Looking for build artifacts (Android AAR)..."
AAR_PATH="$EXAMPLE_DIR/node_modules/$PKG/android/build/outputs/aar"
if ls $AAR_PATH/*.aar 2>/dev/null; then
  echo "✅ Found AAR file(s) in $AAR_PATH"
else
  echo "❌ No AAR files found in $AAR_PATH (try building with ./gradlew :$PKG:assembleRelease)"
fi

echo
echo "🔍 4. Checking if $PKG appears in android/settings.gradle or android/build.gradle ..."
grep -r "$PKG" $EXAMPLE_DIR/android/app/build.gradle $EXAMPLE_DIR/android/settings.gradle.kts || echo "⚠️  $PKG not explicitly mentioned (autolinking may be used)."

echo
echo "🔍 5. Checking Metro configuration for customizations that may interfere..."
if grep "extraNodeModules" $EXAMPLE_DIR/metro.config.js; then
  echo "⚠️  WARNING: custom extraNodeModules present. This can cause resolution issues."
fi
if grep "blockList" $EXAMPLE_DIR/metro.config.js; then
  echo "⚠️  WARNING: custom blockList present. This can cause resolution issues."
fi

echo
echo "🔍 6. Running clean & rebuild recommendations..."
echo "➡️  Run these if you haven't already:"
echo "   ./clean.sh"
echo "   yarn install && cd $EXAMPLE_DIR && yarn install"
echo "   npx react-native start --reset-cache"
echo "   cd android && ./gradlew clean && cd .."
echo "   yarn android"
echo
echo "If you still see the error:"
echo " - Confirm $PKG is present in your app's build.gradle dependencies."
echo " - Make sure the Android project is not using cached builds (always 'clean')."
echo " - Try removing custom metro.config.js temporarily."
echo " - If in a monorepo, ensure you don't have conflicting versions of $PKG."
echo " - Make sure your Java package is not excluded via ProGuard or build config."
echo
echo "For iOS:"
echo "   cd $EXAMPLE_DIR/ios && pod install && cd .."
echo "   npx react-native run-ios"
echo

echo "🧑‍🔬  If all looks good above, but you still get the error, try:"
echo "   - Confirm your app binary was actually rebuilt (sometimes the JS reloads but the native code doesn't update until a full clean build)."
echo "   - Double-check your imports (no typos or path issues)."
echo "   - Check for warnings/errors during build that mention the module."
echo
echo "✨ Done!"

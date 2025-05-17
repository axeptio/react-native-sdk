#!/bin/bash

set -e

# Move to the android directory and clean build artifacts
cd android
./gradlew clean

# Go back to example root
cd ..

# Uninstall the app from the emulator/device
adb uninstall com.axeptiosdkexample || echo "App was not installed"

# Reinstall & rebuild the app
yarn android

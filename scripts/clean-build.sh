#!/bin/bash

set -e

# Enter example
cd example

# Move to the android directory and clean build artifacts
(cd android && ./gradlew clean)

# Uninstall the app from the emulator/device
adb uninstall com.axeptiosdkexample || echo "App was not installed"

# Reinstall & rebuild the app
yarn android

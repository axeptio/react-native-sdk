#!/bin/bash

# Package name of your app
PACKAGE="com.axeptiosdkexample"

echo "Uninstalling $PACKAGE ..."
adb uninstall $PACKAGE

if [ $? -eq 0 ]; then
  echo "✅ Uninstalled $PACKAGE successfully."
else
  echo "⚠️ Uninstall failed or $PACKAGE not found on the device."
fi

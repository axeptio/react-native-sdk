#!/usr/bin/env bash

set -e

echo "=== Sanity Check Script for React Native Android Environment ==="

# Node.js
echo -n "Node version: " && node -v || echo "Node.js not found!"

# npm
echo -n "npm version: " && npm -v || echo "npm not found!"

# Yarn (optional)
if command -v yarn >/dev/null 2>&1; then
  echo -n "Yarn version: " && yarn -v
else
  echo "Yarn not found!"
fi

# Cocoapod
if command -v pod >/dev/null 2>&1; then
  echo -n "Cocoapod version: " && pod --version 2>/dev/null
else
  echo "Cocoapod not found!"
fi

# Java
echo -n "Java version: "
if command -v java >/dev/null 2>&1; then
  java -version 2>&1 | head -n 1
else
  echo "Java not found!"
fi

# Maven
echo -n "Maven version: "
if command -v mvn >/dev/null 2>&1; then
  mvn -v | head -n 1
else
  echo "Maven not found!"
fi

# Android SDK
if [ -z "$ANDROID_HOME" ] && [ -z "$ANDROID_SDK_ROOT" ]; then
  echo "ANDROID_HOME and ANDROID_SDK_ROOT not set!"
else
  echo "Android SDK found at: ${ANDROID_HOME:-$ANDROID_SDK_ROOT}"
fi

# Android commandline tools
if command -v sdkmanager >/dev/null 2>&1; then
  echo "Android sdkmanager is installed."
else
  echo "Android sdkmanager not found! Please install Android Commandline Tools."
fi

if command -v adb >/dev/null 2>&1; then
  echo "adb is installed."
else
  echo "adb not found! Please install Android platform-tools."
fi

# GitHub credentials
if [ -n "$GITHUB_ACTOR" ] && [ -n "$GITHUB_TOKEN" ]; then
  echo "GitHub user: $GITHUB_ACTOR"
  echo "GitHub token is set."
else
  echo "GitHub user/token environment variables are not set!"
fi

echo "=== Done ==="

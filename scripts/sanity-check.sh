#!/usr/bin/env bash

set -e

echo "=== Sanity Check Script for React Native Android Environment ==="

# Node.js
echo -n "Node version: " && node -v || echo "Node.js not found!"
if [ -f ".nvmrc" ]; then
  NVMRC_VERSION=$(cat .nvmrc | tr -d '[:space:]')
  CURRENT_NODE_VERSION=$(node -v 2>/dev/null || echo "")

  if [ -n "$CURRENT_NODE_VERSION" ]; then
    # Remove 'v' prefix if present for comparison
    NVMRC_CLEAN=${NVMRC_VERSION#v}
    CURRENT_CLEAN=${CURRENT_NODE_VERSION#v}

    # Extract major version for comparison
    NVMRC_MAJOR=$(echo $NVMRC_CLEAN | cut -d. -f1)
    CURRENT_MAJOR=$(echo $CURRENT_CLEAN | cut -d. -f1)

    if [ "$NVMRC_MAJOR" = "$CURRENT_MAJOR" ]; then
      echo "✅ Node version ($CURRENT_NODE_VERSION) aligns with .nvmrc ($NVMRC_VERSION)"
    else
      echo "❌ Node version mismatch!"
      echo "   Current: $CURRENT_NODE_VERSION"
      echo "   .nvmrc:  $NVMRC_VERSION"
      echo "   Run 'nvm use' to switch to the correct version"
    fi
  fi
else
  echo "⚠️  .nvmrc file not found"
fi

# npm
echo -n "✅ npm version: " && npm -v || echo "npm not found!"

# Yarn (optional)
if command -v yarn >/dev/null 2>&1; then
  echo -n "✅ Yarn version: " && yarn -v
else
  echo "❌ Yarn not found!"
fi

# Cocoapod
if command -v pod >/dev/null 2>&1; then
  echo -n "✅ Cocoapod version: " && pod --version 2>/dev/null
else
  echo "❌ Cocoapod not found!"
fi

# Java
echo -n "✅ Java version: "
if command -v java >/dev/null 2>&1; then
  java -version 2>&1 | head -n 1
else
  echo "❌ Java not found!"
fi

# Maven
echo -n "✅ Maven version: "
if command -v mvn >/dev/null 2>&1; then
  mvn -v | head -n 1
else
  echo "❌ Maven not found!"
fi

# Android SDK
if [ -z "$ANDROID_HOME" ] && [ -z "$ANDROID_SDK_ROOT" ]; then
  echo "❌ ANDROID_HOME and ANDROID_SDK_ROOT not set!"
else
  echo "✅ Android SDK found at: ${ANDROID_HOME:-$ANDROID_SDK_ROOT}"
fi

# Android commandline tools
if command -v sdkmanager >/dev/null 2>&1; then
  echo "✅ Android sdkmanager is installed."
else
  echo "❌ Android sdkmanager not found! Please install Android Commandline Tools."
fi

if command -v adb >/dev/null 2>&1; then
  echo ""✅ adb is installed."
else
  echo "❌ adb not found! Please install Android platform-tools."
fi

# NPM token
if [ -n "$NPM_TOKEN" ]; then
  echo "✅ NPM_TOKEN is set"
else
  echo "❌ NPM_TOKEN environment variable is not set!"
  echo "   This is required for publishing packages"
fi

# GitHub credentials
if [ -n "$GITHUB_ACTOR" ] && [ -n "$GITHUB_TOKEN" ]; then
  echo "✅ GitHub user: $GITHUB_ACTOR"
  echo "✅ GitHub token is set."
else
  echo "❌ GitHub user/token environment variables are not set!"
fi

echo "=== Done ==="

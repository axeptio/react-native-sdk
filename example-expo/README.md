# Axeptio React Native SDK - Expo Example

This is an example application demonstrating the Axeptio React Native SDK using Expo.

## Prerequisites

- Node.js 22+
- Expo CLI
- iOS Simulator (for iOS development)
- Android Emulator or device (for Android development)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create development builds (required for native modules):
```bash
# For iOS
npx expo run:ios

# For Android
npx expo run:android
```

## Running the App

### Development

```bash
npm start
```

Then press `i` for iOS or `a` for Android.

### Platform-specific commands

```bash
# iOS
npm run ios

# Android
npm run android

# Web (if applicable)
npm run web
```

## Features

This example demonstrates:
- Axeptio consent management integration
- Google Mobile Ads integration
- App Tracking Transparency (iOS)
- WebView with Axeptio token injection

## Configuration

The app is configured with test Ad Unit IDs from Google Mobile Ads. Update these in `src/App.tsx` for production use.

## Notes

- This example uses Expo Dev Client for native module support
- The app requires prebuild or development builds to run native modules like Google Mobile Ads
- App Tracking Transparency is iOS-specific and handled via expo-tracking-transparency
# @axeptio/react-native-sdk

This repository demonstrates how to implement the Axeptio React Native SDK in your mobile applications.

## Setup

### Installation

```shell
npm install --save @axeptio/react-native-sdk
// or
yarn add @axeptio/react-native-sdk
```

### Android setup
- Min sdk 26
- Add maven github repository and credentials in your app's `android/build.gradle` (at the root level of the .gradle file)
```groovy
repositories {
    maven {
        url = uri("https://maven.pkg.github.com/axeptio/tcf-android-sdk")
        credentials {
           username = "[GITHUB_USERNAME]"
           password = "[GITHUB_TOKEN]"
        }
   }
}
```
### iOS

We support iOS versions >= 15.

```shell
npx pod-install
```

The sdk do not manage App Tracking Transparency, you can find more information [there](#app-tracking-transparency-att).

## Sample

You can find a basic usage of the Axeptio SDK in the `example` folder.
Read the specific [documentation](./example/README.md).

## Usage
### Initialize the SDK on app start up:
```typescript
async function init() {
  await AxeptioSDK.initialize(
    [your_client_id],
    [your_cookies_version],
    [optional_consent_token]
  );
  await AxeptioSDK.setupUI();
}
```

### App Tracking Transparency (ATT)

To manage App Tracking Transparency, you can use the [react-native-tracking-transparency](https://www.npmjs.com/package/react-native-tracking-transparency) widget.

First, install it
```shell
npm install --save react-native-tracking-transparency
// or
yarn react-native-tracking-transparency
```

Add `NSUserTrackingUsageDescription` to your Info.plist add file

```xml
<key>NSUserTrackingUsageDescription</key>
<string>Explain why you need user tracking</string>
```

You can now manage ATT popup before setup UI

```typescript
let trackingStatus = await getTrackingStatus();

if (trackingStatus === 'not-determined') {
  trackingStatus = await requestTrackingPermission();
}

if (trackingStatus === 'denied') {
  await AxeptioSDK.setUserDeniedTracking();
} else {
  await AxeptioSDK.setupUI();
}
```

### Show consent popup on demand

Additionally, you can request the consent popup to open on demand.
```typescript
AxeptioSdk.showConsentScreen();
```

### Sharing consents with other web views
The SDK provides a helper function to append the `axeptio_token` query param to any URL.
You can precise a custom user token or use the one currently stored in the SDK.

```typescript
const token = await AxeptioSdk.getAxeptioToken();
const url = await AxeptioSdk.appendAxeptioTokenURL(
  'https://myurl.com',
  token
);
```

Will return `https://myurl.com?axeptio_token=[token]`

### Clear user's consent choices

```typescript
AxeptioSdk.clearConsent();
```

### Events

The Axeptio SDK triggers various events to notify you that the user has taken some action.

We provide an `AxeptioEventListener` class that can be use to catch events. Don't forget to add this listener to AxeptioSdk, as below.

```typescript
const listener: AxeptioEventListener = {
  onPopupClosedEvent: () => {
    // The CMP notice is being hidden
    // Do something
  },
  onConsentChanged: () => {
    // The consent of the user changed
    // Do something
  },
  onGoogleConsentModeUpdate: (_consents) => {
    // The Google Consent V2 status
    // Do something
  },
};
AxeptioSDK.addListener(listener);
```

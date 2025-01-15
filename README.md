# @axeptio/react-native-sdk

This repository demonstrates how to implement the Axeptio React Native SDK in your mobile applications.

This example can be compiled with brands or publishers given your requirements.

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
        url = uri("https://maven.pkg.github.com/axeptio/axeptio-android-sdk")
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

The SDK can be configured for either brands or publishers via the AxeptioService enum during initialization.

```typescript
async function init() {
  await AxeptioSDK.initialize(
    AxeptioService.brands, // or AxeptioService.tcfPublishers
    [your_client_id],
    [your_cookies_version],
    [optional_consent_token]
  );
  await AxeptioSDK.setupUI();
}
```

### App Tracking Transparency (ATT)

The Axeptio SDK does not ask for the user permission for tracking in the ATT framework and it is the responsibility of the app to do so and to decide how the Axeptio CMP and the ATT permission should coexist.

Your app must follow [Apple's guidelines](https://developer.apple.com/app-store/user-privacy-and-data-use/) for disclosing the data collected by your app and asking for the user's permission for tracking.

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

### Responsibilities: Mobile App vs SDK

The Axeptio SDK and your mobile application have distinct responsibilities in managing user consent and tracking:

#### Mobile Application Responsibilities:
- Implementing and managing the App Tracking Transparency (ATT) permission flow
- Deciding when to show the ATT prompt relative to the Axeptio CMP
- Properly declaring data collection practices in App Store privacy labels
- Handling SDK events and updating app behavior based on user consent

#### Axeptio SDK Responsibilities:
- Displaying the consent management platform (CMP) interface
- Managing and storing user consent choices
- Sending consent status through APIs

The SDK does not automatically handle ATT permissions - this must be explicitly managed by the host application as shown in the implementation examples above.

### Get stored consents

You can retrieve the consents that are stored by the SDK in UserDefaults/SharedPreferences.

### Show consent popup on demand

Additionally, you can request the consent popup to open on demand.
```typescript
AxeptioSdk.showConsentScreen();
```

### Sharing consents with other web views
>*This feature is only available for **publishers** service.*

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

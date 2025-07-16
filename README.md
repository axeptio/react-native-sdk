<img src="https://github.com/user-attachments/assets/09c669ea-3187-4fc2-8763-c209d8f4cde4" width="600" height="300"/>

# Axeptio React Native SDK Integration


![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg) ![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg) ![React Native Compatibility](https://img.shields.io/badge/React%20Native-%3E%3D%20065-blue) ![Android SDK](https://img.shields.io/badge/Android%20SDK-%3E%3D%2026-blue) ![iOS Version](https://img.shields.io/badge/iOS%20Versions-%3E%3D%2015-blue)








This repository demonstrates how to implement the **Axeptio React Native SDK** into your mobile applications to handle user consent for GDPR compliance and other privacy regulations.

The SDK is customizable for both brands and publishers, depending on your use case and requirements.


## 📑 Table of Contents
1. [GitHub Access Token Setup](#github-access-token-setup)
2. [Setup](#setup)
   - [Installation](#installation)
   - [Android Setup](#android-setup)
   - [iOS Setup](#ios-setup)
3. [Initialize the SDK on App Startup](#initialize-the-sdk-on-app-startup)
4. [ATT (App Tracking Transparency) Integration Note](#att-app-tracking-transparency-integration-note)
5. [Responsibilities: Mobile App vs SDK](#responsibilities-mobile-app-vs-sdk)
6. [Get Stored Consents](#get-stored-consents)
7. [Show Consent Popup on Demand](#show-consent-popup-on-demand)
8. [Sharing Consents with Other Web Views](#sharing-consents-with-other-web-views)
9. [Clear Users Consent Choices](#clear-users-consent-choices)
10. [Events](#events)






<br><br>
## GitHub Access Token Setup
When setting up your project or accessing certain GitHub services, you may be prompted to create a GitHub Access Token. Please note that generating this token requires:
- A valid **GitHub account**.
- **Two-factor authentication (2FA)** enabled.

To avoid authentication issues during setup, we recommend reviewing the [official GitHub Access Token Documentation](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens) or detailed instructions on how to create your token and ensure 2FA is properly configured.
Following these steps will help you generate a token smoothly and reduce onboarding friction.

<br><br><br>
## Setup
#### Installation
To install the **Axeptio React Native SDK**, run one of the following commands:
###### Using npm:
```bash
npm install --save @axeptio/react-native-sdk
```
###### Using yarn:
```bash
yarn add @axeptio/react-native-sdk
```
#### Android Setup
- **Minimum SDK version**: 26.
- Add the **Maven GitHub repository** and **credentials** to your **app's** `android/build.gradle` (located at the root level of your `.gradle` file).
The snippet below is added to your `android/build.gradle` file, in the repositories block. It configures Gradle to pull the Axeptio Android SDK from a private GitHub repository.
- Your [GITHUB_TOKEN] scopes need [read:packages, repo]
```gradle
allprojects {
    repositories {
        google()
        mavenCentral()
        maven {
            url = uri("https://maven.pkg.github.com/axeptio/axeptio-android-sdk")
            credentials {
                username = "[GITHUB_USERNAME]"
                password = "[GITHUB_TOKEN]"
            }
        }
    }
}
```

#### iOS Setup
- We support **iOS versions >= 15**.
- Run the following command to install the dependencies:
```bash
npx pod-install
```
You can find a basic usage of the Axeptio SDK in the [example folder](https://github.com/axeptio/react-native-sdk/tree/master/example). Please check the folder for more detailed implementation examples.
<br><br><br>
## 🚀Initialize the SDK on App Startup
To initialize the **Axeptio React Native SDK** in your app, you need to set it up when your application starts. The SDK can be configured for different use cases, such as brands or publishers, using the `AxeptioService` enum. This allows you to customize the SDK according to your specific needs (e.g., handling GDPR consent for brands or publishers).

Here’s a step-by-step guide on how to initialize the SDK:
```javascript
import AxeptioSDK, { AxeptioService } from '@axeptio/react-native-sdk';

async function init() {
  try {
    // Initialize the SDK with the desired service (brands or publishers)
    await AxeptioSDK.initialize(
      AxeptioService.brands, // Choose between AxeptioService.brands or AxeptioService.tcfPublishers
      [your_client_id],      // Replace with your client ID (as provided by Axeptio)
      [your_cookies_version], // Replace with your current cookies version (as defined by your platform)
      [optional_consent_token] // Optional: If available, provide an existing consent token to restore previous consent choices
    );

    // Setup the user interface for consent management
    await AxeptioSDK.setupUI();

    console.log("Axeptio SDK initialized successfully!");
  } catch (error) {
    console.error("Error initializing Axeptio SDK:", error);
  }
}
```
##### Parameters:
- `AxeptioService`: This enum defines the type of service you’re using:
   - `AxeptioService.brands`: Use this for brands and advertisers. This setup is typically used for compliance with GDPR and other privacy regulations for tracking user consent.
   - `AxeptioService.tcfPublishers`: Use this for publishers. It helps with managing user consent under the **Transparency and Consent Framework (TCF)** , which is common for handling GDPR consent in the context of digital publishing.
 - `your_client_id`: Replace this with your unique **client ID** provided by Axeptio when you set up your account. This ID identifies your organization or application in the system.
 - `your_cookies_version`: This is a version identifier for your cookies. It helps manage different cookie policies and consent flows over time. This value should be incremented when your cookie policy changes.
 - `optional_consent_token`: This token (if available) allows you to pass a previously stored consent token to restore the user's previous consent choices. This is optional, and you can skip it if it's not required.

<br><br><br>
## ATT (App Tracking Transparency) Integration Note:

The Axeptio SDK does not handle the user permission for tracking in the **App Tracking Transparency (ATT)** framework. It is the responsibility of your app to manage this permission and decide how the **Axeptio Consent Management Platform (CMP)** and the **ATT permission** should coexist.

###### Apple Guidelines
Your app must comply with [Apple's guidelines](https://developer.apple.com/app-store/review/guidelines/#5.1.2) for disclosing the data collected by your app and requesting the user's permission for tracking.

To manage ATT, you can use the [react-native-tracking-transparency](https://www.npmjs.com/package/react-native-tracking-transparency) widget.

- **ATT Flow**: Ensure that the ATT prompt is displayed to the user before you ask for consent in the Axeptio CMP. This ensures that you comply with Apple's privacy requirements.
- **Apple's ATT Guidelines**: Make sure that you follow [Apple's ATT guidelines](https://developer.apple.com/documentation/apptrackingtransparency) for proper implementation.

##### Steps to Integrate ATT:

1. **Install the library**:
   You need to install the `react-native-tracking-transparency` library to handle ATT requests.

Using npm:
```bash
   npm install --save react-native-tracking-transparency
 ```
Or using yarn:
```yarn
yarn add react-native-tracking-transparency
```
2. **Update `Info.plist`**:
Add the following key to your `Info.plist` file to explain why your app requires user tracking:
```xml
<key>NSUserTrackingUsageDescription</key>
<string>Explain why you need user tracking</string>
```
3. **Manage the ATT Popup**:
Before displaying the Axeptio CMP UI, you need to request ATT permission and handle the user's response. Here's how you can manage the ATT popup:
```javascript
import { getTrackingStatus, requestTrackingPermission } from 'react-native-tracking-transparency';

async function handleATT() {
  // Check the current tracking status
  let trackingStatus = await getTrackingStatus();

  // If status is not determined, request permission
  if (trackingStatus === 'not-determined') {
    trackingStatus = await requestTrackingPermission();
  }

  // If tracking is denied, update the Axeptio SDK with the user's decision
 if (trackingStatus !== 'not-determined') {
  // Proceed with showing the Axeptio UI after ATT prompt
  await AxeptioSDK.setupUI();
}

  }
}
```
<br><br><br>
## 🧑‍💻Responsibilities: Mobile App vs SDK
The **Axeptio SDK** and your mobile application have distinct responsibilities when it comes to managing user consent and tracking:

##### Mobile Application Responsibilities:
- Implementing and managing the **App Tracking Transparency (ATT)** permission flow.
- Deciding when to show the **ATT** prompt in relation to the **Axeptio CMP**.
- Properly declaring data collection practices in **App Store privacy labels**.
- Handling SDK events and updating app behavior based on user consent.

##### Axeptio SDK Responsibilities:
- Displaying the consent management platform (**CMP**) interface.
- Managing and storing user consent choices.
- Sending consent status through APIs.

> **Important**: The SDK does **not** automatically handle **ATT permissions**. These must be explicitly managed by the host application, as shown in the implementation examples above.

<br><br><br>
## Get Stored Consents
You can retrieve the consents that are stored by the **Axeptio SDK** in **UserDefaults** (iOS) or **SharedPreferences** (Android). This allows your app to access the consent status even after the app has been closed and reopened.

#### iOS (UserDefaults)
For iOS, consents are stored in the **UserDefaults** system. You can use the standard `UserDefaults` API to access and retrieve the consent data.

```swift
// Example for retrieving consents in iOS
let consentStatus = UserDefaults.standard.string(forKey: "axeptioConsentStatus")
```

#### Android (SharedPreferences)
For Android, consents are stored in **SharedPreferences**. You can access them using the standard `SharedPreferences` API to retrieve the stored consent status.
```java
// Example for retrieving consents in Android
SharedPreferences prefs = context.getSharedPreferences("axeptio", Context.MODE_PRIVATE);
String consentStatus = prefs.getString("axeptioConsentStatus", "default_value");
```
#### Accessing Consent Status in SDK
The React Native SDK does not currently expose a method to directly retrieve consent data.  
To access the stored consent values, you can read from `UserDefaults` on iOS or `SharedPreferences` on Android using a native module or a library like `react-native-default-preference`.

To access UserDefaults (iOS) or SharedPreferences (Android), you can utilize the [react-native-default-preference library](https://github.com/kevinresol/react-native-default-preference), which provides a unified interface for both platforms.
<br><br><br>
## Show Consent Popup on Demand
You can trigger the consent popup to open at any time during the app's lifecycle.
To show the consent popup, use the following method:
```java
AxeptioSdk.showConsentScreen();
```
<br><br><br>
## Sharing Consents with Other Web Views
This feature is available only for the **Publishers** service.

The SDK provides a helper function to append the `axeptio_token` query parameter to any URL. You can either use the current user token stored in the SDK or pass a custom token.

```java
const token = await AxeptioSdk.getAxeptioToken();
const url = await AxeptioSdk.appendAxeptioTokenURL(
  'https://myurl.com',
  token
);

// The resulting URL will be:
// https://myurl.com?axeptio_token=[token]
```
<br><br><br>
## Clear Users Consent Choices
To clear the consent choices stored by the SDK, use the following method:
```java
AxeptioSdk.clearConsent();
```

This will remove all the stored consent data.
<br><br><br>
## Events
The Axeptio SDK triggers various events to notify the app when the user has taken actions related to consent.

To handle these events, you can add an `AxeptioEventListener`. This allows you to react to events such as the consent popup being closed or updates to Google Consent Mode.

```java
const listener: AxeptioEventListener = {
  onPopupClosedEvent: () => {
    // Retrieve consents from UserDefaults/SharedPreferences
    // Check user preferences
    // Run external processes/services based on user consents
  },

  onGoogleConsentModeUpdate: (_consents) => {
    // Handle Google Consent V2 status update
    // You can take further actions based on the consent state
  },
};

// Add the listener to the Axeptio SDK
AxeptioSDK.addListener(listener);
```
<br><br>
For more detailed information, you can visit the [Axeptio documentation](https://support.axeptio.eu/hc/en-gb ).
We hope this guide helps you get started with the Axeptio React Native SDK. Good luck with your integration, and thank you for choosing Axeptio!

# @axeptio/react-native-sdk-example

## Pre-requisites

First, be sure you have React Native installed. If not follow these [instructions](https://reactnative.dev/docs/set-up-your-environment).

Make sure you have the following installed:

- **brew** on Mac OS: https://brew.sh
- **Node.js** (≥ 18.x): https://nodejs.org
- **Yarn**:
  ```bash
  corepack enable && corepack prepare yarn@stable --activate```

- Xcode: Install from the Mac App Store
- CocoaPods (used for iOS dependencies):

  ```sudo gem install cocoapods```

## Mac OS

- To locally run GitHub actions: **act** ```brew install act```

## Install Dependencies

- Prepare the example directory: ```./setup-example.ch```

## iOS setup

- Open the Xcode workspace
 ```
cd ios
open AxeptioSdkExample.xcworkspace
 ```

- Set your development team
	•	In Xcode, select the AxeptioSdkExample target.
	•	Go to the “Signing & Capabilities” tab.
	•	Choose your Apple Developer Team from the dropdown.

- Configure Node path for Xcode

- From  ```example/ios ```, create  ```.xcode.env ```:

 ```echo "export NODE_BINARY=$(command -v node)" > .xcode.env ```

## Run

Finally, run the projet by running :
```shell
yarn start
```

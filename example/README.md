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

### Install Dependencies

- Prepare the example directory: ```./setup-example.ch```

### iOS setup

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

### Run

Finally, run the projet by running :
```shell
yarn start
```

## Android

### Android Studio

- SDK 31, 34, and 35
- Command line tools

### Mac OS Env setup

- Node 20 & Maven (with brew)
- JDK 17 (Brew openJDK@17)
- get your env right (Mac OS)

```
# NODE
export NVM_DIR="$HOME/.nvm"
[ -s "/opt/homebrew/opt/nvm/nvm.sh" ] && \. "/opt/homebrew/opt/nvm/nvm.sh"  # This loads nvm
[ -s "/opt/homebrew/opt/nvm/etc/bash_completion.d/nvm" ] && \. "/opt/homebrew/opt/nvm/etc/bash_completion.d/nvm"  # This loads nvm bash_completion

# ANDROID
export ANDROID_HOME="/Users/me/Library/Android/sdk"
export PATH="$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools:$ANDROID_HOME/cmdline-tools/latest/bin:$PATH"

# GITHUB
export GITHUB_USERNAME=me
export GITHUB_TOKEN=mytoken
export GITHUB_ACTOR=me
git config --global commit.gpgsign true
git config --global user.signingkey mykey

# JAVA
export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"
export CPPFLAGS="-I/opt/homebrew/opt/openjdk@17/include"
export JAVA_HOME="/opt/homebrew/opt/openjdk@17"
```

### Build

- clean ```./clean.sh```
- dependencies ```./install-all.sh```
- fix autolink ```cd example ./fix-autolink.sh```
- get an emulator running  ```./start-emulator.sh ```
- In one terminal window ```yarn start```
- In another window ```yarn android```

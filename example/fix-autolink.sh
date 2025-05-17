#!/bin/bash
mkdir -p android/build/generated/autolinking
npx react-native config \
  | jq 'del(.dependencies["react-native-google-mobile-ads"], .dependencies["react-native-webview"], .dependencies["some-other-package"])' \
  > android/build/generated/autolinking/autolinking.json



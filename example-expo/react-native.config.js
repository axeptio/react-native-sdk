module.exports = {
  dependencies: {
    '@axeptio/react-native-sdk': {
      root: '..',
      platforms: {
        android: {
          sourceDir: '../android',
          manifestPath: '../android/src/main/AndroidManifest.xml',
          packageImportPath: 'import com.axeptiosdk.AxeptioSdkPackage;',
        },
        ios: {
          podspecPath: '../react-native-axeptio-sdk.podspec',
        },
      },
    },
  },
  project: {
    android: {
      sourceDir: './android',
    },
    ios: {
      sourceDir: './ios',
    },
  },
};

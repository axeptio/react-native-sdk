const path = require('path');

module.exports = {
  project: {
    android: {
      packageName: 'com.axeptiosdkexample',
    },
  },
  dependencies: {
    '@axeptio/react-native-sdk': {
      root: path.resolve(__dirname, '..'),
    },
  },
};

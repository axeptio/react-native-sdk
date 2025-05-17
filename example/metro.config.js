const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const root = path.resolve(__dirname, '..');
const pak = require('../package.json');

const modules = Object.keys(pak.peerDependencies || {});

const config = {
  watchFolders: [root],

  resolver: {
    blockList: require('metro-config/src/defaults/exclusionList')(
      modules.map(
        (m) => new RegExp(`^${path.join(root, 'node_modules', m)}\\/.*$`)
      )
    ),

    extraNodeModules: modules.reduce((acc, name) => {
      acc[name] = path.join(__dirname, 'node_modules', name);
      return acc;
    }, {}),
  },

  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);

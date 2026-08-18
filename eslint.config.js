const { FlatCompat } = require('@eslint/eslintrc');
const prettierRecommended = require('eslint-plugin-prettier/recommended');

const compat = new FlatCompat({ baseDirectory: __dirname });

module.exports = [
  {
    ignores: ['**/node_modules/', 'lib/', 'coverage/'],
  },
  ...compat.extends('@react-native'),
  prettierRecommended,
  {
    rules: {
      'prettier/prettier': [
        'error',
        {
          quoteProps: 'consistent',
          singleQuote: true,
          tabWidth: 2,
          trailingComma: 'es5',
          useTabs: false,
        },
      ],
    },
  },
];

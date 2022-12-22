const path = require('path');
const fs = require('fs');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

function getPackageDir(filepath) {
  let currDir = path.dirname(require.resolve(filepath));
  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (fs.existsSync(path.join(currDir, 'package.json'))) {
      return currDir;
    }
    const { dir, root } = path.parse(currDir);
    if (dir === root) {
      throw new Error(
        `Could not find package.json in the parent directories starting from ${filepath}.`
      );
    }
    currDir = dir;
  }
}

module.exports = {
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    'storybook-addon-apollo-client',
    '@storybook/addon-actions',
    '@storybook/addon-viewport',
  ],
  staticDirs: ['../public'],
  stories: ['../**/**/*.stories.@(js|jsx|ts|tsx)'],
  typescript: {
    check: false,
    checkOptions: {},
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      propFilter: (prop) =>
        prop.parent ? !/node_modules/.test(prop.parent.fileName) : true,
      shouldExtractLiteralValuesFromEnum: true,
    },
  },
  webpackFinal: async (config) => {
    config.resolve.plugins = [
      ...(config.resolve.plugins || []),
      new TsconfigPathsPlugin({
        extensions: config.resolve.extensions,
      }),
    ];
    config.resolve.alias = {
      ...config.resolve.alias,
      '@emotion/styled': getPackageDir('@emotion/styled'),
    };
    return config;
  },
};

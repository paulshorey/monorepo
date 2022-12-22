// const fs = require('fs');
// const path = require('path');

// function getPackageDir(filepath) {
//   let currDir = path.dirname(require.resolve(filepath));
//   console.log('\n\n\n\ncurrDir', currDir, '\n\n\n\n\n');
//   while (true) {
//     if (fs.existsSync(path.join(currDir, 'package.json'))) {
//       return currDir;
//     }
//     const { dir, root } = path.parse(currDir);
//     if (dir === root) {
//       throw new Error(
//         `Could not find package.json in the parent directories starting from ${filepath}.`
//       );
//     }
//     currDir = dir;
//   }
// }

module.exports = {
  stories: [
    '../.storybook/**/*.stories.@(js|jsx|ts|tsx|mdx)',
    '../components/**/*.stories.@(js|jsx|ts|tsx|mdx)',
  ],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    'storybook-addon-next',
    // 'storybook-css-modules',
    // {
    //   name: 'storybook-addon-sass-postcss',
    //   options: {
    //     loadSassAfterPostCSS: true,
    //     sassLoaderOptions: {
    //       implementation: require('sass'),
    //     },
    //     rule: {
    //       test: /\.(scss|sass)$/i,
    //     },
    //   },
    // },
  ],
  presets: [
    // path.resolve('./.storybook/addons/scss-preset.js')
  ],
  framework: '@storybook/react',
  staticDir: ['../public'],
  core: {
    builder: 'webpack5',
  },
  // features: { emotionAlias: false },
  webpackFinal: async function supportCssModules(config) {
    // console.log('config', JSON.stringify(config, null, 2));
    config.resolve.enforceExtension = false;
    config.resolve.extensions = ['.ts', '.mjs', '.js', '.jsx', '.json', '.tsx'];

    config.module.rules.push({
      test: /\.m?js/,
      resolve: {
        fullySpecified: false,
      },
    })

    config.module.rules.push({
      test: /\.md$/,
      use: ['raw-loader'],
    });

    //   config.module.rules.find(
    //     (rule) => rule.test.toString() === '/\\.css$/'
    //   ).exclude = /\.module\.css$/;
    // config.resolve.alias = {
    //   ...config.resolve.alias,
    //   '@emotion/styled': getPackageDir('@emotion/styled'),
    //   'emotion-theming': getPackageDir('@emotion/react'),
    // };

    return config;
  },
};

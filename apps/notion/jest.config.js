const JsConfigPathsMapper = require('jsconfig-paths-jest-mapper');

const config = require('../../packages/ps_constants/jest-config');

module.exports = {
  ...config,
  moduleNameMapper: {
    ...new JsConfigPathsMapper({ configFileName: './tsconfig.json' }),
    ...config.moduleNameMapper,
  },
};

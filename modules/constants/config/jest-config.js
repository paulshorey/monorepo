module.exports = {
  collectCoverageFrom: ['**/*.tsx', '**/*.ts'],
  coveragePathIgnorePatterns: ['.*stories.tsx', '.storybook/*', '.cypress/*'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  setupFilesAfterEnv: [
    'dotenv/config',
    '<rootDir>/jest-setup.js',
    '@testing-library/jest-dom/extend-expect',
  ],
  testPathIgnorePatterns: ['.cypress/*'],
  transform: {
    '^.+\\.[t|j]sx?$': 'babel-jest',
    // '^.+\\.stories\\.[t|j]sx?$': '@storybook/addon-storyshots/injectFileName',
  },
  verbose: true,
};

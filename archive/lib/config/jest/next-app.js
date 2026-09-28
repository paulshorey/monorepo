const nextJest = require("next/jest.js");

const defaultModuleNameMapper = {
  "^@/(.*)$": "<rootDir>/$1",
  "^@lib/common/(.*)$": "<rootDir>/../../lib/common/$1",
};

const defaultConfig = {
  coverageProvider: "v8",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: defaultModuleNameMapper,
  testEnvironmentOptions: {
    customExportConditions: [""],
  },
};

const createNextJestConfig = (overrides = {}) => {
  const createJestConfig = nextJest({
    dir: overrides.dir ?? "./",
  });

  const config = {
    ...defaultConfig,
    ...overrides,
    moduleNameMapper: {
      ...defaultModuleNameMapper,
      ...(overrides.moduleNameMapper ?? {}),
    },
  };

  delete config.dir;

  return createJestConfig(config);
};

module.exports = {
  createNextJestConfig,
};

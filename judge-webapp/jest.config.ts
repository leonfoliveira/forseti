import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  dir: "./",
});

const config: Config = {
  coverageProvider: "v8",
  // TODO: Uncomment and adjust the coverage thresholds as needed
  // coverageThreshold: {
  //   global: {
  //     lines: 90,
  //   },
  // },
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/core/repository/**/*",
    "!src/i18n/**/*",
    "!src/config.ts",
  ],
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/test/jest.setup.tsx"],
  moduleNameMapper: {
    "^@/test/(.*)$": "<rootDir>/test/$1",
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  transformIgnorePatterns: ["/node_modules/(?!next-intl)/"],
  clearMocks: true,
};

export default createJestConfig(config);

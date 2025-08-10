import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  dir: "./",
});

const config: Config = {
  coverageProvider: "v8",
  coverageThreshold: {
    global: {
      lines: 90,
    },
  },
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.{ts,tsx}",
    "!src/core/domain/**/*",
    "!src/core/listener/**/*",
    "!src/core/repository/**/*",
    "!src/core/service/dto/**/*",
    "!src/i18n/**/*",
    "!src/config/env.ts",
  ],
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/test/jest.setup.tsx"],
  moduleNameMapper: {
    "^@/test/(.*)$": "<rootDir>/test/$1",
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  clearMocks: true,
};

export default createJestConfig(config);

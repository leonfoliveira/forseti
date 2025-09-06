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
    "!src/config/env.ts",
    "!src/core/domain/**/*",
    "!src/core/listener/**/*",
    "!src/core/repository/**/*",
    "!src/core/service/dto/**/*",
    "!src/i18n/**/*",
    "!src/lib/component/icon/**/*",
    "!src/lib/heroui-wrapper.tsx",
    "!src/lib/heroui.ts",
  ],
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/test/jest.setup.tsx"],
  moduleNameMapper: {
    "^@/test/(.*)$": "<rootDir>/test/$1",
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  clearMocks: true,
  roots: ["<rootDir>/test"],
  silent: true,
};

// eslint-disable-next-line import/no-anonymous-default-export
export default async () => ({
  ...(await createJestConfig(config)()),
  transformIgnorePatterns: ["node_modules/(?!next-intl)/"],
});

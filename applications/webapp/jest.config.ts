import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  coverageProvider: "v8",
  coverageThreshold: {
    global: {
      lines: 90,
    },
  },
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.{ts,tsx}",
    "!src/app/_lib/component/shadcn/**/*",
    "!src/config/**/*",
    "!src/domain/**/*",
    "!src/port/**/*",
  ],
  setupFilesAfterEnv: ["<rootDir>/test/jest.setup.tsx"],

  moduleNameMapper: {
    "^@/test/(.*)$": "<rootDir>/test/$1",
    "^@/(.*)$": "<rootDir>/src/$1",
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
  },

  clearMocks: true,
  roots: ["<rootDir>/test"],
  silent: true,
};

export default config;

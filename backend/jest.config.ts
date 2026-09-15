import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/__tests__/**/*.test.ts"],
  testPathIgnorePatterns: ["/node_modules/", "\\.integration\\.test\\.ts$"],
  setupFiles: ["<rootDir>/jest.setup.ts"],
  collectCoverageFrom: ["src/**/*.ts", "!src/**/__tests__/**", "!src/index.ts"],
};

export default config;

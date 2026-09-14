import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/__tests__/**/*.integration.test.ts"],
  setupFiles: ["<rootDir>/jest.integration.setup.ts"],
};

export default config;

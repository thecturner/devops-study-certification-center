/** @type {import('jest').Config} */
const config = {
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80,
    },
  },
  projects: [
    {
      displayName: "node",
      testEnvironment: "node",
      transform: {
        "^.+\\.tsx?$": ["ts-jest", { tsconfig: { module: "commonjs" } }],
      },
      moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1",
        "^@/data/taxonomy\\.json$": "<rootDir>/src/__mocks__/taxonomy.json",
      },
      testMatch: ["**/__tests__/**/*.test.ts"],
    },
    {
      displayName: "jsdom",
      testEnvironment: "jest-environment-jsdom",
      transform: {
        "^.+\\.tsx?$": ["ts-jest", { tsconfig: { module: "commonjs" } }],
      },
      moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1",
        "^@/data/taxonomy\\.json$": "<rootDir>/src/__mocks__/taxonomy.json",
      },
      testMatch: ["**/__tests__/**/*.test.tsx"],
      setupFilesAfterEnv: ["<rootDir>/src/__tests__/setup.ts"],
    },
  ],
};

module.exports = config;

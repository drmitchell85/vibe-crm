import type { Config } from 'jest';

const config: Config = {
  // Use ts-jest for TypeScript support
  preset: 'ts-jest',

  // Use Node.js test environment for API testing
  testEnvironment: 'node',

  // Root directory for tests
  rootDir: '.',

  // Test file patterns - look for .test.ts files in __tests__ folders or anywhere in src
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.test.ts',
    '<rootDir>/src/**/*.test.ts'
  ],

  // Module file extensions
  moduleFileExtensions: ['ts', 'js', 'json'],

  // Setup file to run before tests
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],

  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.test.ts',
    '!src/test/**/*',
    '!src/index.ts'
  ],

  // Coverage thresholds (can be adjusted as test coverage improves)
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50
    }
  },

  // Clear mocks between tests
  clearMocks: true,

  // Verbose output for better debugging
  verbose: true,

  // TypeScript transformation
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: 'tsconfig.json'
    }]
  }
};

export default config;

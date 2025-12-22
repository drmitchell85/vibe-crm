/**
 * Jest Test Setup File
 *
 * This file runs before each test file and contains:
 * - Global test configuration
 * - Shared mocks
 * - Cleanup logic
 */

// Set test environment variables
process.env.NODE_ENV = 'test';

// Increase timeout for integration tests that may need more time
jest.setTimeout(10000);

// Global cleanup after all tests
afterAll(async () => {
  // Clean up any resources (database connections, etc.)
  // This will be expanded when we add database mocking
});

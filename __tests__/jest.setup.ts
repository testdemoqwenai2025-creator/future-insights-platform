// Jest setup file
import { PrismaClient } from '@prisma/client';

// Mock environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/aeth1_test';

// Mock Prisma (optional - for integration tests)
jest.mock('@/lib/database', () => ({
  prisma: {
    user: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
    paper: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
    $queryRaw: jest.fn(),
    $transaction: jest.fn(),
    $disconnect: jest.fn()
  }
}));

// Extend Jest matchers
expect.extend({
  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    return {
      pass,
      message: () =>
        `expected ${received} to be within range ${floor} - ${ceiling}`
    };
  },
  toBeValidDate(received) {
    const date = new Date(received);
    const pass = !isNaN(date.getTime());
    return {
      pass,
      message: () => `expected ${received} to be a valid date`
    };
  }
});

// Global test utilities
global.testUtils = {
  generateToken: () => `test-token-${Date.now()}`,
  generateUserId: () => `usr_test_${Math.random().toString(36).substr(2, 9)}`,
  waitFor: (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
};

/**
 * Unit Tests - Error Handler
 */

import {
  ErrorCode,
  AethError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  RateLimitError,
  createErrorResponse,
  asyncHandler,
  validateRequired,
  logRequest
} from '@/middleware/error-handler';
import { NextResponse } from 'next/server';

describe('Error Handler', () => {
  describe('Error Codes', () => {
    it('should define all error code categories', () => {
      // Auth errors (1xxx)
      expect(ErrorCode.AUTH_REQUIRED).toBe('AUTH_REQUIRED');
      expect(ErrorCode.INVALID_TOKEN).toBe('INVALID_TOKEN');
      expect(ErrorCode.FORBIDDEN).toBe('FORBIDDEN');

      // Validation errors (2xxx)
      expect(ErrorCode.VALIDATION_ERROR).toBe('VALIDATION_ERROR');
      expect(ErrorCode.INVALID_INPUT).toBe('INVALID_INPUT');

      // Resource errors (3xxx)
      expect(ErrorCode.NOT_FOUND).toBe('NOT_FOUND');
      expect(ErrorCode.ALREADY_EXISTS).toBe('ALREADY_EXISTS');

      // Rate limit (4xxx)
      expect(ErrorCode.RATE_LIMITED).toBe('RATE_LIMITED');

      // Server errors (5xxx)
      expect(ErrorCode.INTERNAL_ERROR).toBe('INTERNAL_ERROR');
    });
  });

  describe('Custom Error Classes', () => {
    it('ValidationError should have correct properties', () => {
      const error = new ValidationError('Test validation error', { field: 'email' });

      expect(error).toBeInstanceOf(AethError);
      expect(error).toBeInstanceOf(Error);
      expect(error.code).toBe(ErrorCode.VALIDATION_ERROR);
      expect(error.message).toBe('Test validation error');
      expect(error.statusCode).toBe(422);
      expect(error.details).toEqual({ field: 'email' });
    });

    it('NotFoundError should include resource info', () => {
      const error = new NotFoundUser('users', '123');

      expect(error.code).toBe(ErrorCode.NOT_FOUND);
      expect(error.statusCode).toBe(404);
      expect(error.message).toContain('users');
    });

    it('UnauthorizedError should have default message', () => {
      const error = new UnauthorizedError();

      expect(error.code).toBe(ErrorCode.AUTH_REQUIRED);
      expect(error.statusCode).toBe(401);
    });

    it('ForbiddenError should accept custom message', () => {
      const error = new ForbiddenError('Custom forbidden message');

      expect(error.code).toBe(ErrorCode.FORBIDDEN);
      expect(error.statusCode).toBe(403);
      expect(error.message).toBe('Custom forbidden message');
    });

    it('RateLimitError should include retryAfter', () => {
      const error = new RateLimitError(60);

      expect(error.code).toBe(ErrorCode.RATE_LIMITED);
      expect(error.statusCode).toBe(429);
      expect(error.details?.retryAfter).toBe(60);
    });
  });

  describe('createErrorResponse', () => {
    it('should create response from AethError', () => {
      const error = new ValidationError('Validation failed');
      const response = createErrorResponse(error);

      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(422);
    });

    it('should create generic response from unknown error', () => {
      const error = new Error('Something went wrong');
      const response = createErrorResponse(error);

      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(500);
    });

    it('should handle non-Error objects', () => {
      const response = createErrorResponse('string error');

      expect(response).toBeInstanceOf(NextResponse);
    });
  });

  describe('asyncHandler', () => {
    it('should resolve successful async functions', async () => {
      // asyncHandler returns a Promise directly, not a function
      const result = await asyncHandler(async () => ({ success: true }));

      expect(result).toEqual({ success: true });
    });

    it('should catch and return error response', async () => {
      // asyncHandler returns a Promise that catches errors
      const result = await asyncHandler(async () => {
        throw new NotFoundError('test');
      });

      expect(result).toBeInstanceOf(NextResponse);
    });

    it('should handle non-Error throws', async () => {
      const result = await asyncHandler(async () => {
        throw 'string error';
      });

      expect(result).toBeInstanceOf(NextResponse);
    });
  });

  describe('validateRequired', () => {
    it('should pass with all required fields present', () => {
      expect(() => {
        validateRequired({ name: 'test', email: 'test@test.com' }, ['name', 'email']);
      }).not.toThrow();
    });

    it('should throw when required fields are missing', () => {
      expect(() => {
        validateRequired({ name: 'test' }, ['name', 'email']);
      }).toThrow(ValidationError);
    });

    it('should list missing fields in error details', () => {
      try {
        validateRequired({}, ['name', 'email', 'role']);
      } catch (error) {
        if (error instanceof ValidationError) {
          expect(error.details?.missingFields).toContain('name');
          expect(error.details?.missingFields).toContain('email');
          expect(error.details?.missingFields).toContain('role');
        }
      }
    });
  });
});

// Helper class for testing
class NotFoundUser extends NotFoundError {
  constructor(resource: string, id?: string) {
    super(resource, id);
  }
}

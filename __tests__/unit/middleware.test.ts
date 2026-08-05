/**
 * Unit Tests for Middleware Layer
 * AETH-1 Advanced Enterprise Technology Hub
 */

import {
  authMiddleware,
  sessionManager,
  validateApiKey,
  rateLimit,
} from '../../src/middleware/auth';
import {
  apiMiddleware,
  corsMiddleware,
  successResponse,
  paginatedResponse,
  errorResponse,
} from '../../src/middleware/api';
import {
  ErrorCode,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  RateLimitError,
  createErrorResponse,
  asyncHandler,
  validateRequired,
} from '../../src/middleware/error-handler';

// Mock dependencies
jest.mock('jose', () => ({
  jwtVerify: jest.fn(),
  SignJWT: jest.fn(() => ({
    setProtectedHeader: jest.fn().mockReturnThis(),
    setIssuedAt: jest.fn().mockReturnThis(),
    setExpirationTime: jest.fn().mockReturnThis(),
    sign: jest.fn().mockResolvedValue('mock-jwt-token'),
  })),
}));

describe('Auth Middleware', () => {
  describe('authMiddleware factory', () => {
    it('should create middleware with default options', () => {
      const middleware = authMiddleware();
      expect(middleware).toBeDefined();
      expect(typeof middleware).toBe('function');
    });

    it('should create middleware with custom options', () => {
      const options = {
        requiredRole: 'ADMIN' as const,
        requireApikey: true,
        rateLimitConfig: { windowMs: 60000, maxRequests: 100 },
      };
      const middleware = authMiddleware(options);
      expect(middleware).toBeDefined();
    });
  });

  describe('sessionManager', () => {
    describe('createSession', () => {
      it('should create a session with valid user data', async () => {
        const userData = {
          id: 'user-123',
          email: 'test@example.com',
          role: 'RESEARCHER' as const,
        };
        
        const session = await sessionManager.createSession(userData);
        
        expect(session).toBeDefined();
        expect(session.user).toEqual(userData);
        expect(session.token).toBeDefined();
        expect(session.expiresAt).toBeInstanceOf(Date);
      });

      it('should throw error for invalid user data', async () => {
        await expect(
          sessionManager.createSession({} as any)
        ).rejects.toThrow();
      });
    });

    describe('refreshSession', () => {
      it('should refresh an existing session', async () => {
        const originalSession = await sessionManager.createSession({
          id: 'user-123',
          email: 'test@example.com',
          role: 'RESEARCHER',
        });
        
        const refreshed = await sessionManager.refreshSession(originalSession.token);
        
        expect(refreshed).toBeDefined();
        expect(refreshed.token).not.toBe(originalSession.token);
      });
    });

    describe('invalidateSession', () => {
      it('should invalidate a session token', async () => {
        const session = await sessionManager.createSession({
          id: 'user-123',
          email: 'test@example.com',
          role: 'RESEARCHER',
        });
        
        const result = await sessionManager.invalidateSession(session.token);
        
        expect(result.success).toBe(true);
      });
    });
  });

  describe('validateApiKey', () => {
    it('should validate a correct API key', () => {
      const result = validateApiKey('aeth1-sk-test-key-12345');
      expect(result.valid).toBe(true);
    });

    it('should reject empty API key', () => {
      const result = validateApiKey('');
      expect(result.valid).toBe(false);
    });

    it('should reject malformed API key', () => {
      const result = validateApiKey('invalid-key');
      expect(result.valid).toBe(false);
    });
  });

  describe('rateLimit', () => {
    beforeEach(() => {
      // Clear rate limit store before each test
      const store = (rateLimit as any).__store || new Map();
      if (store instanceof Map) store.clear();
    });

    it('should allow requests within limit', () => {
      const result = rateLimit('user-123', 10, 60000);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(9);
    });

    it('should block requests exceeding limit', () => {
      // Exhaust the limit
      for (let i = 0; i < 10; i++) {
        rateLimit('user-456', 10, 60000);
      }
      
      const result = rateLimit('user-456', 10, 60000);
      expect(result.allowed).toBe(false);
    });

    it('should reset after window expires', () => {
      // Use very short window for testing
      const result1 = rateLimit('user-789', 2, 1); // 1ms window
      expect(result1.allowed).toBe(true);
      
      // Wait for window to expire
      return new Promise(resolve => {
        setTimeout(() => {
          const result2 = rateLimit('user-789', 2, 1);
          expect(result2.allowed).toBe(true);
          resolve(true);
        }, 10);
      });
    });

    it('should track separate limits per identifier', () => {
      const result1 = rateLimit('user-a', 5, 60000);
      const result2 = rateLimit('user-b', 5, 60000);
      
      expect(result1.remaining).toBe(4);
      expect(result2.remaining).toBe(4);
    });
  });
});

describe('API Middleware', () => {
  describe('corsMiddleware', () => {
    it('should allow configured origins', () => {
      const cors = corsMiddleware({
        origins: ['https://aeth-1.vercel.app', 'http://localhost:3000'],
      });
      
      expect(cors).toBeDefined();
    });

    it('should handle wildcard origin', () => {
      const cors = corsMiddleware({ origins: ['*'] });
      expect(cors).toBeDefined();
    });
  });

  describe('apiMiddleware factory', () => {
    it('should create combined middleware stack', () => {
      const middleware = apiMiddleware({
        enableCors: true,
        enableRateLimit: true,
        enableAuth: false,
      });
      
      expect(middleware).toBeDefined();
      expect(typeof middleware).toBe('function');
    });
  });

  describe('Response Helpers', () => {
    describe('successResponse', () => {
      it('should create success response with data', () => {
        const response = successResponse({ id: 1, name: 'Test' });
        
        expect(response.success).toBe(true);
        expect(response.data).toEqual({ id: 1, name: 'Test' });
        expect(response.timestamp).toBeDefined();
      });

      it('should include metadata when provided', () => {
        const response = successResponse(
          [],
          { page: 1, limit: 10, total: 0 }
        );
        
        expect(response.meta).toEqual({ page: 1, limit: 10, total: 0 });
      });
    });

    describe('paginatedResponse', () => {
      it('should create paginated response', () => {
        const items = [{ id: 1 }, { id: 2 }, { id: 3 }];
        const response = paginatedResponse(items, {
          page: 1,
          limit: 10,
          total: 3,
        });
        
        expect(response.data).toEqual(items);
        expect(response.meta?.page).toBe(1);
        expect(response.meta?.totalPages).toBe(1);
      });

      it('calculate total pages correctly', () => {
        const items = new Array(25).fill({});
        const response = paginatedResponse(items, {
          page: 2,
          limit: 10,
          total: 25,
        });
        
        expect(response.meta?.totalPages).toBe(3);
      });
    });
  });
});

describe('Error Handler', () => {
  describe('Error Classes', () => {
    describe('ValidationError', () => {
      it('should create validation error with details', () => {
        const error = new ValidationError('Invalid input', {
          field: 'email',
          reason: 'Invalid format',
        });
        
        expect(error.message).toBe('Invalid input');
        expect(error.code).toBe(ErrorCode.VALIDATION_ERROR);
        expect(error.details).toEqual({ field: 'email', reason: 'Invalid format' });
        expect(error.statusCode).toBe(400);
      });
    });

    describe('NotFoundError', () => {
      it('should create not found error', () => {
        const error = new NotFoundError('User not found', 'USER_001');
        
        expect(error.message).toBe('User not found');
        expect(error.code).toBe(ErrorCode.NOT_FOUND);
        expect(error.resourceId).toBe('USER_001');
        expect(error.statusCode).toBe(404);
      });
    });

    describe('UnauthorizedError', () => {
      it('should create unauthorized error', () => {
        const error = new UnauthorizedError('Authentication required');
        
        expect(error.message).toBe('Authentication required');
        expect(error.code).toBe(ErrorCode.AUTH_REQUIRED);
        expect(error.statusCode).toBe(401);
      });
    });

    describe('ForbiddenError', () => {
      it('should create forbidden error', () => {
        const error = new ForbiddenError('Insufficient permissions');
        
        expect(error.message).toBe('Insufficient permissions');
        expect(error.code).toBe(ErrorCode.FORBIDDEN);
        expect(error.statusCode).toBe(403);
      });
    });

    describe('RateLimitError', () => {
      it('should create rate limit error with retry info', () => {
        const error = new RateLimitError(60, 100);
        
        expect(error.message).toContain('Rate limit exceeded');
        expect(error.code).toBe(ErrorCode.RATE_LIMITED);
        expect(error.retryAfter).toBe(60);
        expect(error.limit).toBe(100);
        expect(error.statusCode).toBe(429);
      });
    });
  });

  describe('createErrorResponse', () => {
    it('should create error response from Error instance', () => {
      const error = new ValidationError('Test error');
      const response = createErrorResponse(error);
      
      expect(response.success).toBe(false);
      expect(response.error).toBeDefined();
      expect(response.error.message).toBe('Test error');
      expect(response.error.code).toBe(ErrorCode.VALIDATION_ERROR);
    });

    it('should handle unknown errors', () => {
      const error = new Error('Unknown error');
      const response = createErrorResponse(error);
      
      expect(response.success).toBe(false);
      expect(response.error.code).toBe(ErrorCode.INTERNAL_ERROR);
    });

    it('should include details when available', () => {
      const error = new NotFoundError('Not found', 'ID_123');
      const response = createErrorResponse(error);
      
      expect(response.error.resourceId).toBe('ID_123');
    });
  });

  describe('asyncHandler', () => {
    it('should catch errors in async functions', async () => {
      const fn = asyncHandler(async () => {
        throw new Error('Async error');
      });
      
      await expect(fn(null, null, null)).rejects.toThrow('Async error');
    });

    it('should pass through successful results', async () => {
      const mockNext = jest.fn();
      const fn = asyncHandler(async (req, res, next) => {
        next();
      });
      
      await fn(null, null, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('validateRequired', () => {
    it('should pass when all fields are present', () => {
      const data = { name: 'Test', email: 'test@test.com' };
      expect(() => validateRequired(data, ['name', 'email'])).not.toThrow();
    });

    it('should throw when field is missing', () => {
      const data = { name: 'Test' };
      expect(() => validateRequired(data, ['name', 'email'])).toThrow(ValidationError);
    });

    it('should throw when field is empty string', () => {
      const data = { name: '', email: 'test@test.com' };
      expect(() => validateRequired(data, ['name', 'email'])).toThrow(ValidationError);
    });

    it('should allow null/undefined values if not in required list', () => {
      const data = { name: 'Test' };
      expect(() => validateRequired(data, ['name'])).not.toThrow();
    });
  });

  describe('ErrorCode enum', () => {
    it('should have all expected error codes', () => {
      expect(ErrorCode.AUTH_REQUIRED).toBe('AUTH_REQUIRED');
      expect(ErrorCode.FORBIDDEN).toBe('FORBIDDEN');
      expect(ErrorCode.NOT_FOUND).toBe('NOT_FOUND');
      expect(ErrorCode.VALIDATION_ERROR).toBe('VALIDATION_ERROR');
      expect(ErrorCode.RATE_LIMITED).toBe('RATE_LIMITED');
      expect(ErrorCode.INTERNAL_ERROR).toBe('INTERNAL_ERROR');
      expect(ErrorCode.SERVICE_UNAVAILABLE).toBe('SERVICE_UNAVAILABLE');
    });
  });
});

/**
 * AETH-1 Error Handling Middleware
 * Standardized error responses, logging, and recovery
 */

import { NextResponse } from 'next/server';

// Error codes for consistent client-side handling
export enum ErrorCode {
  // Auth errors (1xxx)
  AUTH_REQUIRED = 'AUTH_REQUIRED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  EXPIRED_TOKEN = 'EXPIRED_TOKEN',
  FORBIDDEN = 'FORBIDDEN',
  
  // Validation errors (2xxx)
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_FIELD = 'MISSING_FIELD',
  INVALID_FORMAT = 'INVALID_FORMAT',
  
  // Resource errors (3xxx)
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  CONFLICT = 'CONFLICT',
  RESOURCE_LOCKED = 'RESOURCE_LOCKED',
  
  // Rate limit (4xxx)
  RATE_LIMITED = 'RATE_LIMITED',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  
  // Server errors (5xxx)
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  TIMEOUT = 'TIMEOUT',
  DEPENDENCY_ERROR = 'DEPENDENCY_ERROR'
}

export class AethError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public statusCode: number = 500,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'AethError';
  }
}

// Specific error classes for common scenarios
export class ValidationError extends AethError {
  constructor(message: string, details?: Record<string, any>) {
    super(ErrorCode.VALIDATION_ERROR, message, 422, details);
  }
}

export class NotFoundError extends AethError {
  constructor(resource: string, id?: string) {
    super(ErrorCode.NOT_FOUND, `${resource}${id ? ` (${id})` : ''} not found`, 404);
  }
}

export class UnauthorizedError extends AethError {
  constructor(message: string = 'Authentication required') {
    super(ErrorCode.AUTH_REQUIRED, message, 401);
  }
}

export class ForbiddenError extends AethError {
  constructor(message: string = 'Insufficient permissions') {
    super(ErrorCode.FORBIDDEN, message, 403);
  }
}

export class RateLimitError extends AethError {
  constructor(retryAfter?: number) {
    super(ErrorCode.RATE_LIMITED, 'Too many requests', 429, { retryAfter });
  }
}

/**
 * Create standardized error response
 */
export function createErrorResponse(error: AethError | Error | unknown): NextResponse {
  console.error('[AETH-1 Error]', error);
  
  if (error instanceof AethError) {
    return NextResponse.json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        ...(error.details && { details: error.details })
      },
      timestamp: new Date().toISOString()
    }, { status: error.statusCode });
  }
  
  // Generic error
  const message = error instanceof Error ? error.message : 'An unexpected error occurred';
  
  return NextResponse.json({
    success: false,
    error: {
      code: ErrorCode.INTERNAL_ERROR,
      message: process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : message
    },
    timestamp: new Date().toISOString()
  }, { status: 500 });
}

/**
 * Async handler wrapper for consistent error handling
 */
export function asyncHandler<T>(
  fn: () => Promise<T>
): Promise<T | NextResponse> {
  return fn().catch(createErrorResponse);
}

/**
 * Request validation helper
 */
export function validateRequired(data: Record<string, any>, fields: string[]): void {
  const missing = fields.filter(field => !data[field]);
  
  if (missing.length > 0) {
    throw new ValidationError(`Missing required fields: ${missing.join(', ')}`, {
      missingFields: missing
    });
  }
}

/**
 * Request logger middleware
 */
export function logRequest(request: Request, response?: Response, duration?: number) {
  const timestamp = new Date().toISOString();
  const method = request.method;
  const url = request.url;
  const status = response ? (response as Response).status : '-';
  const time = duration ? `${duration.toFixed(2)}ms` : '-';
  
  console.log(`[${timestamp}] ${method} ${url} ${status} ${time}`);
}

// Global error handlers
if (typeof window === 'undefined') {
  // Server-side only
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  });
  
  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    // Don't exit in development
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  });
}

export default createErrorResponse;

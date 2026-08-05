/**
 * AETH-1 API Middleware
 * Combines authentication, rate limiting, CORS, and logging
 */

import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware, rateLimit, UserRole, validateApiKey } from './auth';
import { createErrorResponse, AethError, logRequest, ErrorCode } from './error-handler';

// CORS configuration
const CORS_CONFIG = {
  allowedOrigins: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:8080').split(','),
  allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-Request-ID'],
  maxAge: 86400, // 24 hours
  credentials: true
};

/**
 * CORS middleware
 */
export function corsMiddleware(request: NextRequest): NextResponse | null {
  const origin = request.headers.get('origin') || '';
  
  // Handle preflight
  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 204 });
    setCorsHeaders(response, origin);
    return response;
  }
  
  return null; // Continue to next middleware
}

function setCorsHeaders(response: NextResponse, origin: string) {
  if (CORS_CONFIG.allowedOrigins.includes('*') || CORS_CONFIG.allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  }
  
  response.headers.set('Access-Control-Allow-Methods', CORS_CONFIG.allowedMethods.join(', '));
  response.headers.set('Access-Control-Allow-Headers', CORS_CONFIG.allowedHeaders.join(', '));
  response.headers.set('Access-Control-Max-Age', CORS_CONFIG.maxAge.toString());
  
  if (CORS_CONFIG.credentials) {
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }
}

/**
 * Request ID tracking
 */
export function addRequestId(request: NextRequest): string {
  const requestId = 
    request.headers.get('X-Request-ID') || 
    `req_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  
  return requestId;
}

/**
 * Main API middleware factory
 */
export function apiMiddleware(options?: {
  requireAuth?: boolean;
  roles?: UserRole[];
  rateLimit?: {
    requests?: number;
    windowMs?: number;
  };
  requireApiKey?: boolean;
}) {
  const {
    requireAuth = false,
    roles = [],
    rateLimit: rateLimitConfig = {},
    requireApiKey = false
  } = options || {};
  
  return async (
    request: NextRequest,
    handler: (request: NextRequest, context?: any) => Promise<NextResponse>
  ): Promise<NextResponse> => {
    const startTime = Date.now();
    const requestId = addRequestId(request);
    
    try {
      // 1. CORS
      const corsResponse = corsMiddleware(request);
      if (corsResponse) return corsResponse;
      
      // 2. API Key validation (for service-to-service)
      if (requireApiKey) {
        const apiKey = request.headers.get('X-API-Key');
        if (!apiKey || !validateApiKey(apiKey)) {
          return NextResponse.json(
            { error: { code: 'INVALID_API_KEY', message: 'Valid API key required' } },
            { status: 401 }
          );
        }
      }
      
      // 3. Rate limiting
      const identifier = request.ip || 'unknown';
      const limitResult = rateLimit(
        identifier,
        rateLimitConfig.requests || 100,
        rateLimitConfig.windowMs || 60000
      );
      
      if (!limitResult.allowed) {
        return NextResponse.json(
          { error: { code: ErrorCode.RATE_LIMITED, message: 'Rate limit exceeded' } },
          { 
            status: 429,
            headers: {
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': limitResult.resetTime.toString(),
              'Retry-After': Math.ceil((limitResult.resetTime - Date.now()) / 1000).toString()
            }
          }
        );
      }
      
      // 4. Authentication
      let user = null;
      if (requireAuth) {
        const auth = authMiddleware({ required: true, roles })(request);
        
        if (auth instanceof NextResponse) {
          return auth; // Auth failed
        }
        
        user = auth.user;
      }
      
      // 5. Execute handler
      const response = await handler(request, { user, requestId });
      
      // 6. Add headers to successful responses
      if (response instanceof NextResponse) {
        const origin = request.headers.get('origin') || '';
        setCorsHeaders(response, origin);
        
        response.headers.set('X-Request-ID', requestId);
        response.headers.set('X-Response-Time', `${Date.now() - startTime}ms`);
        response.headers.set('X-RateLimit-Remaining', limitResult.remaining.toString());
        
        logRequest(request, response, Date.now() - startTime);
      }
      
      return response;
      
    } catch (error) {
      console.error(`[API Error] Request ${requestId}:`, error);
      return createErrorResponse(error);
    }
  };
}

/**
 * Success response helper
 */
export function successResponse(data: any, meta?: Record<string, any>): NextResponse {
  return NextResponse.json({
    success: true,
    data,
    ...(meta && { meta }),
    timestamp: new Date().toISOString()
  });
}

/**
 * Paginated response helper
 */
export function paginatedResponse(
  items: any[],
  page: number,
  limit: number,
  total: number,
  additionalMeta?: Record<string, any>
): NextResponse {
  const totalPages = Math.ceil(total / limit);
  
  return successResponse(items, {
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    },
    ...additionalMeta
  });
}

/**
 * Streaming response for large datasets
 */
export function streamResponse(
  generator: AsyncGenerator<any>,
  options?: { chunkSize?: number }
): ReadableStream {
  const { chunkSize = 100 } = options || {};
  
  return new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      let buffer: any[] = [];
      
      try {
        for await (const item of generator) {
          buffer.push(item);
          
          if (buffer.length >= chunkSize) {
            controller.enqueue(encoder.encode(JSON.stringify(buffer) + '\n'));
            buffer = [];
          }
        }
        
        // Flush remaining
        if (buffer.length > 0) {
          controller.enqueue(encoder.encode(JSON.stringify(buffer) + '\n'));
        }
        
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    }
  });
}

/**
 * Cache control helpers
 */
export const cacheControl = {
  noCache: () => ({ 'Cache-Control': 'no-store, must-revalidate' }),
  shortCache: () => ({ 'Cache-Control': 'public, max-age=60' }),
  mediumCache: () => ({ 'Cache-Control': 'public, max-age=300' }),
  longCache: () => ({ 'Cache-Control': 'public, max-age=86400' }),
  immutable: () => ({ 'Cache-Control': 'public, max-age=31536000, immutable' })
};

export default apiMiddleware;

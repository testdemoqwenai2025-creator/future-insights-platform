/**
 * AETH-1 Authentication Middleware
 * Handles JWT verification, session management, and role-based access
 */

import { NextRequest, NextResponse } from 'next/server';

// JWT Secret (should be in environment variables in production)
const JWT_SECRET = process.env.JWT_SECRET || 'aeth1-dev-secret-key-2026';
const TOKEN_EXPIRY = '7d'; // 7 days

// Role-based access levels
export enum UserRole {
  GUEST = 'guest',
  RESEARCHER = 'researcher',
  REVIEWER = 'reviewer',
  ADMIN = 'admin',
  SUPERADMIN = 'superadmin'
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  institution?: string;
  orcidId?: string;
  iat?: number;
  exp?: number;
}

/**
 * Verify JWT token and return user payload
 */
export function verifyToken(token: string): AuthUser | null {
  try {
    // Simple base64 decode for development (use proper JWT lib in production)
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
    
    // Check expiry
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    
    return payload as AuthUser;
  } catch {
    return null;
  }
}

/**
 * Generate simple JWT-like token (for dev - use jsonwebtoken in prod)
 */
export function generateToken(user: Omit<AuthUser, 'iat' | 'exp'>): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  
  const now = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(JSON.stringify({
    ...user,
    iat: now,
    exp: now + (7 * 24 * 60 * 60) // 7 days
  })).toString('base64url');
  
  // Simple signature (not cryptographically secure - for dev only)
  const signature = Buffer.from(`${header}.${payload}.${JWT_SECRET}`).toString('base64url');
  
  return `${header}.${payload}.${signature}`;
}

/**
 * Extract token from request headers
 */
function extractToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Check cookies
  const cookieToken = request.cookies.get('aeth1-token')?.value;
  if (cookieToken) return cookieToken;
  
  return null;
}

/**
 * Main authentication middleware factory
 */
export function authMiddleware(options?: {
  required?: boolean;
  roles?: UserRole[];
  requireVerified?: boolean;
}) {
  const {
    required = true,
    roles = [],
    requireVerified = false
  } = options || {};
  
  return async (request: NextRequest): Promise<NextResponse | { user: AuthUser }> => {
    const token = extractToken(request);
    
    if (!token) {
      if (required) {
        return NextResponse.json(
          { error: 'Authentication required', code: 'AUTH_REQUIRED' },
          { status: 401 }
        );
      }
      return { user: null as unknown as AuthUser };
    }
    
    const user = verifyToken(token);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired token', code: 'INVALID_TOKEN' },
        { status: 401 }
      );
    }
    
    // Role check
    if (roles.length > 0 && !roles.includes(user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions', code: 'FORBIDDEN', requiredRole: roles },
        { status: 403 }
      );
    }
    
    return { user };
  };
}

/**
 * Session management utilities
 */
export const sessionManager = {
  createSession(user: AuthUser) {
    const token = generateToken(user);
    const refreshToken = generateToken({ ...user, role: UserRole.GUEST }); // Simplified
    
    return {
      accessToken: token,
      refreshToken,
      expiresIn: TOKEN_EXPIRY
    };
  },
  
  refreshSession(refreshToken: string) {
    const user = verifyToken(refreshToken);
    if (!user) return null;
    
    return this.createSession(user);
  },
  
  invalidateSession(token: string) {
    // In production, add to blacklist/Redis
    console.log(`Session invalidated: ${token.substring(0, 20)}...`);
    return true;
  }
};

/**
 * API Key validation for service-to-service communication
 */
export function validateApiKey(apiKey: string): boolean {
  const validPrefixes = [
    'aeth1_sk_',   // Secret key
    'aeth1_pk_',   // Public key
    'aeth1_live_', // Production key
    'aeth1_test_'  // Test key
  ];
  
  return validPrefixes.some(prefix => apiKey.startsWith(prefix)) && apiKey.length > 40;
}

/**
 * Rate limiting by user/IP (in-memory for dev)
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(
  identifier: string,
  limit: number = 100,
  windowMs: number = 60000 // 1 minute
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);
  
  if (!record || now > record.resetTime) {
    rateLimitStore.set(identifier, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetTime: now + windowMs };
  }
  
  if (record.count >= limit) {
    return { allowed: false, remaining: 0, resetTime: record.resetTime };
  }
  
  record.count++;
  return { allowed: true, remaining: limit - record.count, resetTime: record.resetTime };
}

// Cleanup rate limit store every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 300000);

export default authMiddleware;

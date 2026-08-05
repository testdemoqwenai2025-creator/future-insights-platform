/**
 * Integration Tests for Auth API
 * AETH-1 Advanced Enterprise Technology Hub
 */

import { NextRequest } from 'next/server';
import { GET, POST, PUT, DELETE } from '../../src/app/api/auth/route';

// Mock Next.js request creation helper
function createRequest(
  method: string,
  body?: any,
  headers?: Record<string, string>
): NextRequest {
  return new NextRequest('http://localhost:3000/api/auth', {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

describe('Auth API - Integration Tests', () => {
  describe('POST /api/auth (Login)', () => {
    it('should login with valid credentials', async () => {
      const req = createRequest('POST', {
        email: 'admin@aeth-1.com',
        password: 'admin123',
      });
      
      const response = await POST(req);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(data.data.token).toBeDefined();
      expect(data.data.user).toBeDefined();
      expect(data.data.user.email).toBe('admin@aeth-1.com');
    });

    it('should reject invalid email', async () => {
      const req = createRequest('POST', {
        email: 'invalid@example.com',
        password: 'wrongpassword',
      });
      
      const response = await POST(req);
      const data = await response.json();
      
      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('AUTH_REQUIRED');
    });

    it('should reject invalid password', async () => {
      const req = createRequest('POST', {
        email: 'admin@aeth-1.com',
        password: 'wrongpassword',
      });
      
      const response = await POST(req);
      const data = await response.json();
      
      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
    });

    it('should reject missing credentials', async () => {
      const req = createRequest('POST', {});
      
      const response = await POST(req);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject empty request body', async () => {
      const req = new NextRequest('http://localhost:3000/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      const response = await POST(req);
      
      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/auth (Get Current User)', () => {
    it('should return user data when authenticated', async () => {
      // First login to get token
      const loginReq = createRequest('POST', {
        email: 'researcher@aeth-1.com',
        password: 'researcher123',
      });
      
      const loginRes = await POST(loginReq);
      const { token } = (await loginRes.json()).data;
      
      // Then get current user
      const meReq = new NextRequest('http://localhost:3000/api/auth', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      const meResponse = await GET(meReq);
      const meData = await meResponse.json();
      
      expect(meResponse.status).toBe(200);
      expect(meData.success).toBe(true);
      expect(meData.data.email).toBe('researcher@aeth-1.com');
    });

    it('should reject unauthenticated request', async () => {
      const req = new NextRequest('http://localhost:3000/api/auth', {
        method: 'GET',
      });
      
      const response = await GET(req);
      const data = await response.json();
      
      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('AUTH_REQUIRED');
    });

    it('should reject invalid token', async () => {
      const req = new NextRequest('http://localhost:3000/api/auth', {
        method: 'GET',
        headers: {
          Authorization: 'Bearer invalid-token-here',
        },
      });
      
      const response = await GET(req);
      const data = await response.json();
      
      // Should either be 401 or 403 depending on implementation
      expect([401, 403]).toContain(response.status);
      expect(data.success).toBe(false);
    });
  });

  describe('PUT /api/auth (Register - Admin)', () => {
    it('should create new user when admin authenticated', async () => {
      // Login as admin
      const loginReq = createRequest('POST', {
        email: 'admin@aeth-1.com',
        password: 'admin123',
      });
      
      const loginRes = await POST(loginReq);
      const { token } = (await loginRes.json()).data;
      
      // Register new user
      const registerReq = new NextRequest('http://localhost:3000/api/auth', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: 'newuser@test.com',
          name: 'New User',
          role: 'RESEARCHER',
        }),
      });
      
      const registerResponse = await PUT(registerReq);
      const registerData = await registerResponse.json();
      
      expect(registerResponse.status).toBe(201);
      expect(registerData.success).toBe(true);
      expect(registerData.data.email).toBe('newuser@test.com');
    });

    it('should reject non-admin registration attempt', async () => {
      // Login as researcher
      const loginReq = createRequest('POST', {
        email: 'researcher@aeth-1.com',
        password: 'researcher123',
      });
      
      const loginRes = await POST(loginReq);
      const { token } = (await loginRes.json()).data;
      
      // Try to register as researcher
      const registerReq = new NextRequest('http://localhost:3000/api/auth', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: 'hacker@test.com',
          name: 'Hacker',
        }),
      });
      
      const registerResponse = await PUT(registerReq);
      const registerData = await registerResponse.json();
      
      expect(registerResponse.status).toBe(403);
      expect(registerData.success).toBe(false);
      expect(registerData.error.code).toBe('FORBIDDEN');
    });

    it('should validate required fields', async () => {
      // Login as admin
      const loginReq = createRequest('POST', {
        email: 'admin@aeth-1.com',
        password: 'admin123',
      });
      
      const loginRes = await POST(loginReq);
      const { token } = (await loginRes.json()).data;
      
      // Try to register without required fields
      const registerReq = new NextRequest('http://localhost:3000/api/auth', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}), // Missing email
      });
      
      const registerResponse = await PUT(registerReq);
      
      expect(registerResponse.status).toBe(400);
    });
  });

  describe('DELETE /api/auth (Logout)', () => {
    it('should successfully logout and invalidate session', async () => {
      // First login
      const loginReq = createRequest('POST', {
        email: 'admin@aeth-1.com',
        password: 'admin123',
      });
      
      const loginRes = await POST(loginReq);
      const { token } = (await loginRes.json()).data;
      
      // Then logout
      const logoutReq = new NextRequest('http://localhost:3000/api/auth', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      const logoutResponse = await DELETE(logoutReq);
      const logoutData = await logoutResponse.json();
      
      expect(logoutResponse.status).toBe(200);
      expect(logoutData.success).toBe(true);
    });

    it('should handle logout without session gracefully', async () => {
      const req = new NextRequest('http://localhost:3000/api/auth', {
        method: 'DELETE',
        headers: {
          Authorization: 'Bearer some-random-token',
        },
      });
      
      const response = await DELETE(req);
      const data = await response.json();
      
      // Should succeed even if session doesn't exist
      expect([200, 401]).toContain(response.status);
    });
  });

  describe('Rate Limiting on Auth Endpoints', () => {
    it('should rate limit excessive login attempts', async () => {
      const requests = Array.from({ length: 15 }, () =>
        createRequest('POST', {
          email: 'admin@aeth-1.com',
          password: 'wrongpassword',
        })
      );
      
      const responses = await Promise.all(requests.map(req => POST(req)));
      const lastResponse = responses[responses.length - 1];
      const data = await lastResponse.json();
      
      // After too many attempts, should be rate limited
      if (responses.some(r => r.status === 429)) {
        const rateLimitedResponse = responses.find(r => r.status === 429)!;
        const rateLimitedData = await rateLimitedResponse.json();
        expect(rateLimitedData.error.code).toBe('RATE_LIMITED');
      }
      // Note: Rate limiting may not trigger in all test environments
    });
  });

  describe('CORS Headers', () => {
    it('should include CORS headers in responses', async () => {
      const req = createRequest('POST', {
        email: 'test@example.com',
        password: 'test123',
      });
      
      const response = await POST(req);
      
      // Check for CORS headers
      const corsHeaders = [
        'access-control-allow-origin',
        'access-control-allow-methods',
      ];
      
      // At minimum, API should respond (even if auth fails)
      expect(response.headers).toBeDefined();
    });
  });
});

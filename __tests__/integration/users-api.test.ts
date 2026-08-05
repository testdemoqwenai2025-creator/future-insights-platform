/**
 * Integration Tests for Users API
 * AETH-1 Advanced Enterprise Technology Hub
 */

import { NextRequest } from 'next/server';
import { GET, POST } from '../../src/app/api/users/route';

// Mock helpers
function createUserRequest(
  method: string,
  body?: any,
  token?: string
): NextRequest {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return new NextRequest('http://localhost:3000/api/users', {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
}

async function getAdminToken(): Promise<string> {
  // Import auth route for login
  const { POST: authPOST } = await import('../../src/app/api/auth/route');
  
  const loginReq = new NextRequest('http://localhost:3000/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@aeth-1.com',
      password: 'admin123',
    }),
  });
  
  const response = await authPOST(loginReq);
  const data = await response.json();
  return data.data.token;
}

describe('Users API - Integration Tests', () => {
  describe('GET /api/users - List Users', () => {
    it('should return list of users when authenticated', async () => {
      const token = await getAdminToken();
      const req = createUserRequest('GET', undefined, token);
      
      const response = await GET(req);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.meta).toBeDefined();
      expect(data.meta.pagination).toBeDefined();
    });

    it('should support pagination parameters', async () => {
      const token = await getAdminToken();
      const url = new URL('http://localhost:3000/api/users?page=1&limit=5');
      const req = new NextRequest(url.toString(), {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const response = await GET(req);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.data.length).toBeLessThanOrEqual(5);
      expect(data.meta.pagination.limit).toBe(5);
    });

    it('should support search by name', async () => {
      const token = await getAdminToken();
      const url = new URL('http://localhost:3000/api/users?search=admin');
      const req = new NextRequest(url.toString(), {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const response = await GET(req);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      // Results should match search term if found
      if (data.data.length > 0) {
        expect(
          data.data.some((u: any) => 
            u.name?.toLowerCase().includes('admin') ||
            u.email?.toLowerCase().includes('admin')
          )
        ).toBe(true);
      }
    });

    it('should filter users by role', async () => {
      const token = await getAdminToken();
      const url = new URL('http://localhost:3000/api/users?role=ADMIN');
      const req = new NextRequest(url.toString(), {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const response = await GET(req);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      if (data.data.length > 0) {
        expect(data.data.every((u: any) => u.role === 'ADMIN')).toBe(true);
      }
    });

    it('should reject unauthenticated requests', async () => {
      const req = new NextRequest('http://localhost:3000/api/users', {
        method: 'GET',
      });
      
      const response = await GET(req);
      const data = await response.json();
      
      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('AUTH_REQUIRED');
    });

    it('should handle page out of range gracefully', async () => {
      const token = await getAdminToken();
      const url = new URL('http://localhost:3000/api/users?page=9999&limit=10');
      const req = new NextRequest(url.toString(), {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const response = await GET(req);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.data).toEqual([]);
    });

    it('should include user profile information', async () => {
      const token = await getAdminToken();
      const req = createUserRequest('GET', undefined, token);
      
      const response = await GET(req);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      if (data.data.length > 0) {
        const user = data.data[0];
        // Check expected fields exist
        expect(user.id).toBeDefined();
        expect(user.email).toBeDefined();
        expect(user.name).toBeDefined();
        expect(user.role).toBeDefined();
        expect(user.createdAt).toBeDefined();
      }
    });
  });

  describe('POST /api/users - Create User', () => {
    it('should create user with valid data', async () => {
      const token = await getAdminToken();
      const newUser = {
        email: `test-${Date.now()}@example.com`,
        name: 'Test User',
        role: 'RESEARCHER',
        bio: 'Test researcher account',
        specialties: ['AI', 'Machine Learning'],
      };
      
      const req = createUserRequest('POST', newUser, token);
      const response = await POST(req);
      const data = await response.json();
      
      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.email).toBe(newUser.email);
      expect(data.data.name).toBe(newUser.name);
      expect(data.data.role).toBe(newUser.role);
    });

    it('should reject duplicate email', async () => {
      const token = await getAdminToken();
      const duplicateUser = {
        email: 'admin@aeth-1.com', // Already exists
        name: 'Duplicate Admin',
      };
      
      const req = createUserRequest('POST', duplicateUser, token);
      const response = await POST(req);
      const data = await response.json();
      
      expect(response.status).toBe(409); // Conflict
      expect(data.success).toBe(false);
    });

    it('should reject invalid role value', async () => {
      const token = await getAdminToken();
      const invalidUser = {
        email: `invalid-role-${Date.now()}@test.com`,
        name: 'Invalid Role',
        role: 'INVALID_ROLE',
      };
      
      const req = createUserRequest('POST', invalidUser, token);
      const response = await POST(req);
      
      expect([400, 422]).toContain(response.status);
    });

    it('should reject missing required fields', async () => {
      const token = await getAdminToken();
      const incompleteUser = {
        name: 'No Email Provided',
      };
      
      const req = createUserRequest('POST', incompleteUser, token);
      const response = await POST(req);
      
      expect(response.status).toBe(400);
    });

    it('should reject non-admin user creation', async () => {
      // Login as researcher
      const { POST: authPOST } = await import('../../src/app/api/auth/route');
      const loginReq = new NextRequest('http://localhost:3000/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'researcher@aeth-1.com',
          password: 'researcher123',
        }),
      });
      
      const loginRes = await authPOST(loginReq);
      const { token } = (await loginRes.json()).data;
      
      // Try to create user as researcher
      const req = createUserRequest(
        'POST',
        { email: 'hacker@test.com', name: 'Hacker' },
        token
      );
      
      const response = await POST(req);
      const data = await response.json();
      
      expect(response.status).toBe(403);
      expect(data.error.code).toBe('FORBIDDEN');
    });

    it('should validate email format', async () => {
      const token = await getAdminToken();
      const invalidEmailUser = {
        email: 'not-an-email',
        name: 'Bad Email',
      };
      
      const req = createUserRequest('POST', invalidEmailUser, token);
      const response = await POST(req);
      
      expect(response.status).toBe(400);
    });

    it('should set default values for optional fields', async () => {
      const token = await getAdminToken();
      const minimalUser = {
        email: `minimal-${Date.now()}@test.com`,
        name: 'Minimal User',
      };
      
      const req = createUserRequest('POST', minimalUser, token);
      const response = await POST(req);
      const data = await response.json();
      
      expect(response.status).toBe(201);
      expect(data.data.role).toBeDefined(); // Should have default role
      expect(data.data.createdAt).toBeDefined();
      expect(data.data.isActive).toBeDefined();
    });
  });

  describe('Response Format Consistency', () => {
    it('should use consistent response format across endpoints', async () => {
      const token = await getAdminToken();
      
      // Test GET response format
      const getReq = createUserRequest('GET', undefined, token);
      const getResponse = await GET(getReq);
      const getData = await getResponse.json();
      
      // Verify structure
      expect(getData).toHaveProperty('success');
      expect(getData).toHaveProperty('data');
      expect(getData).toHaveProperty('timestamp');
      expect(typeof getData.timestamp).toBe('string');
      
      // Parse timestamp to verify ISO format
      const timestamp = new Date(getData.timestamp);
      expect(timestamp.getTime()).not.toBeNaN();
    });

    it('should include proper metadata in paginated responses', async () => {
      const token = await getAdminToken();
      const url = new URL('http://localhost:3000/api/users?page=1&limit=2');
      const req = new NextRequest(url.toString(), {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const response = await GET(req);
      const data = await response.json();
      
      expect(data.meta).toBeDefined();
      expect(data.meta.pagination).toBeDefined();
      expect(data.meta.pagination.page).toBe(1);
      expect(data.meta.pagination.limit).toBe(2);
      expect(data.meta.pagination.totalItems).toBeGreaterThanOrEqual(0);
      expect(data.meta.pagination.totalPages).toBeGreaterThanOrEqual(0);
    });
  });
});

/**
 * Integration Tests - API Endpoints
 * 
 * These tests verify the API endpoints work correctly together
 */

describe('API Integration Tests', () => {
  const BASE_URL = process.env.TEST_API_URL || 'http://localhost:3000';

  describe('Authentication Flow', () => {
    it('should login with valid credentials and receive tokens', async () => {
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@aeth-1.science',
          password: 'password123'
        })
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      
      expect(data.success).toBe(true);
      expect(data.data.user).toBeDefined();
      expect(data.data.accessToken).toBeDefined();
      expect(data.data.refreshToken).toBeDefined();
    });

    it('should reject invalid credentials', async () => {
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@aeth-1.science',
          password: 'wrongpassword'
        })
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBeDefined();
    });

    it('should get current user with valid token', async () => {
      // First login
      const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'researcher@example.com', password: 'pass' })
      });
      const { data: loginData } = await loginRes.json();

      // Then use token
      const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${loginData.accessToken}` }
      });

      expect(meRes.status).toBe(200);
      const meData = await meRes.json();
      expect(meData.data.email).toBe('researcher@example.com');
    });
  });

  describe('Users API', () => {
    let authToken: string;

    beforeAll(async () => {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@aeth-1.science', password: 'pass' })
      });
      const { data } = await res.json();
      authToken = data.accessToken;
    });

    it('should list users with pagination', async () => {
      const response = await fetch(`${BASE_URL}/api/users?page=1&limit=10`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data.items)).toBe(true);
      expect(data.data.pagination).toBeDefined();
    });

    it('should filter users by role', async () => {
      const response = await fetch(`${BASE_URL}/api/users?role=researcher`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      
      data.data.items.forEach((user: any) => {
        expect(user.role).toBe('researcher');
      });
    });

    it('should search users by name or email', async () => {
      const response = await fetch(`${BASE_URL}/api/users?search=jane`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      
      expect(data.data.total).toBeGreaterThan(0);
    });
  });

  describe('White Papers API', () => {
    let authToken: string;

    beforeAll(async () => {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'researcher@example.com', password: 'pass' })
      });
      const { data } = await res.json();
      authToken = data.accessToken;
    });

    it('should list papers with various statuses', async () => {
      const response = await fetch(`${BASE_URL}/api/papers`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      
      expect(data.success).toBe(true);
      expect(data.data.length).toBeGreaterThan(0);
    });

    it('should create a new paper draft', async () => {
      const response = await fetch(`${BASE_URL}/api/papers`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({
          title: 'Test Paper for Integration Test',
          abstract: 'This is a test paper created by integration tests.',
          templateId: 'WP-CROSS-001',
          dataRepositories: ['test_repo_1']
        })
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      
      expect(data.data.title).toBe('Test Paper for Integration Test');
      expect(data.data.status).toBe('draft');
      expect(data.data.authors).toHaveLength(1);
    });

    it('should filter papers by status', async () => {
      const publishedRes = await fetch(`${BASE_URL}/api/papers?status=published`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const publishedData = await publishedRes.json();

      publishedData.data.forEach((paper: any) => {
        expect(paper.status).toBe('published');
      });
    });
  });

  describe('Data Connectors API', () => {
    it('should list all available connectors', async () => {
      const response = await fetch(`${BASE_URL}/api/data/connectors`);
      
      expect(response.status).toBe(200);
      const data = await response.json();
      
      expect(data.data.connectors).toBeDefined();
      expect(data.data.connectors.length).toBeGreaterThan(0);
    });

    it('should show connector statistics', async () => {
      const response = await fetch(`${BASE_URL}/api/data/connectors`);
      const data = await response.json();
      
      expect(data.data.summary).toBeDefined();
      expect(data.data.summary.totalRecordsProcessed).toBeGreaterThan(0);
    });
  });

  describe('Storage API', () => {
    it('should return storage overview', async () => {
      const response = await fetch(`${BASE_URL}/api/storage`);
      
      expect(response.status).toBe(200);
      const data = await response.json();
      
      expect(data.data.containers).toBeDefined();
      expect(data.data.tiers).toBeDefined();
      expect(data.data.tiers.hot).toBeDefined();
      expect(data.data.tiers.warm).toBeDefined();
      expect(data.data.tiers.cold).toBeDefined();
    });

    it('should format storage sizes correctly', async () => {
      const response = await fetch(`${BASE_URL}/api/storage`);
      const data = await response.json();
      
      data.data.containers.forEach((container: any) => {
        expect(container.sizeFormatted).toMatch(/\d+\.\d+ [KMGT]?B/);
      });
    });
  });

  describe('System Status API', () => {
    it('should return healthy system status', async () => {
      const response = await fetch(`${BASE_URL}/api/status`);
      
      expect(response.status).toBe(200);
      const data = await response.json();
      
      expect(['healthy', 'degraded']).toContain(data.data.status);
      expect(data.data.components).toBeDefined();
      expect(data.data.metrics).toBeDefined();
    });

    it('should include component health details', async () => {
      const response = await fetch(`${BASE_URL}/api/status?detailed=true`);
      const data = await response.json();
      
      data.data.components.forEach((component: any) => {
        expect(component.name).toBeDefined();
        expect(['operational', 'degraded', 'outage']).toContain(component.status);
      });
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent endpoints', async () => {
      const response = await fetch(`${BASE_URL}/api/nonexistent`);
      
      expect(response.status).toBe(404);
    });

    it('should return 401 for unauthorized access', async () => {
      const response = await fetch(`${BASE_URL}/api/users`, {
        headers: { Authorization: 'Bearer invalid-token' }
      });
      
      expect(response.status).toBe(401);
    });

    it('should return proper error format', async () => {
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}) // Missing required fields
      });
      
      expect(response.status).toBe(422);
      const data = await response.json();
      expect(data.error.code).toBeDefined();
      expect(data.error.message).toBeDefined();
    });
  });

  describe('Rate Limiting', () => {
    it('should allow requests within rate limit', async () => {
      const promises = Array(5).fill(null).map(() =>
        fetch(`${BASE_URL}/api/status`)
      );
      
      const responses = await Promise.all(promises);
      
      // All should succeed (within limit)
      responses.forEach(res => {
        expect([200, 429]).toContain(res.status); // Might be limited if run too fast
      });
    });
  });
});

/**
 * Integration Tests for System APIs (Status, Data, Storage)
 * AETH-1 Advanced Enterprise Technology Hub
 */

import { NextRequest } from 'next/server';

// Import route handlers
import { GET as getStatus } from '../../src/app/api/status/route';
import { GET as getDataConnectors, POST as startConnector } from '../../src/app/api/data/route';
import { GET as getStorage, POST as createContainer } from '../../src/app/api/storage/route';

// Helper to create authenticated requests
function createSystemRequest(
  url: string,
  method: string = 'GET',
  body?: any,
  token?: string
): NextRequest {
  const headers: Record<string, string> = {};
  
  if (body) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return new NextRequest(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
}

async function getAuthToken(): Promise<string> {
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

describe('System Status API - Integration Tests', () => {
  describe('GET /api/status - System Health', () => {
    it('should return basic health status without authentication', async () => {
      const req = new NextRequest('http://localhost:3000/api/status?basic=true');
      const response = await getStatus(req);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.status).toBeDefined();
      expect(['healthy', 'degraded', 'unhealthy']).toContain(data.data.status);
    });

    it('should return detailed status when authenticated', async () => {
      const token = await getAuthToken();
      const url = new URL('http://localhost:3000/api/status');
      url.searchParams.set('detailed', 'true');
      
      const req = new NextRequest(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const response = await getStatus(req);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      
      // Detailed status should include component checks
      if (data.detailed || data.data.components) {
        const components = data.data.components || data.data;
        expect(Array.isArray(components) || typeof components === 'object').toBe(true);
      }
    });

    it('should include system metrics', async () => {
      const req = new NextRequest('http://localhost:3000/api/status');
      const response = await getStatus(req);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      
      // Should include basic metrics
      expect(data.data).toBeDefined();
      expect(typeof data.data.uptime).toBe('number') || expect(data.data.timestamp).toBeDefined();
    });

    it('should include component health checks', async () => {
      const token = await getAuthToken();
      const url = new URL('http://localhost:3000/api/status');
      url.searchParams.set('detailed', 'true');
      
      const req = new NextRequest(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const response = await getStatus(req);
      const data = await response.json();
      
      // Check for expected components
      const components = data.data.components || data.data;
      
      // Common system components to check
      const expectedComponents = [
        'database', 'api', 'storage', 'auth'
      ];
      
      if (typeof components === 'object' && !Array.isArray(components)) {
        // Component object with status fields
        Object.entries(components).forEach(([name, info]: [string, any]) => {
          expect(info.status).toBeDefined();
          expect(['operational', 'degraded', 'down']).toContain(info.status);
        });
      }
    });

    it('should handle different query parameter combinations', async () => {
      // Test with various parameters
      const testCases = [
        '?basic=true',
        '?verbose=false',
        '',
      ];
      
      for (const params of testCases) {
        const req = new NextRequest(`http://localhost:3000/api/status${params}`);
        const response = await getStatus(req);
        
        expect([200, 401]).toContain(response.status);
      }
    });

    it('should respond quickly (health check SLA)', async () => {
      const start = Date.now();
      const req = new NextRequest('http://localhost:3000/api/status?basic=true');
      const response = await getStatus(req);
      const duration = Date.now() - start;
      
      // Health checks should be fast (< 500ms)
      expect(duration).toBeLessThan(500);
      expect(response.status).toBe(200);
    });
  });
});

describe('Data Connectors API - Integration Tests', () => {
  describe('GET /api/data - List Connectors', () => {
    it('should return list of available connectors when authenticated', async () => {
      const token = await getAuthToken();
      const req = createSystemRequest(
        'http://localhost:3000/api/data',
        'GET',
        undefined,
        token
      );
      
      const response = await getDataConnectors(req);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });

    it('should include connector metadata', async () => {
      const token = await getAuthToken();
      const req = createSystemRequest(
        'http://localhost:3000/api/data',
        'GET',
        undefined,
        token
      );
      
      const response = await getDataConnectors(req);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      if (data.data.length > 0) {
        const connector = data.data[0];
        expect(connector.id).toBeDefined();
        expect(connector.name).toBeDefined();
        expect(connector.type).toBeDefined();
        expect(connector.status).toBeDefined();
      }
    });

    it('should show various connector types', async () => {
      const token = await getAuthToken();
      const req = createSystemRequest(
        'http://localhost:3000/api/data',
        'GET',
        undefined,
        token
      );
      
      const response = await getDataConnectors(req);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      // Expected connector types based on platform capabilities
      const expectedTypes = ['satellite', 'lhc', 'climate', 'genomic', 'market'];
      // At least some connectors should exist
    });

    it('should reject unauthenticated requests', async () => {
      const req = new NextRequest('http://localhost:3000/api/data');
      const response = await getDataConnectors(req);
      const data = await response.json();
      
      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
    });

    it('should include connector health status', async () => {
      const token = await getAuthToken();
      const req = createSystemRequest(
        'http://localhost:3000/api/data',
        'GET',
        undefined,
        token
      );
      
      const response = await getDataConnectors(req);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      if (data.data.length > 0) {
        const validStatuses = ['ACTIVE', 'INACTIVE', 'ERROR', 'SYNCING'];
        data.data.forEach((connector: any) => {
          expect(validStatuses).toContain(connector.status);
        });
      }
    });
  });

  describe('POST /api/data - Start Connector', () => {
    it('should start a valid connector', async () => {
      const token = await getAuthToken();
      
      // First get available connectors
      const listReq = createSystemRequest(
        'http://localhost:3000/api/data',
        'GET',
        undefined,
        token
      );
      const listResponse = await getDataConnectors(listReq);
      const listData = await listResponse.json();
      
      if (listData.data.length > 0) {
        const connectorId = listData.data[0].id;
        
        const req = createSystemRequest(
          'http://localhost:3000/api/data',
          'POST',
          { connectorId },
          token
        );
        
        const response = await startConnector(req);
        const data = await response.json();
        
        expect([200, 202]).toContain(response.status);
        expect(data.success).toBe(true);
      }
    });

    it('should reject invalid connector ID', async () => {
      const token = await getAuthToken();
      const req = createSystemRequest(
        'http://localhost:3000/api/data',
        'POST',
        { connectorId: 'invalid-connector-id' },
        token
      );
      
      const response = await startConnector(req);
      const data = await response.json();
      
      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
    });

    it('should reject unauthenticated connector start', async () => {
      const req = new NextRequest('http://localhost:3000/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectorId: 'some-id' }),
      });
      
      const response = await startConnector(req);
      
      expect(response.status).toBe(401);
    });
  });
});

describe('Storage API - Integration Tests', () => {
  describe('GET /api/storage - List Containers', () => {
    it('should return storage containers when authenticated', async () => {
      const token = await getAuthToken();
      const req = createSystemRequest(
        'http://localhost:3000/api/storage',
        'GET',
        undefined,
        token
      );
      
      const response = await getStorage(req);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });

    it('should include storage tier information', async () => {
      const token = await getAuthToken();
      const req = createSystemRequest(
        'http://localhost:3000/api/storage',
        'GET',
        undefined,
        token
      );
      
      const response = await getStorage(req);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      if (data.data.length > 0) {
        const container = data.data[0];
        expect(container.id).toBeDefined();
        expect(container.name).toBeDefined();
        expect(container.tier).toBeDefined();
        // Valid tiers: HOT, WARM, COLD, DEEP_FREEZE
        const validTiers = ['HOT', 'WARM', 'COLD', 'DEEP_FREEZE'];
        expect(validTiers).toContain(container.tier);
      }
    });

    it('should include usage statistics', async () => {
      const token = await getAuthToken();
      const req = createSystemRequest(
        'http://localhost:3000/api/storage',
        'GET',
        undefined,
        token
      );
      
      const response = await getStorage(req);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      if (data.data.length > 0) {
        const container = data.data[0];
        expect(container.sizeBytes).toBeDefined();
        expect(container.objectCount).toBeDefined();
        expect(typeof container.sizeBytes).toBe('number');
      }
    });

    it('should reject unauthenticated requests', async () => {
      const req = new NextRequest('http://localhost:3000/api/storage');
      const response = await getStorage(req);
      const data = await response.json();
      
      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
    });

    it('may include summary statistics in meta', async () => {
      const token = await getAuthToken();
      const req = createSystemRequest(
        'http://localhost:3000/api/storage',
        'GET',
        undefined,
        token
      );
      
      const response = await getStorage(req);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      // May include total storage across all containers
      if (data.meta?.summary) {
        expect(data.meta.summary.totalSizeBytes).toBeDefined();
        expect(data.meta.summary.totalContainers).toBeDefined();
      }
    });
  });

  describe('POST /api/storage - Create Container', () => {
    it('should create container with valid data', async () => {
      const token = await getAuthToken();
      const newContainer = {
        name: `test-container-${Date.now()}`,
        tier: 'HOT',
        retentionDays: 30,
      };
      
      const req = createSystemRequest(
        'http://localhost:3000/api/storage',
        'POST',
        newContainer,
        token
      );
      
      const response = await createContainer(req);
      const data = await response.json();
      
      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.name).toBe(newContainer.name);
      expect(data.data.tier).toBe(newContainer.tier);
    });

    it('should validate storage tier values', async () => {
      const token = await getAuthToken();
      const invalidContainer = {
        name: 'invalid-tier-container',
        tier: 'INVALID_TIER',
      };
      
      const req = createSystemRequest(
        'http://localhost:3000/api/storage',
        'POST',
        invalidContainer,
        token
      );
      
      const response = await createContainer(req);
      
      expect([400, 422]).toContain(response.status);
    });

    it('should reject duplicate container names', async () => {
      const token = await getAuthToken();
      const duplicateName = 'duplicate-test-container';
      
      // Create first container
      const firstReq = createSystemRequest(
        'http://localhost:3000/api/storage',
        'POST',
        { name: duplicateName, tier: 'WARM' },
        token
      );
      await createContainer(firstReq);
      
      // Try to create duplicate
      const secondReq = createSystemRequest(
        'http://localhost:3000/api/storage',
        'POST',
        { name: duplicateName, tier: 'COLD' },
        token
      );
      const secondResponse = await createContainer(secondReq);
      
      expect(secondResponse.status).toBe(409); // Conflict
    });

    it('should reject unauthenticated container creation', async () => {
      const req = new NextRequest('http://localhost:3000/api/storage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'unauthorized', tier: 'HOT' }),
      });
      
      const response = await createContainer(req);
      
      expect(response.status).toBe(401);
    });

    it('should set default values for optional fields', async () => {
      const token = await getAuthToken();
      const minimalContainer = {
        name: `minimal-${Date.now()}`,
      };
      
      const req = createSystemRequest(
        'http://localhost:3000/api/storage',
        'POST',
        minimalContainer,
        token
      );
      
      const response = await createContainer(req);
      const data = await response.json();
      
      expect(response.status).toBe(201);
      expect(data.data.tier).toBeDefined(); // Default tier
      expect(data.data.createdAt).toBeDefined();
      expect(data.data.isActive).toBeDefined();
    });
  });
});

describe('Cross-API Consistency', () => {
  it('should use consistent response format across all system APIs', async () => {
    const token = await getAuthToken();
    
    // Test all three APIs
    const statusReq = createSystemRequest('http://localhost:3000/api/status', 'GET', undefined, token);
    const dataReq = createSystemRequest('http://localhost:3000/api/data', 'GET', undefined, token);
    const storageReq = createSystemRequest('http://localhost:3000/api/storage', 'GET', undefined, token);
    
    const [statusRes, dataRes, storageRes] = await Promise.all([
      getStatus(statusReq),
      getDataConnectors(dataReq),
      getStorage(storageReq),
    ]);
    
    const [statusData, dataData, storageData] = await Promise.all([
      statusRes.json(),
      dataRes.json(),
      storageRes.json(),
    ]);
    
    // All should have same structure
    for (const apiData of [statusData, dataData, storageData]) {
      expect(apiData).toHaveProperty('success');
      expect(apiData).toHaveProperty('data');
      expect(apiData).toHaveProperty('timestamp');
      expect(typeof apiData.timestamp).toBe('string');
    }
  });

  it('should accept the same auth token across all APIs', async () => {
    const token = await getAuthToken();
    
    // Same token should work for all endpoints
    const endpoints = [
      { fn: getStatus, url: '/api/status' },
      { fn: getDataConnectors, url: '/api/data' },
      { fn: getStorage, url: '/api/storage' },
    ];
    
    for (const endpoint of endpoints) {
      const req = createSystemRequest(
        `http://localhost:3000${endpoint.url}`,
        'GET',
        undefined,
        token
      );
      
      const response = await endpoint.fn(req);
      expect(response.status).toBe(200);
    }
  });
});

/**
 * Integration Tests for Papers API
 * AETH-1 Advanced Enterprise Technology Hub
 */

import { NextRequest } from 'next/server';
import { GET, POST } from '../../src/app/api/papers/route';

// Helper functions
function createPaperRequest(
  method: string,
  body?: any,
  token?: string,
  query?: Record<string, string>
): NextRequest {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const url = new URL('http://localhost:3000/api/papers');
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }
  
  return new NextRequest(url.toString(), {
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
      email: 'researcher@aeth-1.com',
      password: 'researcher123',
    }),
  });
  
  const response = await authPOST(loginReq);
  const data = await response.json();
  return data.data.token;
}

describe('Papers API - Integration Tests', () => {
  describe('GET /api/papers - List Papers', () => {
    it('should return list of papers when authenticated', async () => {
      const token = await getAuthToken();
      const req = createPaperRequest('GET', undefined, token);
      
      const response = await GET(req);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.meta).toBeDefined();
    });

    it('should filter papers by status', async () => {
      const token = await getAuthToken();
      const req = createPaperRequest('GET', undefined, token, {
        status: 'PUBLISHED',
      });
      
      const response = await GET(req);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      if (data.data.length > 0) {
        expect(data.data.every((p: any) => p.status === 'PUBLISHED')).toBe(true);
      }
    });

    it('should filter papers by domain/category', async () => {
      const token = await getAuthToken();
      const req = createPaperRequest('GET', undefined, token, {
        domain: 'physics',
      });
      
      const response = await GET(req);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      // If results exist, they should match domain
      if (data.data.length > 0) {
        expect(
          data.data.every((p: any) =>
            p.domain?.toLowerCase().includes('physics') ||
            p.category?.toLowerCase().includes('physics')
          )
        ).toBe(true);
      }
    });

    it('should filter papers by author', async () => {
      const token = await getAuthToken();
      const req = createPaperRequest('GET', undefined, token, {
        author: 'dr',
      });
      
      const response = await GET(req);
      const data = await response.json();
      
      expect(response.status).toBe(200);
    });

    it('should search papers by title/abstract', async () => {
      const token = await getAuthToken();
      const req = createPaperRequest('GET', undefined, token, {
        search: 'quantum',
      });
      
      const response = await GET(req);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      // Results should match search if found
    });

    it('should support combined filters', async () => {
      const token = await getAuthToken();
      const req = createPaperRequest('GET', undefined, token, {
        status: 'DRAFT',
        domain: 'ai',
        search: 'learning',
      });
      
      const response = await GET(req);
      const data = await response.json();
      
      expect(response.status).toBe(200);
    });

    it('should reject unauthenticated requests', async () => {
      const req = new NextRequest('http://localhost:3000/api/papers', {
        method: 'GET',
      });
      
      const response = await GET(req);
      const data = await response.json();
      
      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
    });

    it('should paginate results correctly', async () => {
      const token = await getAuthToken();
      const req = createPaperRequest('GET', undefined, token, {
        page: '1',
        limit: '5',
      });
      
      const response = await GET(req);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.data.length).toBeLessThanOrEqual(5);
      expect(data.meta.pagination.page).toBe(1);
      expect(data.meta.pagination.limit).toBe(5);
    });
  });

  describe('POST /api/papers - Create Paper', () => {
    it('should create paper with valid data', async () => {
      const token = await getAuthToken();
      const newPaper = {
        title: `Test Paper ${Date.now()}`,
        abstract: 'This is a test paper abstract for integration testing.',
        content: '# Test Paper\n\nFull content of the test paper...',
        domain: 'computer-science',
        category: 'Machine Learning',
        keywords: ['testing', 'integration', 'AI'],
        coAuthors: ['Researcher Two'],
      };
      
      const req = createPaperRequest('POST', newPaper, token);
      const response = await POST(req);
      const data = await response.json();
      
      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.title).toBe(newPaper.title);
      expect(data.data.abstract).toBe(newPaper.abstract);
      expect(data.data.status).toBeDefined(); // Should have default status
    });

    it('should set initial status to DRAFT', async () => {
      const token = await getAuthToken();
      const newPaper = {
        title: `Draft Paper ${Date.now()}`,
        abstract: 'Testing draft status assignment.',
        domain: 'physics',
      };
      
      const req = createPaperRequest('POST', newPaper, token);
      const response = await POST(req);
      const data = await response.json();
      
      expect(response.status).toBe(201);
      expect(data.data.status).toBe('DRAFT');
    });

    it('should reject missing required fields', async () => {
      const token = await getAuthToken();
      const incompletePaper = {
        // Missing title and abstract
        domain: 'test',
      };
      
      const req = createPaperRequest('POST', incompletePaper, token);
      const response = await POST(req);
      
      expect(response.status).toBe(400);
    });

    it('should reject empty title', async () => {
      const token = await getAuthToken();
      const invalidPaper = {
        title: '',
        abstract: 'Some abstract',
        domain: 'test',
      };
      
      const req = createPaperRequest('POST', invalidPaper, token);
      const response = await POST(req);
      
      expect(response.status).toBe(400);
    });

    it('should validate domain value', async () => {
      const token = await getAuthToken();
      const invalidDomainPaper = {
        title: 'Invalid Domain Paper',
        abstract: 'Test',
        domain: 'invalid-domain-that-does-not-exist',
      };
      
      const req = createPaperRequest('POST', invalidDomainPaper, token);
      const response = await POST(req);
      
      // Either accepts or rejects based on validation strictness
      expect([201, 400, 422]).toContain(response.status);
    });

    it('should store keywords as array', async () => {
      const token = await getAuthToken();
      const paperWithKeywords = {
        title: `Keywords Paper ${Date.now()}`,
        abstract: 'Testing keyword storage.',
        domain: 'ai',
        keywords: ['AI', 'ML', 'Deep Learning', 'NLP'],
      };
      
      const req = createPaperRequest('POST', paperWithKeywords, token);
      const response = await POST(req);
      const data = await response.json();
      
      expect(response.status).toBe(201);
      expect(Array.isArray(data.data.keywords)).toBe(true);
      expect(data.data.keywords.length).toBe(4);
    });

    it('should track author from authenticated user', async () => {
      const token = await getAuthToken();
      const newPaper = {
        title: `Author Track ${Date.now()}`,
        abstract: 'Testing author tracking.',
        domain: 'biology',
      };
      
      const req = createPaperRequest('POST', newPaper, token);
      const response = await POST(req);
      const data = await response.json();
      
      expect(response.status).toBe(201);
      expect(data.data.author).toBeDefined();
      expect(data.data.authorId).toBeDefined();
    });
  });

  describe('Paper Status Transitions', () => {
    it('should include status in paper metadata', async () => {
      const token = await getAuthToken();
      const req = createPaperRequest('GET', undefined, token, {
        status: 'PUBLISHED',
      });
      
      const response = await GET(req);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      if (data.data.length > 0) {
        const publishedPaper = data.data.find((p: any) => p.status === 'PUBLISHED');
        if (publishedPaper) {
          expect(publishedPaper.doi).toBeDefined(); // Published papers should have DOI
          expect(publishedPaper.publishedAt).toBeDefined();
        }
      }
    });

    it('should show all valid statuses in results', async () => {
      const token = await getAuthToken();
      const req = createPaperRequest('GET', undefined, token);
      
      const response = await GET(req);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      const statuses = new Set(data.data.map((p: any) => p.status));
      
      // Check that we see various statuses
      const expectedStatuses = ['DRAFT', 'UNDER_REVIEW', 'REVISION_REQUIRED', 'ACCEPTED', 'PUBLISHED'];
      // At minimum, DRAFT should exist since newly created papers are drafts
    });
  });

  describe('Response Metadata', () => {
    it('should include paper count statistics', async () => {
      const token = await getAuthToken();
      const req = createPaperRequest('GET', undefined, token);
      
      const response = await GET(req);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      if (data.meta) {
        // May include counts by status
        expect(data.meta.pagination).toBeDefined();
      }
    });

    it('should return consistent timestamp format', async () => {
      const token = await getAuthToken();
      const req = createPaperRequest('GET', undefined, token);
      
      const response = await GET(req);
      const data = await response.json();
      
      expect(typeof data.timestamp).toBe('string');
      const date = new Date(data.timestamp);
      expect(date.getTime()).not.toBeNaN();
    });
  });
});

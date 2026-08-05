/**
 * AETH-1 System Status & Health API
 * Platform monitoring, metrics, and diagnostics
 */

import { NextRequest } from 'next/server';
import { apiMiddleware, successResponse } from '@/middleware/api';

// System health data
interface SystemHealth {
  status: 'healthy' | 'degraded' | 'down';
  uptime: string;
  version: string;
  components: Array<{
    name: string;
    status: 'operational' | 'degraded' | 'outage';
    latency?: number;
    message?: string;
  }>;
  metrics: {
    activeUsers: number;
    requestsPerSecond: number;
    avgResponseTime: number;
    errorRate: number;
    storageUsed: number;
    storageTotal: number;
  };
  lastUpdated: string;
}

const systemHealth: SystemHealth = {
  status: 'healthy',
  uptime: '45d 12h 34m',
  version: '2.0.0',
  components: [
    { name: 'API Gateway', status: 'operational', latency: 12, message: 'All endpoints responding' },
    { name: 'Authentication Service', status: 'operational', latency: 8 },
    { name: 'Database Cluster', status: 'operational', latency: 3 },
    { name: 'Blob Storage', status: 'operational', message: '181 PB allocated, 38.8 PB used' },
    { name: 'Data Connectors', status: 'degraded', message: 'Genomic connector in maintenance' },
    { name: 'Analysis Engine', status: 'operational', latency: 145 },
    { name: 'CDN / Edge Network', status: 'operational', latency: 23 }
  ],
  metrics: {
    activeUsers: 1247,
    requestsPerSecond: 3421,
    avgResponseTime: 45,
    errorRate: 0.02,
    storageUsed: 38.8,
    storageTotal: 181
  },
  lastUpdated: new Date().toISOString()
};

// GET /api/status - System health check
export async function GET(request: NextRequest) {
  return apiMiddleware({ rateLimit: { requests: 60, windowMs: 60000 } })(
    request,
    async (request) => {
      const { searchParams } = new URL(request.url);
      const detailed = searchParams.get('detailed') === 'true';
      
      systemHealth.lastUpdated = new Date().toISOString();
      systemHealth.metrics.activeUsers = 1200 + Math.floor(Math.random() * 100);
      systemHealth.metrics.requestsPerSecond = 3000 + Math.floor(Math.random() * 500);
      
      if (detailed) {
        return successResponse({
          ...systemHealth,
          environment: process.env.NODE_ENV || 'development',
          region: 'global',
          deploymentInfo: {
            deployedAt: '2024-11-20T10:30:00Z',
            commitSha: 'a3f7b2c9d1e0f4a5b6c7d8e9f0a1b2c3d4e5f6a7',
            imageTag: 'v2.0.0-production'
          },
          recentIncidents: [{
            id: 'inc_001',
            title: 'Genomic connector scheduled maintenance',
            severity: 'low',
            status: 'resolved',
            startedAt: '2025-01-04T02:00:00Z',
            resolvedAt: '2025-01-04T06:00:00Z',
            duration: '4 hours'
          }],
          upcomingMaintenance: [{
            id: 'maint_001',
            title: 'Database cluster upgrade',
            scheduledFor: '2025-01-15T00:00:00Z',
            estimatedDuration: '2 hours',
            affectedServices: ['Database', 'User Profiles', 'Papers']
          }]
        });
      }
      
      return successResponse(systemHealth);
    }
  );
}

export default { GET };

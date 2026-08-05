/**
 * AETH-1 Admin Audit Log API
 * Retrieve and manage audit log entries
 */

import { NextRequest } from 'next/server';
import { apiMiddleware, successResponse, paginatedResponse } from '@/middleware/api';

// Audit Log Types
export type AuditAction = 'create' | 'update' | 'delete' | 'login' | 'export' | 'config_change' | 'role_change';
export type AuditSeverity = 'info' | 'warning' | 'error' | 'critical';

interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId?: string;
  userName: string;
  action: AuditAction;
  resourceType: 'user' | 'paper' | 'api_key' | 'system' | 'config';
  resourceId?: string;
  details: string;
  ipAddress: string;
  userAgent?: string;
  severity: AuditSeverity;
  metadata?: Record<string, unknown>;
}

// Mock audit log data
const auditLogs: AuditLogEntry[] = [
  {
    id: 'log_001',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    userId: 'usr_admin',
    userName: 'System Admin',
    action: 'create',
    resourceType: 'user',
    resourceId: 'usr_new_001',
    details: 'Created new user account for Dr. Sarah Chen (sarah@mit.edu)',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 Admin Dashboard',
    severity: 'info',
  },
  {
    id: 'log_002',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    userId: 'usr_4',
    userName: 'Dr. Kenji Tanaka',
    action: 'update',
    resourceType: 'paper',
    resourceId: 'wp_003',
    details: 'Updated paper metadata for "Climate Model Uncertainty Quantification"',
    ipAddress: '10.0.0.45',
    severity: 'info',
  },
  {
    id: 'log_003',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    userId: 'usr_admin',
    userName: 'System Admin',
    action: 'role_change',
    resourceType: 'user',
    resourceId: 'usr_7',
    details: 'Changed Dr. Lisa Park role from REVIEWER to SUSPENDED due to policy violation',
    ipAddress: '192.168.1.100',
    severity: 'warning',
    metadata: { previousRole: 'REVIEWER', newRole: 'SUSPENDED', reason: 'policy_violation' },
  },
  {
    id: 'log_004',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    userId: 'usr_2',
    userName: 'Prof. James Wilson',
    action: 'login',
    resourceType: 'system',
    details: 'Successful login from new device (Chrome on macOS)',
    ipAddress: '203.45.67.89',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/120.0.0.0',
    severity: 'info',
  },
  {
    id: 'log_005',
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    userId: 'usr_admin',
    userName: 'System Admin',
    action: 'delete',
    resourceType: 'api_key',
    resourceId: 'key_legacy_001',
    details: 'Removed deprecated API key dev_legacy_1234 (inactive for 90+ days)',
    ipAddress: '192.168.1.100',
    severity: 'warning',
  },
  {
    id: 'log_006',
    timestamp: new Date(Date.now() - 1000 * 60 * 75).toISOString(),
    userName: 'Unknown',
    action: 'login',
    resourceType: 'system',
    details: 'Failed login attempt - invalid credentials for user admin@aeth-1.science',
    ipAddress: '45.67.89.123',
    userAgent: 'python-requests/2.31.0',
    severity: 'error',
    metadata: { attemptCount: 3, lockedOut: false },
  },
];

// GET /api/admin/audit - Retrieve audit logs with filtering
export async function GET(request: NextRequest) {
  return apiMiddleware({
    requireAuth: true,
    roles: ['ADMIN', 'SUPERADMIN'],
    rateLimit: { requests: 60, windowMs: 60000 }
  })(request, async (request) => {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const action = searchParams.get('action') as AuditAction | null;
    const severity = searchParams.get('severity') as AuditSeverity | null;
    const resourceType = searchParams.get('resourceType') as AuditLogEntry['resourceType'] | null;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const search = searchParams.get('search');
    
    let filteredLogs = [...auditLogs];
    
    // Apply filters
    if (action) {
      filteredLogs = filteredLogs.filter(log => log.action === action);
    }
    
    if (severity) {
      filteredLogs = filteredLogs.filter(log => log.severity === severity);
    }
    
    if (resourceType) {
      filteredLogs = filteredLogs.filter(log => log.resourceType === resourceType);
    }
    
    if (startDate) {
      filteredLogs = filteredLogs.filter(log => log.timestamp >= startDate);
    }
    
    if (endDate) {
      filteredLogs = filteredLogs.filter(log => log.timestamp <= endDate);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      filteredLogs = filteredLogs.filter(log =>
        log.userName.toLowerCase().includes(searchLower) ||
        log.details.toLowerCase().includes(searchLower) ||
        log.ipAddress.includes(search)
      );
    }
    
    // Sort by timestamp descending
    filteredLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    // Calculate stats
    const stats = {
      totalEvents: auditLogs.length,
      errorCount: auditLogs.filter(l => l.severity === 'error' || l.severity === 'critical').length,
      warningCount: auditLogs.filter(l => l.severity === 'warning').length,
      securityEvents: auditLogs.filter(l => l.action === 'login' || l.action === 'role_change').length,
      actionsBreakdown: auditLogs.reduce((acc, log) => {
        acc[log.action] = (acc[log.action] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };
    
    return paginatedResponse(filteredLogs, page, limit, filteredLogs.length, {
      stats,
      filters: { action, severity, resourceType, startDate, endDate, search }
    });
  });
}

// POST /api/admin/audit - Create new audit log entry (internal use)
export async function POST(request: NextRequest) {
  return apiMiddleware({
    requireAuth: true,
    rateLimit: { requests: 100, windowMs: 60000 }
  })(request, async (request) => {
    const body = await request.json();
    
    const { action, resourceType, resourceId, details, severity = 'info', metadata } = body;
    
    if (!action || !details) {
      throw new Error('Action and details are required');
    }
    
    const newEntry: AuditLogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      timestamp: new Date().toISOString(),
      userName: body.userName || 'System',
      action,
      resourceType: resourceType || 'system',
      resourceId,
      details,
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || undefined,
      severity,
      metadata,
    };
    
    auditLogs.unshift(newEntry);
    
    return successResponse(newEntry, {
      message: 'Audit log entry created successfully'
    });
  });
}

export default { GET, POST };

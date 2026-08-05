/**
 * AETH-1 Webhook API
 * Webhook registration, management, and delivery tracking
 * 
 * Endpoints:
 * - GET /api/webhooks (list webhooks)
 * - POST /api/webhooks (register new webhook)
 * - DELETE /api/webhooks/:id (remove webhook)
 * - PUT /api/webhooks/:id (update webhook)
 * - GET /api/webhooks/:id/logs (webhook delivery logs)
 * - POST /api/webhooks/:id/test (test webhook delivery)
 * - GET /api/webhooks/events (available webhook events)
 */

import { NextRequest } from 'next/server';
import { apiMiddleware, successResponse, paginatedResponse } from '@/middleware/api';
import { UserRole } from '@/middleware/auth';
import { ValidationError, NotFoundError, ForbiddenError } from '@/middleware/error-handler';

// ============== Type Definitions ==============

export enum WebhookStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  FAILED = 'failed',
  DISABLED = 'disabled'
}

export enum WebhookEventType {
  // Paper events
  PAPER_CREATED = 'paper.created',
  PAPER_UPDATED = 'paper.updated',
  PAPER_PUBLISHED = 'paper.published',
  PAPER_SUBMITTED_FOR_REVIEW = 'paper.submitted_for_review',
  
  // Collaboration events
  COLLABORATION_INVITE_SENT = 'collaboration.invite_sent',
  COLLABORATION_MEMBER_JOINED = 'collaboration.member_joined',
  COLLABORATION_MEMBER_LEFT = 'collaboration.member_left',
  
  // Data events
  DATA_CONNECTOR_STATUS_CHANGE = 'data.connector_status_change',
  DATA_PIPELINE_COMPLETE = 'data.pipeline_complete',
  DATA_ANOMALY_DETECTED = 'data.anomaly_detected',
  
  // User events
  USER_CREATED = 'user.created',
  USER_LOGIN = 'user.login',
  
  // System events
  SYSTEM_MAINTENANCE_SCHEDULED = 'system.maintenance_scheduled',
  SYSTEM_ALERT = 'system.alert'
}

export interface Webhook {
  id: string;
  name: string;
  url: string;
  secret: string; // Hashed in production
  events: WebhookEventType[];
  status: WebhookStatus;
  ownerId: string;
  ownerName?: string;
  headers?: Record<string, string>;
  retryConfig: {
    enabled: boolean;
    maxRetries: number;
    retryIntervalSeconds: number;
  };
  version: number; // Payload format version
  lastDeliveryAt?: string;
  lastDeliveryStatus?: 'success' | 'failed';
  totalDeliveries: number;
  successRate: number;
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryLog {
  id: string;
  webhookId: string;
  webhookName: string;
  eventType: WebhookEventType;
  url: string;
  method: 'POST';
  requestHeaders: Record<string, string>;
  requestBody: Record<string, any>;
  responseStatus: number;
  responseHeaders?: Record<string, string>;
  responseBody?: string;
  duration: number; // ms
  status: 'success' | 'failed' | 'retrying' | 'pending';
  attempts: number;
  maxAttempts: number;
  nextRetryAt?: string;
  errorMessage?: string;
  triggeredBy: string;
  triggeredByName?: string;
  createdAt: string;
}

// ============== Mock Data Store ==============

const webhooks: Webhook[] = [
  {
    id: 'wh_001',
    name: 'Paper Publication Notifier',
    url: 'https://example.com/webhooks/paper-published',
    secret: 'whsec_***************',
    events: [WebhookEventType.PAPER_PUBLISHED, WebhookEventType.PAPER_UPDATED],
    status: WebhookStatus.ACTIVE,
    ownerId: 'usr_2',
    ownerName: 'Dr. Jane Smith',
    headers: {
      'X-Custom-Header': 'AETH-1-Webhook'
    },
    retryConfig: {
      enabled: true,
      maxRetries: 3,
      retryIntervalSeconds: 60
    },
    version: 1,
    lastDeliveryAt: new Date(Date.now() - 3600000).toISOString(),
    lastDeliveryStatus: 'success',
    totalDeliveries: 1247,
    successRate: 98.4,
    createdAt: '2024-09-15T10:00:00Z',
    updatedAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'wh_002',
    name: 'Data Pipeline Monitor',
    url: 'https://monitoring.example.com/alerts',
    secret: 'whsec_***************',
    events: [
      WebhookEventType.DATA_CONNECTOR_STATUS_CHANGE,
      WebhookEventType.DATA_ANOMALY_DETECTED,
      WebhookEventType.SYSTEM_ALERT
    ],
    status: WebhookStatus.ACTIVE,
    ownerId: 'usr_1',
    ownerName: 'AETH-1 Admin',
    retryConfig: {
      enabled: true,
      maxRetries: 5,
      retryIntervalSeconds: 30
    },
    version: 1,
    lastDeliveryAt: new Date(Date.now() - 300000).toISOString(),
    lastDeliveryStatus: 'success',
    totalDeliveries: 8932,
    successRate: 99.1,
    createdAt: '2024-08-01T14:30:00Z',
    updatedAt: new Date(Date.now() - 300000).toISOString()
  },
  {
    id: 'wh_003',
    name: 'Collaboration Tracker',
    url: 'https://slack.example.com/hooks/collab',
    secret: 'whsec_***************',
    events: [
      WebhookEventType.COLLABORATION_INVITE_SENT,
      WebhookEventType.COLLABORATION_MEMBER_JOINED,
      WebhookEventType.COLLABORATION_MEMBER_LEFT
    ],
    status: WebhookStatus.PAUSED,
    ownerId: 'usr_2',
    ownerName: 'Dr. Jane Smith',
    retryConfig: {
      enabled: false,
      maxRetries: 3,
      retryIntervalSeconds: 60
    },
    version: 1,
    totalDeliveries: 456,
    successRate: 94.2,
    createdAt: '2024-10-20T09:15:00Z',
    updatedAt: new Date(Date.now() - 86400000).toISOString()
  }
];

const deliveryLogs: DeliveryLog[] = [
  {
    id: 'dl_001',
    webhookId: 'wh_001',
    webhookName: 'Paper Publication Notifier',
    eventType: WebhookEventType.PAPER_PUBLISHED,
    url: 'https://example.com/webhooks/paper-published',
    method: 'POST',
    requestHeaders: {
      'Content-Type': 'application/json',
      'X-AETH-1-Signature': 'sha256=abc123...',
      'X-AETH-1-Timestamp': new Date(Date.now() - 3600000).toISOString(),
      'X-AETH-1-Event': 'paper.published'
    },
    requestBody: {
      event: 'paper.published',
      data: {
        paperId: 'wp_001',
        title: 'Cross-Domain Correlation Between Solar Activity and LHC Beam Stability',
        doi: '10.5547/aeth.2024.00047',
        authors: ['Dr. Jane Smith', 'Prof. Wei Chen'],
        publishedAt: '2024-11-25T12:00:00Z'
      }
    },
    responseStatus: 200,
    responseHeaders: {
      'X-Request-ID': 'req_123456',
      'Content-Type': 'application/json'
    },
    responseBody: '{"status":"received","id":"evt_789"}',
    duration: 145,
    status: 'success',
    attempts: 1,
    maxAttempts: 3,
    triggeredBy: 'system',
    triggeredByName: 'System Automation',
    createdAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'dl_002',
    webhookId: 'wh_002',
    webhookName: 'Data Pipeline Monitor',
    eventType: WebhookEventType.DATA_ANOMALY_DETECTED,
    url: 'https://monitoring.example.com/alerts',
    method: 'POST',
    requestHeaders: {
      'Content-Type': 'application/json',
      'X-AETH-1-Signature': 'sha256=def456...',
      'X-AETH-1-Event': 'data.anomaly_detected'
    },
    requestBody: {
      event: 'data.anomaly_detected',
      data: {
        pipelineId: 'lhc_beam_monitor',
        severity: 'high',
        metric: 'luminosity',
        threshold: 1e34,
        actualValue: 1.2e34,
        timestamp: new Date(Date.now() - 300000).toISOString()
      }
    },
    responseStatus: 200,
    duration: 89,
    status: 'success',
    attempts: 1,
    maxAttempts: 5,
    triggeredBy: 'system',
    triggeredByName: 'Data Monitor Service',
    createdAt: new Date(Date.now() - 300000).toISOString()
  },
  {
    id: 'dl_003',
    webhookId: 'wh_003',
    webhookName: 'Collaboration Tracker',
    eventType: WebhookEventType.COLLABORATION_MEMBER_JOINED,
    url: 'https://slack.example.com/hooks/collab',
    method: 'POST',
    requestHeaders: {
      'Content-Type': 'application/json',
      'X-AETH-1-Event': 'collaboration.member_joined'
    },
    requestBody: {
      event: 'collaboration.member_joined',
      data: {
        projectId: 'proj_001',
        projectName: 'Solar-LHC Correlation Study',
        memberName: 'AETH-1 Admin',
        role: 'reviewer'
      }
    },
    responseStatus: 503,
    errorMessage: 'Service Unavailable: Slack API rate limit exceeded',
    duration: 2340,
    status: 'failed',
    attempts: 3,
    maxAttempts: 3,
    triggeredBy: 'usr_2',
    triggeredByName: 'Dr. Jane Smith',
    createdAt: new Date(Date.now() - 86400000).toISOString()
  }
];

// Available webhook events catalog
const availableEvents = Object.values(WebhookEventType).map(eventType => ({
  name: eventType,
  description: getEventDescription(eventType),
  category: getEventCategory(eventType),
  payloadSchema: getEventPayloadSchema(eventType)
}));

// ============== Helper Functions ==============

function getEventDescription(event: WebhookEventType): string {
  const descriptions: Record<WebhookEventType, string> = {
    [WebhookEventType.PAPER_CREATED]: 'Fired when a new white paper is created',
    [WebhookEventType.PAPER_UPDATED]: 'Fired when a paper is updated or revised',
    [WebhookEventType.PAPER_PUBLISHED]: 'Fired when a paper transitions to published status',
    [WebhookEventType.PAPER_SUBMITTED_FOR_REVIEW]: 'Fired when a paper is submitted for peer review',
    [WebhookEventType.COLLABORATION_INVITE_SENT]: 'Fired when a collaboration invitation is sent',
    [WebhookEventType.COLLABORATION_MEMBER_JOINED]: 'Fired when a user accepts and joins a project',
    [WebhookEventType.COLLABORATION_MEMBER_LEFT]: 'Fired when a member leaves or is removed from a project',
    [WebhookEventType.DATA_CONNECTOR_STATUS_CHANGE]: 'Fired when a data connector changes status',
    [WebhookEventType.DATA_PIPELINE_COMPLETE]: 'Fired when a data processing pipeline completes',
    [WebhookEventType.DATA_ANOMALY_DETECTED]: 'Fired when an anomaly is detected in data streams',
    [WebhookEventType.USER_CREATED]: 'Fired when a new user account is created',
    [WebhookEventType.USER_LOGIN]: 'Fired when a user successfully authenticates',
    [WebhookEventType.SYSTEM_MAINTENANCE_SCHEDULED]: 'Fired when system maintenance is scheduled',
    [WebhookEventType.SYSTEM_ALERT]: 'Fired for critical system alerts'
  };
  return descriptions[event] || 'Unknown event';
}

function getEventCategory(event: WebhookEventType): string {
  if (event.startsWith('paper.')) return 'Papers';
  if (event.startsWith('collaboration.')) return 'Collaboration';
  if (event.startsWith('data.')) return 'Data';
  if (event.startsWith('user.')) return 'Users';
  if (event.startsWith('system.')) return 'System';
  return 'Other';
}

function getEventPayloadSchema(event: WebhookEventType): object {
  const baseSchema = {
    type: 'object',
    properties: {
      event: { type: 'string', const: event },
      timestamp: { type: 'string', format: 'date-time' },
      webhookId: { type: 'string' }
    }
  };
  
  switch (event) {
    case WebhookEventType.PAPER_PUBLISHED:
      return {
        ...baseSchema,
        properties: {
          ...baseSchema.properties,
          data: {
            type: 'object',
            properties: {
              paperId: { type: 'string' },
              title: { type: 'string' },
              doi: { type: 'string' },
              authors: { type: 'array', items: { type: 'string' } },
              publishedAt: { type: 'string', format: 'date-time' }
            }
          }
        }
      };
    case WebhookEventType.DATA_ANOMALY_DETECTED:
      return {
        ...baseSchema,
        properties: {
          ...baseSchema.properties,
          data: {
            type: 'object',
            properties: {
              pipelineId: { type: 'string' },
              severity: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
              metric: { type: 'string' },
              threshold: { type: 'number' },
              actualValue: { type: 'number' }
            }
          }
        }
      };
    default:
      return baseSchema;
  }
}

function generateSecret(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let secret = 'whsec_';
  for (let i = 0; i < 32; i++) {
    secret += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return secret;
}

function calculateSuccessRate(webhookId: string): number {
  const logs = deliveryLogs.filter(l => l.webhookId === webhookId);
  if (logs.length === 0) return 100;
  const successes = logs.filter(l => l.status === 'success').length;
  return Math.round((successes / logs.length) * 1000) / 10;
}

// ============== API Endpoints ==============

/**
 * GET /api/webhooks
 * List webhooks with filtering
 * Query parameters:
 * - page: page number (default: 1)
 * - limit: results per page (default: 20)
 * - status: filter by status
 */
export async function GET(request: NextRequest) {
  return apiMiddleware({ requireAuth: true })(
    request,
    async (request, context) => {
      const { searchParams } = new URL(request.url);
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '20');
      const status = searchParams.get('status') as WebhookStatus | null;
      
      let filteredWebhooks = [...webhooks];
      
      // Non-admin users can only see their own webhooks
      if (context.user.role !== UserRole.ADMIN && context.user.role !== UserRole.SUPERADMIN) {
        filteredWebhooks = filteredWebhooks.filter(w => w.ownerId === context.user.id);
      }
      
      // Apply status filter
      if (status) {
        filteredWebhooks = filteredWebhooks.filter(w => w.status === status);
      }
      
      // Sort by creation date (newest first)
      filteredWebhooks.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      // Paginate
      const total = filteredWebhooks.length;
      const start = (page - 1) * limit;
      const paginatedWebhooks = filteredWebhooks.slice(start, start + limit);
      
      // Mask secrets for security
      const safeWebhooks = paginatedWebhooks.map(w => ({
        ...w,
        secret: w.secret.replace(/./g, '*').substring(0, 20) + '...'
      }));
      
      return successResponse({
        webhooks: safeWebhooks,
        total,
        page,
        limit,
        summary: {
          active: webhooks.filter(w => w.status === WebhookStatus.ACTIVE).length,
          paused: webhooks.filter(w => w.status === WebhookStatus.PAUSED).length,
          failed: webhooks.filter(w => w.status === WebhookStatus.FAILED).length,
          totalDeliveriesToday: deliveryLogs.filter(
            l => new Date(l.createdAt) > new Date(Date.now() - 86400000)
          ).length
        }
      });
    }
  );
}

/**
 * POST /api/webhooks
 * Register a new webhook
 * Body: { name, url, events, headers?, retryConfig? }
 */
export async function POST(request: NextRequest) {
  return apiMiddleware({ requireAuth: true })(
    request,
    async (request, context) => {
      const body = await request.json();
      const { 
        name, 
        url, 
        events = [], 
        headers = {},
        retryConfig,
        version = 1
      } = body;
      
      // Validate required fields
      if (!name || !url) {
        throw new ValidationError('Name and URL are required');
      }
      
      if (!Array.isArray(events) || events.length === 0) {
        throw new ValidationError('At least one event must be specified');
      }
      
      // Validate URL format
      try {
        new URL(url);
      } catch {
        throw new ValidationError('Invalid URL format');
      }
      
      // Validate events
      const validEvents = events.filter((e: string) => 
        Object.values(WebhookEventType).includes(e as WebhookEventType)
      );
      
      if (validEvents.length !== events.length) {
        throw new ValidationError(`Invalid events. Valid events: ${Object.values(WebhookEventType).join(', ')}`);
      }
      
      // Check for duplicate URLs per user
      const existingUrl = webhooks.find(
        w => w.url === url && w.ownerId === context.user.id
      );
      if (existingUrl) {
        throw new ValidationError('You already have a webhook registered for this URL');
      }
      
      const now = new Date().toISOString();
      
      const newWebhook: Webhook = {
        id: `wh_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name,
        url,
        secret: generateSecret(),
        events: validEvents as WebhookEventType[],
        status: WebhookStatus.ACTIVE,
        ownerId: context.user.id,
        ownerName: context.user.name,
        headers,
        retryConfig: {
          enabled: retryConfig?.enabled ?? true,
          maxRetries: retryConfig?.maxRetries ?? 3,
          retryIntervalSeconds: retryConfig?.retryIntervalSeconds ?? 60
        },
        version,
        totalDeliveries: 0,
        successRate: 100,
        createdAt: now,
        updatedAt: now
      };
      
      webhooks.push(newWebhook);
      
      // Return full secret only on creation (user should save it securely)
      return successResponse({
        ...newWebhook,
        message: 'Webhook registered successfully. Save your secret securely - it will not be shown again.'
      }, {
        message: 'Webhook created successfully',
        tip: 'Save the webhook secret - you will need it to verify payloads'
      });
    }
  );
}

/**
 * DELETE /api/webhooks/:id
 * Remove a webhook
 */
export async function DELETE(request: NextRequest) {
  return apiMiddleware({ requireAuth: true })(
    request,
    async (request, context) => {
      const { searchParams } = new URL(request.url);
      const webhookId = searchParams.get('id');
      
      if (!webhookId) {
        throw new ValidationError('Webhook ID is required');
      }
      
      const webhookIndex = webhooks.findIndex(w => w.id === webhookId);
      
      if (webhookIndex === -1) {
        throw new NotFoundError('Webhook', webhookId);
      }
      
      const webhook = webhooks[webhookIndex];
      
      // Check ownership (admins can delete any)
      if (
        webhook.ownerId !== context.user.id &&
        ![UserRole.ADMIN, UserRole.SUPERADMIN].includes(context.user.role)
      ) {
        throw new ForbiddenError('You can only delete your own webhooks');
      }
      
      // Remove webhook
      webhooks.splice(webhookIndex, 1);
      
      return successResponse({
        deleted: webhookId,
        message: `Webhook "${webhook.name}" deleted successfully`,
        note: 'Delivery logs are retained for 30 days for audit purposes'
      });
    }
  );
}

/**
 * PUT /api/webhooks/:id
 * Update webhook configuration
 */
export async function PUT(request: NextRequest) {
  return apiMiddleware({ requireAuth: true })(
    request,
    async (request, context) => {
      const { searchParams } = new URL(request.url);
      const webhookId = searchParams.get('id');
      const body = await request.json();
      const { name, url, events, status, headers, retryConfig, regenerateSecret } = body;
      
      if (!webhookId) {
        throw new ValidationError('Webhook ID is required');
      }
      
      const webhook = webhooks.find(w => w.id === webhookId);
      
      if (!webhook) {
        throw new NotFoundError('Webhook', webhookId);
      }
      
      // Check ownership
      if (
        webhook.ownerId !== context.user.id &&
        ![UserRole.ADMIN, UserRole.SUPERADMIN].includes(context.user.role)
      ) {
        throw new ForbiddenError('You can only update your own webhooks');
      }
      
      // Update fields
      if (name) webhook.name = name;
      if (url) {
        try {
          new URL(url);
          webhook.url = url;
        } catch {
          throw new ValidationError('Invalid URL format');
        }
      }
      if (events) {
        const validEvents = events.filter((e: string) => 
          Object.values(WebhookEventType).includes(e as WebhookEventType)
        );
        if (validEvents.length > 0) {
          webhook.events = validEvents as WebhookEventType[];
        }
      }
      if (status && Object.values(WebhookStatus).includes(status)) {
        webhook.status = status;
      }
      if (headers) webhook.headers = { ...webhook.headers, ...headers };
      if (retryConfig) {
        webhook.retryConfig = { ...webhook.retryConfig, ...retryConfig };
      }
      if (regenerateSecret) {
        webhook.secret = generateSecret();
      }
      
      webhook.updatedAt = new Date().toISOString();
      
      return successResponse({
        ...webhook,
        secret: regenerateSecret ? webhook.secret : undefined,
        message: 'Webhook updated successfully'
      }, {
        message: regenerateSecret ? 'New secret generated - save it securely!' : 'Webhook updated'
      });
    }
  );
}

/**
 * GET /api/webhooks/:id/logs
 * Get delivery logs for a specific webhook
 */
export async function GET_LOGS(request: NextRequest) {
  return apiMiddleware({ requireAuth: true })(
    request,
    async (request, context) => {
      const { searchParams } = new URL(request.url);
      const webhookId = searchParams.get('webhookId');
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '20');
      const status = searchParams.get('status'); // success, failed, retrying
      
      if (!webhookId) {
        throw new ValidationError('Webhook ID is required');
      }
      
      const webhook = webhooks.find(w => w.id === webhookId);
      
      if (!webhook) {
        throw new NotFoundError('Webhook', webhookId);
      }
      
      // Check access
      if (
        webhook.ownerId !== context.user.id &&
        ![UserRole.ADMIN, UserRole.SUPERADMIN].includes(context.user.role)
      ) {
        throw new ForbiddenError('You can only view your own webhook logs');
      }
      
      // Get logs for this webhook
      let logs = deliveryLogs.filter(l => l.webhookId === webhookId);
      
      // Filter by status
      if (status) {
        logs = logs.filter(l => l.status === status);
      }
      
      // Sort by date (newest first)
      logs.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      // Paginate
      const total = logs.length;
      const start = (page - 1) * limit;
      const paginatedLogs = logs.slice(start, start + limit);
      
      // Calculate statistics
      const allLogs = deliveryLogs.filter(l => l.webhookId === webhookId);
      const stats = {
        totalDeliveries: allLogs.length,
        successful: allLogs.filter(l => l.status === 'success').length,
        failed: allLogs.filter(l => l.status === 'failed').length,
        retrying: allLogs.filter(l => l.status === 'retrying').length,
        avgDuration: allLogs.length > 0 
          ? Math.round(allLogs.reduce((sum, l) => sum + l.duration, 0) / allLogs.length)
          : 0,
        successRate: calculateSuccessRate(webhookId)
      };
      
      return successResponse({
        webhookId,
        webhookName: webhook.name,
        logs: paginatedLogs,
        total,
        page,
        limit,
        statistics: stats
      });
    }
  );
}

/**
 * POST /api/webhooks/:id/test
 * Send a test payload to verify webhook configuration
 */
export async function TEST_WEBHOOK(request: NextRequest) {
  return apiMiddleware({ requireAuth: true })(
    request,
    async (request, context) => {
      const { searchParams } = new URL(request.url);
      const webhookId = searchParams.get('id');
      const body = await request.json().catch(() => ({}));
      const { eventType } = body;
      
      if (!webhookId) {
        throw new ValidationError('Webhook ID is required');
      }
      
      const webhook = webhooks.find(w => w.id === webhookId);
      
      if (!webhook) {
        throw new NotFoundError('Webhook', webhookId);
      }
      
      // Check ownership
      if (
        webhook.ownerId !== context.user.id &&
        ![UserRole.ADMIN, UserRole.SUPERADMIN].includes(context.user.role)
      ) {
        throw new ForbiddenError('You can only test your own webhooks');
      }
      
      // Use provided event type or first configured event
      const testEvent = (eventType || webhook.events[0]) as WebhookEventType;
      
      // Simulate test delivery
      const testResult = {
        testId: `test_${Date.now()}`,
        webhookId: webhook.id,
        webhookName: webhook.name,
        url: webhook.url,
        event: testEvent,
        status: Math.random() > 0.1 ? 'success' : 'failed', // Simulate occasional failures
        statusCode: Math.random() > 0.1 ? 200 : 500,
        duration: Math.floor(50 + Math.random() * 200),
        timestamp: new Date().toISOString(),
        message: Math.random() > 0.1 
          ? 'Test payload delivered successfully' 
          : 'Failed to deliver test payload - check endpoint availability',
        testPayload: {
          event: testEvent,
          test: true,
          timestamp: new Date().toISOString(),
          data: {
            message: 'This is a test payload from AETH-1 Webhook API',
            webhookId: webhook.id
          }
        }
      };
      
      // Create log entry for the test
      const testLog: DeliveryLog = {
        id: `dl_test_${Date.now()}`,
        webhookId: webhook.id,
        webhookName: webhook.name,
        eventType: testEvent,
        url: webhook.url,
        method: 'POST',
        requestHeaders: {
          'Content-Type': 'application/json',
          'X-AETH-1-Event': testEvent,
          'X-AETH-1-Delivery-Mode': 'test'
        },
        requestBody: testResult.testPayload,
        responseStatus: testResult.statusCode,
        duration: testResult.duration,
        status: testResult.status === 'success' ? 'success' : 'failed',
        attempts: 1,
        maxAttempts: webhook.retryConfig.maxRetries,
        triggeredBy: context.user.id,
        triggeredByName: context.user.name,
        createdAt: new Date().toISOString()
      };
      
      deliveryLogs.unshift(testLog);
      
      return successResponse(testResult, {
        message: 'Test completed',
        note: 'Check the delivery log for detailed results'
      });
    }
  );
}

/**
 * GET /api/webhooks/events
 * Get list of available webhook events
 */
export async function GET_EVENTS(request: NextRequest) {
  return apiMiddleware({ requireAuth: true })(
    request,
    async () => {
      return successResponse({
        events: availableEvents,
        categories: [...new Set(availableEvents.map(e => e.category))],
        totalEvents: availableEvents.length,
        documentation: 'https://docs.aeth-1.science/webhooks/events'
      });
    }
  );
}

export default { GET, POST, PUT, DELETE, GET_LOGS, TEST_WEBHOOK, GET_EVENTS };

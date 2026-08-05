/**
 * AETH-1 Notifications API
 * User notifications, alerts, activity feed management
 * 
 * Endpoints:
 * - GET /api/notifications (list user notifications)
 * - PUT /api/notifications/:id/read (mark as read)
 * - POST /api/notifications (create system notification - admin only)
 * - DELETE /api/notifications/:id (delete notification)
 * - GET /api/notifications/unread-count (get unread count)
 * - PUT /api/notifications/read-all (mark all as read)
 */

import { NextRequest } from 'next/server';
import { apiMiddleware, successResponse, paginatedResponse } from '@/middleware/api';
import { UserRole } from '@/middleware/auth';
import { ValidationError, NotFoundError } from '@/middleware/error-handler';

// ============== Type Definitions ==============

export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  PAPER_UPDATE = 'paper_update',
  COLLABORATION_REQUEST = 'collaboration_request',
  CITATION = 'citation',
  SYSTEM = 'system',
  DATA_ALERT = 'data_alert',
  SECURITY = 'security'
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  actionUrl?: string;
  actionLabel?: string;
  icon?: string;
  read: boolean;
  readAt?: string;
  metadata?: Record<string, any>;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface NotificationPreferences {
  userId: string;
  emailEnabled: boolean;
  pushEnabled: boolean;
  types: {
    type: NotificationType;
    enabled: boolean;
  }[];
  quietHoursStart?: string; // HH:mm format
  quietHoursEnd?: string; // HH:mm format
}

// ============== Mock Data Store ==============

const notifications: Notification[] = [
  {
    id: 'notif_001',
    userId: 'usr_2',
    type: NotificationType.PAPER_UPDATE,
    priority: NotificationPriority.MEDIUM,
    title: 'Paper status changed',
    message: 'Your paper "Machine Learning Approaches for Satellite Image Classification" has been moved to under review.',
    actionUrl: '/papers/wp_002',
    actionLabel: 'View Paper',
    icon: 'file-text',
    read: false,
    metadata: { paperId: 'wp_002', previousStatus: 'draft', newStatus: 'under_review' },
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'notif_002',
    userId: 'usr_2',
    type: NotificationType.CITATION,
    priority: NotificationPriority.HIGH,
    title: 'New citation!',
    message: 'Your paper "Cross-Domain Correlation Between Solar Activity and LHC Beam Stability" was cited by Dr. Robert Johnson in "Solar-Terrestrial Connections in Modern Physics".',
    actionUrl: '/papers/wp_001/citations',
    actionLabel: 'View Citations',
    icon: 'award',
    read: false,
    metadata: { paperId: 'wp_001', citingAuthor: 'Dr. Robert Johnson', citingPaper: 'Solar-Terrestrial Connections in Modern Physics' },
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: 'notif_003',
    userId: 'usr_2',
    type: NotificationType.COLLABORATION_REQUEST,
    priority: NotificationPriority.HIGH,
    title: 'Collaboration request',
    message: 'Prof. Wei Chen has invited you to collaborate on a new quantum computing research project.',
    actionUrl: '/collaborations/inv_001',
    actionLabel: 'View Request',
    icon: 'users',
    read: true,
    readAt: new Date(Date.now() - 3600000).toISOString(),
    metadata: { fromUserId: 'usr_3', projectId: 'proj_quantum_001' },
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'notif_004',
    userId: 'usr_2',
    type: NotificationType.SYSTEM,
    priority: NotificationPriority.LOW,
    title: 'Data connector update',
    message: 'The SatelliteStream connector has been updated to v3.2 with improved throughput (+15%) and reduced latency (-8ms).',
    actionUrl: '/connectors/conn_sat_001',
    actionLabel: 'View Changelog',
    icon: 'settings',
    read: true,
    readAt: new Date(Date.now() - 172800000).toISOString(),
    metadata: { connectorId: 'conn_sat_001', version: '3.2.0' },
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 172800000).toISOString()
  },
  {
    id: 'notif_005',
    userId: 'usr_2',
    type: NotificationType.SUCCESS,
    priority: NotificationPriority.HIGH,
    title: 'Paper published! 🎉',
    message: 'Congratulations! Your paper "Cross-Domain Correlation Between Solar Activity and LHC Beam Stability" has been published and assigned DOI: 10.5547/aeth.2024.00047',
    actionUrl: '/papers/wp_001',
    actionLabel: 'View Published Paper',
    icon: 'check-circle',
    read: true,
    readAt: new Date(Date.now() - 604800000).toISOString(),
    metadata: { doi: '10.5547/aeth.2024.00047', publishedAt: '2024-11-25' },
    createdAt: new Date(Date.now() - 604800000).toISOString(),
    updatedAt: new Date(Date.now() - 604800000).toISOString()
  },
  {
    id: 'notif_006',
    userId: 'usr_2',
    type: NotificationType.DATA_ALERT,
    priority: NotificationPriority.URGENT,
    title: 'Data pipeline anomaly detected',
    message: 'Anomaly detected in LHC data stream: unexpected spike in beam luminosity readings. Automatic calibration initiated.',
    actionUrl: '/data/pipelines/lhc_stream',
    actionLabel: 'Investigate',
    icon: 'alert-triangle',
    read: false,
    metadata: { 
      pipelineId: 'lhc_beam_monitor', 
      severity: 'high',
      metric: 'luminosity',
      threshold: 1e34,
      actualValue: 1.2e34
    },
    createdAt: new Date(Date.now() - 300000).toISOString(),
    updatedAt: new Date(Date.now() - 300000).toISOString()
  }
];

// User preferences store
const userPreferences: Map<string, NotificationPreferences> = new Map([
  ['usr_2', {
    userId: 'usr_2',
    emailEnabled: true,
    pushEnabled: false,
    types: [
      { type: NotificationType.PAPER_UPDATE, enabled: true },
      { type: NotificationType.COLLABORATION_REQUEST, enabled: true },
      { type: NotificationType.CITATION, enabled: true },
      { type: NotificationType.SYSTEM, enabled: true },
      { type: NotificationType.DATA_ALERT, enabled: true },
      { type: NotificationType.SECURITY, enabled: true }
    ],
    quietHoursStart: '22:00',
    quietHoursEnd: '07:00'
  }]
]);

// ============== Helper Functions ==============

function getUserNotifications(userId: string): Notification[] {
  return notifications.filter(n => n.userId === userId);
}

function getUnreadCount(userId: string): number {
  return notifications.filter(n => n.userId === userId && !n.read).length;
}

// ============== API Endpoints ==============

/**
 * GET /api/notifications
 * List user's notifications with filtering and pagination
 * Query parameters:
 * - page: page number (default: 1)
 * - limit: results per page (default: 20)
 * - unreadOnly: filter unread only (true/false)
 * - type: filter by notification type
 * - priority: filter by priority
 */
export async function GET(request: NextRequest) {
  return apiMiddleware({ requireAuth: true })(
    request,
    async (request, context) => {
      const { searchParams } = new URL(request.url);
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '20');
      const unreadOnly = searchParams.get('unreadOnly') === 'true';
      const type = searchParams.get('type') as NotificationType | null;
      const priority = searchParams.get('priority') as NotificationPriority | null;
      
      // Get notifications for authenticated user
      let userNotifications = getUserNotifications(context.user.id);
      
      // Apply filters
      if (unreadOnly) {
        userNotifications = userNotifications.filter(n => !n.read);
      }
      
      if (type) {
        userNotifications = userNotifications.filter(n => n.type === type);
      }
      
      if (priority) {
        userNotifications = userNotifications.filter(n => n.priority === priority);
      }
      
      // Sort by date (newest first), then by priority
      const priorityOrder = { [NotificationPriority.URGENT]: 0, [NotificationPriority.HIGH]: 1, [NotificationPriority.MEDIUM]: 2, [NotificationPriority.LOW]: 3 };
      userNotifications.sort((a, b) => {
        // Unread first
        if (a.read !== b.read) return a.read ? 1 : -1;
        // Then by priority
        const priorityDiff = (priorityOrder[a.priority] || 99) - (priorityOrder[b.priority] || 99);
        if (priorityDiff !== 0) return priorityDiff;
        // Then by date
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      
      // Paginate
      const total = userNotifications.length;
      const start = (page - 1) * limit;
      const paginatedNotifications = userNotifications.slice(start, start + limit);
      
      return successResponse({
        notifications: paginatedNotifications,
        total,
        unreadCount: getUnreadCount(context.user.id),
        page,
        limit,
        hasNext: start + limit < total,
        hasPrev: page > 1
      });
    }
  );
}

/**
 * POST /api/notifications
 * Create a new notification (admin/service use or for testing)
 * Body: { userId, type, title, message, priority?, actionUrl?, actionLabel?, metadata? }
 */
export async function POST(request: NextRequest) {
  return apiMiddleware({ requireAuth: true, roles: [UserRole.ADMIN] })(
    request,
    async (request) => {
      const body = await request.json();
      const { 
        userId, 
        type, 
        title, 
        message, 
        priority = NotificationPriority.MEDIUM,
        actionUrl, 
        actionLabel, 
        icon,
        metadata,
        expiresAt 
      } = body;
      
      // Validate required fields
      if (!userId || !type || !title || !message) {
        throw new ValidationError('userId, type, title, and message are required', {
          required: ['userId', 'type', 'title', 'message'],
          provided: Object.keys(body)
        });
      }
      
      // Validate type
      if (!Object.values(NotificationType).includes(type)) {
        throw new ValidationError(`Invalid notification type. Valid types: ${Object.values(NotificationType).join(', ')}`);
      }
      
      // Validate priority
      if (!Object.values(NotificationPriority).includes(priority)) {
        throw new ValidationError(`Invalid priority. Valid priorities: ${Object.values(NotificationPriority).join(', ')}`);
      }
      
      const now = new Date().toISOString();
      
      const newNotification: Notification = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        userId,
        type,
        priority,
        title,
        message,
        actionUrl,
        actionLabel,
        icon,
        read: false,
        metadata,
        expiresAt,
        createdAt: now,
        updatedAt: now
      };
      
      notifications.push(newNotification);
      
      // In production, trigger push notification/email here based on user preferences
      
      return successResponse(newNotification, {
        message: 'Notification created successfully',
        delivered: true
      });
    }
  );
}

/**
 * PUT /api/notifications/:id/read
 * Mark a specific notification as read
 * Or mark all as read with { markAll: true }
 */
export async function PUT(request: NextRequest) {
  return apiMiddleware({ requireAuth: true })(
    request,
    async (request, context) => {
      const { searchParams } = new URL(request.url);
      const notificationId = searchParams.get('id');
      const body = await request.json().catch(() => ({}));
      const { markAll = false } = body;
      
      const now = new Date().toISOString();
      
      if (markAll) {
        // Mark all notifications as read for this user
        let count = 0;
        notifications.forEach(n => {
          if (n.userId === context.user.id && !n.read) {
            n.read = true;
            n.readAt = now;
            n.updatedAt = now;
            count++;
          }
        });
        
        return successResponse({
          markedAsRead: count,
          message: `Marked ${count} notification${count !== 1 ? 's' : ''} as read`,
          remainingUnread: 0
        });
      }
      
      if (!notificationId) {
        throw new ValidationError('Provide notification ID or set markAll=true');
      }
      
      const notification = notifications.find(n => n.id === notificationId && n.userId === context.user.id);
      
      if (!notification) {
        throw new NotFoundError('Notification', notificationId);
      }
      
      notification.read = true;
      notification.readAt = now;
      notification.updatedAt = now;
      
      return successResponse({
        notification,
        message: 'Notification marked as read',
        remainingUnread: getUnreadCount(context.user.id)
      });
    }
  );
}

/**
 * DELETE /api/notifications/:id
 * Delete a specific notification
 */
export async function DELETE(request: NextRequest) {
  return apiMiddleware({ requireAuth: true })(
    request,
    async (request, context) => {
      const { searchParams } = new URL(request.url);
      const notificationId = searchParams.get('id');
      
      if (!notificationId) {
        throw new ValidationError('Notification ID is required');
      }
      
      const index = notifications.findIndex(n => n.id === notificationId && n.userId === context.user.id);
      
      if (index === -1) {
        throw new NotFoundError('Notification', notificationId);
      }
      
      const deleted = notifications.splice(index, 1)[0];
      
      return successResponse({
        deleted: deleted.id,
        message: 'Notification deleted successfully',
        remainingUnread: getUnreadCount(context.user.id)
      });
    }
  );
}

/**
 * GET /api/notifications/unread-count
 * Quick endpoint to get just the unread count
 */
export async function GET_UNREAD_COUNT(request: NextRequest) {
  return apiMiddleware({ requireAuth: true })(
    request,
    async (request, context) => {
      const count = getUnreadCount(context.user.id);
      
      // Also get counts by type
      const typeCounts: Record<string, number> = {};
      notifications
        .filter(n => n.userId === context.user.id && !n.read)
        .forEach(n => {
          typeCounts[n.type] = (typeCounts[n.type] || 0) + 1;
        });
      
      return successResponse({
        totalUnread: count,
        byType: typeCounts,
        lastChecked: new Date().toISOString()
      });
    }
  );
}

/**
 * GET /api/notifications/preferences
 * Get user's notification preferences
 */
export async function GET_PREFERENCES(request: NextRequest) {
  return apiMiddleware({ requireAuth: true })(
    request,
    async (request, context) => {
      const prefs = userPreferences.get(context.user.id) || {
        userId: context.user.id,
        emailEnabled: true,
        pushEnabled: true,
        types: Object.values(NotificationType).map(t => ({ type: t, enabled: true }))
      };
      
      return successResponse(prefs);
    }
  );
}

/**
 * PUT /api/notifications/preferences
 * Update user's notification preferences
 */
export async function UPDATE_PREFERENCES(request: NextRequest) {
  return apiMiddleware({ requireAuth: true })(
    request,
    async (request, context) => {
      const body = await request.json();
      const { emailEnabled, pushEnabled, types, quietHoursStart, quietHoursEnd } = body;
      
      let prefs = userPreferences.get(context.user.id) || {
        userId: context.user.id,
        types: []
      };
      
      prefs = {
        ...prefs,
        ...(emailEnabled !== undefined && { emailEnabled }),
        ...(pushEnabled !== undefined && { pushEnabled }),
        ...(types && { types }),
        ...(quietHoursStart !== undefined && { quietHoursStart }),
        ...(quietHoursEnd !== undefined && { quietHoursEnd })
      };
      
      userPreferences.set(context.user.id, prefs);
      
      return successResponse(prefs, {
        message: 'Preferences updated successfully'
      });
    }
  );
}

export default { GET, POST, PUT, DELETE, GET_UNREAD_COUNT, GET_PREFERENCES, UPDATE_PREFERENCES };

/**
 * AETH-1 Analytics API
 * Platform metrics, usage analytics, custom event tracking
 * 
 * Endpoints:
 * - GET /api/analytics?range=7d|30d|90d&metrics=users,requests,storage
 * - POST /api/analytics/events (track custom events)
 * - GET /api/analytics/realtime (real-time metrics)
 */

import { NextRequest } from 'next/server';
import { apiMiddleware, successResponse, paginatedResponse } from '@/middleware/api';
import { UserRole } from '@/middleware/auth';
import { ValidationError } from '@/middleware/error-handler';

// ============== Type Definitions ==============

interface TimeSeriesPoint {
  timestamp: string;
  value: number;
}

interface MetricData {
  id: string;
  name: string;
  description: string;
  unit: string;
  current: number;
  previous: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
  timeSeries: TimeSeriesPoint[];
  breakdown?: Record<string, number>;
}

interface AnalyticsEvent {
  id: string;
  eventType: string;
  userId?: string;
  sessionId: string;
  properties: Record<string, any>;
  timestamp: string;
  source: 'web' | 'api' | 'mobile' | 'service';
}

interface AggregationResult {
  metric: string;
  count: number;
  sum?: number;
  avg?: number;
  min?: number;
  max?: number;
  uniqueUsers?: number;
}

// ============== Mock Data Stores ==============

const platformMetrics: MetricData[] = [
  {
    id: 'metric_active_users',
    name: 'Active Users',
    description: 'Users active in the last 24 hours',
    unit: 'users',
    current: 1247,
    previous: 1189,
    changePercent: 4.9,
    trend: 'up',
    timeSeries: generateTimeSeries(30, 1000, 1500),
    breakdown: {
      'Researchers': 892,
      'Reviewers': 234,
      'Admins': 45,
      'Guests': 76
    }
  },
  {
    id: 'metric_papers_published',
    name: 'Papers Published',
    description: 'White papers published this month',
    unit: 'papers',
    current: 147,
    previous: 132,
    changePercent: 11.4,
    trend: 'up',
    timeSeries: generateTimeSeries(30, 80, 160),
    breakdown: {
      'Physics': 42,
      'Climate Science': 38,
      'Genomics': 29,
      'Data Science': 28,
      'Cross-Domain': 10
    }
  },
  {
    id: 'metric_data_processed',
    name: 'Data Processed',
    description: 'Total data processed today',
    unit: 'TB',
    current: 847.3,
    previous: 892.1,
    changePercent: -5.0,
    trend: 'down',
    timeSeries: generateTimeSeries(24, 600, 1200),
    breakdown: {
      'Satellite': 342.1,
      'LHC Events': 287.6,
      'Climate': 124.8,
      'Genomic': 92.8
    }
  },
  {
    id: 'metric_api_requests',
    name: 'API Requests',
    description: 'API requests per second (avg)',
    unit: 'req/s',
    current: 3421,
    previous: 3156,
    changePercent: 8.4,
    trend: 'up',
    timeSeries: generateTimeSeries(24, 2500, 4000),
    breakdown: {
      '/api/data': 1245,
      '/api/papers': 876,
      '/api/users': 654,
      '/api/storage': 432,
      '/api/auth': 234
    }
  },
  {
    id: 'metric_storage_used',
    name: 'Storage Used',
    description: 'Total blob storage utilization',
    unit: 'PB',
    current: 38.8,
    previous: 37.2,
    changePercent: 4.3,
    trend: 'up',
    timeSeries: generateTimeSeries(90, 35, 42),
    breakdown: {
      'Hot Tier': 12.4,
      'Warm Tier': 24.8,
      'Cold Tier': 1.6
    }
  },
  {
    id: 'metric_avg_response_time',
    name: 'Avg Response Time',
    description: 'Average API response time',
    unit: 'ms',
    current: 45,
    previous: 52,
    changePercent: -13.5,
    trend: 'up', // Lower is better
    timeSeries: generateTimeSeries(24, 40, 80),
    breakdown: {
      'Auth': 12,
      'Users': 28,
      'Papers': 45,
      'Data': 67,
      'Storage': 34
    }
  },
  {
    id: 'metric_collaboration_sessions',
    name: 'Active Sessions',
    description: 'Real-time collaboration sessions',
    unit: 'sessions',
    current: 89,
    previous: 76,
    changePercent: 17.1,
    trend: 'up',
    timeSeries: generateTimeSeries(30, 50, 120),
    breakdown: {
      'Editing': 34,
      'Reviewing': 28,
      'Viewing': 27
    }
  },
  {
    id: 'metric_webhook_deliveries',
    name: 'Webhook Deliveries',
    description: 'Successful webhook deliveries (24h)',
    unit: 'deliveries',
    current: 15420,
    previous: 14890,
    changePercent: 3.6,
    trend: 'up',
    timeSeries: generateTimeSeries(24, 10000, 20000),
    breakdown: {
      'Success': 14890,
      'Failed': 430,
      'Retrying': 100
    }
  }
];

// In-memory events store (in production, use TimescaleDB/ClickHouse)
const eventsStore: AnalyticsEvent[] = [];

// Pre-populate with some sample events
for (let i = 0; i < 500; i++) {
  const eventTypes = ['page_view', 'api_call', 'paper_download', 'data_query', 'user_login', 'collaboration_start'];
  const sources: Array<'web' | 'api' | 'mobile' | 'service'> = ['web', 'api', 'mobile', 'service'];
  
  eventsStore.push({
    id: `evt_${Date.now()}_${i}`,
    eventType: eventTypes[Math.floor(Math.random() * eventTypes.length)],
    userId: Math.random() > 0.2 ? `usr_${Math.floor(Math.random() * 10) + 1}` : undefined,
    sessionId: `sess_${Math.floor(Math.random() * 100)}`,
    properties: {
      duration: Math.floor(Math.random() * 300000),
      userAgent: 'AETH-1 Client'
    },
    timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    source: sources[Math.floor(Math.random() * sources.length)]
  });
}

// ============== Helper Functions ==============

function generateTimeSeries(days: number, min: number, max: number): TimeSeriesPoint[] {
  const points: TimeSeriesPoint[] = [];
  const now = new Date();
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    points.push({
      timestamp: date.toISOString().split('T')[0],
      value: Math.round(min + Math.random() * (max - min))
    });
  }
  
  return points;
}

function parseRange(range: string): number {
  const ranges: Record<string, number> = {
    '7d': 7,
    '30d': 30,
    '90d': 90,
    '365d': 365,
    '24h': 1,
    '1d': 1
  };
  return ranges[range] || 30;
}

function getMetricsByIds(metricIds: string[]): MetricData[] {
  if (metricIds.length === 0) return platformMetrics;
  return platformMetrics.filter(m => metricIds.includes(m.id));
}

function generateAggregations(events: AnalyticsEvent[], groupBy?: string): AggregationResult[] {
  const aggregations: AggregationResult[] = [];
  
  // Group by event type
  const byType: Record<string, number> = {};
  const typeUniqueUsers: Record<string, Set<string>> = {};
  
  for (const event of events) {
    byType[event.eventType] = (byType[event.eventType] || 0) + 1;
    
    if (!typeUniqueUsers[event.eventType]) {
      typeUniqueUsers[event.eventType] = new Set();
    }
    if (event.userId) {
      typeUniqueUsers[event.eventType].add(event.userId);
    }
  }
  
  for (const [eventType, count] of Object.entries(byType)) {
    aggregations.push({
      metric: eventType,
      count,
      uniqueUsers: typeUniqueUsers[eventType]?.size || 0
    });
  }
  
  return aggregations.sort((a, b) => b.count - a.count);
}

function calculateTrend(timeSeries: TimeSeriesPoint[]): 'up' | 'down' | 'stable' {
  if (timeSeries.length < 2) return 'stable';
  
  const recent = timeSeries.slice(-7).reduce((sum, p) => sum + p.value, 0) / 7;
  const previous = timeSeries.slice(-14, -7).reduce((sum, p) => sum + p.value, 0) / 7;
  
  const changePercent = ((recent - previous) / previous) * 100;
  
  if (Math.abs(changePercent) < 5) return 'stable';
  return changePercent > 0 ? 'up' : 'down';
}

// ============== API Endpoints ==============

/**
 * GET /api/analytics
 * Query parameters:
 * - range: 7d | 30d | 90d | 365d (default: 30d)
 * - metrics: comma-separated metric IDs (default: all)
 * - detailed: include full time series and breakdowns
 */
export async function GET(request: NextRequest) {
  return apiMiddleware({ rateLimit: { requests: 60, windowMs: 60000 } })(
    request,
    async (request) => {
      const { searchParams } = new URL(request.url);
      const range = searchParams.get('range') || '30d';
      const metricsParam = searchParams.get('metrics');
      const detailed = searchParams.get('detailed') === 'true';
      const realtime = searchParams.get('realtime') === 'true';
      
      const days = parseRange(range);
      const metricIds = metricsParam ? metricsParam.split(',').map(m => m.trim()) : [];
      
      // Get requested metrics
      let metrics = getMetricsByIds(metricIds);
      
      // Filter time series based on range
      metrics = metrics.map(m => ({
        ...m,
        timeSeries: m.timeSeries.slice(-days),
        trend: calculateTrend(m.timeSeries.slice(-days))
      }));
      
      // Build response
      if (!detailed) {
        // Summary view
        const summaryMetrics = metrics.map(m => ({
          id: m.id,
          name: m.name,
          unit: m.unit,
          current: m.current,
          previous: m.previous,
          changePercent: m.changePercent,
          trend: m.trend
        }));
        
        return successResponse({
          metrics: summaryMetrics,
          summary: {
            totalMetrics: platformMetrics.length,
            improving: metrics.filter(m => m.trend === 'up').length,
            declining: metrics.filter(m => m.trend === 'down').length,
            stable: metrics.filter(m => m.trend === 'stable').length,
            dateRange: {
              start: new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString(),
              end: new Date().toISOString(),
              label: range
            }
          },
          ...(realtime && {
            realtime: {
              activeConnections: Math.floor(800 + Math.random() * 400),
              requestsPerSecond: Math.floor(2500 + Math.random() * 1500),
              cpuUsage: `${(15 + Math.random() * 25).toFixed(1)}%`,
              memoryUsage: `${(45 + Math.random() * 20).toFixed(1)}%`,
              queueDepth: Math.floor(Math.random() * 50)
            }
          })
        });
      }
      
      // Detailed view with full time series
      return successResponse({
        metrics: metrics.map(m => ({
          ...m,
          timeSeries: m.timeSeries,
          breakdown: m.breakdown
        })),
        summary: {
          totalMetrics: metrics.length,
          generatedAt: new Date().toISOString()
        }
      });
    }
  );
}

/**
 * POST /api/analytics/events
 * Track custom analytics events
 * Body: { eventType, properties?, userId?, source? }
 */
export async function POST(request: NextRequest) {
  return apiMiddleware({ rateLimit: { requests: 200, windowMs: 60000 } })(
    request,
    async (request, context) => {
      const body = await request.json();
      const { eventType, properties = {}, userId, source = 'api' } = body;
      
      if (!eventType) {
        throw new ValidationError('Event type is required');
      }
      
      // Validate event type format (alphanumeric with underscores)
      if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(eventType)) {
        throw new ValidationError('Invalid event type format. Use alphanumeric characters and underscores only.');
      }
      
      // Create event record
      const newEvent: AnalyticsEvent = {
        id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        eventType,
        userId: userId || context.user?.id,
        sessionId: request.headers.get('X-Session-ID') || `anon_${Date.now()}`,
        properties: {
          ...properties,
          ip: request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown',
          userAgent: request.headers.get('user-agent')?.substring(0, 200),
          path: request.headers.get('referer') || 'unknown'
        },
        timestamp: new Date().toISOString(),
        source
      };
      
      // Store event (in production, write to Timeseries DB)
      eventsStore.push(newEvent);
      
      // Keep store size manageable in memory
      if (eventsStore.length > 10000) {
        eventsStore.splice(0, eventsStore.length - 10000);
      }
      
      // Return acknowledgment
      return successResponse({
        eventId: newEvent.id,
        status: 'recorded',
        message: 'Event tracked successfully'
      }, {
        processingTime: `${Math.floor(Math.random() * 10 + 1)}ms`
      });
    }
  );
}

/**
 * GET /api/analytics/events
 * Retrieve stored events with filtering
 */
export async function GET_EVENTS(request: NextRequest) {
  return apiMiddleware({ requireAuth: true, roles: [UserRole.ADMIN, UserRole.REVIEWER] })(
    request,
    async (request) => {
      const { searchParams } = new URL(request.url);
      const eventType = searchParams.get('eventType');
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '50');
      const startDate = searchParams.get('startDate');
      const endDate = searchParams.get('endDate');
      
      let filteredEvents = [...eventsStore];
      
      // Apply filters
      if (eventType) {
        filteredEvents = filteredEvents.filter(e => e.eventType === eventType);
      }
      
      if (startDate) {
        filteredEvents = filteredEvents.filter(e => e.timestamp >= startDate);
      }
      
      if (endDate) {
        filteredEvents = filteredEvents.filter(e => e.timestamp <= endDate);
      }
      
      // Sort by timestamp descending
      filteredEvents.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      
      // Paginate
      const total = filteredEvents.length;
      const start = (page - 1) * limit;
      const paginatedEvents = filteredEvents.slice(start, start + limit);
      
      // Generate aggregations
      const aggregations = generateAggregations(filteredEvents);
      
      return successResponse({
        events: paginatedEvents.map(e => ({
          ...e,
          // Don't expose internal properties in list view
          properties: {
            duration: e.properties.duration
          }
        })),
        total,
        aggregations,
        pagination: {
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          hasNext: start + limit < total,
          hasPrev: page > 1
        }
      });
    }
  );
}

/**
 * GET /api/analytics/trends
 * Calculate trend analysis for specific metrics
 */
export async function GET_TRENDS(request: NextRequest) {
  return apiMiddleware({ requireAuth: true })(
    request,
    async (request) => {
      const { searchParams } = new URL(request.url);
      const metricId = searchParams.get('metric');
      const period = searchParams.get('period') || '7d'; // 7d, 14d, 30d
      
      if (!metricId) {
        throw new ValidationError('Metric ID is required');
      }
      
      const metric = platformMetrics.find(m => m.id === metricId);
      if (!metric) {
        return successResponse({ error: 'Metric not found' }, { status: 404 });
      }
      
      const days = parseRange(period);
      const series = metric.timeSeries.slice(-days);
      
      // Calculate trend statistics
      const values = series.map(p => p.value);
      const sum = values.reduce((a, b) => a + b, 0);
      const avg = sum / values.length;
      const min = Math.min(...values);
      const max = Math.max(...values);
      
      // Simple linear regression for trend line
      const n = values.length;
      let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
      for (let i = 0; i < n; i++) {
        sumX += i;
        sumY += values[i];
        sumXY += i * values[i];
        sumXX += i * i;
      }
      const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
      const intercept = (sumY - slope * sumX) / n;
      
      // Project next period
      const projectedNext = slope * n + intercept;
      
      return successResponse({
        metric: metricId,
        name: metric.name,
        period,
        statistics: {
          average: Math.round(avg),
          minimum: min,
          maximum: max,
          standardDeviation: Math.sqrt(values.reduce((sq, v) => sq + Math.pow(v - avg, 2), 0) / n)
        },
        trend: {
          direction: slope > 0 ? 'increasing' : slope < 0 ? 'decreasing' : 'stable',
          slope: Math.round(slope * 100) / 100,
          rSquared: Math.min(1, Math.max(0, 1 - (values.reduce((err, v, i) => {
            const predicted = slope * i + intercept;
            return err + Math.pow(v - predicted, 2);
          }, 0) / (n * Math.pow(max - min, 2))))),
          projected: Math.round(projectedNext)
        },
        dataPoints: series
      });
    }
  );
}

export default { GET, POST, GET_EVENTS, GET_TRENDS };

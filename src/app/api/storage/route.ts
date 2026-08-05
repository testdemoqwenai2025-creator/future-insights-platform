/**
 * AETH-1 Blob Storage API
 * Petabyte-scale storage management
 */

import { NextRequest } from 'next/server';
import { apiMiddleware, successResponse, paginatedResponse } from '@/middleware/api';
import { UserRole } from '@/middleware/auth';
import { ValidationError, NotFoundError } from '@/middleware/error-handler';

// Storage class definitions
export enum StorageClass {
  HOT_REALTIME = 'blob:hot-realtime',
  HOT_ACTIVE = 'blob:hot-active',
  WARM_RECENT = 'blob:warm-recent',
  COLD_ARCHIVE = 'blob:cold-archive',
  DEEP_FREEZE = 'blob:deep-freeze',
  COMPLIANCE = 'blob:compliance'
}

export interface BlobStorage {
  id: string;
  name: string;
  containerPath: string;
  storageClass: StorageClass;
  sizeBytes: number;
  objectCount: number;
  versionsEnabled: boolean;
  lifecycleRules: Array<{
    action: string;
    days: number;
    targetClass?: string
  }>;
  createdAt: string;
  lastModified: string;
  accessCount: number;
}

// Mock storage containers
const storageContainers: BlobStorage[] = [
  {
    id: 'cont_001',
    name: 'aeth1-satellite-feeds-lhc-events',
    containerPath: '/data/active/satellite-lhc/',
    storageClass: StorageClass.HOT_ACTIVE,
    sizeBytes: 847329485760000, // ~847 TB
    objectCount: 2847293,
    versionsEnabled: true,
    lifecycleRules: [
      { action: 'tier', days: 30, targetClass: 'blob:warm-recent' },
      { action: 'tier', days: 90, targetClass: 'blob:cold-archive' }
    ],
    createdAt: '2024-01-15T00:00:00Z',
    lastModified: new Date().toISOString(),
    accessCount: 15234
  },
  {
    id: 'cont_002',
    name: 'genomics-reference-datasets',
    containerPath: '/data/genomic/reference/',
    storageClass: StorageClass.WARM_RECENT,
    sizeBytes: 320000000000000, // ~320 PB (scaled down for demo)
    objectCount: 45000000,
    versionsEnabled: false,
    lifecycleRules: [
      { action: 'archive', days: 180, targetClass: 'blob:cold-archive' }
    ],
    createdAt: '2024-03-01T00:00:00Z',
    lastModified: new Date(Date.now() - 86400000).toISOString(),
    accessCount: 8921
  },
  {
    id: 'cont_003',
    name: 'published-white-papers-archive',
    containerPath: '/data/archive/papers/',
    storageClass: StorageClass.COLD_ARCHIVE,
    sizeBytes: 25000000000, // ~25 GB
    objectCount: 3847,
    versionsEnabled: true,
    lifecycleRules: [
      { action: 'freeze', days: 2555 } // 7 years
    ],
    createdAt: '2020-06-01T00:00:00Z',
    lastModified: new Date(Date.now() - 259200000).toISOString(),
    accessCount: 45678
  },
  {
    id: 'cont_004',
    name: 'lhc-run3-atlas-open-data',
    containerPath: '/data/lhc/atlas/run3/',
    storageClass: StorageClass.HOT_REALTIME,
    sizeBytes: 2400000000000, // ~2.4 TB
    objectCount: 142000000,
    versionsEnabled: true,
    lifecycleRules: [
      { action: 'delete', days: 365 }
    ],
    createdAt: '2024-07-22T00:00:00Z',
    lastModified: new Date().toISOString(),
    accessCount: 89234
  }
];

// Helper to format bytes
function formatBytes(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB'];
  let unitIndex = 0;
  let value = bytes;
  
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex++;
  }
  
  return `${value.toFixed(1)} ${units[unitIndex]}`;
}

// GET /api/storage - List storage containers and status
export async function GET(request: NextRequest) {
  return apiMiddleware({ rateLimit: { requests: 120, windowMs: 60000 } })(
    request,
    async (request) => {
      const { searchParams } = new URL(request.url);
      const storageClass = searchParams.get('class');
      
      let filteredContainers = [...storageContainers];
      
      if (storageClass) {
        filteredContainers = filteredContainers.filter(c => c.storageClass === storageClass);
      }
      
      // Calculate totals
      const totalSize = filteredContainers.reduce((sum, c) => sum + c.sizeBytes, 0);
      const totalObjects = filteredContainers.reduce((sum, c) => sum + c.objectCount, 0);
      
      return successResponse({
        containers: filteredContainers.map(c => ({
          ...c,
          sizeFormatted: formatBytes(c.sizeBytes)
        })),
        summary: {
          totalContainers: filteredContainers.length,
          totalSize: formatBytes(totalSize),
          totalSizeBytes: totalSize,
          totalObjects,
          averageAccessCount: Math.round(
            filteredContainers.reduce((sum, c) => sum + c.accessCount, 0) / filteredContainers.length
          )
        },
        tiers: {
          hot: {
            count: storageContainers.filter(c => 
              [StorageClass.HOT_REALTIME, StorageClass.HOT_ACTIVE].includes(c.storageClass)
            ).length,
            size: formatBytes(
              storageContainers
                .filter(c => [StorageClass.HOT_REALTIME, StorageClass.HOT_ACTIVE].includes(c.storageClass))
                .reduce((sum, c) => sum + c.sizeBytes, 0)
            )
          },
          warm: {
            count: storageContainers.filter(c => c.storageClass === StorageClass.WARM_RECENT).length,
            size: formatBytes(
              storageContainers
                .filter(c => c.storageClass === StorageClass.WARM_RECENT)
                .reduce((sum, c) => sum + c.sizeBytes, 0)
            )
          },
          cold: {
            count: storageContainers.filter(c =>
              [StorageClass.COLD_ARCHIVE, StorageClass.DEEP_FREEZE].includes(c.storageClass)
            ).length,
            size: formatBytes(
              storageContainers
                .filter(c => [StorageClass.COLD_ARCHIVE, StorageClass.DEEP_FREEZE].includes(c.storageClass))
                .reduce((sum, c) => sum + c.sizeBytes, 0)
            )
          }
        }
      });
    }
  );
}

// POST /api/storage/container - Create new storage container
export async function POST(request: NextRequest) {
  return apiMiddleware({ 
    requireAuth: true,
    roles: [UserRole.ADMIN],
    rateLimit: { requests: 10, windowMs: 300000 }
  })(
    request,
    async (request) => {
      const body = await request.json();
      const { name, containerPath, storageClass, lifecycleRules } = body;
      
      if (!name || !containerPath || !storageClass) {
        throw new ValidationError('Name, path, and storage class are required');
      }
      
      const newContainer: BlobStorage = {
        id: `cont_${Date.now()}`,
        name,
        containerPath,
        storageClass,
        sizeBytes: 0,
        objectCount: 0,
        versionsEnabled: body.versionsEnabled ?? true,
        lifecycleRules: lifecycleRules || [],
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        accessCount: 0
      };
      
      storageContainers.push(newContainer);
      
      return successResponse({
        ...newContainer,
        sizeFormatted: '0 B'
      }, {
        message: 'Storage container created successfully'
      });
    }
  );
}

export { formatBytes };

export default { GET, POST };

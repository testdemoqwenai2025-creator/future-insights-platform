/**
 * AETH-1 Database Utilities
 * Prisma client setup, connection management, and helpers
 */

import { PrismaClient } from '@prisma/client';

// Global Prisma instance for development (singleton pattern)
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma = globalThis.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] 
    : ['error']
});

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

/**
 * Database health check
 */
export async function dbHealthCheck(): Promise<{
  status: 'healthy' | 'unhealthy';
  latency?: number;
  error?: string
}> {
  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    return {
      status: 'healthy',
      latency: Date.now() - start
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Transaction helper with retry logic
 */
export async function withTransaction<T>(
  fn: (tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0]) => Promise<T>,
  options?: { retries?: number; delay?: number }
): Promise<T> {
  const { retries = 3, delay = 1000 } = options || {};
  
  let lastError: Error | null = null;
  
  for (let i = 0; i <= retries; i++) {
    try {
      return await prisma.$transaction(fn);
    } catch (error) {
      lastError = error as Error;
      
      if (i < retries) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  }
  
  throw lastError;
}

/**
 * Pagination helper for database queries
 */
export function paginate(options: {
  page?: number;
  limit?: number;
  maxLimit?: number;
}) {
  const page = Math.max(1, options.page || 1);
  const limit = Math.min(
    options.limit || 20,
    options.maxLimit || 100
  );
  
  const skip = (page - 1) * limit;
  
  return { skip, take: limit, page };
}

/**
 * Soft delete helper
 */
export function softDelete(where: Record<string, any>) {
  return {
    where,
    data: {
      deletedAt: new Date(),
      isActive: false
    }
  };
}

/**
 * Search query builder
 */
export function buildSearchQuery(
  fields: string[],
  searchTerm: string
) {
  if (!searchTerm) return {};
  
  const searchFields = fields.map(field => ({
    [field]: { contains: searchTerm, mode: 'insensitive' as const }
  }));
  
  return { OR: searchFields };
}

/**
 * Repository base class for common CRUD operations
 */
export abstract class BaseRepository<T> {
  abstract modelName: string;
  
  protected get model() {
    return (prisma as any)[this.modelName];
  }
  
  async findById(id: string, include?: Record<string, any>): Promise<T | null> {
    return this.model.findUnique({ 
      where: { id },
      ...(include && { include })
    });
  }
  
  async findMany(
    filter?: Record<string, any>,
    pagination?: { page?: number; limit?: number }
  ): Promise<{ items: T[]; total: number }> {
    const { skip, take } = paginate(pagination || {});
    
    const [items, total] = await Promise.all([
      this.model.findMany({
        ...filter,
        skip,
        take,
        orderBy: { createdAt: 'desc' }
      }),
      this.model.count({ where: filter?.where })
    ]);
    
    return { items, total };
  }
  
  async create(data: Partial<T>): Promise<T> {
    return this.model.create({ data });
  }
  
  async update(id: string, data: Partial<T>): Promise<T> {
    return this.model.update({
      where: { id },
      data
    });
  }
  
  async delete(id: string): Promise<T> {
    return this.model.delete({ where: { id } });
  }
  
  async softDelete(id: string): Promise<T> {
    return this.model.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false
      }
    });
  }
}

// Export types
export type { PrismaClient };

export default prisma;

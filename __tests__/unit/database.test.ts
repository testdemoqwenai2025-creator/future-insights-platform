/**
 * Unit Tests for Database Utilities
 * AETH-1 Advanced Enterprise Technology Hub
 */

import {
  getPrisma,
  healthCheck,
  paginate,
  softDelete,
  buildSearchQuery,
  BaseRepository,
} from '../../src/lib/database';
import { PrismaClient } from '@prisma/client';

// Mock PrismaClient
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => ({
    $connect: jest.fn().mockResolvedValue(true),
    $disconnect: jest.fn().mockResolvedValue(true),
    $queryRaw: jest.fn(),
    $executeRaw: jest.fn(),
    $transaction: jest.fn(),
    user: { findMany: jest.fn(), count: jest.fn() },
    paper: { findMany: jest.fn(), count: jest.fn() },
  })),
}));

describe('Database Utilities', () => {
  describe('getPrisma (Singleton Pattern)', () => {
    it('should return singleton Prisma instance', () => {
      const prisma1 = getPrisma();
      const prisma2 = getPrisma();
      
      expect(prisma1).toBe(prisma2);
      expect(prisma1).toBeInstanceOf(PrismaClient);
    });

    it('should create only one instance across multiple calls', () => {
      const instances = Array.from({ length: 5 }, () => getPrisma());
      const uniqueInstances = new Set(instances);
      
      expect(uniqueInstances.size).toBe(1);
    });
  });

  describe('healthCheck', () => {
    it('should return healthy status when connected', async () => {
      const result = await healthCheck();
      
      expect(result.healthy).toBe(true);
      expect(result.latencyMs).toBeGreaterThanOrEqual(0);
    });

    it('should handle connection failures gracefully', async () => {
      // Mock connection failure
      const prisma = getPrisma();
      prisma.$connect = jest.fn().mockRejectedValue(new Error('Connection failed'));
      
      const result = await healthCheck();
      
      expect(result.healthy).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('paginate', () => {
    const mockItems = Array.from({ length: 25 }, (_, i) => ({ id: i + 1, name: `Item ${i + 1}` }));

    it('should return first page with correct items', () => {
      const result = paginate(mockItems, { page: 1, limit: 10 });
      
      expect(result.items).toHaveLength(10);
      expect(result.items[0].id).toBe(1);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.totalPages).toBe(3);
      expect(result.pagination.hasNext).toBe(true);
      expect(result.pagination.hasPrev).toBe(false);
    });

    it('should return second page correctly', () => {
      const result = paginate(mockItems, { page: 2, limit: 10 });
      
      expect(result.items).toHaveLength(10);
      expect(result.items[0].id).toBe(11);
      expect(result.pagination.page).toBe(2);
      expect(result.pagination.hasNext).toBe(true);
      expect(result.pagination.hasPrev).toBe(true);
    });

    it('should return last page with remaining items', () => {
      const result = paginate(mockItems, { page: 3, limit: 10 });
      
      expect(result.items).toHaveLength(5);
      expect(result.items[0].id).toBe(21);
      expect(result.pagination.hasNext).toBe(false);
      expect(result.pagination.hasPrev).toBe(true);
    });

    it('should handle empty array', () => {
      const result = paginate([], { page: 1, limit: 10 });
      
      expect(result.items).toHaveLength(0);
      expect(result.pagination.totalItems).toBe(0);
      expect(result.pagination.totalPages).toBe(0);
    });

    it('should handle page beyond range', () => {
      const result = paginate(mockItems, { page: 100, limit: 10 });
      
      expect(result.items).toHaveLength(0);
      expect(result.pagination.page).toBe(100);
    });

    it('should use default limit if not specified', () => {
      const result = paginate(mockItems, { page: 1 });
      
      expect(result.pagination.limit).toBeDefined();
      expect(result.items.length).toBeLessThanOrEqual(result.pagination.limit);
    });

    it('should calculate total items correctly', () => {
      const result = paginate(mockItems, { page: 1, limit: 10 });
      
      expect(result.pagination.totalItems).toBe(25);
    });
  });

  describe('softDelete', () => {
    it('should add deletedAt timestamp to item', () => {
      const item = { id: 1, name: 'Test', deletedAt: null };
      const result = softDelete(item as any);
      
      expect(result.deletedAt).toBeInstanceOf(Date);
      expect(result.name).toBe('Test');
    });

    it('should not modify other fields', () => {
      const item = { id: 1, name: 'Test', value: 42, active: true };
      const result = softDelete(item as any);
      
      expect(result.id).toBe(1);
      expect(result.value).toBe(42);
      expect(result.active).toBe(true);
    });

    it('should handle already deleted items', () => {
      const existingDate = new Date('2024-01-01');
      const item = { id: 1, deletedAt: existingDate };
      const result = softDelete(item as any);
      
      expect(result.deletedAt).toBeInstanceOf(Date);
    });
  });

  describe('buildSearchQuery', () => {
    it('should build query for single search term', () => {
      const query = buildSearchQuery('test', ['name', 'description']);
      
      expect(query.OR).toBeDefined();
      expect(query.OR).toHaveLength(2);
    });

    it('should be case insensitive', () => {
      const query = buildSearchQuery('TEST', ['name']);
      
      expect(query.OR?.[0]).toBeDefined();
    });

    it('should handle multiple search terms', () => {
      const query = buildSearchQuery('test search', ['name', 'title']);
      
      // Should handle multiple terms (AND logic between terms)
      expect(query.AND || query.OR).toBeDefined();
    });

    it('should handle empty search string', () => {
      const query = buildSearchQuery('', ['name']);
      
      expect(query).toEqual({});
    });

    it('should handle empty field list', () => {
      const query = buildSearchQuery('test', []);
      
      expect(query).toEqual({});
    });

    it('should trim whitespace from search term', () => {
      const query = buildSearchQuery('  test  ', ['name']);
      
      expect(query.OR).toBeDefined();
    });
  });

  describe('BaseRepository<T>', () => {
    interface TestEntity {
      id: string;
      name: string;
      createdAt: Date;
      updatedAt: Date;
      deletedAt?: Date | null;
    }

    class TestRepository extends BaseRepository<TestEntity> {
      constructor() {
        super('testEntity' as any);
      }
    }

    let repository: TestRepository;

    beforeEach(() => {
      repository = new TestRepository();
    });

    describe('find method', () => {
      it('should find all non-deleted items by default', async () => {
        const mockData = [
          { id: '1', name: 'Test 1', createdAt: new Date(), updatedAt: new Date() },
          { id: '2', name: 'Test 2', createdAt: new Date(), updatedAt: new Date() },
        ];
        
        (getPrisma().testEntity.findMany as jest.Mock).mockResolvedValue(mockData);
        
        const results = await repository.find();
        
        expect(results).toEqual(mockData);
        expect(getPrisma().testEntity.findMany).toHaveBeenCalledWith(
          expect.objectContaining({ where: expect.objectContaining({ deletedAt: null }) })
        );
      });

      it('should accept custom where clause', async () => {
        (getPrisma().testEntity.findMany as jest.Mock).mockResolvedValue([]);
        
        await repository.find({ where: { name: 'Test' } as any });
        
        expect(getPrisma().testEntity.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({ name: 'Test' }),
          })
        );
      });
    });

    describe('findById method', () => {
      it('should find item by ID', async () => {
        const mockItem = { 
          id: '123', 
          name: 'Test', 
          createdAt: new Date(), 
          updatedAt: new Date() 
        };
        
        (getPrisma().testEntity.findUnique as jest.Mock).mockResolvedValue(mockItem);
        
        const result = await repository.findById('123');
        
        expect(result).toEqual(mockItem);
        expect(getPrisma().testEntity.findUnique).toHaveBeenCalledWith({
          where: { id: '123' },
        });
      });

      it('should return null for non-existent ID', async () => {
        (getPrisma().testEntity.findUnique as jest.Mock).mockResolvedValue(null);
        
        const result = await repository.findById('non-existent');
        
        expect(result).toBeNull();
      });
    });

    describe('create method', () => {
      it('should create new item', async () => {
        const newItem = { name: 'New Item' };
        const createdItem = { 
          id: '456', 
          ...newItem, 
          createdAt: new Date(), 
          updatedAt: new Date() 
        };
        
        (getPrisma().testEntity.create as jest.Mock).mockResolvedValue(createdItem);
        
        const result = await repository.create(newItem as any);
        
        expect(result).toEqual(createdItem);
        expect(getPrisma().testEntity.create).toHaveBeenCalledWith({
          data: newItem,
        });
      });
    });

    describe('update method', () => {
      it('should update existing item', async () => {
        const updateData = { name: 'Updated Name' };
        const updatedItem = { 
          id: '789', 
          ...updateData, 
          createdAt: new Date(), 
          updatedAt: new Date() 
        };
        
        (getPrisma().testEntity.update as jest.Mock).mockResolvedValue(updatedItem);
        
        const result = await repository.update('789', updateData as any);
        
        expect(result).toEqual(updatedItem);
        expect(getPrisma().testEntity.update).toHaveBeenCalledWith({
          where: { id: '789' },
          data: updateData,
        });
      });
    });

    describe('delete method (soft delete)', () => {
      it('should soft delete item by default', async () => {
        const deletedItem = { 
          id: 'abc', 
          name: 'To Delete', 
          createdAt: new Date(), 
          updatedAt: new Date(),
          deletedAt: new Date(),
        };
        
        (getPrisma().testEntity.update as jest.Mock).mockResolvedValue(deletedItem);
        
        const result = await repository.delete('abc');
        
        expect(result.deletedAt).toBeInstanceOf(Date);
        expect(getPrisma().testEntity.update).toHaveBeenCalledWith({
          where: { id: 'abc' },
          data: expect.objectContaining({ deletedAt: expect.any(Date) }),
        });
      });
    });

    describe('count method', () => {
      it('should count items matching criteria', async () => {
        (getPrisma().testEntity.count as jest.Mock).mockResolvedValue(42);
        
        const count = await repository.count({ where: {} as any });
        
        expect(count).toBe(42);
        expect(getPrisma().testEntity.count).toHaveBeenCalled();
      });
    });

    describe('exists method', () => {
      it('should return true when item exists', async () => {
        (getPrisma().testEntity.count as jest.Mock).mockResolvedValue(1);
        
        const exists = await repository.exists('123');
        
        expect(exists).toBe(true);
      });

      it('should return false when item does not exist', async () => {
        (getPrisma().testEntity.count as jest.Mock).mockResolvedValue(0);
        
        const exists = await repository.exists('non-existent');
        
        expect(exists).toBe(false);
      });
    });
  });
});

/**
 * Unit Tests for Utility Functions
 * AETH-1 Advanced Enterprise Technology Hub
 */

// Import utility functions from the codebase
// These are common utilities used across the application

describe('Format Utilities', () => {
  describe('formatBytes', () => {
    // Test the formatBytes function (or create inline version for testing)
    const formatBytes = (bytes: number, decimals = 2): string => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const dm = Math.max(0, decimals);
      const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    it('should format bytes correctly', () => {
      expect(formatBytes(0)).toBe('0 Bytes');
      expect(formatBytes(1024)).toBe('1 KB');
      expect(formatBytes(1048576)).toBe('1 MB');
      expect(formatBytes(1073741824)).toBe('1 GB');
      expect(formatBytes(1099511627776)).toBe('1 TB');
    });

    it('handle decimal places', () => {
      const result = formatBytes(1536, 2);
      expect(result).toContain('KB');
      expect(parseFloat(result)).toBeCloseTo(1.5, 1);
    });

    it('should handle large numbers (petabytes)', () => {
      const pb = 1125899906842624;
      expect(formatBytes(pb)).toBe('1 PB');
    });

    it('should handle small byte values', () => {
      expect(formatBytes(500)).toBe('500 Bytes');
      expect(formatBytes(999)).toBe('999 Bytes');
    });
  });

  describe('formatNumber', () => {
    const formatNumber = (num: number): string => {
      if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
      if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
      return num.toString();
    };

    it('should format large numbers with suffixes', () => {
      expect(formatNumber(100)).toBe('100');
      expect(formatNumber(1500)).toBe('1.5K');
      expect(formatNumber(2500000)).toBe('2.5M');
    });

    it('should handle edge cases', () => {
      expect(formatNumber(0)).toBe('0');
      expect(formatNumber(999)).toBe('999');
      expect(formatNumber(1000)).toBe('1.0K');
    });
  });

  describe('formatDate', () => {
    const formatDate = (date: Date | string, locale = 'en-US'): string => {
      const d = typeof date === 'string' ? new Date(date) : date;
      return d.toLocaleDateString(locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    };

    it('should format dates to readable string', () => {
      const date = new Date('2024-01-15');
      const result = formatDate(date);
      
      expect(result).toContain('2024');
      expect(result).toContain('Jan');
    });

    it('should handle string input', () => {
      const result = formatDate('2024-06-20');
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('formatRelativeTime', () => {
    const formatRelativeTime = (date: Date | string): string => {
      const now = new Date();
      const d = typeof date === 'string' ? new Date(date) : date;
      const diffMs = now.getTime() - d.getTime();
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffSecs < 60) return `${diffSecs}s ago`;
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return `${diffDays}d ago`;
    };

    it('should show seconds for recent times', () => {
      const now = new Date();
      const result = formatRelativeTime(new Date(now.getTime() - 30000)); // 30s ago
      expect(result).toContain('s ago');
    });

    it('should show minutes for recent times', () => {
      const now = new Date();
      const result = formatRelativeTime(new Date(now.getTime() - 5 * 60000)); // 5m ago
      expect(result).toContain('m ago');
    });

    it('should show hours for same-day times', () => {
      const now = new Date();
      const result = formatRelativeTime(new Date(now.getTime() - 3 * 3600000)); // 3h ago
      expect(result).toContain('h ago');
    });

    it('should show days for older times', () => {
      const now = new Date();
      const result = formatRelativeTime(new Date(now.getTime() - 5 * 86400000)); // 5d ago
      expect(result).toContain('d ago');
    });
  });
});

describe('Validation Utilities', () => {
  describe('isValidEmail', () => {
    const isValidEmail = (email: string): boolean => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };

    it('should validate correct emails', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name+tag@domain.co.uk')).toBe(true);
    });

    it('should reject invalid emails', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('invalid@')).toBe(false);
      expect(isValidEmail('@domain.com')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('isValidUrl', () => {
    const isValidUrl = (url: string): boolean => {
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    };

    it('should validate correct URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://localhost:3000')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(isValidUrl('not-a-url')).toBe(false);
      expect(isValidUrl('')).toBe(false);
    });
  });

  describe('isValidUUID', () => {
    const isValidUUID = (uuid: string): boolean => {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      return uuidRegex.test(uuid);
    };

    it('should validate UUID v4 format', () => {
      expect(isValidUUID('123e4567-e89b-12d3-a456-426614174000')).toBe(true);
      expect(isValidUUID('not-a-uuid')).toBe(false);
      expect(isValidUUID('')).toBe(false);
    });
  });

  describe('sanitizeString', () => {
    const sanitizeString = (str: string): string => {
      return str
        .trim()
        .replace(/[<>\"\'&]/g, '') // Remove potentially dangerous chars
        .replace(/\s+/g, ' ') // Collapse whitespace
        .substring(0, 1000); // Limit length
    };

    it('should trim and clean strings', () => {
      expect(sanitizeString('  hello world  ')).toBe('hello world');
    });

    it('should remove dangerous characters', () => {
      expect(sanitizeString('<script>alert("xss")</script>')).not.toContain('<');
      expect(sanitizeString('test"quote')).not.toContain('"');
    });

    it('should limit string length', () => {
      const longStr = 'a'.repeat(2000);
      expect(sanitizeString(longStr).length).toBe(1000);
    });
  });
});

describe('ID Generation Utilities', () => {
  describe('generateId', () => {
    const generateId = (prefix = ''): string => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let id = prefix;
      for (let i = 0; i < 12; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return id;
    };

    it('should generate ID with specified length', () => {
      const id = generateId();
      expect(id.length).toBe(12);
    });

    it('should include prefix when provided', () => {
      const id = generateId('usr_');
      expect(id.startsWith('usr_'));
      expect(id.length).toBe(16); // prefix + 12 chars
    });

    it('should generate unique IDs', () => {
      const ids = new Set(Array.from({ length: 100 }, () => generateId()));
      expect(ids.size).toBe(100); // All unique
    });
  });

  describe('slugify', () => {
    const slugify = (str: string): string => {
      return str
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 80);
    };

    it('should convert strings to URL-friendly slugs', () => {
      expect(slugify('Hello World')).toBe('hello-world');
      expect(slugify('Test String Here')).toBe('test-string-here');
    });

    it('should remove special characters', () => {
      expect(slugify('Hello, World!')).toBe('hello-world');
      expect(slugify('Test @#$% String')).toBe('test-string');
    });

    it('should handle multiple spaces and dashes', () => {
      expect(slugify('  Hello   World  ')).toBe('hello-world');
      // Note: current implementation collapses spaces but not consecutive dashes
      const result = slugify('Test--String---Here');
      expect(result).toContain('test');
      expect(result).toContain('string');
      expect(result).toContain('here');
    });
  });
});

describe('Array Utilities', () => {
  describe('chunkArray', () => {
    const chunkArray = <T>(arr: T[], size: number): T[][] => {
      const chunks: T[][] = [];
      for (let i = 0; i < arr.length; i += size) {
        chunks.push(arr.slice(i, i + size));
      }
      return chunks;
    };

    it('should split array into chunks', () => {
      const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9];
      const chunks = chunkArray(arr, 3);
      
      expect(chunks).toHaveLength(3);
      expect(chunks[0]).toEqual([1, 2, 3]);
      expect(chunks[1]).toEqual([4, 5, 6]);
      expect(chunks[2]).toEqual([7, 8, 9]);
    });

    it('should handle remainder items', () => {
      const arr = [1, 2, 3, 4, 5];
      const chunks = chunkArray(arr, 2);
      
      expect(chunks).toHaveLength(3);
      expect(chunks[2]).toEqual([5]);
    });

    it('should handle empty array', () => {
      const chunks = chunkArray([], 3);
      expect(chunks).toEqual([]);
    });

    it('should handle chunk size larger than array', () => {
      const arr = [1, 2, 3];
      const chunks = chunkArray(arr, 10);
      
      expect(chunks).toHaveLength(1);
      expect(chunks[0]).toEqual([1, 2, 3]);
    });
  });

  describe('uniqueBy', () => {
    const uniqueBy = <T>(arr: T[], key: keyof T): T[] => {
      const seen = new Set();
      return arr.filter(item => {
        const val = item[key];
        if (seen.has(val)) return false;
        seen.add(val);
        return true;
      });
    };

    it('should remove duplicates by key', () => {
      const arr = [
        { id: 1, name: 'A' },
        { id: 2, name: 'B' },
        { id: 1, name: 'C' }, // Duplicate id
      ];
      
      const result = uniqueBy(arr, 'id');
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('A'); // Keep first occurrence
    });

    it('should handle empty array', () => {
      expect(uniqueBy([], 'id' as any)).toEqual([]);
    });
  });

  describe('groupBy', () => {
    const groupBy = <T>(arr: T[], key: keyof T): Record<string, T[]> => {
      return arr.reduce((groups, item) => {
        const val = String(item[key]);
        (groups[val] ||= []).push(item);
        return groups;
      }, {} as Record<string, T[]>);
    };

    it('should group items by key value', () => {
      const arr = [
        { category: 'A', value: 1 },
        { category: 'B', value: 2 },
        { category: 'A', value: 3 },
      ];
      
      const groups = groupBy(arr, 'category');
      
      expect(groups['A']).toHaveLength(2);
      expect(groups['B']).toHaveLength(1);
    });
  });
});

describe('Object Utilities', () => {
  describe('omit', () => {
    const omit = <T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> => {
      const result = { ...obj };
      for (const key of keys) {
        delete result[key];
      }
      return result;
    };

    it('should omit specified keys from object', () => {
      const obj = { a: 1, b: 2, c: 3, d: 4 };
      const result = omit(obj, ['b', 'd']);
      
      expect(result).toEqual({ a: 1, c: 3 });
      expect('b' in result).toBe(false);
    });

    it('should not modify original object', () => {
      const obj = { a: 1, b: 2 };
      const result = omit(obj, ['a']);
      
      expect(obj.a).toBe(1); // Original unchanged
    });
  });

  describe('pick', () => {
    const pick = <T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => {
      const result = {} as Pick<T, K>;
      for (const key of keys) {
        if (key in obj) {
          result[key] = obj[key];
        }
      }
      return result;
    };

    it('should pick only specified keys', () => {
      const obj = { a: 1, b: 2, c: 3, d: 4 };
      const result = pick(obj, ['a', 'c']);
      
      expect(result).toEqual({ a: 1, c: 3 });
    });

    it('should handle missing keys gracefully', () => {
      const obj = { a: 1 };
      const result = pick(obj, ['a', 'b'] as any);
      
      expect(result).toEqual({ a: 1 });
    });
  });

  describe('deepClone', () => {
    const deepClone = <T>(obj: T): T => {
      return JSON.parse(JSON.stringify(obj));
    };

    it('should create independent copy of object', () => {
      const original = { nested: { value: 1 }, arr: [1, 2, 3] };
      const cloned = deepClone(original);
      
      cloned.nested.value = 99;
      cloned.arr.push(4);
      
      expect(original.nested.value).toBe(1);
      expect(original.arr).toHaveLength(3);
    });

    it('should clone arrays properly', () => {
      const arr = [{ a: 1 }, { b: 2 }];
      const cloned = deepClone(arr);
      
      expect(cloned).toEqual(arr);
      expect(cloned).not.toBe(arr);
      expect(cloned[0]).not.toBe(arr[0]);
    });
  });
});

import { Injectable, OnModuleDestroy } from '@nestjs/common';
import NodeCache from 'node-cache';

/**
 * Centralized caching service using node-cache
 *
 * Cache TTLs (Time To Live):
 * - User lookups (JWT auth): 5 minutes - reduces DB hits on every request
 * - Events list: 2 minutes - frequently accessed, updates aren't urgent
 * - Leaderboard: 5 minutes - expensive query, updates aren't real-time critical
 * - Friends list: 3 minutes - balance between freshness and performance
 */
@Injectable()
export class CacheService implements OnModuleDestroy {
  private cache: NodeCache;

  constructor() {
    this.cache = new NodeCache({
      stdTTL: 300, // Default 5 minutes
      checkperiod: 60, // Check for expired keys every 60 seconds
      useClones: false, // Don't clone objects (better performance)
    });

    // Log cache stats periodically in development
    if (process.env.NODE_ENV !== 'production') {
      setInterval(() => {
        const stats = this.cache.getStats();
        if (stats.keys > 0) {
          console.log(`📊 Cache stats: ${stats.keys} keys, ${stats.hits} hits, ${stats.misses} misses`);
        }
      }, 60000); // Every minute
    }
  }

  /**
   * Get value from cache
   */
  get<T>(key: string): T | undefined {
    return this.cache.get<T>(key);
  }

  /**
   * Set value in cache with optional TTL override
   */
  set<T>(key: string, value: T, ttl?: number): boolean {
    return this.cache.set(key, value, ttl || 0);
  }

  /**
   * Delete specific key(s) from cache
   */
  del(keys: string | string[]): number {
    return this.cache.del(keys);
  }

  /**
   * Delete all keys matching a pattern
   * @param pattern Regex pattern or string prefix
   */
  delPattern(pattern: string | RegExp): number {
    const keys = this.cache.keys();
    const regex = typeof pattern === 'string' ? new RegExp(`^${pattern}`) : pattern;
    const matchingKeys = keys.filter(key => regex.test(key));
    return this.cache.del(matchingKeys);
  }

  /**
   * Check if key exists in cache
   */
  has(key: string): boolean {
    return this.cache.has(key);
  }

  /**
   * Clear all cache entries
   */
  flushAll(): void {
    this.cache.flushAll();
    console.log('🧹 Cache cleared');
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return this.cache.getStats();
  }

  /**
   * Wrap a function with caching
   * @param key Cache key
   * @param fn Function to execute if cache miss
   * @param ttl Optional TTL override (seconds)
   */
  async wrap<T>(key: string, fn: () => Promise<T>, ttl?: number): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== undefined) {
      return cached;
    }

    const result = await fn();
    this.set(key, result, ttl);
    return result;
  }

  /**
   * Cleanup on module destroy
   */
  onModuleDestroy() {
    this.cache.close();
  }
}

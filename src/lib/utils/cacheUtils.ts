/**
 * Standard Cache TTL presets for Next.js cacheLife() API.
 * 
 * Each profile defines:
 * - stale: How long the client can use the cached value without checking the server.
 * - revalidate: How often the server background-refreshes the cache.
 * - expire: Maximum duration before a value is considered dead.
 */

export const CACHE_TTL = {
  FAST: {
    stale: 60,       // 1 minute
    revalidate: 30,  // 30 seconds
    expire: 3600,    // 1 hour
  },
  STANDARD: {
    stale: 3600,     // 1 hour
    revalidate: 900,  // 15 minutes
    expire: 86400,   // 1 day
  },
  PERSISTENT: {
    stale: 86400,    // 1 day
    revalidate: 3600, // 1 hour
    expire: 604800,  // 1 week
  },
} as const;

export type CacheLifeProfile = keyof typeof CACHE_TTL;

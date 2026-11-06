interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

/**
 * In-memory TTL cache to deduplicate YouTube search queries
 * and conserve YouTube Data API quota.
 */
class SearchCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private maxEntries = 1000;
  private defaultTtlMs = 1000 * 60 * 60 * 24; // 24 hours

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > this.defaultTtlMs) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  set<T>(key: string, data: T, ttlMs?: number): void {
    if (this.cache.size >= this.maxEntries) {
      // Evict oldest 20%
      const keys = Array.from(this.cache.keys()).slice(0, 200);
      for (const k of keys) this.cache.delete(k);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  clear(): void {
    this.cache.clear();
  }
}

export const youtubeSearchCache = new SearchCache();

/**
 * Utility to retry an async task with exponential backoff on transient errors (e.g. 503, 500, 429).
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries = 3,
  baseDelayMs = 500
): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (err: unknown) {
      attempt++;
      if (attempt >= retries) throw err;

      // Don't retry on quotaExceeded or 401/403 permission errors
      const errorMsg = String(err);
      if (
        errorMsg.includes("quotaExceeded") ||
        errorMsg.includes("401") ||
        errorMsg.includes("invalid_grant")
      ) {
        throw err;
      }

      const delay = baseDelayMs * Math.pow(2, attempt) + Math.random() * 200;
      await new Promise((res) => setTimeout(res, delay));
    }
  }
}

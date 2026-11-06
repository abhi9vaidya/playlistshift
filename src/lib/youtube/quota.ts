interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

/**
 * In-memory TTL cache to deduplicate YouTube search queries
 * and conserve YouTube Data API quota within active serverless containers.
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

  set<T>(key: string, data: T): void {
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
 * In-flight request deduplication map.
 * If multiple identical search queries arrive simultaneously, they share the same Promise
 * rather than triggering duplicate outgoing HTTP calls and consuming extra quota units.
 */
const inFlightRequests = new Map<string, Promise<unknown>>();

export function deduplicateInFlight<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  if (inFlightRequests.has(key)) {
    return inFlightRequests.get(key) as Promise<T>;
  }

  const promise = fetcher().finally(() => {
    inFlightRequests.delete(key);
  });

  inFlightRequests.set(key, promise);
  return promise;
}

/**
 * In-memory sliding window rate limiter per client IP.
 * Protects serverless functions from burst attacks and prevents rapid quota depletion.
 */
interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

export function checkRateLimit(
  clientId: string,
  limit = 40,
  windowMs = 60000
): { allowed: boolean; remaining: number; resetInMs: number } {
  const now = Date.now();
  const record = rateLimitMap.get(clientId);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(clientId, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetInMs: windowMs };
  }

  if (record.count >= limit) {
    return { allowed: false, remaining: 0, resetInMs: record.resetAt - now };
  }

  record.count++;
  return { allowed: true, remaining: limit - record.count, resetInMs: record.resetAt - now };
}

/**
 * Calculates YouTube API quota unit consumption based on Google's official pricing:
 * - search.list: 100 units per call
 * - playlists.insert: 50 units
 * - playlistItems.insert: 50 units per song item
 */
export function estimatePlaylistQuotaCost(trackCount: number): {
  searchUnits: number;
  creationUnits: number;
  insertionUnits: number;
  totalEstimatedUnits: number;
} {
  const searchUnits = trackCount * 100;
  const creationUnits = 50;
  const insertionUnits = trackCount * 50;
  const totalEstimatedUnits = searchUnits + creationUnits + insertionUnits;

  return {
    searchUnits,
    creationUnits,
    insertionUnits,
    totalEstimatedUnits,
  };
}

/**
 * Utility to retry an async task with exponential backoff on transient errors (e.g. 503, 500, 429).
 * Strictly aborts immediately if quota is exceeded or authorization fails.
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

      // Do NOT retry on quotaExceeded, 401, 403, or invalid grant errors
      const errorMsg = String(err);
      if (
        errorMsg.includes("quotaExceeded") ||
        errorMsg.includes("401") ||
        errorMsg.includes("403") ||
        errorMsg.includes("invalid_grant") ||
        errorMsg.includes("YouTubeQuotaExceededError")
      ) {
        throw err;
      }

      const delay = baseDelayMs * Math.pow(2, attempt) + Math.random() * 200;
      await new Promise((res) => setTimeout(res, delay));
    }
  }
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

/**
 * In-memory TTL cache to deduplicate YouTube search queries
 * within an active warm serverless instance.
 *
 * NOTE ON SERVERLESS PERSISTENCE:
 * This cache is instance-local. On Vercel serverless functions, separate container
 * instances do NOT share memory, and cold starts will reset this map.
 * It provides effective short-term optimization and prevents redundant queries during
 * a warm session, but does NOT guarantee global distributed quota persistence.
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
 * If multiple identical search queries arrive concurrently within the same instance,
 * they share the active Promise rather than making duplicated outgoing HTTP requests.
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
 * Sliding window rate limiter per client IP (instance-local).
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
 * Calculates YouTube API quota usage under Google's granular quota system:
 *
 * 1. Search Queries Quota Bucket:
 *    - search.list: 1 unit per request from a separate Search Queries bucket
 *      (Default limit: 100 search requests/day).
 *
 * 2. General Quota Bucket:
 *    - playlists.insert: 50 units
 *    - playlistItems.insert: 50 units per video inserted
 *      (Default limit: 10,000 general units/day).
 *
 * Example (20-song playlist):
 *    - 20 YouTube searches = 20 Search Queries quota units.
 *    - 1 playlist creation = 50 general quota units.
 *    - 20 playlist insertions = 1,000 general quota units.
 *    - Total = 1,050 general quota units PLUS 20 search queries.
 *
 * Notice: The 100 Search Queries/day ceiling is the primary constraint,
 * allowing approximately five 20-track conversions per day on default free tiers.
 */
export function estimatePlaylistQuotaCost(trackCount: number): {
  searchQueries: number;
  creationUnits: number;
  insertionUnits: number;
  totalGeneralUnits: number;
  searchQueriesDayLimit: number;
  generalQuotaDayLimit: number;
  estimatedConversionsPerDay: number;
} {
  const searchQueries = trackCount; // 1 unit per search
  const creationUnits = 50;
  const insertionUnits = trackCount * 50;
  const totalGeneralUnits = creationUnits + insertionUnits;

  const searchQueriesDayLimit = 100;
  const generalQuotaDayLimit = 10000;
  const estimatedConversionsPerDay = Math.floor(searchQueriesDayLimit / Math.max(1, trackCount));

  return {
    searchQueries,
    creationUnits,
    insertionUnits,
    totalGeneralUnits,
    searchQueriesDayLimit,
    generalQuotaDayLimit,
    estimatedConversionsPerDay,
  };
}

/**
 * Utility to retry an async task with exponential backoff on transient errors (e.g. 503, 500, 429).
 * Strictly aborts immediately if quota is exhausted or authorization fails.
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
        errorMsg.includes("searchQuotaExceeded") ||
        errorMsg.includes("401") ||
        errorMsg.includes("403") ||
        errorMsg.includes("invalid_grant") ||
        errorMsg.includes("YouTubeSearchQuotaExceededError") ||
        errorMsg.includes("YouTubeGeneralQuotaExceededError")
      ) {
        throw err;
      }

      const delay = baseDelayMs * Math.pow(2, attempt) + Math.random() * 200;
      await new Promise((res) => setTimeout(res, delay));
    }
  }
}

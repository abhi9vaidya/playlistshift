import { describe, it, expect, vi } from "vitest";
import {
  deduplicateInFlight,
  checkRateLimit,
  estimatePlaylistQuotaCost,
  retryWithBackoff,
} from "@/lib/youtube/quota";

describe("YouTube API Quota Management & Optimization", () => {
  it("deduplicates concurrent in-flight requests for identical queries", async () => {
    let callCount = 0;
    const fetcher = vi.fn(async () => {
      callCount++;
      await new Promise((r) => setTimeout(r, 50));
      return [{ id: "vid1", title: "Song 1" }];
    });

    // Fire 3 simultaneous requests with the exact same cache key
    const [res1, res2, res3] = await Promise.all([
      deduplicateInFlight("key_bohemian_rhapsody", fetcher),
      deduplicateInFlight("key_bohemian_rhapsody", fetcher),
      deduplicateInFlight("key_bohemian_rhapsody", fetcher),
    ]);

    expect(callCount).toBe(1);
    expect(res1).toEqual(res2);
    expect(res2).toEqual(res3);
  });

  it("calculates official YouTube API quota costs accurately", () => {
    // 20 songs: 20 searches (2000 units), 1 playlist creation (50 units), 20 insertions (1000 units)
    const cost20 = estimatePlaylistQuotaCost(20);
    expect(cost20.searchUnits).toBe(2000);
    expect(cost20.creationUnits).toBe(50);
    expect(cost20.insertionUnits).toBe(1000);
    expect(cost20.totalEstimatedUnits).toBe(3050);

    // Single song
    const cost1 = estimatePlaylistQuotaCost(1);
    expect(cost1.totalEstimatedUnits).toBe(200);
  });

  it("enforces sliding window rate limits per client IP", () => {
    const clientId = `test_client_${Date.now()}`;
    const limit = 5;

    for (let i = 0; i < limit; i++) {
      const check = checkRateLimit(clientId, limit, 60000);
      expect(check.allowed).toBe(true);
    }

    // Exceeding limit should return allowed: false
    const blockedCheck = checkRateLimit(clientId, limit, 60000);
    expect(blockedCheck.allowed).toBe(false);
    expect(blockedCheck.remaining).toBe(0);
  });

  it("never retries on quotaExceeded or 403 errors in retryWithBackoff", async () => {
    let attempts = 0;
    const failingFetcher = async () => {
      attempts++;
      throw new Error("The request cannot be completed because you have exceeded your quotaExceeded limit.");
    };

    await expect(retryWithBackoff(failingFetcher, 3)).rejects.toThrow("quotaExceeded");
    expect(attempts).toBe(1); // Aborts immediately without retrying
  });
});


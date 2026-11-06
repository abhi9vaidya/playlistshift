import { youtubeSearchCache, deduplicateInFlight, retryWithBackoff } from "./quota";
import { parseIsoDurationMs } from "../matching/similarity";
import { PrivacyStatus, YouTubePlaylistCreationResult } from "@/types";

export interface YouTubeCandidateRaw {
  videoId: string;
  title: string;
  channelTitle: string;
  channelId?: string;
  description?: string;
  thumbnailUrl: string;
  durationMs?: number;
  publishedAt?: string;
}

export class YouTubeQuotaExceededError extends Error {
  constructor(
    message = "YouTube Data API daily quota limit (10,000 units) reached. Please try again tomorrow or sign in with your own Google account."
  ) {
    super(message);
    this.name = "YouTubeQuotaExceededError";
  }
}

export class YouTubeRateLimitExceededError extends Error {
  constructor(
    message = "YouTube search rate limit temporarily reached. Please wait a moment before searching more tracks."
  ) {
    super(message);
    this.name = "YouTubeRateLimitExceededError";
  }
}

export class YouTubeAuthRequiredError extends Error {
  constructor(message = "Google authorization required to perform this action.") {
    super(message);
    this.name = "YouTubeAuthRequiredError";
  }
}

/**
 * Decodes basic HTML entities commonly returned by YouTube API (e.g. &quot;, &#39;, &amp;)
 */
function decodeHtmlEntities(str: string): string {
  if (!str) return "";
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

/**
 * Searches YouTube for video candidates matching a query string.
 * Employs in-memory caching and in-flight request deduplication to conserve YouTube Data API quota.
 */
export async function searchYouTubeVideos(
  query: string,
  maxResults = 5,
  userAccessToken?: string
): Promise<YouTubeCandidateRaw[]> {
  const cleanQuery = query.toLowerCase().trim();
  const cacheKey = `yt_search_${cleanQuery}_${maxResults}`;

  const cached = youtubeSearchCache.get<YouTubeCandidateRaw[]>(cacheKey);
  if (cached) {
    return cached;
  }

  return deduplicateInFlight(cacheKey, async () => {
    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!userAccessToken && !apiKey) {
      throw new Error(
        "YouTube integration is not configured. Either connect your Google account or provide a YOUTUBE_API_KEY in environment variables."
      );
    }

    const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search");
    searchUrl.searchParams.set("part", "snippet");
    searchUrl.searchParams.set("type", "video");
    searchUrl.searchParams.set("videoCategoryId", "10"); // Music category
    searchUrl.searchParams.set("maxResults", Math.min(maxResults, 10).toString());
    searchUrl.searchParams.set("q", query);

    if (!userAccessToken && apiKey) {
      searchUrl.searchParams.set("key", apiKey);
    }

    const headers: Record<string, string> = {
      Accept: "application/json",
    };
    if (userAccessToken) {
      headers["Authorization"] = `Bearer ${userAccessToken}`;
    }

    const res = await retryWithBackoff(async () => {
      const r = await fetch(searchUrl.toString(), {
        method: "GET",
        headers,
        next: { revalidate: 3600 },
      });
      return r;
    });

    const data = await res.json();

    if (!res.ok) {
      const errorReason = data?.error?.errors?.[0]?.reason || "";
      if (errorReason === "quotaExceeded") {
        throw new YouTubeQuotaExceededError();
      }
      if (errorReason === "rateLimitExceeded" || errorReason === "userRateLimitExceeded" || res.status === 429) {
        throw new YouTubeRateLimitExceededError();
      }
      if (res.status === 403) {
        throw new Error(data?.error?.message || "YouTube API permission denied (403). Ensure YouTube Data API v3 is enabled in Google Cloud Console.");
      }
      throw new Error(data?.error?.message || `YouTube search failed with status ${res.status}`);
    }

    const items = data.items || [];
    if (items.length === 0) {
      youtubeSearchCache.set(cacheKey, []);
      return [];
    }

    const videoIds = items.map((item: any) => item.id?.videoId).filter(Boolean);

    // Fetch duration details for these video IDs to boost matching precision
    const durationsMap = new Map<string, number>();
    if (videoIds.length > 0) {
      try {
        const detailsUrl = new URL("https://www.googleapis.com/youtube/v3/videos");
        detailsUrl.searchParams.set("part", "contentDetails");
        detailsUrl.searchParams.set("id", videoIds.join(","));
        if (!userAccessToken && apiKey) {
          detailsUrl.searchParams.set("key", apiKey);
        }

        const detRes = await fetch(detailsUrl.toString(), { headers });
        if (detRes.ok) {
          const detData = await detRes.json();
          for (const v of detData.items || []) {
            const ms = parseIsoDurationMs(v.contentDetails?.duration);
            if (ms) durationsMap.set(v.id, ms);
          }
        }
      } catch {
        // Non-fatal if video duration details lookup fails
      }
    }

    const results: YouTubeCandidateRaw[] = items.map((item: any) => {
      const videoId = item.id?.videoId;
      return {
        videoId,
        title: decodeHtmlEntities(item.snippet?.title || ""),
        channelTitle: decodeHtmlEntities(item.snippet?.channelTitle || ""),
        channelId: item.snippet?.channelId,
        description: item.snippet?.description,
        thumbnailUrl:
          item.snippet?.thumbnails?.medium?.url ||
          item.snippet?.thumbnails?.default?.url ||
          `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        durationMs: durationsMap.get(videoId),
        publishedAt: item.snippet?.publishedAt,
      };
    });

    youtubeSearchCache.set(cacheKey, results);
    return results;
  });
}

/**
 * Creates a new playlist in the authenticated user's YouTube account.
 * Default privacy is 'private'.
 */
export async function createYouTubePlaylist(
  userAccessToken: string,
  params: {
    title: string;
    description?: string;
    privacyStatus: PrivacyStatus;
  }
): Promise<{ playlistId: string; playlistUrl: string }> {
  if (!userAccessToken) {
    throw new YouTubeAuthRequiredError("Please connect your Google account to create YouTube playlists.");
  }

  const url = "https://www.googleapis.com/youtube/v3/playlists?part=snippet,status";
  const body = {
    snippet: {
      title: params.title.slice(0, 150),
      description: params.description?.slice(0, 5000) || "Created with PlaylistShift",
    },
    status: {
      privacyStatus: params.privacyStatus,
    },
  };

  const res = await retryWithBackoff(async () => {
    return await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userAccessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  });

  const data = await res.json();
  if (!res.ok) {
    const errorReason = data?.error?.errors?.[0]?.reason || "";
    if (errorReason === "quotaExceeded" || res.status === 403) {
      throw new YouTubeQuotaExceededError();
    }
    throw new Error(data?.error?.message || `Failed to create playlist (${res.status})`);
  }

  const playlistId = data.id;
  const playlistUrl = `https://www.youtube.com/playlist?list=${playlistId}`;

  return { playlistId, playlistUrl };
}

/**
 * Inserts videos into a YouTube playlist in preserved order.
 * Handles rate limits, throttles inserts smoothly, and collects skipped items.
 */
export async function insertVideosIntoPlaylist(
  userAccessToken: string,
  playlistId: string,
  items: Array<{ videoId: string; title: string; artist: string }>
): Promise<{
  insertedCount: number;
  skippedCount: number;
  insertedVideoIds: string[];
  skippedItems: Array<{ title: string; artist: string; reason: string }>;
}> {
  if (!userAccessToken) {
    throw new YouTubeAuthRequiredError();
  }

  const insertedVideoIds: string[] = [];
  const skippedItems: Array<{ title: string; artist: string; reason: string }> = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    // Throttle to respect YouTube API rate limits and avoid 429
    if (i > 0) {
      await new Promise((r) => setTimeout(r, 250));
    }

    try {
      const res = await fetch("https://www.googleapis.com/youtube/v3/playlistItems?part=snippet", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userAccessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          snippet: {
            playlistId,
            resourceId: {
              kind: "youtube#video",
              videoId: item.videoId,
            },
            position: insertedVideoIds.length,
          },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const reason = data?.error?.errors?.[0]?.reason || data?.error?.message || "Failed to insert";
        if (reason === "quotaExceeded" || res.status === 403) {
          throw new YouTubeQuotaExceededError();
        }
        skippedItems.push({
          title: item.title,
          artist: item.artist,
          reason,
        });
        continue;
      }

      insertedVideoIds.push(item.videoId);
    } catch (err: unknown) {
      if (err instanceof YouTubeQuotaExceededError) {
        throw err;
      }
      skippedItems.push({
        title: item.title,
        artist: item.artist,
        reason: err instanceof Error ? err.message : "Network error during insertion",
      });
    }
  }

  return {
    insertedCount: insertedVideoIds.length,
    skippedCount: skippedItems.length,
    insertedVideoIds,
    skippedItems,
  };
}

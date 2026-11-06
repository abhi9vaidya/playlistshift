import { NextRequest, NextResponse } from "next/server";
import { batchSearchRequestSchema } from "@/lib/validation/schemas";
import { matchTrackOnYouTube } from "@/lib/matching/engine";
import { getValidAccessToken } from "@/lib/auth/google-oauth";
import { YouTubeQuotaExceededError } from "@/lib/youtube/client";
import { checkRateLimit } from "@/lib/youtube/quota";
import { YouTubeVideoMatch } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const clientIp = request.headers.get("x-forwarded-for") || "unknown_client";
    const rateLimit = checkRateLimit(`batch_${clientIp}`, 15, 60000); // 15 batches per min max

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded. Please wait a moment before sending additional batch match requests.",
          code: "RATE_LIMITED",
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const validated = batchSearchRequestSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid batch request", details: validated.error.flatten() },
        { status: 400 }
      );
    }

    const token = await getValidAccessToken();
    const tracks = validated.data.tracks;

    const results: Record<
      string,
      {
        bestMatch: YouTubeVideoMatch | null;
        alternatives: YouTubeVideoMatch[];
        error?: string;
      }
    > = {};

    // Process in batches of 3 concurrency to balance speed and quota
    const concurrency = 3;
    for (let i = 0; i < tracks.length; i += concurrency) {
      const chunk = tracks.slice(i, i + concurrency);
      await Promise.all(
        chunk.map(async (track) => {
          try {
            const res = await matchTrackOnYouTube(track, token || undefined);
            results[track.id] = {
              bestMatch: res.bestMatch,
              alternatives: res.alternatives,
            };
          } catch (err: unknown) {
            if (err instanceof YouTubeQuotaExceededError) {
              throw err;
            }
            results[track.id] = {
              bestMatch: null,
              alternatives: [],
              error: err instanceof Error ? err.message : "Search failed",
            };
          }
        })
      );
    }

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (err: unknown) {
    if (err instanceof YouTubeQuotaExceededError) {
      return NextResponse.json(
        {
          error: err.message,
          code: "QUOTA_EXCEEDED",
        },
        { status: 429 }
      );
    }

    console.error("Batch search error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Batch search failed" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { searchYouTubeRequestSchema } from "@/lib/validation/schemas";
import { matchTrackOnYouTube } from "@/lib/matching/engine";
import { getValidAccessToken } from "@/lib/auth/google-oauth";
import { YouTubeQuotaExceededError } from "@/lib/youtube/client";
import { checkRateLimit } from "@/lib/youtube/quota";

export async function POST(request: NextRequest) {
  try {
    const clientIp = request.headers.get("x-forwarded-for") || "unknown_client";
    const rateLimit = checkRateLimit(clientIp, 40, 60000);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "Too many search requests. Please wait a moment before searching again.",
          code: "RATE_LIMITED",
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const validated = searchYouTubeRequestSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid search parameters", details: validated.error.flatten() },
        { status: 400 }
      );
    }

    const token = await getValidAccessToken();
    const result = await matchTrackOnYouTube(validated.data, token || undefined);

    return NextResponse.json({
      success: true,
      bestMatch: result.bestMatch,
      alternatives: result.alternatives,
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

    console.error("YouTube search error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "YouTube search failed" },
      { status: 500 }
    );
  }
}

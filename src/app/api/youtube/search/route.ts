import { NextRequest, NextResponse } from "next/server";
import { searchYouTubeRequestSchema } from "@/lib/validation/schemas";
import { matchTrackOnYouTube } from "@/lib/matching/engine";
import { getValidAccessToken } from "@/lib/auth/google-oauth";
import { YouTubeQuotaExceededError } from "@/lib/youtube/client";

export async function POST(request: NextRequest) {
  try {
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

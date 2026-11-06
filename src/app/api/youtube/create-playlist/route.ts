import { NextRequest, NextResponse } from "next/server";
import { createPlaylistRequestSchema } from "@/lib/validation/schemas";
import { getValidAccessToken } from "@/lib/auth/google-oauth";
import {
  createYouTubePlaylist,
  insertVideosIntoPlaylist,
  YouTubeQuotaExceededError,
} from "@/lib/youtube/client";
import { YouTubePlaylistCreationResult } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createPlaylistRequestSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid playlist data", details: validated.error.flatten() },
        { status: 400 }
      );
    }

    const token = await getValidAccessToken();
    if (!token) {
      return NextResponse.json(
        {
          error: "Google authentication required to create playlists. Please connect your YouTube account.",
          code: "AUTH_REQUIRED",
        },
        { status: 401 }
      );
    }

    const { title, description, privacyStatus, trackMatches } = validated.data;

    // 1. Create the empty playlist with user-chosen privacy (default: private)
    const { playlistId, playlistUrl } = await createYouTubePlaylist(token, {
      title,
      description,
      privacyStatus,
    });

    // 2. Insert the matched videos into the new playlist
    const insertItems = trackMatches.map((tm) => ({
      videoId: tm.videoId,
      title: tm.title,
      artist: tm.artist,
    }));

    const insertResult = await insertVideosIntoPlaylist(token, playlistId, insertItems);

    const result: YouTubePlaylistCreationResult = {
      playlistId,
      playlistUrl,
      title,
      privacyStatus,
      totalInserted: insertResult.insertedCount,
      totalSkipped: insertResult.skippedCount,
      insertedVideoIds: insertResult.insertedVideoIds,
      skippedTracks: insertResult.skippedItems,
    };

    return NextResponse.json({
      success: true,
      result,
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

    console.error("Create playlist error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create YouTube playlist" },
      { status: 500 }
    );
  }
}

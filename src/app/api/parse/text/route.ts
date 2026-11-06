import { NextRequest, NextResponse } from "next/server";
import { parseTracksFromText } from "@/lib/parsing/text";
import { siteConfig } from "@/config/site";

const MAX_TEXT_SIZE_BYTES = 100 * 1024; // 100KB safety limit

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text } = body;

    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json(
        { error: "Please paste at least one song line." },
        { status: 400 }
      );
    }

    if (text.length > MAX_TEXT_SIZE_BYTES) {
      return NextResponse.json(
        { error: "Pasted text exceeds maximum size limit (100KB)." },
        { status: 413 }
      );
    }

    const result = parseTracksFromText(text);

    if (result.tracks.length === 0) {
      return NextResponse.json(
        {
          error:
            "Could not parse any tracks. Please use formats like: 'Song Title - Artist Name' or 'Song Title by Artist'.",
        },
        { status: 400 }
      );
    }

    const maxAllowed = siteConfig.conversionLimits.maxTracksPerPlaylist;
    let finalTracks = result.tracks;
    if (finalTracks.length > maxAllowed) {
      finalTracks = finalTracks.slice(0, maxAllowed);
    }

    return NextResponse.json({
      success: true,
      tracks: finalTracks,
      duplicateCount: result.duplicateCount,
    });
  } catch (err: unknown) {
    console.error("Text parse error:", err);
    return NextResponse.json(
      { error: "Failed to parse text tracklist." },
      { status: 500 }
    );
  }
}

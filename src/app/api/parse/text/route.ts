import { NextRequest, NextResponse } from "next/server";
import { parseTracksFromText } from "@/lib/parsing/text";

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

    return NextResponse.json({
      success: true,
      tracks: result.tracks,
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

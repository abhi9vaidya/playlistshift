import { NextRequest, NextResponse } from "next/server";
import { parseSpotifyUrl } from "@/lib/parsing/spotify-url";
import { fetchSpotifyTrack, SpotifyError } from "@/lib/spotify/adapter";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "Spotify track URL is required." },
        { status: 400 }
      );
    }

    const parsed = parseSpotifyUrl(url);
    if (!parsed || parsed.type !== "track") {
      return NextResponse.json(
        {
          error:
            "Invalid Spotify track URL. Please provide a link formatted like: https://open.spotify.com/track/{id}",
        },
        { status: 400 }
      );
    }

    const playlist = await fetchSpotifyTrack(parsed.id);

    return NextResponse.json({
      success: true,
      playlist,
    });
  } catch (err: unknown) {
    if (err instanceof SpotifyError) {
      return NextResponse.json(
        {
          error: err.message,
          code: err.code,
          fallbackSuggested: true,
        },
        { status: err.code === "NOT_FOUND" ? 404 : 400 }
      );
    }

    console.error("Spotify track error:", err);
    return NextResponse.json(
      {
        error: "Unable to retrieve Spotify track metadata. Please enter the song manually or use text import.",
        fallbackSuggested: true,
      },
      { status: 500 }
    );
  }
}


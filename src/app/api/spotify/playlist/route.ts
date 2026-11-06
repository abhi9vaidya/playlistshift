import { NextRequest, NextResponse } from "next/server";
import { parseSpotifyUrl } from "@/lib/parsing/spotify-url";
import { fetchSpotifyPlaylist, SpotifyError } from "@/lib/spotify/adapter";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "Spotify playlist URL is required." },
        { status: 400 }
      );
    }

    const parsed = parseSpotifyUrl(url);
    if (!parsed || parsed.type !== "playlist") {
      return NextResponse.json(
        {
          error:
            "Invalid Spotify playlist URL. Please provide a link formatted like: https://open.spotify.com/playlist/{id}",
        },
        { status: 400 }
      );
    }

    const playlist = await fetchSpotifyPlaylist(parsed.id);

    if (playlist.tracks.length === 0) {
      return NextResponse.json(
        { error: "The provided playlist is empty or contains no playable tracks." },
        { status: 400 }
      );
    }

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

    console.error("Spotify playlist error:", err);
    return NextResponse.json(
      {
        error: "Unable to retrieve Spotify playlist. Please try CSV or text paste import.",
        fallbackSuggested: true,
      },
      { status: 500 }
    );
  }
}

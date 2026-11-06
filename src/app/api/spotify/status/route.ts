import { NextResponse } from "next/server";
import { isSpotifyConfigured } from "@/lib/spotify/adapter";

export async function GET() {
  const status = isSpotifyConfigured();
  return NextResponse.json(status);
}

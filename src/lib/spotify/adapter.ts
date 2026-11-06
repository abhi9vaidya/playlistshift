import { Track, PlaylistData } from "@/types";

export class SpotifyError extends Error {
  code: "NOT_CONFIGURED" | "DISABLED" | "RESTRICTED" | "NOT_FOUND" | "RATE_LIMITED" | "API_ERROR";
  constructor(message: string, code: SpotifyError["code"]) {
    super(message);
    this.name = "SpotifyError";
    this.code = code;
  }
}

interface SpotifyTokenCache {
  token: string;
  expiresAt: number;
}

let cachedToken: SpotifyTokenCache | null = null;

export function isSpotifyEnabled(): boolean {
  return process.env.SPOTIFY_INTEGRATION_ENABLED !== "false";
}

export function isSpotifyConfigured(): {
  configured: boolean;
  enabled: boolean;
  message?: string;
} {
  const enabled = isSpotifyEnabled();
  if (!enabled) {
    return {
      configured: false,
      enabled: false,
      message: "Spotify URL integration is currently disabled in site settings. Please use CSV or text import.",
    };
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret || clientId === "your_spotify_client_id_here") {
    return {
      configured: false,
      enabled: true,
      message:
        "Spotify API credentials are not configured on the server. You can still easily convert your songs using our free CSV or text paste importer below.",
    };
  }

  return { configured: true, enabled: true };
}

/**
 * Gets an official Client Credentials token from Spotify Accounts service.
 */
async function getSpotifyAppToken(): Promise<string> {
  const status = isSpotifyConfigured();
  if (!status.enabled) {
    throw new SpotifyError(status.message || "Spotify integration is disabled", "DISABLED");
  }
  if (!status.configured) {
    throw new SpotifyError(status.message || "Spotify credentials not set", "NOT_CONFIGURED");
  }

  // Return cached token if valid with 60 second safety buffer
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60000) {
    return cachedToken.token;
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID!;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET!;
  const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${authHeader}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    if (res.status === 400 || res.status === 401) {
      throw new SpotifyError(
        "Invalid Spotify API credentials. Please check SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET.",
        "RESTRICTED"
      );
    }
    throw new SpotifyError(`Spotify token authentication failed with status ${res.status}`, "API_ERROR");
  }

  const data = await res.json();
  const token = data.access_token;
  const expiresIn = data.expires_in || 3600;

  cachedToken = {
    token,
    expiresAt: Date.now() + expiresIn * 1000,
  };

  return token;
}

/**
 * Fetches playlist metadata and tracks from official Spotify Web API.
 */
export async function fetchSpotifyPlaylist(playlistId: string): Promise<PlaylistData> {
  const token = await getSpotifyAppToken();

  const playlistUrl = `https://api.spotify.com/v1/playlists/${playlistId}?fields=id,name,description,images,tracks.total,tracks.items(track(id,name,artists(name),album(name,images),duration_ms,external_urls,external_ids)),tracks.next`;

  const res = await fetch(playlistUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    if (res.status === 404) {
      throw new SpotifyError("Spotify playlist not found or is set to private.", "NOT_FOUND");
    }
    if (res.status === 429) {
      throw new SpotifyError("Spotify API rate limit reached. Please try again shortly.", "RATE_LIMITED");
    }
    if (res.status === 403) {
      throw new SpotifyError(
        "Spotify access restricted. The Spotify app may be in Development Mode or restricted by Spotify's current developer policy.",
        "RESTRICTED"
      );
    }
    throw new SpotifyError(`Failed to retrieve playlist (${res.status})`, "API_ERROR");
  }

  const data = await res.json();
  const tracks: Track[] = [];

  const rawItems = data.tracks?.items || [];
  for (const item of rawItems) {
    const t = item.track;
    if (!t || !t.name) continue;

    const artist = t.artists?.map((a: any) => a.name).join(", ") || "Unknown Artist";
    const album = t.album?.name;
    const coverImage = t.album?.images?.[0]?.url;

    tracks.push({
      id: `sp-${t.id || tracks.length + 1}`,
      title: t.name,
      artist,
      album,
      durationMs: t.duration_ms,
      isrc: t.external_ids?.isrc,
      spotifyUrl: t.external_urls?.spotify,
      thumbnailUrl: coverImage,
      status: "pending",
    });
  }

  // Cover image of playlist
  const coverUrl = data.images?.[0]?.url;

  return {
    id: data.id,
    title: data.name || "My Spotify Playlist",
    description: data.description || "",
    coverUrl,
    source: "spotify_playlist",
    originalUrl: `https://open.spotify.com/playlist/${playlistId}`,
    tracks,
  };
}

/**
 * Fetches an individual track from official Spotify Web API.
 */
export async function fetchSpotifyTrack(trackId: string): Promise<PlaylistData> {
  const token = await getSpotifyAppToken();

  const trackUrl = `https://api.spotify.com/v1/tracks/${trackId}`;
  const res = await fetch(trackUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    if (res.status === 404) {
      throw new SpotifyError("Spotify track not found.", "NOT_FOUND");
    }
    if (res.status === 429) {
      throw new SpotifyError("Spotify API rate limit reached. Please try again in a few moments.", "RATE_LIMITED");
    }
    throw new SpotifyError(`Failed to retrieve track (${res.status})`, "API_ERROR");
  }

  const t = await res.json();
  const artist = t.artists?.map((a: any) => a.name).join(", ") || "Unknown Artist";
  const album = t.album?.name;
  const coverImage = t.album?.images?.[0]?.url;

  const track: Track = {
    id: `sp-${t.id}`,
    title: t.name,
    artist,
    album,
    durationMs: t.duration_ms,
    isrc: t.external_ids?.isrc,
    spotifyUrl: t.external_urls?.spotify,
    thumbnailUrl: coverImage,
    status: "pending",
  };

  return {
    id: t.id,
    title: `${t.name} - ${artist}`,
    description: `Single track transferred via PlaylistShift`,
    coverUrl: coverImage,
    source: "spotify_track",
    originalUrl: `https://open.spotify.com/track/${trackId}`,
    tracks: [track],
  };
}

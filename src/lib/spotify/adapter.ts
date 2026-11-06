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

/**
 * Decodes HTML entities commonly found in web payloads.
 */
function decodeHtmlEntities(str: string): string {
  if (!str) return "";
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'");
}

export function isSpotifyEnabled(): boolean {
  return process.env.SPOTIFY_INTEGRATION_ENABLED !== "false";
}

export function isSpotifyConfigured(): {
  configured: boolean;
  enabled: boolean;
  mode?: "official" | "public_resolver";
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

  if (clientId && clientSecret && clientId !== "your_spotify_client_id_here") {
    return {
      configured: true,
      enabled: true,
      mode: "official",
      message: "Spotify official API integration active.",
    };
  }

  return {
    configured: true,
    enabled: true,
    mode: "public_resolver",
    message: "Public Spotify playlist and track resolver active.",
  };
}

/**
 * Gets an official Client Credentials token from Spotify Accounts service.
 */
async function getSpotifyAppToken(): Promise<string> {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret || clientId === "your_spotify_client_id_here") {
    throw new SpotifyError("Spotify credentials not set", "NOT_CONFIGURED");
  }

  // Return cached token if valid with 60 second safety buffer
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60000) {
    return cachedToken.token;
  }

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
async function fetchSpotifyPlaylistOfficial(playlistId: string): Promise<PlaylistData> {
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
        "Spotify access restricted. Spotify Development Mode is capped at 5 authorized users.",
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
      title: decodeHtmlEntities(t.name),
      artist: decodeHtmlEntities(artist),
      album: album ? decodeHtmlEntities(album) : undefined,
      durationMs: t.duration_ms,
      isrc: t.external_ids?.isrc,
      spotifyUrl: t.external_urls?.spotify,
      thumbnailUrl: coverImage,
      status: "pending",
    });
  }

  const coverUrl = data.images?.[0]?.url;

  return {
    id: data.id,
    title: decodeHtmlEntities(data.name || "My Spotify Playlist"),
    description: decodeHtmlEntities(data.description || ""),
    coverUrl,
    source: "spotify_playlist",
    originalUrl: `https://open.spotify.com/playlist/${playlistId}`,
    tracks,
  };
}

/**
 * Fetches an individual track from official Spotify Web API.
 */
async function fetchSpotifyTrackOfficial(trackId: string): Promise<PlaylistData> {
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
    title: decodeHtmlEntities(t.name),
    artist: decodeHtmlEntities(artist),
    album: album ? decodeHtmlEntities(album) : undefined,
    durationMs: t.duration_ms,
    isrc: t.external_ids?.isrc,
    spotifyUrl: t.external_urls?.spotify,
    thumbnailUrl: coverImage,
    status: "pending",
  };

  return {
    id: t.id,
    title: `${track.title} - ${track.artist}`,
    description: `Single track transferred via PlaylistShift`,
    coverUrl: coverImage,
    source: "spotify_track",
    originalUrl: `https://open.spotify.com/track/${trackId}`,
    tracks: [track],
  };
}

/**
 * Fallback resolver: Fetches public Spotify playlist metadata and tracks via Spotify's public embed page.
 * Requires zero credentials and bypasses Spotify developer user limits for public playlists.
 */
async function fetchSpotifyPlaylistFromEmbed(playlistId: string): Promise<PlaylistData> {
  const embedUrl = `https://open.spotify.com/embed/playlist/${playlistId}`;
  const res = await fetch(embedUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });

  if (!res.ok) {
    if (res.status === 404) {
      throw new SpotifyError("Spotify playlist not found or is set to private.", "NOT_FOUND");
    }
    throw new SpotifyError(`Failed to fetch Spotify playlist (HTTP ${res.status})`, "API_ERROR");
  }

  const html = await res.text();
  const matchNext = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!matchNext) {
    throw new SpotifyError(
      "Unable to read Spotify playlist format. Make sure the playlist is public.",
      "API_ERROR"
    );
  }

  let data: any;
  try {
    data = JSON.parse(matchNext[1]);
  } catch {
    throw new SpotifyError("Failed to parse Spotify playlist data.", "API_ERROR");
  }

  const pageProps = data.props?.pageProps;
  if (!pageProps || pageProps.status >= 400 || !pageProps.state?.data?.entity) {
    throw new SpotifyError(
      "Spotify playlist not found or is set to private. Please ensure the playlist is public.",
      "NOT_FOUND"
    );
  }

  const entity = pageProps.state.data.entity;
  const rawTrackList = entity.trackList || [];

  if (rawTrackList.length === 0) {
    throw new SpotifyError("The provided playlist contains no playable tracks.", "NOT_FOUND");
  }

  const coverUrl =
    entity.visualIdentity?.image?.find((img: any) => img.maxWidth >= 300)?.url ||
    entity.visualIdentity?.image?.[0]?.url;

  const tracks: Track[] = rawTrackList.map((item: any, idx: number) => {
    const rawUri = item.uri || "";
    const cleanId = rawUri.startsWith("spotify:track:") ? rawUri.replace("spotify:track:", "") : `tr-${idx + 1}`;
    return {
      id: `sp-${cleanId}`,
      title: decodeHtmlEntities(item.title || "Unknown Title"),
      artist: decodeHtmlEntities(item.subtitle || "Unknown Artist"),
      album: entity.name ? decodeHtmlEntities(entity.name) : undefined,
      durationMs: typeof item.duration === "number" ? item.duration : undefined,
      spotifyUrl: rawUri.startsWith("spotify:track:") ? `https://open.spotify.com/track/${cleanId}` : undefined,
      thumbnailUrl: coverUrl,
      status: "pending",
    };
  });

  return {
    id: entity.id || playlistId,
    title: decodeHtmlEntities(entity.name || "Spotify Playlist"),
    description: decodeHtmlEntities(entity.description || ""),
    coverUrl,
    source: "spotify_playlist",
    originalUrl: `https://open.spotify.com/playlist/${playlistId}`,
    tracks,
  };
}

/**
 * Fallback resolver: Fetches an individual public Spotify track via Spotify's public embed page.
 */
async function fetchSpotifyTrackFromEmbed(trackId: string): Promise<PlaylistData> {
  const embedUrl = `https://open.spotify.com/embed/track/${trackId}`;
  const res = await fetch(embedUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });

  if (!res.ok) {
    if (res.status === 404) {
      throw new SpotifyError("Spotify track not found.", "NOT_FOUND");
    }
    throw new SpotifyError(`Failed to fetch Spotify track (HTTP ${res.status})`, "API_ERROR");
  }

  const html = await res.text();
  const matchNext = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!matchNext) {
    throw new SpotifyError("Unable to read Spotify track data.", "API_ERROR");
  }

  let data: any;
  try {
    data = JSON.parse(matchNext[1]);
  } catch {
    throw new SpotifyError("Failed to parse Spotify track data.", "API_ERROR");
  }

  const pageProps = data.props?.pageProps;
  if (!pageProps || pageProps.status >= 400 || !pageProps.state?.data?.entity) {
    throw new SpotifyError("Spotify track not found.", "NOT_FOUND");
  }

  const entity = pageProps.state.data.entity;
  const title = decodeHtmlEntities(entity.name || entity.title || "Unknown Track");
  let artist = "Unknown Artist";
  if (Array.isArray(entity.artists) && entity.artists.length > 0) {
    artist = decodeHtmlEntities(entity.artists.map((a: any) => a.name).join(", "));
  } else if (entity.subtitle) {
    artist = decodeHtmlEntities(entity.subtitle);
  }

  const coverUrl =
    entity.visualIdentity?.image?.find((img: any) => img.maxWidth >= 300)?.url ||
    entity.visualIdentity?.image?.[0]?.url;

  const track: Track = {
    id: `sp-${trackId}`,
    title,
    artist,
    durationMs: typeof entity.duration === "number" ? entity.duration : undefined,
    spotifyUrl: `https://open.spotify.com/track/${trackId}`,
    thumbnailUrl: coverUrl,
    status: "pending",
  };

  return {
    id: trackId,
    title: `${title} - ${artist}`,
    description: "Single track imported via PlaylistShift",
    coverUrl,
    source: "spotify_track",
    originalUrl: `https://open.spotify.com/track/${trackId}`,
    tracks: [track],
  };
}

/**
 * Universal Spotify Playlist Fetcher.
 * Automatically tries official Spotify API if credentials exist, falling back seamlessly
 * to public embed resolver if credentials are unset or restricted.
 */
export async function fetchSpotifyPlaylist(playlistId: string): Promise<PlaylistData> {
  if (!isSpotifyEnabled()) {
    throw new SpotifyError("Spotify URL integration is disabled in settings.", "DISABLED");
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const hasOfficialKeys = Boolean(clientId && clientSecret && clientId !== "your_spotify_client_id_here");

  if (hasOfficialKeys) {
    try {
      return await fetchSpotifyPlaylistOfficial(playlistId);
    } catch (err) {
      console.warn("Official Spotify API attempt failed, using fallback public resolver:", err);
      return await fetchSpotifyPlaylistFromEmbed(playlistId);
    }
  }

  return await fetchSpotifyPlaylistFromEmbed(playlistId);
}

/**
 * Universal Spotify Track Fetcher.
 * Automatically tries official Spotify API if credentials exist, falling back seamlessly
 * to public embed resolver if credentials are unset or restricted.
 */
export async function fetchSpotifyTrack(trackId: string): Promise<PlaylistData> {
  if (!isSpotifyEnabled()) {
    throw new SpotifyError("Spotify URL integration is disabled in settings.", "DISABLED");
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const hasOfficialKeys = Boolean(clientId && clientSecret && clientId !== "your_spotify_client_id_here");

  if (hasOfficialKeys) {
    try {
      return await fetchSpotifyTrackOfficial(trackId);
    } catch (err) {
      console.warn("Official Spotify API attempt failed, using fallback public resolver:", err);
      return await fetchSpotifyTrackFromEmbed(trackId);
    }
  }

  return await fetchSpotifyTrackFromEmbed(trackId);
}

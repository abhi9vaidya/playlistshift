export interface ParsedSpotifyResource {
  type: 'playlist' | 'track' | 'album';
  id: string;
  originalUrl: string;
}

/**
 * Extracts the ID and type from any valid Spotify URL or URI.
 * Handles open.spotify.com/{type}/{id}, open.spotify.com/intl-{lang}/{type}/{id}, and spotify:{type}:{id}.
 */
export function parseSpotifyUrl(input: string): ParsedSpotifyResource | null {
  if (!input || typeof input !== 'string') return null;
  const trimmed = input.trim();

  // URI format: spotify:playlist:37i9dQZF1DXcBWIGoYBM5M
  const uriMatch = trimmed.match(/^spotify:(playlist|track|album):([a-zA-Z0-9]{22})/i);
  if (uriMatch) {
    return {
      type: uriMatch[1].toLowerCase() as 'playlist' | 'track' | 'album',
      id: uriMatch[2],
      originalUrl: trimmed,
    };
  }

  // Web URL format, with optional internationalized segment (/intl-xx/) and query params
  // Examples:
  // https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M?si=123
  // https://open.spotify.com/intl-es/track/4cOdK2wGLETKBW3PvgPWqT
  const urlMatch = trimmed.match(
    /(?:https?:\/\/)?(?:open\.)?spotify\.com\/(?:intl-[a-z]{2}\/)?(playlist|track|album)\/([a-zA-Z0-9]{22})/i
  );

  if (urlMatch) {
    return {
      type: urlMatch[1].toLowerCase() as 'playlist' | 'track' | 'album',
      id: urlMatch[2],
      originalUrl: trimmed,
    };
  }

  return null;
}

export function isValidSpotifyPlaylistUrl(url: string): boolean {
  const parsed = parseSpotifyUrl(url);
  return parsed?.type === 'playlist';
}

export function isValidSpotifyTrackUrl(url: string): boolean {
  const parsed = parseSpotifyUrl(url);
  return parsed?.type === 'track';
}


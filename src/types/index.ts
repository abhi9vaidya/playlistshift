export type PrivacyStatus = 'private' | 'unlisted' | 'public';

export type MatchConfidenceTier = 'excellent' | 'good' | 'review' | 'low';

export interface YouTubeVideoMatch {
  videoId: string;
  title: string;
  channelTitle: string;
  channelId?: string;
  thumbnailUrl: string;
  durationMs?: number;
  durationFormatted?: string;
  confidence: number; // 0 - 100
  confidenceTier: MatchConfidenceTier;
  matchReason?: string;
  publishedAt?: string;
}

export type TrackStatus =
  | 'pending'
  | 'searching'
  | 'matched'
  | 'review'
  | 'unmatched'
  | 'excluded'
  | 'inserting'
  | 'inserted'
  | 'failed';

export interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  durationMs?: number;
  spotifyUri?: string;
  spotifyUrl?: string;
  thumbnailUrl?: string;
  isrc?: string;
  matchedVideo?: YouTubeVideoMatch | null;
  alternativeMatches?: YouTubeVideoMatch[];
  status: TrackStatus;
  errorMessage?: string;
}

export interface PlaylistData {
  id?: string;
  title: string;
  description?: string;
  coverUrl?: string;
  source: 'spotify_playlist' | 'spotify_track' | 'csv' | 'text' | 'manual';
  originalUrl?: string;
  tracks: Track[];
}

export interface UserSessionData {
  isAuthenticated: boolean;
  user?: {
    id: string;
    name: string;
    email: string;
    picture?: string;
  };
}

export interface ConversionProgress {
  total: number;
  matched: number;
  needsReview: number;
  unmatched: number;
  excluded: number;
  inserted: number;
}

export interface YouTubePlaylistCreationResult {
  playlistId: string;
  playlistUrl: string;
  title: string;
  privacyStatus: PrivacyStatus;
  totalInserted: number;
  totalSkipped: number;
  insertedVideoIds: string[];
  skippedTracks: { title: string; artist: string; reason: string }[];
}


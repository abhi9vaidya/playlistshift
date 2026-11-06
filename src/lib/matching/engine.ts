import { Track, YouTubeVideoMatch } from "@/types";
import { rankVideoCandidates } from "./scorer";
import { searchYouTubeVideos } from "../youtube/client";

export interface MatchTrackResult {
  bestMatch: YouTubeVideoMatch | null;
  alternatives: YouTubeVideoMatch[];
  searchAttempts: number;
}

/**
 * Searches and selects the highest-scoring YouTube match for a given track.
 */
export async function matchTrackOnYouTube(
  track: Pick<Track, "title" | "artist" | "durationMs">,
  userAccessToken?: string
): Promise<MatchTrackResult> {
  const cleanTitle = track.title.trim();
  const cleanArtist = track.artist.trim();

  // Try primary search: "Song Title Artist Official Audio"
  const primaryQuery = `${cleanTitle} ${cleanArtist} Official Audio`;
  let candidates = await searchYouTubeVideos(primaryQuery, 5, userAccessToken);

  // If primary returned few or low-quality candidates, fall back to "Song Title Artist"
  let searchAttempts = 1;
  const initialRanked = rankVideoCandidates(
    candidates,
    cleanTitle,
    cleanArtist,
    track.durationMs
  );

  if (initialRanked.length === 0 || (initialRanked[0] && initialRanked[0].confidence < 60)) {
    searchAttempts++;
    const secondaryQuery = `${cleanTitle} ${cleanArtist}`;
    const secondaryCandidates = await searchYouTubeVideos(secondaryQuery, 5, userAccessToken);

    // Merge candidates, deduplicating by videoId
    const seen = new Set(candidates.map((c) => c.videoId));
    for (const c of secondaryCandidates) {
      if (!seen.has(c.videoId)) {
        candidates.push(c);
        seen.add(c.videoId);
      }
    }
  }

  const finalRanked = rankVideoCandidates(
    candidates,
    cleanTitle,
    cleanArtist,
    track.durationMs
  );

  if (finalRanked.length === 0) {
    return {
      bestMatch: null,
      alternatives: [],
      searchAttempts,
    };
  }

  const bestMatch = finalRanked[0];
  const alternatives = finalRanked.slice(1, 6);

  return {
    bestMatch,
    alternatives,
    searchAttempts,
  };
}

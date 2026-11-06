import { Track } from "@/types";

export interface TextParseResult {
  tracks: Track[];
  duplicateCount: number;
}

/**
 * Parses freeform text tracklists into structured Track objects.
 * Handles:
 * - "Title - Artist"
 * - "1. Title - Artist"
 * - "Title by Artist"
 * - "Title / Artist" or "Title | Artist"
 */
export function parseTracksFromText(rawText: string): TextParseResult {
  if (!rawText || !rawText.trim()) {
    return { tracks: [], duplicateCount: 0 };
  }

  const lines = rawText.split(/\r?\n/);
  const tracks: Track[] = [];
  const seenTracks = new Set<string>();
  let duplicateCount = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Remove leading numbering like "1.", "01.", "1 -", "[1]"
    const strippedNumber = trimmed.replace(/^(\[\d+\]|\d+[\.\)\-:]\s*)/, "").trim();
    if (!strippedNumber) continue;

    let title = "";
    let artist = "Unknown Artist";

    // Check for delimiter: " - ", " – ", " — ", " | ", " / ", " by "
    if (/\s+[-–—|/]\s+/.test(strippedNumber)) {
      const parts = strippedNumber.split(/\s+[-–—|/]\s+/);
      if (parts.length >= 2) {
        title = parts[0].trim();
        artist = parts.slice(1).join(" - ").trim();
      } else {
        title = strippedNumber;
      }
    } else if (/\s+by\s+/i.test(strippedNumber)) {
      const parts = strippedNumber.split(/\s+by\s+/i);
      title = parts[0].trim();
      artist = parts.slice(1).join(" ").trim();
    } else {
      // No explicit separator, treat entire line as track title
      title = strippedNumber;
    }

    // Clean up quotes like "Bohemian Rhapsody"
    title = title.replace(/^["'“”]/, "").replace(/["'“”]$/, "").trim();
    artist = artist.replace(/^["'“”]/, "").replace(/["'“”]$/, "").trim();

    if (!title) continue;

    const dedupeKey = `${title.toLowerCase()}:::${artist.toLowerCase()}`;
    if (seenTracks.has(dedupeKey)) {
      duplicateCount++;
      continue;
    }
    seenTracks.add(dedupeKey);

    tracks.push({
      id: `text-${tracks.length + 1}-${Date.now().toString(36)}`,
      title,
      artist: artist || "Unknown Artist",
      status: "pending",
    });
  }

  return { tracks, duplicateCount };
}

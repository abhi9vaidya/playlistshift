import Papa from "papaparse";
import { Track } from "@/types";

export interface CsvParseResult {
  tracks: Track[];
  errors: string[];
  totalParsed: number;
  duplicateCount: number;
}

const TITLE_HEADERS = [
  "title",
  "track",
  "track name",
  "trackname",
  "song",
  "song name",
  "song title",
  "name",
];

const ARTIST_HEADERS = [
  "artist",
  "artists",
  "artist name",
  "artist(s)",
  "performer",
  "band",
  "singer",
  "creator",
];

const ALBUM_HEADERS = ["album", "album name", "record", "release"];

function normalizeHeader(header: string): string {
  return header.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}

function findColumnValue(row: Record<string, string>, targets: string[]): string | undefined {
  const normalizedTargets = targets.map((t) => t.replace(/[^a-z0-9]/g, ""));
  for (const [key, value] of Object.entries(row)) {
    const normKey = normalizeHeader(key);
    if (normalizedTargets.includes(normKey) && typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return undefined;
}

export function parseTracksFromCsv(csvContent: string): CsvParseResult {
  const errors: string[] = [];
  const tracks: Track[] = [];
  const seenTracks = new Set<string>();
  let duplicateCount = 0;

  if (!csvContent || !csvContent.trim()) {
    return { tracks: [], errors: ["CSV file is empty"], totalParsed: 0, duplicateCount: 0 };
  }

  // Parse using PapaParse with automatic delimiter detection
  const parseResult = Papa.parse<Record<string, string>>(csvContent.trim(), {
    header: true,
    skipEmptyLines: "greedy",
    transformHeader: (h) => h.trim(),
  });

  if (parseResult.errors.length > 0) {
    for (const err of parseResult.errors.slice(0, 3)) {
      errors.push(`Row ${err.row}: ${err.message}`);
    }
  }

  // If header-based parsing found usable rows
  const rows = parseResult.data;
  let hasValidHeaders = false;

  if (rows.length > 0 && typeof rows[0] === "object") {
    const firstRow = rows[0];
    const hasTitle = TITLE_HEADERS.some((t) => findColumnValue(firstRow, [t]));
    const hasArtist = ARTIST_HEADERS.some((a) => findColumnValue(firstRow, [a]));
    hasValidHeaders = hasTitle || hasArtist;
  }

  if (hasValidHeaders) {
    for (const row of rows) {
      const title = findColumnValue(row, TITLE_HEADERS);
      const artist = findColumnValue(row, ARTIST_HEADERS) || "Unknown Artist";
      const album = findColumnValue(row, ALBUM_HEADERS);

      if (!title) continue;

      const dedupeKey = `${title.toLowerCase()}:::${artist.toLowerCase()}`;
      if (seenTracks.has(dedupeKey)) {
        duplicateCount++;
        continue;
      }
      seenTracks.add(dedupeKey);

      tracks.push({
        id: `csv-${tracks.length + 1}-${Date.now().toString(36)}`,
        title,
        artist,
        album,
        status: "pending",
      });
    }
  } else {
    // Fallback: parse as headerless 2D array
    const rawParse = Papa.parse<string[]>(csvContent.trim(), {
      header: false,
      skipEmptyLines: "greedy",
    });

    for (const cols of rawParse.data) {
      if (!cols || cols.length === 0) continue;
      const cleanCols = cols.map((c) => (c ? c.trim() : "")).filter(Boolean);

      if (cleanCols.length === 0) continue;

      let title = "";
      let artist = "Unknown Artist";
      let album: string | undefined;

      if (cleanCols.length === 1) {
        // Single column might be "Song - Artist"
        const dashSplit = cleanCols[0].split(/\s+-\s+|\s+–\s+|\s+by\s+/i);
        if (dashSplit.length >= 2) {
          title = dashSplit[0].trim();
          artist = dashSplit[1].trim();
        } else {
          title = cleanCols[0];
        }
      } else if (cleanCols.length >= 2) {
        title = cleanCols[0];
        artist = cleanCols[1];
        if (cleanCols.length >= 3) {
          album = cleanCols[2];
        }
      }

      if (!title) continue;

      // Skip row if it looks like header row (e.g. "Title, Artist")
      if (
        title.toLowerCase() === "title" ||
        title.toLowerCase() === "track" ||
        title.toLowerCase() === "song"
      ) {
        continue;
      }

      const dedupeKey = `${title.toLowerCase()}:::${artist.toLowerCase()}`;
      if (seenTracks.has(dedupeKey)) {
        duplicateCount++;
        continue;
      }
      seenTracks.add(dedupeKey);

      tracks.push({
        id: `csv-raw-${tracks.length + 1}-${Date.now().toString(36)}`,
        title,
        artist,
        album,
        status: "pending",
      });
    }
  }

  return {
    tracks,
    errors,
    totalParsed: tracks.length,
    duplicateCount,
  };
}


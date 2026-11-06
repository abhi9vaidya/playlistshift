/**
 * Normalizes text for comparison by lowercasing, removing noise words,
 * accents, and special characters.
 */
export function normalizeSongText(text: string): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Strip diacritics
    .replace(/\b(feat\.?|featuring|ft\.?)\b.*$/i, "") // Remove feature credits from title
    .replace(/[\(\[\{].*?[\)\]\}]/g, "") // Remove parenthesized extra info like (Remastered 2011)
    .replace(/[^a-z0-9\s]/g, " ") // Non-alphanumeric to spaces
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Parses YouTube's ISO 8601 duration string (e.g. "PT3M54S", "PT1H2M10S", "PT45S") to milliseconds.
 */
export function parseIsoDurationMs(isoDuration?: string): number | undefined {
  if (!isoDuration) return undefined;
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return undefined;

  const hours = parseInt(match[1] || "0", 10);
  const minutes = parseInt(match[2] || "0", 10);
  const seconds = parseInt(match[3] || "0", 10);

  return (hours * 3600 + minutes * 60 + seconds) * 1000;
}

/**
 * Formats milliseconds to readable mm:ss or hh:mm:ss string.
 */
export function formatDuration(ms?: number): string {
  if (!ms || ms <= 0) return "--:--";
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

/**
 * Computes bigram Dice coefficient similarity between two strings (0.0 to 1.0).
 */
export function diceCoefficient(str1: string, str2: string): number {
  const s1 = normalizeSongText(str1);
  const s2 = normalizeSongText(str2);

  if (s1 === s2) return 1.0;
  if (s1.length < 2 || s2.length < 2) {
    return s1.includes(s2) || s2.includes(s1) ? 0.7 : 0.0;
  }

  const bigrams1 = new Map<string, number>();
  for (let i = 0; i < s1.length - 1; i++) {
    const bigram = s1.substring(i, i + 2);
    bigrams1.set(bigram, (bigrams1.get(bigram) || 0) + 1);
  }

  let intersection = 0;
  for (let i = 0; i < s2.length - 1; i++) {
    const bigram = s2.substring(i, i + 2);
    const count = bigrams1.get(bigram) || 0;
    if (count > 0) {
      bigrams1.set(bigram, count - 1);
      intersection++;
    }
  }

  return (2.0 * intersection) / (s1.length - 1 + s2.length - 1);
}

/**
 * Computes word-level token Jaccard overlap between two strings (0.0 to 1.0).
 */
export function tokenOverlap(str1: string, str2: string): number {
  const words1 = new Set(normalizeSongText(str1).split(" ").filter(Boolean));
  const words2 = new Set(normalizeSongText(str2).split(" ").filter(Boolean));

  if (words1.size === 0 || words2.size === 0) return 0;

  let common = 0;
  for (const word of words1) {
    if (words2.has(word)) common++;
  }

  const union = new Set([...words1, ...words2]).size;
  return union === 0 ? 0 : common / union;
}

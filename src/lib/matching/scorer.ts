import { YouTubeVideoMatch, MatchConfidenceTier } from "@/types";
import {
  normalizeSongText,
  diceCoefficient,
  tokenOverlap,
  formatDuration,
} from "./similarity";

interface RawVideoCandidate {
  videoId: string;
  title: string;
  channelTitle: string;
  channelId?: string;
  description?: string;
  thumbnailUrl: string;
  durationMs?: number;
  publishedAt?: string;
}

export interface ScoreDetails {
  score: number;
  tier: MatchConfidenceTier;
  reasons: string[];
}

const NEGATIVE_KEYWORDS = [
  "cover",
  "acoustic cover",
  "karaoke",
  "instrumental",
  "live at",
  "live in",
  "live performance",
  "remix",
  "1 hour",
  "10 hours",
  "slowed",
  "reverb",
  "bass boosted",
  "reaction",
  "tutorial",
  "how to play",
  "guitar lesson",
  "parody",
];

const POSITIVE_KEYWORDS = [
  "official audio",
  "official music video",
  "official video",
  "lyric video",
  "provided to youtube by",
];

export function scoreCandidate(
  candidate: RawVideoCandidate,
  targetTitle: string,
  targetArtist: string,
  targetDurationMs?: number
): ScoreDetails {
  const normTargetTitle = normalizeSongText(targetTitle);
  const normTargetArtist = normalizeSongText(targetArtist);
  const normVideoTitle = normalizeSongText(candidate.title);
  const normChannel = normalizeSongText(candidate.channelTitle);
  const normDesc = normalizeSongText(candidate.description || "");

  let score = 0;
  const reasons: string[] = [];

  // 1. Title Similarity (0 to 45 points)
  const titleDice = diceCoefficient(targetTitle, candidate.title);
  const titleOverlap = tokenOverlap(targetTitle, candidate.title);
  const titleMatchMetric = Math.max(titleDice, titleOverlap);

  const titlePoints = Math.round(titleMatchMetric * 45);
  score += titlePoints;
  if (titleMatchMetric > 0.85) {
    reasons.push("Strong title match");
  }

  // 2. Artist Presence (0 to 30 points)
  let artistFound = false;
  const artistInChannel =
    normChannel.includes(normTargetArtist) ||
    diceCoefficient(targetArtist, candidate.channelTitle) > 0.6;
  const artistInTitle =
    normVideoTitle.includes(normTargetArtist) ||
    tokenOverlap(targetArtist, candidate.title) > 0.5;
  const artistInDesc = normDesc.includes(normTargetArtist);

  if (artistInChannel) {
    score += 30;
    artistFound = true;
    reasons.push("Artist matches channel");
  } else if (artistInTitle) {
    score += 25;
    artistFound = true;
    reasons.push("Artist found in video title");
  } else if (artistInDesc) {
    score += 15;
    artistFound = true;
    reasons.push("Artist found in description");
  } else {
    // Penalty if artist is missing entirely
    score -= 10;
  }

  // 3. Official Channel / YouTube Topic Indicator (0 to 15 points)
  const isTopicChannel = candidate.channelTitle.toLowerCase().endsWith(" - topic");
  const isVevoChannel = candidate.channelTitle.toLowerCase().includes("vevo");
  const isOfficialArtistChannel = candidate.channelTitle.toLowerCase().includes("official");

  if (isTopicChannel) {
    score += 15;
    reasons.push("YouTube Music official audio release (- Topic)");
  } else if (isVevoChannel || isOfficialArtistChannel) {
    score += 10;
    reasons.push("Official artist / VEVO channel");
  }

  // 4. Positive Keywords bonus (up to 10 points)
  const rawLowerTitle = candidate.title.toLowerCase();
  for (const pos of POSITIVE_KEYWORDS) {
    if (rawLowerTitle.includes(pos) || candidate.description?.toLowerCase().includes(pos)) {
      score += 8;
      reasons.push(`Official indicator: "${pos}"`);
      break;
    }
  }

  // 5. Negative Keyword Penalties (unless target specifically asked for it)
  for (const neg of NEGATIVE_KEYWORDS) {
    const targetHasNeg =
      targetTitle.toLowerCase().includes(neg) || targetArtist.toLowerCase().includes(neg);
    if (!targetHasNeg && rawLowerTitle.includes(neg)) {
      score -= 30;
      reasons.push(`Penalized for keyword: "${neg}"`);
    }
  }

  // 6. Duration Matching (bonus or penalty)
  if (targetDurationMs && candidate.durationMs && candidate.durationMs > 0) {
    const diffSec = Math.abs(targetDurationMs - candidate.durationMs) / 1000;
    if (diffSec <= 6) {
      score += 12;
      reasons.push(`Accurate duration match (within ${Math.round(diffSec)}s)`);
    } else if (diffSec <= 15) {
      score += 6;
      reasons.push(`Close duration match (within ${Math.round(diffSec)}s)`);
    } else if (diffSec > 60) {
      score -= 20;
      reasons.push(`Duration mismatch (>60s difference)`);
    }
  }

  // Clamp score between 0 and 100
  const finalScore = Math.max(0, Math.min(100, Math.round(score)));

  let tier: MatchConfidenceTier = "low";
  if (finalScore >= 90) tier = "excellent";
  else if (finalScore >= 75) tier = "good";
  else if (finalScore >= 50) tier = "review";
  else tier = "low";

  return {
    score: finalScore,
    tier,
    reasons,
  };
}

export function rankVideoCandidates(
  candidates: RawVideoCandidate[],
  targetTitle: string,
  targetArtist: string,
  targetDurationMs?: number
): YouTubeVideoMatch[] {
  const scored = candidates.map((cand) => {
    const { score, tier, reasons } = scoreCandidate(
      cand,
      targetTitle,
      targetArtist,
      targetDurationMs
    );
    const match: YouTubeVideoMatch = {
      videoId: cand.videoId,
      title: cand.title,
      channelTitle: cand.channelTitle,
      channelId: cand.channelId,
      thumbnailUrl: cand.thumbnailUrl,
      durationMs: cand.durationMs,
      durationFormatted: formatDuration(cand.durationMs),
      confidence: score,
      confidenceTier: tier,
      matchReason: reasons.slice(0, 2).join(" • "),
      publishedAt: cand.publishedAt,
    };
    return match;
  });

  // Sort descending by confidence score
  scored.sort((a, b) => b.confidence - a.confidence);

  return scored;
}

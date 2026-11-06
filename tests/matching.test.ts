import { describe, it, expect } from "vitest";
import { scoreCandidate, rankVideoCandidates } from "@/lib/matching/scorer";
import { normalizeSongText, parseIsoDurationMs, diceCoefficient } from "@/lib/matching/similarity";

describe("Text Normalization & Similarity", () => {
  it("normalizes text and strips noise, accents, and features", () => {
    expect(normalizeSongText("Blinding Lights (feat. Rosalía)")).toBe("blinding lights");
    expect(normalizeSongText("Bohemian Rhapsody - 2011 Remaster")).toBe("bohemian rhapsody 2011 remaster");
    expect(normalizeSongText("Déjà Vu")).toBe("deja vu");
    expect(normalizeSongText("Måneskin - Beggin'")).toBe("maneskin beggin");
  });

  it("calculates high similarity for identical and minor variations", () => {
    expect(diceCoefficient("Bohemian Rhapsody", "Bohemian Rhapsody")).toBe(1.0);
    expect(diceCoefficient("Bohemian Rhapsody", "Bohemian Rhapsody Official")).toBeGreaterThan(0.7);
  });

  it("parses ISO 8601 durations to milliseconds", () => {
    expect(parseIsoDurationMs("PT3M54S")).toBe((3 * 60 + 54) * 1000);
    expect(parseIsoDurationMs("PT1H2M10S")).toBe((3600 + 120 + 10) * 1000);
    expect(parseIsoDurationMs("PT45S")).toBe(45 * 1000);
    expect(parseIsoDurationMs(undefined)).toBeUndefined();
  });
});

describe("Matching Engine Scorer - Special Scenarios", () => {
  it("assigns excellent confidence (>=90) to official YouTube Music Topic release", () => {
    const candidate = {
      videoId: "fJ9rUzIMcZQ",
      title: "Bohemian Rhapsody",
      channelTitle: "Queen - Topic",
      thumbnailUrl: "https://i.ytimg.com/vi/fJ9rUzIMcZQ/default.jpg",
      durationMs: 354000,
      description: "Provided to YouTube by Universal Music Group",
    };

    const details = scoreCandidate(candidate, "Bohemian Rhapsody", "Queen", 354000);
    expect(details.score).toBeGreaterThanOrEqual(90);
    expect(details.tier).toBe("excellent");
  });

  it("penalizes unrequested remixes when original is studio version", () => {
    const candidateRemix = {
      videoId: "remix123",
      title: "Levitating (The Blessed Madonna Remix)",
      channelTitle: "Dua Lipa",
      thumbnailUrl: "https://i.ytimg.com/vi/remix123/default.jpg",
      durationMs: 240000,
    };

    const details = scoreCandidate(candidateRemix, "Levitating", "Dua Lipa", 203000);
    expect(details.score).toBeLessThan(75);
    expect(details.reasons.some((r) => r.includes("remix"))).toBe(true);
  });

  it("does NOT penalize remix if target specifically requests a remix", () => {
    const candidateRemix = {
      videoId: "remix456",
      title: "Levitating (The Blessed Madonna Remix)",
      channelTitle: "Dua Lipa",
      thumbnailUrl: "https://i.ytimg.com/vi/remix456/default.jpg",
      durationMs: 240000,
    };

    const details = scoreCandidate(
      candidateRemix,
      "Levitating (The Blessed Madonna Remix)",
      "Dua Lipa",
      240000
    );
    expect(details.score).toBeGreaterThanOrEqual(85);
  });

  it("penalizes unrequested acoustic covers and karaoke instrumental", () => {
    const candidateCover = {
      videoId: "cov123",
      title: "Bohemian Rhapsody (Acoustic Guitar Cover)",
      channelTitle: "GuitarGuy101",
      thumbnailUrl: "https://i.ytimg.com/vi/cov123/default.jpg",
      durationMs: 240000,
    };

    const details = scoreCandidate(candidateCover, "Bohemian Rhapsody", "Queen", 354000);
    expect(details.score).toBeLessThan(60);
    expect(details.tier).not.toBe("excellent");
  });

  it("differentiates similar song titles (e.g., 'Stay' vs 'Stay With Me')", () => {
    const candidateStay = {
      videoId: "stay1",
      title: "The Kid LAROI, Justin Bieber - STAY (Official Video)",
      channelTitle: "The Kid LAROI",
      thumbnailUrl: "https://i.ytimg.com/vi/stay1/default.jpg",
      durationMs: 141000,
    };

    const candidateStayWithMe = {
      videoId: "swm1",
      title: "Sam Smith - Stay With Me (Official Music Video)",
      channelTitle: "Sam Smith",
      thumbnailUrl: "https://i.ytimg.com/vi/swm1/default.jpg",
      durationMs: 172000,
    };

    const scoreForStay = scoreCandidate(candidateStay, "Stay", "The Kid LAROI", 141000);
    const scoreForStayWithMe = scoreCandidate(candidateStayWithMe, "Stay", "The Kid LAROI", 141000);

    expect(scoreForStay.score).toBeGreaterThan(80);
    expect(scoreForStayWithMe.score).toBeLessThan(50);
  });

  it("correctly handles collaboration artists (e.g., 'Coldplay & BTS - My Universe')", () => {
    const candidate = {
      videoId: "univ1",
      title: "Coldplay X BTS - My Universe (Official Lyric Video)",
      channelTitle: "Coldplay",
      thumbnailUrl: "https://i.ytimg.com/vi/univ1/default.jpg",
      durationMs: 228000,
    };

    const details = scoreCandidate(candidate, "My Universe", "Coldplay, BTS", 228000);
    expect(details.score).toBeGreaterThanOrEqual(80);
  });
});

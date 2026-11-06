import { describe, it, expect } from "vitest";
import { scoreCandidate, rankVideoCandidates } from "@/lib/matching/scorer";
import { normalizeSongText, parseIsoDurationMs, diceCoefficient } from "@/lib/matching/similarity";

describe("Text Normalization & Similarity", () => {
  it("normalizes text and strips noise, accents, and features", () => {
    expect(normalizeSongText("Blinding Lights (feat. Rosalía)")).toBe("blinding lights");
    expect(normalizeSongText("Bohemian Rhapsody - 2011 Remaster")).toBe("bohemian rhapsody 2011 remaster");
    expect(normalizeSongText("Déjà Vu")).toBe("deja vu");
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

describe("Matching Engine Scorer", () => {
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

  it("penalizes covers, karaoke, and live bootlegs", () => {
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

  it("ranks official video higher than karaoke cover", () => {
    const candidates = [
      {
        videoId: "kar1",
        title: "Yellow (Karaoke Instrumental Version)",
        channelTitle: "Karaoke Channel",
        thumbnailUrl: "https://i.ytimg.com/vi/kar1/default.jpg",
        durationMs: 260000,
      },
      {
        videoId: "off1",
        title: "Coldplay - Yellow (Official Video)",
        channelTitle: "Coldplay",
        thumbnailUrl: "https://i.ytimg.com/vi/off1/default.jpg",
        durationMs: 269000,
      },
    ];

    const ranked = rankVideoCandidates(candidates, "Yellow", "Coldplay", 269000);
    expect(ranked[0].videoId).toBe("off1");
    expect(ranked[0].confidence).toBeGreaterThan(ranked[1].confidence);
  });
});

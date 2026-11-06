import { describe, it, expect } from "vitest";
import {
  spotifyPlaylistUrlSchema,
  spotifyTrackUrlSchema,
  createPlaylistRequestSchema,
} from "@/lib/validation/schemas";

describe("Validation Schemas", () => {
  it("validates legitimate Spotify playlist URLs", () => {
    const valid = "https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M";
    expect(spotifyPlaylistUrlSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects non-playlist Spotify URLs", () => {
    const invalid = "https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT";
    expect(spotifyPlaylistUrlSchema.safeParse(invalid).success).toBe(false);
  });

  it("validates legitimate Spotify track URLs", () => {
    const valid = "https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT";
    expect(spotifyTrackUrlSchema.safeParse(valid).success).toBe(true);
  });

  it("validates YouTube playlist creation requests with private default", () => {
    const validRequest = {
      title: "My Roadtrip Songs",
      privacyStatus: "private",
      trackMatches: [
        {
          trackId: "1",
          videoId: "dQw4w9WgXcQ",
          title: "Never Gonna Give You Up",
          artist: "Rick Astley",
        },
      ],
    };

    const parsed = createPlaylistRequestSchema.safeParse(validRequest);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.privacyStatus).toBe("private");
    }
  });

  it("rejects empty track lists when creating playlist", () => {
    const invalidRequest = {
      title: "Empty Playlist",
      privacyStatus: "private",
      trackMatches: [],
    };

    const parsed = createPlaylistRequestSchema.safeParse(invalidRequest);
    expect(parsed.success).toBe(false);
  });
});

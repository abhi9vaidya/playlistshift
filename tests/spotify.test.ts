import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  isSpotifyEnabled,
  isSpotifyConfigured,
  fetchSpotifyPlaylist,
  fetchSpotifyTrack,
  SpotifyError,
} from "@/lib/spotify/adapter";

describe("Spotify Adapter & Dual-Mode Resolver", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("reports active status with public resolver when credentials are unset", () => {
    expect(isSpotifyEnabled()).toBe(true);
    const status = isSpotifyConfigured();
    expect(status.enabled).toBe(true);
    expect(status.configured).toBe(true);
    expect(status.mode).toBe("public_resolver");
  });

  it("throws NOT_FOUND when playlist embed cannot be found or is private", async () => {
    // Mock fetch returning a 404 or empty pageProps
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        '<html><body><script id="__NEXT_DATA__">{"props":{"pageProps":{"status":404}}}</script></body></html>',
        { status: 200 }
      )
    );

    await expect(fetchSpotifyPlaylist("nonexistentid12345678")).rejects.toThrow(SpotifyError);
  });

  it("parses track metadata cleanly from public embed payload", async () => {
    const mockEmbedJson = {
      props: {
        pageProps: {
          state: {
            data: {
              entity: {
                id: "test-playlist-123",
                name: "Top Hits &amp; Chill",
                description: "The best hits &amp; vibes",
                visualIdentity: {
                  image: [{ url: "https://example.com/cover.jpg", maxWidth: 640 }],
                },
                trackList: [
                  {
                    uri: "spotify:track:track12345",
                    title: "Blinding Lights &quot;Remix&quot;",
                    subtitle: "The Weeknd &amp; Friends",
                    duration: 200000,
                  },
                ],
              },
            },
          },
        },
      },
    };

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        `<html><body><script id="__NEXT_DATA__">${JSON.stringify(mockEmbedJson)}</script></body></html>`,
        { status: 200 }
      )
    );

    const playlist = await fetchSpotifyPlaylist("test-playlist-123");
    expect(playlist.title).toBe("Top Hits & Chill");
    expect(playlist.coverUrl).toBe("https://example.com/cover.jpg");
    expect(playlist.tracks.length).toBe(1);
    expect(playlist.tracks[0].title).toBe('Blinding Lights "Remix"');
    expect(playlist.tracks[0].artist).toBe("The Weeknd & Friends");
    expect(playlist.tracks[0].durationMs).toBe(200000);
    expect(playlist.tracks[0].spotifyUrl).toBe("https://open.spotify.com/track/track12345");
  });

  it("parses single track embed payload cleanly", async () => {
    const mockTrackJson = {
      props: {
        pageProps: {
          state: {
            data: {
              entity: {
                id: "track12345",
                name: "Levitating",
                artists: [{ name: "Dua Lipa" }],
                duration: 203000,
                visualIdentity: {
                  image: [{ url: "https://example.com/single.jpg", maxWidth: 300 }],
                },
              },
            },
          },
        },
      },
    };

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        `<html><body><script id="__NEXT_DATA__">${JSON.stringify(mockTrackJson)}</script></body></html>`,
        { status: 200 }
      )
    );

    const result = await fetchSpotifyTrack("track12345");
    expect(result.tracks.length).toBe(1);
    expect(result.tracks[0].title).toBe("Levitating");
    expect(result.tracks[0].artist).toBe("Dua Lipa");
    expect(result.tracks[0].durationMs).toBe(203000);
    expect(result.tracks[0].thumbnailUrl).toBe("https://example.com/single.jpg");
  });
});

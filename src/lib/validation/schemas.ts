import { z } from "zod";

export const spotifyPlaylistUrlSchema = z
  .string()
  .trim()
  .min(1, "Please enter a Spotify playlist URL")
  .refine(
    (val) => {
      return (
        /^(https?:\/\/)?(open\.)?spotify\.com\/playlist\/[a-zA-Z0-9]+(\?.*)?$/.test(val) ||
        /^spotify:playlist:[a-zA-Z0-9]+$/.test(val)
      );
    },
    { message: "Invalid Spotify playlist URL. Format: https://open.spotify.com/playlist/{id}" }
  );

export const spotifyTrackUrlSchema = z
  .string()
  .trim()
  .min(1, "Please enter a Spotify track URL")
  .refine(
    (val) => {
      return (
        /^(https?:\/\/)?(open\.)?spotify\.com\/track\/[a-zA-Z0-9]+(\?.*)?$/.test(val) ||
        /^spotify:track:[a-zA-Z0-9]+$/.test(val)
      );
    },
    { message: "Invalid Spotify track URL. Format: https://open.spotify.com/track/{id}" }
  );

export const manualTrackSchema = z.object({
  title: z.string().trim().min(1, "Track title is required"),
  artist: z.string().trim().min(1, "Artist name is required"),
  album: z.string().trim().optional(),
});

export const searchYouTubeRequestSchema = z.object({
  title: z.string().trim().min(1),
  artist: z.string().trim().min(1),
  durationMs: z.number().positive().optional(),
});

export const batchSearchRequestSchema = z.object({
  tracks: z
    .array(
      z.object({
        id: z.string(),
        title: z.string().trim().min(1),
        artist: z.string().trim().min(1),
        durationMs: z.number().optional(),
      })
    )
    .min(1)
    .max(50, "Maximum 50 tracks per batch to prevent quota exhaustion"),
});

export const createPlaylistRequestSchema = z.object({
  title: z.string().trim().min(1, "Playlist title is required").max(150),
  description: z.string().trim().max(1000).optional().default("Converted with PlaylistShift - https://playlistshift.com"),
  privacyStatus: z.enum(["private", "unlisted", "public"]).default("private"),
  trackMatches: z
    .array(
      z.object({
        trackId: z.string(),
        videoId: z.string().min(5),
        title: z.string(),
        artist: z.string(),
      })
    )
    .min(1, "At least one matched video is required to create a playlist"),
});


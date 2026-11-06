import React from "react";
import { constructMetadata } from "@/lib/seo/metadata";
import { ConversionTool } from "@/components/converter/ConversionTool";
import { Music, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";

export const metadata = constructMetadata({
  title: "Spotify Playlist to YouTube - Instant Free Converter",
  description:
    "Easily convert entire Spotify playlists to YouTube playlists. Match hundreds of songs in minutes, choose Private or Public privacy, and enjoy on YouTube Music.",
  path: "/spotify-playlist-to-youtube",
  keywords: [
    "Spotify Playlist to YouTube",
    "Convert Spotify Playlist",
    "Transfer Spotify Playlist to YouTube Music",
    "Spotify Playlist Converter Free",
  ],
});

export default function SpotifyPlaylistToYouTubePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="text-xs uppercase tracking-wider text-brandGreen font-semibold">
          Complete Playlist Migration
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
          Convert Entire Spotify Playlists to YouTube
        </h1>
        <p className="text-base sm:text-lg text-textMuted leading-relaxed">
          Paste your public Spotify playlist URL below to import tracks, preview YouTube matches with confidence ratings, and create a brand-new playlist on YouTube.
        </p>
      </div>

      <ConversionTool />

      <article className="prose prose-invert max-w-none space-y-8 bg-surface p-8 sm:p-12 rounded-3xl border border-border">
        <h2 className="text-2xl font-bold text-white">Step-by-Step Playlist Conversion Guide</h2>
        <div className="space-y-4 text-sm text-textMuted leading-relaxed">
          <p>
            1. <strong>Open Spotify</strong> and navigate to the playlist you wish to migrate. Ensure its privacy is set to Public so our adapter can safely read track metadata.
          </p>
          <p>
            2. <strong>Copy the Link:</strong> Click the three dots menu (•••) on Spotify, select <em>Share</em>, and click <em>Copy Link to Playlist</em>.
          </p>
          <p>
            3. <strong>Paste into PlaylistShift:</strong> Paste the link in the input field above. Our system extracts the track names, artists, and durations.
          </p>
          <p>
            4. <strong>Review Matches:</strong> Our intelligent scoring engine assigns confidence scores (0-100) to each match. You can manually inspect or swap any video before exporting.
          </p>
          <p>
            5. <strong>Export:</strong> Click <em>Create YouTube Playlist</em> to generate your playlist in your personal YouTube library.
          </p>
        </div>
      </article>
    </div>
  );
}

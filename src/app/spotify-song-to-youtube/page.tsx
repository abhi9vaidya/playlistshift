import React from "react";
import { constructMetadata } from "@/lib/seo/metadata";
import { ConversionTool } from "@/components/converter/ConversionTool";
import { Disc3, CheckCircle2 } from "lucide-react";

export const metadata = constructMetadata({
  title: "Spotify Song to YouTube - Find & Add Tracks Online",
  description:
    "Convert individual Spotify songs to YouTube. Instantly find official YouTube music videos or audio tracks from a single Spotify track link.",
  path: "/spotify-song-to-youtube",
  keywords: [
    "Spotify Song to YouTube",
    "Spotify Track to YouTube Video",
    "Convert Spotify Song to YouTube",
    "Find Spotify Song on YouTube",
  ],
});

export default function SpotifySongToYouTubePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="text-xs uppercase tracking-wider text-brandPurple font-semibold">
          Single Track Conversion
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
          Convert Single Spotify Songs to YouTube
        </h1>
        <p className="text-base sm:text-lg text-textMuted leading-relaxed">
          Found a great song on Spotify that you want in your YouTube library? Paste the track URL below to locate the official audio and add it directly to YouTube.
        </p>
      </div>

      <ConversionTool />

      <article className="prose prose-invert max-w-none space-y-6 bg-surface p-8 sm:p-12 rounded-3xl border border-border text-sm text-textMuted leading-relaxed">
        <h2 className="text-2xl font-bold text-white">Why Convert Individual Tracks?</h2>
        <p>
          Sometimes you discover a single new favourite track from a friend&apos;s link or playlist, but you listen primarily on YouTube or YouTube Music. PlaylistShift makes it seamless to identify the verified video or official topic release on YouTube and add it straight to your channel.
        </p>
        <p>
          You can create a standalone one-song playlist or continuously add tracks to your active session before exporting all of them in a batch.
        </p>
      </article>
    </div>
  );
}


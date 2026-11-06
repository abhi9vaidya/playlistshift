import React from "react";
import { constructMetadata } from "@/lib/seo/metadata";
import { ConversionTool } from "@/components/converter/ConversionTool";
import { CheckCircle2, Shield, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export const metadata = constructMetadata({
  title: "Spotify to YouTube Playlist Converter - Free & Instant Transfer",
  description:
    "Convert your Spotify playlists directly into YouTube and YouTube Music playlists online for free. Accurate audio matching, private playlist options, and zero software download.",
  path: "/spotify-to-youtube",
  keywords: [
    "Spotify to YouTube",
    "Spotify to YouTube Converter",
    "Spotify to YouTube Playlist Converter",
    "Convert Spotify Playlist Online",
    "Free Playlist Converter",
  ],
});

export default function SpotifyToYouTubePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="text-xs uppercase tracking-wider text-brandGreen font-semibold">
          Online Playlist Migration
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
          Convert Spotify Playlists to YouTube Online Free
        </h1>
        <p className="text-base sm:text-lg text-textMuted leading-relaxed">
          Switching from Spotify to YouTube Music? PlaylistShift accurately identifies and transfers every song into your personal YouTube library in minutes.
        </p>
      </div>

      {/* Embedded Converter */}
      <ConversionTool />

      {/* Detailed Informational Guide */}
      <article className="prose prose-invert max-w-none space-y-8 bg-surface p-8 sm:p-12 rounded-3xl border border-border">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white">
            Why Transfer Your Spotify Library to YouTube?
          </h2>
          <p className="text-sm text-textMuted leading-relaxed">
            YouTube and YouTube Music offer one of the largest digital music catalogues on the planet, including rare live acoustic sessions, official studio audio, and remasters unavailable anywhere else. However, manually recreating playlists with dozens or hundreds of songs is tedious. PlaylistShift automates the search and assembly process safely.
          </p>
        </section>

        <section className="space-y-4">
          <h3 className="text-xl font-bold text-white">How Our Audio Matching Works</h3>
          <p className="text-sm text-textMuted leading-relaxed">
            Unlike basic search scripts that simply pick the first YouTube video result, PlaylistShift employs an intelligent multi-stage scoring algorithm:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-surfaceHover border border-border space-y-2">
              <span className="text-xs font-bold text-brandGreen uppercase">Stage 1</span>
              <h4 className="text-sm font-semibold text-white">Official Topic Releases</h4>
              <p className="text-xs text-textMuted">
                Prioritizes YouTube Music auto-generated audio topics provided directly by record labels.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-surfaceHover border border-border space-y-2">
              <span className="text-xs font-bold text-brandPurple uppercase">Stage 2</span>
              <h4 className="text-sm font-semibold text-white">Noise Filtering</h4>
              <p className="text-xs text-textMuted">
                Penalizes karaoke, amateur covers, instrumental-only remakes, and unofficial live bootlegs.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-surfaceHover border border-border space-y-2">
              <span className="text-xs font-bold text-emerald-400 uppercase">Stage 3</span>
              <h4 className="text-sm font-semibold text-white">Duration Cross-Checking</h4>
              <p className="text-xs text-textMuted">
                Compares original track length against candidate video runtimes to avoid extended compilations.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-xl font-bold text-white">Your Privacy and Security</h3>
          <p className="text-sm text-textMuted leading-relaxed">
            PlaylistShift adheres strictly to Google API security guidelines. We use Google OAuth 2.0 with minimal required permissions. Your Google password is never exposed to PlaylistShift, and created playlists default to <strong>Private</strong> status so your music taste remains your own.
          </p>
        </section>
      </article>
    </div>
  );
}

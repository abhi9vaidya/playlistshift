import React from "react";
import { constructMetadata } from "@/lib/seo/metadata";
import { Link2, Search, Youtube, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { AdSlot } from "@/components/ads/AdSlot";

export const metadata = constructMetadata({
  title: "How to Convert Spotify Playlists to YouTube - Complete Guide",
  description:
    "Comprehensive step-by-step tutorial on converting Spotify playlists to YouTube and YouTube Music online for free without downloading music files.",
  path: "/how-to-convert-spotify-playlist-to-youtube",
  keywords: [
    "How to Convert Spotify Playlist to YouTube",
    "Transfer Spotify to YouTube Guide",
    "Migrate Music from Spotify to YouTube",
  ],
});

export default function HowToConvertGuidePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center space-y-4">
        <span className="text-xs uppercase tracking-wider text-brandGreen font-semibold">
          Step-by-Step Tutorial
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
          How to Convert a Spotify Playlist to YouTube
        </h1>
        <p className="text-base sm:text-lg text-textMuted leading-relaxed max-w-2xl mx-auto">
          A complete, easy-to-follow guide to transferring your music library from Spotify to YouTube and YouTube Music without downloading files or installing shady software.
        </p>
      </div>

      <div className="flex justify-center">
        <Link href="/#convert">
          <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
            Open Converter Now
          </Button>
        </Link>
      </div>

      <article className="prose prose-invert max-w-none space-y-10 bg-surface p-8 sm:p-12 rounded-3xl border border-border text-sm text-textMuted leading-relaxed">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white">Introduction</h2>
          <p>
            Whether you are switching completely to YouTube Premium or simply want access to music videos on your smart TV, migrating playlists manually can take hours. With PlaylistShift, the whole process takes only a few clicks.
          </p>
        </section>

        <section className="space-y-4">
          <h3 className="text-xl font-bold text-white">Step 1: Obtain the Spotify Playlist Link</h3>
          <p>
            Open Spotify on desktop, web, or mobile. Navigate to the playlist you want to migrate. Click the three dots icon (•••) near the play button, choose <em>Share</em>, and click <em>Copy link to playlist</em>.
          </p>
          <div className="p-4 rounded-xl bg-surfaceHover border border-borderSubtle text-xs">
            <strong>Note:</strong> Ensure the playlist privacy on Spotify is set to Public so third-party integrations can read the tracklist.
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-xl font-bold text-white">Step 2: Paste into PlaylistShift</h3>
          <p>
            Visit <Link href="/" className="text-brandGreen hover:underline">PlaylistShift.com</Link> and paste your URL into the Spotify Playlist input box. Click <em>Import Playlist</em>. PlaylistShift parses each track&apos;s title, artist, and duration.
          </p>
        </section>

        <section className="space-y-4">
          <h3 className="text-xl font-bold text-white">Step 3: Review Matched Songs</h3>
          <p>
            PlaylistShift queries YouTube&apos;s music catalogue for official audio releases and music videos. Each candidate is assigned a confidence rating from 0 to 100%. If a song looks incorrect or has a low score, click <em>Match</em> to select an alternate YouTube video.
          </p>
        </section>

        {/* Compliant AdSlot surrounded by educational content */}
        <AdSlot placement="between-content" />

        <section className="space-y-4">
          <h3 className="text-xl font-bold text-white">Step 4: Connect Google & Choose Privacy</h3>
          <p>
            Click <em>Connect Google & Create Playlist</em>. Choose your playlist privacy:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Private (Default):</strong> Only you can view the playlist.</li>
            <li><strong>Unlisted:</strong> Anyone with the direct link can listen.</li>
            <li><strong>Public:</strong> Discoverable in YouTube search.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h3 className="text-xl font-bold text-white">Step 5: Enjoy on YouTube Music</h3>
          <p>
            Once completed, click <em>Open on YouTube</em>. Your newly created playlist will instantly appear in your YouTube library and can be streamed on YouTube Music across mobile, web, and TV devices.
          </p>
        </section>
      </article>
    </div>
  );
}


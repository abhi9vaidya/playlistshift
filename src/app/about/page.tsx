import React from "react";
import { constructMetadata } from "@/lib/seo/metadata";
import { Music, Shield, Sparkles, Heart } from "lucide-react";

export const metadata = constructMetadata({
  title: "About PlaylistShift - Free Music Migration Tool",
  description:
    "Learn about PlaylistShift's mission to make music accessible across platforms without subscriptions or paywalls.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center space-y-4">
        <span className="text-xs uppercase tracking-wider text-brandGreen font-semibold">
          Our Mission
        </span>
        <h1 className="text-4xl font-extrabold text-white tracking-tight">
          About PlaylistShift
        </h1>
        <p className="text-base text-textMuted max-w-2xl mx-auto leading-relaxed">
          Music belongs to listeners, not platforms. We built PlaylistShift to give you total freedom over your playlists.
        </p>
      </div>

      <div className="bg-surface border border-border rounded-3xl p-8 sm:p-12 space-y-8 text-sm text-textMuted leading-relaxed">
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white">Why PlaylistShift Exists</h2>
          <p>
            When listeners decide to switch music streaming services—whether moving from Spotify to YouTube Music, backing up playlists, or sharing music across platforms with friends—they often encounter proprietary lock-in or subscription-based converter apps demanding expensive monthly recurring fees.
          </p>
          <p>
            We believe that organizing the music you already love should never require a paid subscription. PlaylistShift was created as a lightweight, privacy-conscious, fast, and 100% free web utility designed to solve this problem simply.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white">Our Core Principles</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-surfaceHover border border-border">
              <Sparkles className="w-5 h-5 text-brandGreen mb-2" />
              <h3 className="font-semibold text-white mb-1">Always Free</h3>
              <p className="text-xs">No artificial limits, no paywalls, and no credit card required.</p>
            </div>
            <div className="p-4 rounded-xl bg-surfaceHover border border-border">
              <Shield className="w-5 h-5 text-brandPurple mb-2" />
              <h3 className="font-semibold text-white mb-1">Privacy First</h3>
              <p className="text-xs">We do not store passwords or sell personal data. Playlists default to private.</p>
            </div>
            <div className="p-4 rounded-xl bg-surfaceHover border border-border">
              <Music className="w-5 h-5 text-emerald-400 mb-2" />
              <h3 className="font-semibold text-white mb-1">Zero Audio Piracy</h3>
              <p className="text-xs">We never scrape or rip audio. We only assemble official links directly on YouTube.</p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white">Technology & Maintenance</h2>
          <p>
            PlaylistShift is built with modern, performant web technologies including Next.js, React, Tailwind CSS, and official YouTube and Google OAuth APIs. We actively maintain our matching algorithms to ensure high conversion accuracy across varying genres and languages.
          </p>
        </section>
      </div>
    </div>
  );
}

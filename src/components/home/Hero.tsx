import React from "react";
import Link from "next/link";
import { Button } from "../ui/Button";
import { ArrowRight, Music2, Youtube, ShieldCheck, Sparkles, Zap } from "lucide-react";

export const Hero: React.FC = () => {
  return (
    <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden text-center">
      {/* Background radial gradient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-r from-brandGreen/15 via-brandPurple/15 to-brandRed/10 blur-[130px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Top Announcement Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface/80 border border-border text-xs text-textMuted shadow-sm">
          <span className="w-2 h-2 rounded-full bg-brandGreen animate-pulse" />
          <span className="text-white font-medium">Free Spotify to YouTube Playlist Converter</span>
          <span className="text-textSubtle">•</span>
          <span className="text-brandGreen">No Account Required</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
          Move Your Music. <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-brandGreen via-emerald-300 to-brandPurple bg-clip-text text-transparent">
            Keep Your Vibe.
          </span>
        </h1>

        {/* Supporting Copy */}
        <p className="max-w-2xl mx-auto text-base sm:text-lg text-textMuted leading-relaxed">
          Convert Spotify playlists and songs into YouTube and YouTube Music playlists in minutes. Free, simple, and engineered to make switching music platforms effortless.
        </p>

        {/* Visual Platform Transition Badge */}
        <div className="flex items-center justify-center gap-3 pt-2 pb-4">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface border border-border">
            <Music2 className="w-5 h-5 text-brandGreen" />
            <span className="text-xs font-semibold text-white">Spotify</span>
          </div>

          <div className="w-6 h-6 rounded-full bg-surfaceHover border border-border flex items-center justify-center text-textMuted">
            <ArrowRight className="w-3.5 h-3.5 text-brandGreen" />
          </div>

          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface border border-border">
            <Youtube className="w-5 h-5 text-brandRed" />
            <span className="text-xs font-semibold text-white">YouTube & Music</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link href="#convert">
            <Button size="lg" variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Start Converting Free
            </Button>
          </Link>
          <Link href="#how-it-works">
            <Button size="lg" variant="secondary">
              How It Works
            </Button>
          </Link>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 pt-6 text-xs text-textSubtle">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-brandGreen" /> 100% Free Forever
          </span>
          <span className="flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-brandPurple" /> Private Playlists Default
          </span>
          <span className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-400" /> High-Accuracy Matching
          </span>
        </div>
      </div>
    </section>
  );
};

function Lock(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}


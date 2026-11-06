import React from "react";
import {
  Sparkles,
  Music2,
  Lock,
  FileSpreadsheet,
  CheckCircle2,
  CloudOff,
  ShieldCheck,
  Smartphone,
} from "lucide-react";

export const Features: React.FC = () => {
  const featureList = [
    {
      title: "100% Free Playlist Transfer",
      description:
        "No subscriptions, hidden costs, or paywalled track limits. Convert your music library freely.",
      icon: Sparkles,
      color: "text-brandGreen",
    },
    {
      title: "Accurate Song Matching",
      description:
        "Our matching algorithm prioritizes official studio audio releases, YouTube Music Topic tracks, and verified VEVO videos.",
      icon: Music2,
      color: "text-brandPurple",
    },
    {
      title: "Private Playlists by Default",
      description:
        "Your YouTube playlists are created Private by default. Choose between Private, Unlisted, or Public anytime.",
      icon: Lock,
      color: "text-emerald-400",
    },
    {
      title: "Universal CSV & Text Fallback",
      description:
        "Works completely independently of Spotify API availability. Paste tracklists or upload spreadsheet files anytime.",
      icon: FileSpreadsheet,
      color: "text-blue-400",
    },
    {
      title: "Manual Match Correction",
      description:
        "Easily preview alternative video search results and swap any track match with a single click before exporting.",
      icon: CheckCircle2,
      color: "text-brandGreen",
    },
    {
      title: "Zero Music Downloading",
      description:
        "PlaylistShift solely organizes playlist links directly inside your personal YouTube account. No audio files are pirated or stored.",
      icon: CloudOff,
      color: "text-textMuted",
    },
    {
      title: "Secure Google OAuth 2.0",
      description:
        "We never request or store your Google password. Authorization uses Google's official, least-privilege token flow.",
      icon: ShieldCheck,
      color: "text-brandRed",
    },
    {
      title: "Mobile-First Experience",
      description:
        "Optimized for smooth, responsive playlist transfers on smartphones, tablets, and desktop browsers alike.",
      icon: Smartphone,
      color: "text-amber-400",
    },
  ];

  return (
    <section id="features" className="py-20 bg-[#0B0C12] border-t border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
          <span className="text-xs uppercase tracking-wider text-brandGreen font-semibold">
            Built for Music Enthusiasts
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Engineered for Precision & Ease
          </h2>
          <p className="text-sm text-textMuted">
            Everything you need to migrate your music seamlessly between Spotify and YouTube.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featureList.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="p-6 rounded-2xl bg-surface border border-border hover:border-textSubtle transition-all duration-200 space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-surfaceHover border border-border flex items-center justify-center">
                  <Icon className={`w-5 h-5 ${f.color}`} />
                </div>
                <h3 className="text-base font-bold text-white">{f.title}</h3>
                <p className="text-xs text-textMuted leading-relaxed">{f.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

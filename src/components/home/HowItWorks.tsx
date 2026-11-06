import React from "react";
import { Link2, Search, CheckCircle2 } from "lucide-react";

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      number: "01",
      title: "Import Your Music",
      description:
        "Paste a public Spotify playlist or song link, upload a CSV spreadsheet, or paste a raw text list of your favourite tracks.",
      icon: Link2,
      accent: "text-brandGreen bg-brandGreen/10 border-brandGreen/20",
    },
    {
      number: "02",
      title: "Intelligent Audio Matching",
      description:
        "Our engine scours YouTube for official audio releases and music videos, filtering out karaoke, covers, and live recordings with confidence scoring.",
      icon: Search,
      accent: "text-brandPurple bg-brandPurple/10 border-brandPurple/20",
    },
    {
      number: "03",
      title: "Create YouTube Playlist",
      description:
        "Authenticate safely with Google OAuth, pick your playlist privacy (Private by default), and your new playlist is automatically assembled.",
      icon: CheckCircle2,
      accent: "text-brandRed bg-brandRed/10 border-brandRed/20",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 border-t border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
          <span className="text-xs uppercase tracking-wider text-brandGreen font-semibold">
            Simple 3-Step Process
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            How PlaylistShift Works
          </h2>
          <p className="text-sm text-textMuted">
            Transfer hundreds of songs from Spotify to YouTube in under two minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="relative p-8 rounded-2xl bg-surface border border-border hover:border-textSubtle transition-all duration-300 group"
              >
                <div className="flex items-center justify-between mb-6">
                  <div
                    className={`w-12 h-12 rounded-xl border flex items-center justify-center ${step.accent}`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-3xl font-mono font-bold text-surfaceActive group-hover:text-border transition-colors">
                    {step.number}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-textMuted leading-relaxed">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

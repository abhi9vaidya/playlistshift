"use client";

import React, { useState } from "react";
import { SpotifyPlaylistTab } from "./SpotifyPlaylistTab";
import { SpotifyTrackTab } from "./SpotifyTrackTab";
import { CsvTextTab } from "./CsvTextTab";
import { ConversionWorkspace } from "./ConversionWorkspace";
import { PlaylistData } from "@/types";
import { Music, Disc3, FileSpreadsheet, Sparkles } from "lucide-react";

export const ConversionTool: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"playlist" | "track" | "csv">("playlist");
  const [activePlaylist, setActivePlaylist] = useState<PlaylistData | null>(null);

  if (activePlaylist) {
    return (
      <ConversionWorkspace
        initialPlaylist={activePlaylist}
        onReset={() => setActivePlaylist(null)}
      />
    );
  }

  return (
    <div
      id="convert"
      className="w-full max-w-4xl mx-auto rounded-3xl bg-surface/90 border border-border shadow-2xl backdrop-blur-xl p-6 sm:p-8 space-y-6 relative overflow-hidden"
    >
      {/* Decorative subtle ambient glows */}
      <div className="absolute -top-32 -left-32 w-64 h-64 bg-brandGreen/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-brandPurple/10 rounded-full blur-3xl pointer-events-none" />

      {/* Conversion Modes Tabs (Section 3) */}
      <div className="flex flex-col sm:flex-row items-center justify-between border-b border-border pb-4 gap-4">
        <div className="flex items-center gap-2 p-1 bg-surfaceHover rounded-2xl border border-border w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab("playlist")}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
              activeTab === "playlist"
                ? "bg-brandGreen text-black shadow-md shadow-brandGreen/20"
                : "text-textMuted hover:text-white"
            }`}
          >
            <Music className="w-4 h-4" />
            Spotify Playlist
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("track")}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
              activeTab === "track"
                ? "bg-brandPurple text-white shadow-md shadow-brandPurple/20"
                : "text-textMuted hover:text-white"
            }`}
          >
            <Disc3 className="w-4 h-4" />
            Spotify Song
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("csv")}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
              activeTab === "csv"
                ? "bg-surface text-white border border-border shadow-md"
                : "text-textMuted hover:text-white"
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-brandGreen" />
            CSV / Text Import
          </button>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-textMuted">
          <Sparkles className="w-3.5 h-3.5 text-brandGreen" />
          <span>100% Free • No Sign-up Needed to Start</span>
        </div>
      </div>

      {/* Tab Panels */}
      <div className="relative z-10 pt-2">
        {activeTab === "playlist" && (
          <SpotifyPlaylistTab
            onPlaylistLoaded={setActivePlaylist}
            onSwitchToCsv={() => setActiveTab("csv")}
          />
        )}
        {activeTab === "track" && (
          <SpotifyTrackTab
            onPlaylistLoaded={setActivePlaylist}
            onSwitchToCsv={() => setActiveTab("csv")}
          />
        )}
        {activeTab === "csv" && (
          <CsvTextTab onPlaylistLoaded={setActivePlaylist} />
        )}
      </div>
    </div>
  );
};

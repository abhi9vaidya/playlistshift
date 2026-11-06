"use client";

import React, { useState } from "react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Clipboard, ArrowRight, Music, AlertCircle, Sparkles, FileSpreadsheet } from "lucide-react";
import { PlaylistData } from "@/types";

interface SpotifyPlaylistTabProps {
  onPlaylistLoaded: (playlist: PlaylistData) => void;
  onSwitchToCsv: () => void;
}

export const SpotifyPlaylistTab: React.FC<SpotifyPlaylistTabProps> = ({
  onPlaylistLoaded,
  onSwitchToCsv,
}) => {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fallbackOffer, setFallbackOffer] = useState(false);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text.trim());
        setError(null);
      }
    } catch {
      // Clipboard access denied
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError("Please enter a Spotify playlist URL.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setFallbackOffer(false);

    try {
      const res = await fetch("/api/spotify/playlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to import Spotify playlist.");
        if (data.fallbackSuggested || res.status === 400 || res.status === 403 || res.status === 500) {
          setFallbackOffer(true);
        }
        return;
      }

      onPlaylistLoaded(data.playlist);
    } catch (err: unknown) {
      setError("Network error while connecting to Spotify API.");
      setFallbackOffer(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-textMuted mb-2">
            Spotify Playlist URL
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Input
                type="text"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M..."
                leftElement={<Music className="w-4 h-4 text-brandGreen" />}
                rightElement={
                  <button
                    type="button"
                    onClick={handlePaste}
                    className="p-1 text-textMuted hover:text-white hover:bg-surfaceHover rounded transition-colors text-xs flex items-center gap-1"
                    title="Paste from clipboard"
                  >
                    <Clipboard className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Paste</span>
                  </button>
                }
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="shrink-0"
            >
              Import Playlist
            </Button>
          </div>
        </div>

        <p className="text-xs text-textSubtle">
          Example: <code className="text-textMuted">https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M</code> (Public playlists only)
        </p>
      </form>

      {error && (
        <div className="p-4 rounded-xl bg-brandRed/10 border border-brandRed/30 text-sm text-brandRed flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="space-y-2">
            <p className="font-medium">{error}</p>
            {fallbackOffer && (
              <div className="pt-2 border-t border-brandRed/20">
                <p className="text-xs text-textMuted mb-2">
                  Spotify Web API credentials may be restricted or pending approval. You can seamlessly convert your playlist using our free CSV or text paste importer!
                </p>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={onSwitchToCsv}
                  leftIcon={<FileSpreadsheet className="w-3.5 h-3.5 text-brandGreen" />}
                >
                  Switch to CSV / Text Importer
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Helpful tips box */}
      <div className="p-4 rounded-xl bg-surface/50 border border-borderSubtle flex items-start gap-3">
        <Sparkles className="w-4 h-4 text-brandGreen shrink-0 mt-0.5" />
        <div className="text-xs text-textMuted leading-relaxed">
          <strong className="text-white">Tip:</strong> Make sure the playlist privacy on Spotify is set to <em>Public</em> so that PlaylistShift can securely read the track list.
        </div>
      </div>
    </div>
  );
};

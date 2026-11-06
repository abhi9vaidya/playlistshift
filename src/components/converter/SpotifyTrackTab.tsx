"use client";

import React, { useState } from "react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Clipboard, ArrowRight, Disc3, AlertCircle, FileSpreadsheet } from "lucide-react";
import { PlaylistData } from "@/types";

interface SpotifyTrackTabProps {
  onPlaylistLoaded: (playlist: PlaylistData) => void;
  onSwitchToCsv: () => void;
}

export const SpotifyTrackTab: React.FC<SpotifyTrackTabProps> = ({
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
      // Ignore clipboard error
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError("Please enter a Spotify song URL.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setFallbackOffer(false);

    try {
      const res = await fetch("/api/spotify/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to find Spotify song.");
        if (data.fallbackSuggested || res.status === 400 || res.status === 403 || res.status === 500) {
          setFallbackOffer(true);
        }
        return;
      }

      onPlaylistLoaded(data.playlist);
    } catch {
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
            Spotify Track URL
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
                placeholder="https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT..."
                leftElement={<Disc3 className="w-4 h-4 text-brandPurple" />}
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
              variant="purple"
              size="md"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="shrink-0"
            >
              Find Song
            </Button>
          </div>
        </div>

        <p className="text-xs text-textSubtle">
          Example: <code className="text-textMuted">https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT</code>
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
                  You can also paste the song title and artist directly in our universal text importer.
                </p>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={onSwitchToCsv}
                  leftIcon={<FileSpreadsheet className="w-3.5 h-3.5 text-brandGreen" />}
                >
                  Switch to Text Importer
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

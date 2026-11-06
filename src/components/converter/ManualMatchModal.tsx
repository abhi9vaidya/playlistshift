"use client";

import React, { useState } from "react";
import { Modal } from "../ui/Modal";
import { Track, YouTubeVideoMatch } from "@/types";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { ConfidenceBadge } from "../matching/ConfidenceBadge";
import { Search, ExternalLink, Check, Loader2 } from "lucide-react";

interface ManualMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  track: Track | null;
  onSelectMatch: (trackId: string, match: YouTubeVideoMatch) => void;
}

export const ManualMatchModal: React.FC<ManualMatchModalProps> = ({
  isOpen,
  onClose,
  track,
  onSelectMatch,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [customCandidates, setCustomCandidates] = useState<YouTubeVideoMatch[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen && track) {
      setSearchQuery(`${track.title} ${track.artist}`);
      setCustomCandidates(null);
      setSearchError(null);
    }
  }, [isOpen, track]);

  if (!track) return null;

  const currentMatch = track.matchedVideo;
  const initialAlternatives = track.alternativeMatches || [];
  const displayCandidates =
    customCandidates !== null
      ? customCandidates
      : [currentMatch, ...initialAlternatives].filter(Boolean) as YouTubeVideoMatch[];

  const handleCustomSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchError(null);

    try {
      const res = await fetch("/api/youtube/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: searchQuery.trim(),
          artist: track.artist,
          durationMs: track.durationMs,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setSearchError(data.error || "Search failed");
        return;
      }

      const list: YouTubeVideoMatch[] = [];
      if (data.bestMatch) list.push(data.bestMatch);
      if (data.alternatives) list.push(...data.alternatives);

      setCustomCandidates(list);
    } catch {
      setSearchError("Failed to search YouTube.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Select YouTube Match"
      description={`Review matches for "${track.title}" by ${track.artist}`}
      maxWidth="lg"
    >
      <div className="space-y-6">
        {/* Custom YouTube search bar */}
        <form onSubmit={handleCustomSearch} className="flex gap-2">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search YouTube for "${track.title} ${track.artist}"`}
            leftElement={<Search className="w-4 h-4 text-textMuted" />}
          />
          <Button
            type="submit"
            variant="secondary"
            size="md"
            isLoading={isSearching}
            className="shrink-0"
          >
            Search
          </Button>
        </form>

        {searchError && (
          <p className="text-xs text-brandRed font-medium">{searchError}</p>
        )}

        {/* Video Candidate list */}
        <div className="space-y-3">
          <div className="text-xs font-semibold text-textMuted uppercase tracking-wider">
            Available Matches ({displayCandidates.length})
          </div>

          {displayCandidates.length === 0 ? (
            <div className="text-center py-8 text-sm text-textSubtle bg-surface/40 rounded-xl border border-border">
              No matching YouTube videos found. Try a custom search query above.
            </div>
          ) : (
            displayCandidates.map((candidate) => {
              const isSelected = currentMatch?.videoId === candidate.videoId;

              return (
                <div
                  key={candidate.videoId}
                  className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                    isSelected
                      ? "bg-brandGreen/5 border-brandGreen/50"
                      : "bg-surface hover:bg-surfaceHover border-border"
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="relative w-24 h-14 rounded-lg overflow-hidden bg-black/40 shrink-0 border border-border">
                      <img
                        src={candidate.thumbnailUrl}
                        alt={candidate.title}
                        className="w-full h-full object-cover"
                      />
                      {candidate.durationFormatted && (
                        <span className="absolute bottom-1 right-1 bg-black/80 text-[10px] text-white px-1 py-0.5 rounded font-mono font-medium">
                          {candidate.durationFormatted}
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <a
                          href={`https://www.youtube.com/watch?v=${candidate.videoId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-semibold text-white hover:text-brandGreen line-clamp-1 transition-colors flex items-center gap-1"
                        >
                          <span>{candidate.title}</span>
                          <ExternalLink className="w-3 h-3 shrink-0 opacity-50" />
                        </a>
                      </div>

                      <p className="text-xs text-textMuted truncate">
                        {candidate.channelTitle}
                      </p>

                      <ConfidenceBadge
                        score={candidate.confidence}
                        tier={candidate.confidenceTier}
                        reason={candidate.matchReason}
                      />
                    </div>
                  </div>

                  <div className="pl-3 shrink-0">
                    {isSelected ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-brandGreen bg-brandGreen/10 border border-brandGreen/30 px-3 py-1.5 rounded-lg">
                        <Check className="w-3.5 h-3.5" /> Selected
                      </span>
                    ) : (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          onSelectMatch(track.id, candidate);
                          onClose();
                        }}
                      >
                        Choose Match
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </Modal>
  );
};


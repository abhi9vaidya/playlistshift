"use client";

import React from "react";
import { Track, YouTubeVideoMatch } from "@/types";
import { ConfidenceBadge } from "../matching/ConfidenceBadge";
import { Button } from "../ui/Button";
import {
  Music,
  ExternalLink,
  Edit2,
  Trash2,
  RotateCcw,
  Plus,
  Loader2,
  AlertCircle,
  Video,
} from "lucide-react";

interface TrackRowProps {
  track: Track;
  index: number;
  onOpenManualMatch: (track: Track) => void;
  onToggleExclude: (trackId: string) => void;
  onRetrySearch: (track: Track) => void;
}

export const TrackRow: React.FC<TrackRowProps> = ({
  track,
  index,
  onOpenManualMatch,
  onToggleExclude,
  onRetrySearch,
}) => {
  const isExcluded = track.status === "excluded";
  const isSearching = track.status === "searching";
  const isUnmatched = track.status === "unmatched";
  const hasMatch = Boolean(track.matchedVideo);

  return (
    <div
      className={`group flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border transition-all duration-200 gap-4 ${
        isExcluded
          ? "opacity-40 bg-surface/30 border-border/50"
          : isUnmatched
          ? "bg-brandRed/5 border-brandRed/30"
          : hasMatch && track.matchedVideo?.confidenceTier === "review"
          ? "bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40"
          : "bg-surface hover:bg-surfaceHover/70 border-border hover:border-[#2A2F40]"
      }`}
    >
      {/* Left: Original Track details */}
      <div className="flex items-center gap-3.5 min-w-0 md:w-5/12">
        <span className="text-xs font-mono text-textSubtle w-6 text-right shrink-0">
          {index + 1}
        </span>

        {/* Thumbnail */}
        <div className="w-12 h-12 rounded-lg bg-surfaceHover border border-border overflow-hidden shrink-0 flex items-center justify-center text-textMuted">
          {track.thumbnailUrl ? (
            <img
              src={track.thumbnailUrl}
              alt={track.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <Music className="w-5 h-5 text-textSubtle" />
          )}
        </div>

        {/* Title & Artist */}
        <div className="min-w-0 space-y-0.5">
          <p className="text-sm font-semibold text-white truncate group-hover:text-brandGreen transition-colors">
            {track.title}
          </p>
          <p className="text-xs text-textMuted truncate">
            {track.artist}
            {track.album && <span className="opacity-60"> • {track.album}</span>}
          </p>
        </div>
      </div>

      {/* Middle: Matched YouTube Video Details */}
      <div className="flex items-center gap-3 min-w-0 md:w-5/12">
        {isSearching ? (
          <div className="flex items-center gap-2 text-xs text-brandGreen">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Searching YouTube...</span>
          </div>
        ) : isExcluded ? (
          <span className="text-xs text-textSubtle italic">Track excluded from export</span>
        ) : track.matchedVideo ? (
          <div className="flex items-center gap-3 min-w-0 w-full">
            <div className="relative w-16 h-10 rounded-md overflow-hidden bg-black/40 border border-border shrink-0">
              <img
                src={track.matchedVideo.thumbnailUrl}
                alt={track.matchedVideo.title}
                className="w-full h-full object-cover"
              />
              {track.matchedVideo.durationFormatted && (
                <span className="absolute bottom-0.5 right-0.5 bg-black/80 text-[9px] text-white px-1 rounded font-mono">
                  {track.matchedVideo.durationFormatted}
                </span>
              )}
            </div>

            <div className="min-w-0 space-y-0.5 flex-1">
              <div className="flex items-center gap-1.5">
                <a
                  href={`https://www.youtube.com/watch?v=${track.matchedVideo.videoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-white hover:text-brandGreen truncate flex items-center gap-1"
                >
                  <span className="truncate">{track.matchedVideo.title}</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-50 shrink-0" />
                </a>
              </div>
              <div className="flex items-center gap-2">
                <ConfidenceBadge
                  score={track.matchedVideo.confidence}
                  tier={track.matchedVideo.confidenceTier}
                  reason={track.matchedVideo.matchReason}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-brandRed">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>No confident YouTube match found</span>
          </div>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center justify-end gap-1.5 shrink-0 md:w-2/12 pt-2 md:pt-0 border-t md:border-t-0 border-borderSubtle">
        {isExcluded ? (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onToggleExclude(track.id)}
            leftIcon={<Plus className="w-3.5 h-3.5 text-brandGreen" />}
          >
            Include
          </Button>
        ) : (
          <>
            <button
              onClick={() => onOpenManualMatch(track)}
              title="Change YouTube video match"
              className="p-1.5 text-textMuted hover:text-white hover:bg-surfaceActive rounded-lg transition-colors flex items-center gap-1 text-xs"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Match</span>
            </button>

            {isUnmatched && (
              <button
                onClick={() => onRetrySearch(track)}
                title="Retry search"
                className="p-1.5 text-textMuted hover:text-brandGreen hover:bg-surfaceActive rounded-lg transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={() => onToggleExclude(track.id)}
              title="Exclude this track"
              className="p-1.5 text-textMuted hover:text-brandRed hover:bg-surfaceActive rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

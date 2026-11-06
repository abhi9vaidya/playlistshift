"use client";

import React, { useState, useEffect } from "react";
import { PlaylistData, Track, YouTubeVideoMatch, PrivacyStatus, YouTubePlaylistCreationResult, UserSessionData } from "@/types";
import { TrackRow } from "./TrackRow";
import { ManualMatchModal } from "./ManualMatchModal";
import { PlaylistSuccessModal } from "./PlaylistSuccessModal";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import {
  Sparkles,
  Lock,
  Globe,
  EyeOff,
  Youtube,
  AlertCircle,
  Play,
  RotateCcw,
  CheckCircle2,
  FileCheck,
  Filter,
  Shield,
  Loader2,
} from "lucide-react";

interface ConversionWorkspaceProps {
  initialPlaylist: PlaylistData;
  onReset: () => void;
}

export const ConversionWorkspace: React.FC<ConversionWorkspaceProps> = ({
  initialPlaylist,
  onReset,
}) => {
  const [playlist, setPlaylist] = useState<PlaylistData>(initialPlaylist);
  const [playlistTitle, setPlaylistTitle] = useState(initialPlaylist.title);
  const [privacyStatus, setPrivacyStatus] = useState<PrivacyStatus>("private");
  const [filter, setFilter] = useState<"all" | "matched" | "review" | "unmatched">("all");

  const [isMatchingBatch, setIsMatchingBatch] = useState(false);
  const [matchProgressPercent, setMatchProgressPercent] = useState(0);

  const [selectedTrackForManual, setSelectedTrackForManual] = useState<Track | null>(null);

  const [session, setSession] = useState<UserSessionData>({ isAuthenticated: false });
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);
  const [creationError, setCreationError] = useState<string | null>(null);
  const [creationResult, setCreationResult] = useState<YouTubePlaylistCreationResult | null>(null);
  const [successModalOpen, setSuccessModalOpen] = useState(false);

  // Check auth session on mount
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => setSession(data))
      .catch(() => {});
  }, []);

  // Compute live statistics
  const totalTracks = playlist.tracks.length;
  const activeTracks = playlist.tracks.filter((t) => t.status !== "excluded");
  const matchedTracks = activeTracks.filter(
    (t) => t.matchedVideo && t.matchedVideo.confidenceTier !== "review"
  );
  const reviewTracks = activeTracks.filter(
    (t) => t.matchedVideo && t.matchedVideo.confidenceTier === "review"
  );
  const unmatchedTracks = activeTracks.filter(
    (t) => !t.matchedVideo && t.status !== "pending" && t.status !== "searching"
  );
  const pendingTracks = activeTracks.filter(
    (t) => t.status === "pending" || t.status === "searching"
  );

  // Trigger batch matching for all pending tracks
  const handleStartMatching = async () => {
    setIsMatchingBatch(true);
    setCreationError(null);

    const pending = playlist.tracks.filter(
      (t) => t.status === "pending" || t.status === "unmatched"
    );

    // Batch size of 10 tracks per network call
    const batchSize = 10;
    let completedCount = 0;

    for (let i = 0; i < pending.length; i += batchSize) {
      const chunk = pending.slice(i, i + batchSize);

      // Mark as searching in state
      setPlaylist((prev) => ({
        ...prev,
        tracks: prev.tracks.map((t) =>
          chunk.some((c) => c.id === t.id) ? { ...t, status: "searching" } : t
        ),
      }));

      try {
        const res = await fetch("/api/youtube/batch-search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tracks: chunk.map((c) => ({
              id: c.id,
              title: c.title,
              artist: c.artist,
              durationMs: c.durationMs,
            })),
          }),
        });

        const data = await res.json();

        if (res.status === 429) {
          setCreationError(
            "YouTube API quota limit reached. Please connect your Google account or try again tomorrow."
          );
          break;
        }

        if (data.results) {
          setPlaylist((prev) => ({
            ...prev,
            tracks: prev.tracks.map((t) => {
              const matchData = data.results[t.id];
              if (!matchData) return t;

              if (matchData.bestMatch) {
                const tier = matchData.bestMatch.confidenceTier;
                return {
                  ...t,
                  matchedVideo: matchData.bestMatch,
                  alternativeMatches: matchData.alternatives,
                  status: tier === "review" ? "review" : "matched",
                };
              } else {
                return {
                  ...t,
                  status: "unmatched",
                  alternativeMatches: matchData.alternatives || [],
                };
              }
            }),
          }));
        }
      } catch (err) {
        console.error("Batch search chunk error:", err);
      }

      completedCount += chunk.length;
      setMatchProgressPercent(Math.round((completedCount / pending.length) * 100));
    }

    setIsMatchingBatch(false);
  };

  // Start matching automatically when workspace opens if all tracks are pending
  useEffect(() => {
    if (playlist.tracks.length > 0 && playlist.tracks.every((t) => t.status === "pending")) {
      handleStartMatching();
    }
  }, []);

  const handleSelectManualMatch = (trackId: string, match: YouTubeVideoMatch) => {
    setPlaylist((prev) => ({
      ...prev,
      tracks: prev.tracks.map((t) =>
        t.id === trackId
          ? {
              ...t,
              matchedVideo: match,
              status: "matched",
            }
          : t
      ),
    }));
  };

  const handleToggleExclude = (trackId: string) => {
    setPlaylist((prev) => ({
      ...prev,
      tracks: prev.tracks.map((t) =>
        t.id === trackId
          ? {
              ...t,
              status: t.status === "excluded" ? (t.matchedVideo ? "matched" : "pending") : "excluded",
            }
          : t
      ),
    }));
  };

  const handleRetrySearch = async (track: Track) => {
    setPlaylist((prev) => ({
      ...prev,
      tracks: prev.tracks.map((t) => (t.id === track.id ? { ...t, status: "searching" } : t)),
    }));

    try {
      const res = await fetch("/api/youtube/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: track.title,
          artist: track.artist,
          durationMs: track.durationMs,
        }),
      });

      const data = await res.json();
      if (data.bestMatch) {
        setPlaylist((prev) => ({
          ...prev,
          tracks: prev.tracks.map((t) =>
            t.id === track.id
              ? {
                  ...t,
                  matchedVideo: data.bestMatch,
                  alternativeMatches: data.alternatives,
                  status: data.bestMatch.confidenceTier === "review" ? "review" : "matched",
                }
              : t
          ),
        }));
      } else {
        setPlaylist((prev) => ({
          ...prev,
          tracks: prev.tracks.map((t) =>
            t.id === track.id ? { ...t, status: "unmatched" } : t
          ),
        }));
      }
    } catch {
      setPlaylist((prev) => ({
        ...prev,
        tracks: prev.tracks.map((t) =>
          t.id === track.id ? { ...t, status: "unmatched" } : t
        ),
      }));
    }
  };

  const handleMoveTrack = (trackId: string, direction: "up" | "down") => {
    setPlaylist((prev) => {
      const idx = prev.tracks.findIndex((t) => t.id === trackId);
      if (idx === -1) return prev;
      const targetIdx = direction === "up" ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= prev.tracks.length) return prev;

      const newTracks = [...prev.tracks];
      const temp = newTracks[idx];
      newTracks[idx] = newTracks[targetIdx];
      newTracks[targetIdx] = temp;
      return { ...prev, tracks: newTracks };
    });
  };

  const handleCreateYouTubePlaylist = async () => {
    if (!session.isAuthenticated) {
      // Redirect to Google OAuth
      window.location.href = "/api/auth/google";
      return;
    }

    const matchesToExport = playlist.tracks
      .filter((t) => t.status !== "excluded" && t.matchedVideo)
      .map((t) => ({
        trackId: t.id,
        videoId: t.matchedVideo!.videoId,
        title: t.title,
        artist: t.artist,
      }));

    if (matchesToExport.length === 0) {
      setCreationError("Please match at least one track before creating your YouTube playlist.");
      return;
    }

    setIsCreatingPlaylist(true);
    setCreationError(null);

    try {
      const res = await fetch("/api/youtube/create-playlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: playlistTitle.trim() || "Converted Playlist",
          description: `Transferred with PlaylistShift (https://playlistshift.com) • ${matchesToExport.length} tracks`,
          privacyStatus,
          trackMatches: matchesToExport,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.code === "AUTH_REQUIRED") {
          window.location.href = "/api/auth/google";
          return;
        }
        setCreationError(data.error || "Failed to create playlist on YouTube.");
        return;
      }

      setCreationResult(data.result);
      setSuccessModalOpen(true);
    } catch {
      setCreationError("Network error while creating YouTube playlist.");
    } finally {
      setIsCreatingPlaylist(false);
    }
  };

  const filteredTracks = playlist.tracks.filter((t) => {
    if (filter === "matched") return t.matchedVideo && t.matchedVideo.confidenceTier !== "review";
    if (filter === "review") return t.matchedVideo && t.matchedVideo.confidenceTier === "review";
    if (filter === "unmatched") return !t.matchedVideo && t.status !== "excluded";
    return true;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Header Card */}
      <div className="p-6 md:p-8 rounded-2xl bg-surface border border-border shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-surfaceHover border border-border overflow-hidden shrink-0 flex items-center justify-center">
              {playlist.coverUrl ? (
                <img
                  src={playlist.coverUrl}
                  alt={playlist.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Youtube className="w-8 h-8 text-brandRed" />
              )}
            </div>

            <div className="space-y-1">
              <span className="text-xs uppercase tracking-wider text-brandGreen font-semibold">
                Conversion Workspace
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={playlistTitle}
                  onChange={(e) => setPlaylistTitle(e.target.value)}
                  className="text-xl md:text-2xl font-bold text-white bg-transparent border-b border-transparent hover:border-border focus:border-brandGreen focus:outline-none transition-colors"
                />
              </div>
              <p className="text-xs text-textMuted">
                Source: {playlist.source.replace("_", " ").toUpperCase()} • {totalTracks} tracks total
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              Start Over
            </Button>

            {pendingTracks.length > 0 && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleStartMatching}
                isLoading={isMatchingBatch}
                leftIcon={<Play className="w-3.5 h-3.5" />}
              >
                {isMatchingBatch ? `Matching (${matchProgressPercent}%)` : "Match Songs"}
              </Button>
            )}
          </div>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-surfaceHover/50 border border-border/80">
            <span className="text-xs text-textMuted font-medium">Total Songs</span>
            <p className="text-2xl font-bold text-white mt-1">{totalTracks}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-brandGreen/5 border border-brandGreen/20">
            <span className="text-xs text-brandGreen font-medium">High Match</span>
            <p className="text-2xl font-bold text-brandGreen mt-1">{matchedTracks.length}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20">
            <span className="text-xs text-amber-400 font-medium">Needs Review</span>
            <p className="text-2xl font-bold text-amber-400 mt-1">{reviewTracks.length}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-brandRed/5 border border-brandRed/20">
            <span className="text-xs text-brandRed font-medium">Unmatched</span>
            <p className="text-2xl font-bold text-brandRed mt-1">{unmatchedTracks.length}</p>
          </div>
        </div>

        {/* Batch Progress Bar */}
        {isMatchingBatch && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-textMuted">
              <span>Matching songs on YouTube...</span>
              <span>{matchProgressPercent}%</span>
            </div>
            <div className="w-full h-2 bg-surfaceHover rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brandGreen to-brandPurple transition-all duration-300"
                style={{ width: `${matchProgressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Error notification */}
      {creationError && (
        <div className="p-4 rounded-xl bg-brandRed/10 border border-brandRed/30 text-sm text-brandRed flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="font-medium">{creationError}</p>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filter === "all"
                ? "bg-surfaceHover text-white border border-border"
                : "text-textMuted hover:text-white"
            }`}
          >
            All Tracks ({totalTracks})
          </button>
          <button
            onClick={() => setFilter("matched")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filter === "matched"
                ? "bg-brandGreen/10 text-brandGreen border border-brandGreen/30"
                : "text-textMuted hover:text-white"
            }`}
          >
            Matched ({matchedTracks.length})
          </button>
          <button
            onClick={() => setFilter("review")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filter === "review"
                ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                : "text-textMuted hover:text-white"
            }`}
          >
            Needs Review ({reviewTracks.length})
          </button>
          <button
            onClick={() => setFilter("unmatched")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filter === "unmatched"
                ? "bg-brandRed/10 text-brandRed border border-brandRed/30"
                : "text-textMuted hover:text-white"
            }`}
          >
            Unmatched ({unmatchedTracks.length})
          </button>
        </div>

        <span className="text-xs text-textSubtle hidden sm:inline">
          Preserving original playlist order
        </span>
      </div>

      {/* Track List */}
      <div className="space-y-2.5">
        {filteredTracks.map((track, idx) => {
          const originalIdx = playlist.tracks.findIndex((t) => t.id === track.id);
          return (
            <TrackRow
              key={track.id}
              track={track}
              index={idx}
              onOpenManualMatch={setSelectedTrackForManual}
              onToggleExclude={handleToggleExclude}
              onRetrySearch={handleRetrySearch}
              onMoveUp={() => handleMoveTrack(track.id, "up")}
              onMoveDown={() => handleMoveTrack(track.id, "down")}
              canMoveUp={originalIdx > 0}
              canMoveDown={originalIdx < playlist.tracks.length - 1}
            />
          );
        })}
      </div>

      {/* YouTube Export Section (Section 4 & Section 9) */}
      <div className="p-6 md:p-8 rounded-2xl bg-surface border border-border shadow-2xl space-y-6">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Youtube className="w-5 h-5 text-brandRed" />
            Export to YouTube
          </h3>
          <p className="text-xs text-textMuted mt-1">
            Configure playlist privacy and export matched songs directly to your personal YouTube account.
          </p>
        </div>

        {/* Privacy Selector */}
        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-textMuted">
            Playlist Privacy (Private by Default)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setPrivacyStatus("private")}
              className={`p-4 rounded-xl border text-left transition-all ${
                privacyStatus === "private"
                  ? "bg-brandGreen/5 border-brandGreen shadow-[0_0_20px_rgba(0,229,153,0.15)]"
                  : "bg-surfaceHover/50 border-border hover:border-textSubtle"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Lock className={`w-4 h-4 ${privacyStatus === "private" ? "text-brandGreen" : "text-textMuted"}`} />
                <span className="text-sm font-semibold text-white">Private (Default)</span>
              </div>
              <p className="text-xs text-textMuted">
                Only you can view this playlist. Ideal for personal libraries.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setPrivacyStatus("unlisted")}
              className={`p-4 rounded-xl border text-left transition-all ${
                privacyStatus === "unlisted"
                  ? "bg-brandGreen/5 border-brandGreen shadow-[0_0_20px_rgba(0,229,153,0.15)]"
                  : "bg-surfaceHover/50 border-border hover:border-textSubtle"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <EyeOff className={`w-4 h-4 ${privacyStatus === "unlisted" ? "text-brandGreen" : "text-textMuted"}`} />
                <span className="text-sm font-semibold text-white">Unlisted</span>
              </div>
              <p className="text-xs text-textMuted">
                Anyone with the link can view. Does not appear in search results.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setPrivacyStatus("public")}
              className={`p-4 rounded-xl border text-left transition-all ${
                privacyStatus === "public"
                  ? "bg-brandGreen/5 border-brandGreen shadow-[0_0_20px_rgba(0,229,153,0.15)]"
                  : "bg-surfaceHover/50 border-border hover:border-textSubtle"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Globe className={`w-4 h-4 ${privacyStatus === "public" ? "text-brandGreen" : "text-textMuted"}`} />
                <span className="text-sm font-semibold text-white">Public</span>
              </div>
              <p className="text-xs text-textMuted">
                Anyone can search for and view this playlist on YouTube.
              </p>
            </button>
          </div>
        </div>

        {/* Action button */}
        <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-textMuted">
            <Shield className="w-4 h-4 text-brandGreen" />
            <span>Secure official Google OAuth • Your Google password is never seen or stored</span>
          </div>

          <Button
            variant="primary"
            size="lg"
            onClick={handleCreateYouTubePlaylist}
            isLoading={isCreatingPlaylist}
            disabled={matchedTracks.length === 0 && reviewTracks.length === 0}
            leftIcon={<Youtube className="w-5 h-5 text-black" />}
          >
            {isCreatingPlaylist
              ? "Creating YouTube Playlist..."
              : session.isAuthenticated
              ? `Create YouTube Playlist (${matchedTracks.length + reviewTracks.length} songs)`
              : "Connect Google & Create Playlist"}
          </Button>
        </div>
      </div>

      {/* Manual Match Modal */}
      <ManualMatchModal
        isOpen={Boolean(selectedTrackForManual)}
        onClose={() => setSelectedTrackForManual(null)}
        track={selectedTrackForManual}
        onSelectMatch={handleSelectManualMatch}
      />

      {/* Success Modal */}
      <PlaylistSuccessModal
        isOpen={successModalOpen}
        onClose={() => setSuccessModalOpen(false)}
        result={creationResult}
        onReset={onReset}
      />
    </div>
  );
};


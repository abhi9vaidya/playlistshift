"use client";

import React, { useState } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { YouTubePlaylistCreationResult } from "@/types";
import { CheckCircle2, ExternalLink, Copy, Check, Sparkles, RefreshCw } from "lucide-react";

interface PlaylistSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: YouTubePlaylistCreationResult | null;
  onReset: () => void;
}

export const PlaylistSuccessModal: React.FC<PlaylistSuccessModalProps> = ({
  isOpen,
  onClose,
  result,
  onReset,
}) => {
  const [copied, setCopied] = useState(false);

  if (!result) return null;

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(result.playlistUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Ignore
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Your Playlist is Ready!"
      description="Successfully transferred and created on YouTube"
      maxWidth="md"
    >
      <div className="space-y-6 text-center">
        {/* Success Icon */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brandGreen/20 to-emerald-500/10 border border-brandGreen/40 flex items-center justify-center mx-auto text-brandGreen shadow-[0_0_40px_rgba(0,229,153,0.2)]">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div>
          <h4 className="text-xl font-bold text-white mb-1">{result.title}</h4>
          <p className="text-xs text-textMuted uppercase tracking-wider font-semibold">
            Privacy: <span className="text-brandGreen">{result.privacyStatus}</span>
          </p>
        </div>

        {/* Stats card */}
        <div className="grid grid-cols-2 gap-3 p-4 bg-surface rounded-xl border border-border">
          <div className="p-3 bg-surfaceHover/50 rounded-lg">
            <span className="text-2xl font-bold text-brandGreen">{result.totalInserted}</span>
            <p className="text-xs text-textMuted mt-1">Songs Added</p>
          </div>
          <div className="p-3 bg-surfaceHover/50 rounded-lg">
            <span className="text-2xl font-bold text-white">{result.totalSkipped}</span>
            <p className="text-xs text-textMuted mt-1">Skipped / Unavailable</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <a
            href={result.playlistUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1"
          >
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              rightIcon={<ExternalLink className="w-4 h-4" />}
            >
              Open on YouTube
            </Button>
          </a>

          <Button
            variant="secondary"
            size="lg"
            onClick={handleCopyUrl}
            className="sm:w-auto shrink-0"
            leftIcon={copied ? <Check className="w-4 h-4 text-brandGreen" /> : <Copy className="w-4 h-4" />}
          >
            {copied ? "Link Copied!" : "Copy Link"}
          </Button>
        </div>

        <div className="pt-4 border-t border-border flex justify-center">
          <button
            type="button"
            onClick={() => {
              onClose();
              onReset();
            }}
            className="text-xs text-textMuted hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Convert Another Playlist
          </button>
        </div>
      </div>
    </Modal>
  );
};

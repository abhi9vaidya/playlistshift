"use client";

import React, { useState, useRef } from "react";
import { Button } from "../ui/Button";
import {
  FileSpreadsheet,
  Upload,
  Download,
  AlertCircle,
  ArrowRight,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { PlaylistData } from "@/types";

interface CsvTextTabProps {
  onPlaylistLoaded: (playlist: PlaylistData) => void;
}

const SAMPLE_CSV_CONTENT = `Title,Artist,Album
Bohemian Rhapsody,Queen,A Night at the Opera
Hotel California,Eagles,Hotel California
Yellow,Coldplay,Parachutes
Blinding Lights,The Weeknd,After Hours
Stay With Me,Sam Smith,In the Lonely Hour`;

export const CsvTextTab: React.FC<CsvTextTabProps> = ({ onPlaylistLoaded }) => {
  const [activeSubTab, setActiveSubTab] = useState<"text" | "csv">("text");
  const [textInput, setTextInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadSampleCsv = () => {
    const blob = new Blob([SAMPLE_CSV_CONTENT], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "playlistshift_sample.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleParseText = async () => {
    if (!textInput.trim()) {
      setError("Please paste at least one song line (e.g. Song Title - Artist).");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/parse/text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textInput.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to parse text tracks.");
        return;
      }

      onPlaylistLoaded({
        title: "Imported Playlist",
        description: `Imported via PlaylistShift Text Importer (${data.tracks.length} tracks)`,
        source: "text",
        tracks: data.tracks,
      });
    } catch {
      setError("Network error while processing tracks.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleParseCsvFile = async () => {
    if (!selectedFile) {
      setError("Please select or drop a CSV file first.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await fetch("/api/parse/csv", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to parse CSV file.");
        return;
      }

      onPlaylistLoaded({
        title: selectedFile.name.replace(/\.[^/.]+$/, ""),
        description: `Imported from CSV file ${selectedFile.name} (${data.tracks.length} tracks)`,
        source: "csv",
        tracks: data.tracks,
      });
    } catch {
      setError("Network error while uploading CSV file.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith(".csv") || file.name.endsWith(".txt") || file.name.endsWith(".tsv")) {
        setSelectedFile(file);
        setError(null);
      } else {
        setError("Please drop a valid .csv, .tsv, or .txt file.");
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <button
          type="button"
          onClick={() => {
            setActiveSubTab("text");
            setError(null);
          }}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeSubTab === "text"
              ? "bg-surfaceHover text-white border border-border"
              : "text-textMuted hover:text-white"
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-brandGreen" />
          Paste Text Tracklist
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveSubTab("csv");
            setError(null);
          }}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeSubTab === "csv"
              ? "bg-surfaceHover text-white border border-border"
              : "text-textMuted hover:text-white"
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-brandPurple" />
          Upload CSV Spreadsheet
        </button>

        <div className="ml-auto">
          <button
            type="button"
            onClick={handleDownloadSampleCsv}
            className="flex items-center gap-1.5 text-xs text-textMuted hover:text-brandGreen transition-colors"
            title="Download sample CSV template"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sample CSV</span>
          </button>
        </div>
      </div>

      {activeSubTab === "text" ? (
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-textMuted">
                Paste Song List (one per line)
              </label>
              <button
                type="button"
                onClick={() =>
                  setTextInput(
                    `Bohemian Rhapsody - Queen\nHotel California - Eagles\nYellow - Coldplay\nBlinding Lights - The Weeknd\nStay With Me - Sam Smith`
                  )
                }
                className="text-xs text-brandGreen hover:underline"
              >
                Insert Example
              </button>
            </div>
            <textarea
              rows={6}
              value={textInput}
              onChange={(e) => {
                setTextInput(e.target.value);
                if (error) setError(null);
              }}
              placeholder={`Bohemian Rhapsody - Queen\nHotel California - Eagles\nYellow - Coldplay\nShape of You - Ed Sheeran`}
              className="w-full bg-[#11131A] text-white placeholder-textSubtle rounded-xl border border-border p-4 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brandGreen/40 focus:border-brandGreen/80 transition-all resize-y"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
            <p className="text-xs text-textSubtle">
              Supported formats: <code className="text-textMuted">Song - Artist</code>, <code className="text-textMuted">1. Song - Artist</code>, <code className="text-textMuted">Song by Artist</code>
            </p>
            <Button
              type="button"
              variant="primary"
              onClick={handleParseText}
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Parse Tracks
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <input
            type="file"
            ref={fileInputRef}
            accept=".csv,.tsv,.txt"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setSelectedFile(e.target.files[0]);
                setError(null);
              }
            }}
            className="hidden"
          />

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${
              isDragging
                ? "border-brandGreen bg-brandGreen/5"
                : selectedFile
                ? "border-brandPurple/60 bg-brandPurple/5"
                : "border-border hover:border-textSubtle bg-surface/40 hover:bg-surface/80"
            }`}
          >
            {selectedFile ? (
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="w-12 h-12 rounded-xl bg-brandGreen/10 text-brandGreen flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-white">{selectedFile.name}</p>
                <p className="text-xs text-textMuted">
                  {(selectedFile.size / 1024).toFixed(1)} KB • Click or drop another to replace
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-12 h-12 rounded-xl bg-surfaceHover border border-border flex items-center justify-center text-textMuted">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    Click to upload or drag & drop CSV
                  </p>
                  <p className="text-xs text-textSubtle mt-1">
                    Accepts standard CSV with &quot;Title&quot; and &quot;Artist&quot; columns
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="button"
              variant="primary"
              disabled={!selectedFile}
              onClick={handleParseCsvFile}
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Parse CSV Tracks
            </Button>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-brandRed/10 border border-brandRed/30 text-sm text-brandRed flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="font-medium">{error}</p>
        </div>
      )}
    </div>
  );
};


import React from "react";
import { constructMetadata } from "@/lib/seo/metadata";
import { ConversionTool } from "@/components/converter/ConversionTool";
import { FileSpreadsheet, Download } from "lucide-react";

export const metadata = constructMetadata({
  title: "CSV to YouTube Playlist Converter - Free Spreadsheet Importer",
  description:
    "Upload a CSV or text list of songs and turn them into a YouTube playlist. Works 100% independently of Spotify API. Free, fast, and secure.",
  path: "/csv-to-youtube-playlist",
  keywords: [
    "CSV to YouTube Playlist",
    "Spreadsheet to YouTube Playlist",
    "Excel to YouTube Playlist",
    "Text to YouTube Playlist",
    "Exportify to YouTube",
  ],
});

export default function CsvToYouTubePlaylistPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="text-xs uppercase tracking-wider text-brandGreen font-semibold">
          Spreadsheet & Text Importer
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
          Convert CSV Spreadsheets to YouTube Playlists
        </h1>
        <p className="text-base sm:text-lg text-textMuted leading-relaxed">
          The universal converter that works without any Spotify account or API dependency. Drop your CSV file or paste tracklists below to build a YouTube playlist instantly.
        </p>
      </div>

      <ConversionTool />

      <article className="prose prose-invert max-w-none space-y-6 bg-surface p-8 sm:p-12 rounded-3xl border border-border text-sm text-textMuted leading-relaxed">
        <h2 className="text-2xl font-bold text-white">How to Convert Spreadsheets to YouTube</h2>
        <p>
          Export tools like Exportify allow you to backup your Spotify playlists into standard CSV spreadsheet files. PlaylistShift allows you to upload these CSV files directly and convert every song into an official YouTube playlist.
        </p>
        <h3 className="text-lg font-bold text-white">Supported CSV Formats</h3>
        <p>
          Your CSV file should have a header row with column titles such as:
        </p>
        <div className="p-4 rounded-xl bg-[#090A0F] font-mono text-xs text-brandGreen">
          Track Name,Artist Name,Album<br />
          Bohemian Rhapsody,Queen,A Night at the Opera<br />
          Hotel California,Eagles,Hotel California
        </div>
        <p>
          We automatically detect alternative column header names like &quot;Title&quot;, &quot;Song&quot;, &quot;Performer&quot;, or &quot;Artist(s)&quot;. If your file lacks headers, our engine intelligently parses the first two columns as Title and Artist.
        </p>
      </article>
    </div>
  );
}

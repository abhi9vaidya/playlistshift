"use client";

import React from "react";
import { Button } from "../ui/Button";
import { Download, FileSpreadsheet, FileText, CheckCircle2 } from "lucide-react";

export const SupportedImports: React.FC = () => {
  const handleDownloadSample = () => {
    const csv = `Title,Artist,Album\nBohemian Rhapsody,Queen,A Night at the Opera\nHotel California,Eagles,Hotel California\nYellow,Coldplay,Parachutes\nBlinding Lights,The Weeknd,After Hours`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "playlistshift_sample.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <section className="py-20 border-t border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-3 max-w-2xl">
            <span className="text-xs uppercase tracking-wider text-brandGreen font-semibold">
              Supported Formats
            </span>
            <h2 className="text-3xl font-bold text-white tracking-tight">
              Universal Import Flexibility
            </h2>
            <p className="text-sm text-textMuted">
              Whether you have a live Spotify URL, an exported spreadsheet, or a simple text list, PlaylistShift parses and matches your songs effortlessly.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadSample}
            leftIcon={<Download className="w-4 h-4 text-brandGreen" />}
          >
            Download Sample CSV
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Format 1: CSV */}
          <div className="p-6 rounded-2xl bg-surface border border-border space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brandGreen/10 border border-brandGreen/20 flex items-center justify-center text-brandGreen">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">CSV & TSV Spreadsheets</h3>
                <p className="text-xs text-textMuted">Compatible with Excel, Google Sheets, & export tools</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#090A0F] border border-borderSubtle font-mono text-xs text-textMuted overflow-x-auto">
              <p className="text-brandGreen font-semibold">Title,Artist,Album</p>
              <p>Bohemian Rhapsody,Queen,A Night at the Opera</p>
              <p>Hotel California,Eagles,Hotel California</p>
              <p>Yellow,Coldplay,Parachutes</p>
            </div>

            <ul className="text-xs text-textMuted space-y-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-brandGreen shrink-0" />
                Automatic column header detection (Title, Song, Track, Artist, Performer)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-brandGreen shrink-0" />
                Handles quotes, commas, semicolons, and UTF-8 characters
              </li>
            </ul>
          </div>

          {/* Format 2: Plain Text */}
          <div className="p-6 rounded-2xl bg-surface border border-border space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brandPurple/10 border border-brandPurple/20 flex items-center justify-center text-brandPurple">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Freeform Plain Text</h3>
                <p className="text-xs text-textMuted">Paste tracklists directly from notes or messages</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#090A0F] border border-borderSubtle font-mono text-xs text-textMuted overflow-x-auto">
              <p>1. Bohemian Rhapsody - Queen</p>
              <p>02. Hotel California - Eagles</p>
              <p>Yellow by Coldplay</p>
              <p>Blinding Lights | The Weeknd</p>
            </div>

            <ul className="text-xs text-textMuted space-y-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-brandPurple shrink-0" />
                Automatically strips leading numbers and bullet points
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-brandPurple shrink-0" />
                Supports delimiters including hyphens (-), slashes (/), pipes (|), and &quot;by&quot;
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

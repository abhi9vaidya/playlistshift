import { NextRequest, NextResponse } from "next/server";
import { parseTracksFromCsv } from "@/lib/parsing/csv";
import { siteConfig } from "@/config/site";

const MAX_CSV_SIZE_BYTES = 2 * 1024 * 1024; // 2MB safety limit

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";

    let csvContent = "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
      }

      if (file.size > MAX_CSV_SIZE_BYTES) {
        return NextResponse.json(
          { error: "Uploaded file exceeds maximum size limit of 2MB." },
          { status: 413 }
        );
      }

      csvContent = await file.text();
    } else {
      const body = await request.json();
      csvContent = body.content || "";
    }

    if (csvContent.length > MAX_CSV_SIZE_BYTES) {
      return NextResponse.json(
        { error: "CSV content exceeds maximum allowed size (2MB)." },
        { status: 413 }
      );
    }

    if (!csvContent.trim()) {
      return NextResponse.json({ error: "CSV content is empty." }, { status: 400 });
    }

    const result = parseTracksFromCsv(csvContent);

    if (result.tracks.length === 0) {
      return NextResponse.json(
        {
          error:
            "No valid tracks could be found in the CSV. Please ensure your file includes track title and artist columns.",
        },
        { status: 400 }
      );
    }

    const maxAllowed = siteConfig.conversionLimits.maxTracksPerPlaylist;
    let finalTracks = result.tracks;
    if (finalTracks.length > maxAllowed) {
      result.errors.push(`Tracklist capped at maximum ${maxAllowed} tracks to respect YouTube API daily quotas.`);
      finalTracks = finalTracks.slice(0, maxAllowed);
    }

    return NextResponse.json({
      success: true,
      tracks: finalTracks,
      duplicateCount: result.duplicateCount,
      totalParsed: result.totalParsed,
      warnings: result.errors,
    });
  } catch (err: unknown) {
    console.error("CSV parse error:", err);
    return NextResponse.json(
      { error: "Failed to parse CSV file. Please verify file formatting." },
      { status: 500 }
    );
  }
}

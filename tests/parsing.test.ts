import { describe, it, expect } from "vitest";
import { parseSpotifyUrl, isValidSpotifyPlaylistUrl, isValidSpotifyTrackUrl } from "@/lib/parsing/spotify-url";
import { parseTracksFromCsv } from "@/lib/parsing/csv";
import { parseTracksFromText } from "@/lib/parsing/text";

describe("Spotify URL Parsing & Validation", () => {
  it("parses standard Spotify playlist web URLs", () => {
    const url = "https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M?si=abcd1234efgh";
    const res = parseSpotifyUrl(url);
    expect(res).not.toBeNull();
    expect(res?.type).toBe("playlist");
    expect(res?.id).toBe("37i9dQZF1DXcBWIGoYBM5M");
    expect(isValidSpotifyPlaylistUrl(url)).toBe(true);
    expect(isValidSpotifyTrackUrl(url)).toBe(false);
  });

  it("parses internationalized Spotify playlist URLs", () => {
    const url = "https://open.spotify.com/intl-es/playlist/37i9dQZF1DXcBWIGoYBM5M";
    const res = parseSpotifyUrl(url);
    expect(res).not.toBeNull();
    expect(res?.type).toBe("playlist");
    expect(res?.id).toBe("37i9dQZF1DXcBWIGoYBM5M");
  });

  it("parses Spotify URIs", () => {
    const uri = "spotify:playlist:37i9dQZF1DXcBWIGoYBM5M";
    const res = parseSpotifyUrl(uri);
    expect(res).not.toBeNull();
    expect(res?.type).toBe("playlist");
    expect(res?.id).toBe("37i9dQZF1DXcBWIGoYBM5M");
  });

  it("parses single Spotify track URLs", () => {
    const url = "https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT";
    const res = parseSpotifyUrl(url);
    expect(res).not.toBeNull();
    expect(res?.type).toBe("track");
    expect(res?.id).toBe("4cOdK2wGLETKBW3PvgPWqT");
    expect(isValidSpotifyTrackUrl(url)).toBe(true);
    expect(isValidSpotifyPlaylistUrl(url)).toBe(false);
  });

  it("returns null for non-Spotify or invalid URLs", () => {
    expect(parseSpotifyUrl("https://youtube.com/watch?v=123")).toBeNull();
    expect(parseSpotifyUrl("not a url")).toBeNull();
    expect(parseSpotifyUrl("")).toBeNull();
  });
});

describe("CSV Parsing & Duplicate Detection", () => {
  it("parses CSV with standard headers (Title, Artist, Album)", () => {
    const csv = `Title,Artist,Album
Bohemian Rhapsody,Queen,A Night at the Opera
Hotel California,Eagles,Hotel California
Yellow,Coldplay,Parachutes`;

    const res = parseTracksFromCsv(csv);
    expect(res.tracks.length).toBe(3);
    expect(res.tracks[0].title).toBe("Bohemian Rhapsody");
    expect(res.tracks[0].artist).toBe("Queen");
    expect(res.tracks[0].album).toBe("A Night at the Opera");
    expect(res.duplicateCount).toBe(0);
  });

  it("supports semicolon and tab delimiters", () => {
    const semicolonCsv = `Title;Artist\nBohemian Rhapsody;Queen\nHotel California;Eagles`;
    const res1 = parseTracksFromCsv(semicolonCsv);
    expect(res1.tracks.length).toBe(2);
    expect(res1.tracks[0].title).toBe("Bohemian Rhapsody");
    expect(res1.tracks[0].artist).toBe("Queen");

    const tabCsv = "Title\tArtist\nYellow\tColdplay\nFix You\tColdplay";
    const res2 = parseTracksFromCsv(tabCsv);
    expect(res2.tracks.length).toBe(2);
    expect(res2.tracks[0].title).toBe("Yellow");
  });

  it("deduplicates identical tracks in CSV", () => {
    const csv = `Track Name,Artist
Yellow,Coldplay
Yellow,Coldplay
Yellow,Coldplay
Fix You,Coldplay`;

    const res = parseTracksFromCsv(csv);
    expect(res.tracks.length).toBe(2);
    expect(res.duplicateCount).toBe(2);
  });

  it("handles headerless CSV fallback", () => {
    const csv = `Bohemian Rhapsody,Queen
Hotel California,Eagles`;

    const res = parseTracksFromCsv(csv);
    expect(res.tracks.length).toBe(2);
    expect(res.tracks[0].title).toBe("Bohemian Rhapsody");
    expect(res.tracks[0].artist).toBe("Queen");
  });
});

describe("Text Importer Parsing & 20-Song Batch Verification", () => {
  it("parses a full batch of 20 songs with numbering and whitespace variation", () => {
    const raw20Songs = `1. Bohemian Rhapsody - Queen
2. Hotel California - Eagles
3. Yellow - Coldplay
4. Blinding Lights - The Weeknd
5. Stay With Me - Sam Smith
6. Shape of You - Ed Sheeran
7. Rolling in the Deep - Adele
8. Someone Like You - Adele
9. Viva La Vida - Coldplay
10. Don't Stop Believin' - Journey
11. Billi Jean - Michael Jackson
12. Sweet Child O' Mine - Guns N' Roses
13. Smells Like Teen Spirit - Nirvana
14. Wonderwall - Oasis
15. In The End - Linkin Park
16. Lose Yourself - Eminem
17. Take Me To Church - Hozier
18. Bad Guy - Billie Eilish
19. Uptown Funk - Mark Ronson ft. Bruno Mars
20. As It Was - Harry Styles`;

    const res = parseTracksFromText(raw20Songs);
    expect(res.tracks.length).toBe(20);
    expect(res.duplicateCount).toBe(0);
    expect(res.tracks[0].title).toBe("Bohemian Rhapsody");
    expect(res.tracks[0].artist).toBe("Queen");
    expect(res.tracks[19].title).toBe("As It Was");
    expect(res.tracks[19].artist).toBe("Harry Styles");
  });

  it("handles international characters and Unicode titles", () => {
    const unicodeText = `Djadja - Aya Nakamura
Échame La Culpa - Luis Fonsi
春よ、来い - 松任谷由実
Måneskin - Beggin'`;

    const res = parseTracksFromText(unicodeText);
    expect(res.tracks.length).toBe(4);
    expect(res.tracks[0].title).toBe("Djadja");
    expect(res.tracks[1].title).toBe("Échame La Culpa");
    expect(res.tracks[2].title).toBe("春よ、来い");
    expect(res.tracks[3].title).toBe("Måneskin");
  });

  it("strips numbered prefixes and bracket formats", () => {
    const text = `1. Bohemian Rhapsody - Queen\n02. Hotel California - Eagles\n[3] Yellow - Coldplay`;
    const res = parseTracksFromText(text);
    expect(res.tracks.length).toBe(3);
    expect(res.tracks[0].title).toBe("Bohemian Rhapsody");
    expect(res.tracks[1].title).toBe("Hotel California");
    expect(res.tracks[2].title).toBe("Yellow");
  });

  it("handles 'by' separator", () => {
    const text = `Yellow by Coldplay\nStay With Me by Sam Smith`;
    const res = parseTracksFromText(text);
    expect(res.tracks.length).toBe(2);
    expect(res.tracks[0].title).toBe("Yellow");
    expect(res.tracks[0].artist).toBe("Coldplay");
  });
});

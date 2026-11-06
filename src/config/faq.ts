export interface FaqItem {
  q: string;
  a: string;
}

export const FAQ_DATA: FaqItem[] = [
  {
    q: "Is PlaylistShift free?",
    a: "Yes, PlaylistShift is 100% free to use. There are no subscriptions, paywalls, or hidden charges for converting playlists.",
  },
  {
    q: "Can I convert a Spotify playlist to YouTube?",
    a: "Yes. Simply paste your public Spotify playlist URL into our converter, review the matched YouTube songs, authenticate with Google, and your playlist will be assembled in seconds.",
  },
  {
    q: "Can I convert an individual Spotify song?",
    a: "Yes. Use the 'Spotify Song' tab to paste an individual track link (e.g. https://open.spotify.com/track/...) to match the song on YouTube and create a new playlist.",
  },
  {
    q: "Can I make my YouTube playlist private?",
    a: "Yes. In fact, Private is the default setting on PlaylistShift! You can also select 'Unlisted' or 'Public' according to your preference before creating the playlist.",
  },
  {
    q: "Do I need a Spotify Premium account?",
    a: "No. PlaylistShift works with free Spotify accounts as well as public playlists without requiring any Spotify login from you.",
  },
  {
    q: "Do I need a Google account?",
    a: "Yes, creating a YouTube playlist requires an active Google/YouTube account so our application can add the songs directly into your personal YouTube library using Google's official API.",
  },
  {
    q: "Does PlaylistShift download music?",
    a: "No. PlaylistShift never downloads, converts, rips, or stores any audio or video files. It exclusively links and organizes official YouTube videos into playlists on your YouTube account.",
  },
  {
    q: "What happens when a song cannot be found?",
    a: "If a specific track cannot be matched automatically with high confidence, it is marked as 'Unmatched' in your workspace. You can use our manual search tool to pick an alternative video or exclude that track before exporting.",
  },
  {
    q: "Is there a playlist size limit?",
    a: "To prevent exceeding daily YouTube API quotas and avoid browser timeouts, we recommend converting up to 250 tracks at a time.",
  },
  {
    q: "Are my Spotify or Google passwords stored?",
    a: "Never. PlaylistShift uses official Google OAuth 2.0 where you log in directly on Google's secure website. We never see, ask for, or store your passwords.",
  },
  {
    q: "Can I use CSV files instead of Spotify?",
    a: "Yes! Our CSV and Text Importer functions 100% independently of Spotify. You can upload spreadsheets from tools like Exportify or simply paste a list of song titles and artists.",
  },
  {
    q: "Why are some songs matched incorrectly?",
    a: "Songs with common titles, live recordings, acoustic covers, or region-restricted videos can sometimes confuse search algorithms. PlaylistShift provides confidence scores (0-100) and lets you manually swap any match with one click.",
  },
];


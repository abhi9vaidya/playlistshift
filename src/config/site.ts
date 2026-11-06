export const siteConfig = {
  name: "PlaylistShift",
  tagline: "Your Music. Your Platform. One Click Away.",
  description:
    "Free online playlist converter to transfer your favourite songs and playlists from Spotify to YouTube & YouTube Music. Fast, accurate, and completely free.",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ogImage: "/images/og-image.png",
  links: {
    github: "https://github.com",
  },
  navigation: [
    { title: "Home", href: "/" },
    { title: "How It Works", href: "/how-to-convert-spotify-playlist-to-youtube" },
    { title: "Spotify to YouTube", href: "/spotify-to-youtube" },
    { title: "CSV to YouTube", href: "/csv-to-youtube-playlist" },
    { title: "FAQ", href: "/faq" },
    { title: "About", href: "/about" },
  ],
  footerLinks: {
    product: [
      { title: "Spotify to YouTube Converter", href: "/spotify-to-youtube" },
      { title: "Spotify Playlist to YouTube", href: "/spotify-playlist-to-youtube" },
      { title: "Spotify Song to YouTube", href: "/spotify-song-to-youtube" },
      { title: "CSV to YouTube Playlist", href: "/csv-to-youtube-playlist" },
      { title: "How It Works", href: "/how-to-convert-spotify-playlist-to-youtube" },
    ],
    company: [
      { title: "About PlaylistShift", href: "/about" },
      { title: "Contact Support", href: "/contact" },
      { title: "FAQ", href: "/faq" },
    ],
    legal: [
      { title: "Privacy Policy", href: "/privacy" },
      { title: "Terms of Service", href: "/terms" },
      { title: "Cookie Policy", href: "/privacy#cookies" },
    ],
  },
  features: [
    {
      title: "100% Free Playlist Transfer",
      description: "Convert playlists without paying for costly subscriptions. Zero hidden fees, zero paywalls.",
      icon: "Sparkles",
    },
    {
      title: "Intelligent Audio Matching",
      description: "Smart algorithmic matching targets official audio and music videos while filtering out karaoke, covers, and live bootlegs.",
      icon: "Music2",
    },
    {
      title: "Private Playlists by Default",
      description: "Your converted YouTube playlists are created as Private by default, ensuring your personal library stays under your control.",
      icon: "ShieldCheck",
    },
    {
      title: "Universal CSV & Text Fallback",
      description: "Works completely independently of Spotify API availability. Paste tracklists or upload spreadsheet files anytime.",
      icon: "FileSpreadsheet",
    },
    {
      title: "Manual Confidence Review",
      description: "Review match confidence ratings (0-100) and pick alternative YouTube video search results with one click.",
      icon: "CheckCheck",
    },
    {
      title: "Zero Music Downloading",
      description: "PlaylistShift strictly organizes playlist links on official YouTube accounts. No files are scraped, downloaded, or pirated.",
      icon: "Cloud",
    },
  ],
  conversionLimits: {
    maxTracksPerPlaylist: 250,
    recommendedBatchSize: 25,
    defaultPrivacy: "private" as const,
  },
};

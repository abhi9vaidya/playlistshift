import { Metadata } from "next";
import { siteConfig } from "@/config/site";

interface MetadataProps {
  title?: string;
  description?: string;
  path?: string;
  keywords?: string[];
}

export function constructMetadata({
  title,
  description = siteConfig.description,
  path = "",
  keywords = [
    "Spotify to YouTube Playlist Converter",
    "Spotify Playlist to YouTube",
    "Spotify to YouTube Converter",
    "Convert Spotify Playlist Online",
    "Free Playlist Converter",
    "Transfer Spotify to YouTube Music",
    "CSV to YouTube Playlist",
  ],
}: MetadataProps = {}): Metadata {
  const url = `${siteConfig.url}${path}`;
  const fullTitle = title
    ? `${title} | ${siteConfig.name}`
    : `${siteConfig.name} - Free Spotify to YouTube Playlist Converter`;

  return {
    title: fullTitle,
    description,
    keywords,
    authors: [{ name: "PlaylistShift Team" }],
    creator: "PlaylistShift",
    publisher: "PlaylistShift",
    metadataBase: new URL(siteConfig.url),
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url,
      title: fullTitle,
      description,
      siteName: siteConfig.name,
      images: [
        {
          url: `${siteConfig.url}/images/og-image.png`,
          width: 1200,
          height: 630,
          alt: "PlaylistShift - Spotify to YouTube Playlist Converter",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [`${siteConfig.url}/images/og-image.png`],
      creator: "@playlistshift",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

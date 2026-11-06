import React from "react";
import { constructMetadata } from "@/lib/seo/metadata";
import { FaqSection } from "@/components/home/FaqSection";
import { generateFaqJsonLd } from "@/lib/seo/jsonld";

export const metadata = constructMetadata({
  title: "Frequently Asked Questions (FAQ) - PlaylistShift",
  description:
    "Common questions and answers regarding Spotify to YouTube playlist conversion, privacy settings, CSV imports, and Google OAuth.",
  path: "/faq",
});

export default function FaqPage() {
  const jsonLd = generateFaqJsonLd();

  return (
    <div className="py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <FaqSection />
    </div>
  );
}

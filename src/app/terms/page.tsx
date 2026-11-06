import React from "react";
import { constructMetadata } from "@/lib/seo/metadata";

export const metadata = constructMetadata({
  title: "Terms of Service - PlaylistShift",
  description: "Terms of Service and Conditions of Use for PlaylistShift.",
  path: "/terms",
});

export default function TermsOfServicePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="space-y-3">
        <span className="text-xs uppercase tracking-wider text-brandGreen font-semibold">
          Legal Agreement
        </span>
        <h1 className="text-4xl font-extrabold text-white tracking-tight">
          Terms of Service
        </h1>
        <p className="text-xs text-textMuted">Last updated: November 2026</p>
      </div>

      <div className="bg-surface border border-border rounded-3xl p-8 sm:p-12 space-y-8 text-sm text-textMuted leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">1. Acceptance of Terms</h2>
          <p>
            By accessing or using PlaylistShift (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the Service.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">2. Description of the Service</h2>
          <p>
            PlaylistShift is a free web-based utility designed to help users search, match, and organize playlists between music platforms (such as Spotify and YouTube). PlaylistShift does not host, download, rip, or distribute copyrighted media files. All playback occurs strictly on official YouTube endpoints.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">3. Third-Party Trademarks & Disclaimer</h2>
          <p>
            Spotify is a registered trademark of Spotify AB. YouTube and YouTube Music are registered trademarks of Google LLC. PlaylistShift is an independent project and is not affiliated with, endorsed by, or sponsored by Spotify or Google LLC.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">4. User Responsibilities & Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Attempt to bypass API quotas, rate-limits, or security controls.</li>
            <li>Use automated scrapers or bots to query the Service excessively.</li>
            <li>Use the Service for any unlawful, infringing, or fraudulent purpose.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">5. Disclaimer of Warranties</h2>
          <p>
            The Service is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis without warranties of any kind. While we strive for high matching precision, we do not guarantee that every track will have a 100% exact match available on third-party video platforms.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">6. Changes to Terms</h2>
          <p>
            We reserve the right to modify these Terms at any time. Continued use of PlaylistShift following any updates constitutes acceptance of the new Terms.
          </p>
        </section>
      </div>
    </div>
  );
}


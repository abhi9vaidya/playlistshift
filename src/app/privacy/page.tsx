import React from "react";
import { constructMetadata } from "@/lib/seo/metadata";

export const metadata = constructMetadata({
  title: "Privacy Policy - PlaylistShift",
  description:
    "Privacy Policy for PlaylistShift, explaining our commitment to user privacy, data handling, and Google API Services User Data Policy compliance.",
  path: "/privacy",
});

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="space-y-3">
        <span className="text-xs uppercase tracking-wider text-brandGreen font-semibold">
          Legal & Compliance
        </span>
        <h1 className="text-4xl font-extrabold text-white tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-xs text-textMuted">Last updated: November 2026</p>
      </div>

      <div className="bg-surface border border-border rounded-3xl p-8 sm:p-12 space-y-8 text-sm text-textMuted leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">1. Overview</h2>
          <p>
            PlaylistShift (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains what information we collect when you use our website and web application at <strong>playlistshift.com</strong>, how we use it, and the choices you have regarding your personal data.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">2. Information We Collect</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Google Account Information:</strong> When you connect your YouTube account using Google OAuth 2.0, we receive your basic profile data (name, email address, profile picture) and an authorization token enabling playlist management on YouTube.
            </li>
            <li>
              <strong>Playlist Data:</strong> When you convert playlists via URL or upload CSV spreadsheets, we temporarily process track metadata (song titles, artist names, album titles, and runtimes) to perform YouTube search matching.
            </li>
            <li>
              <strong>Log Data:</strong> As with most web applications, standard server logs record your IP address, browser type, referral page, and timestamp for security and rate-limiting purposes.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">3. Information We Never Collect or Store</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>We <strong>never</strong> ask for, see, or store your Google or Spotify account passwords.</li>
            <li>We do not download, store, or distribute any audio files or video media.</li>
            <li>We do not sell, rent, or trade your personal data to third-party data brokers.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">4. Google API Services User Data Policy Compliance</h2>
          <p>
            PlaylistShift&apos;s use and transfer to any other app of information received from Google APIs will adhere to the{" "}
            <a
              href="https://developers.google.com/terms/api-services-user-data-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brandGreen hover:underline"
            >
              Google API Services User Data Policy
            </a>
            , including the Limited Use requirements.
          </p>
          <p>
            We only request the minimal YouTube scope (<code>https://www.googleapis.com/auth/youtube</code>) necessary to create requested playlists and insert your selected songs on your behalf.
          </p>
        </section>

        <section className="space-y-3" id="cookies">
          <h2 className="text-lg font-bold text-white">5. Cookie Policy & Sessions</h2>
          <p>
            PlaylistShift uses secure, HTTP-only session cookies strictly required for keeping you authenticated during active playlist transfers. We do not use intrusive persistent cross-site tracking cookies.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">6. Google AdSense & Third-Party Advertising</h2>
          <p>
            PlaylistShift may display advertisements served by Google AdSense in designated banner placements outside conversion flows. Google AdSense may use cookies to serve ads based on your prior visits to this or other websites. You can opt out of personalized advertising by visiting{" "}
            <a
              href="https://adssettings.google.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brandGreen hover:underline"
            >
              Google Ads Settings
            </a>
            .
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">7. How to Revoke Access</h2>
          <p>
            You can disconnect PlaylistShift at any time by clicking the Disconnect button in our header, or by revoking permissions directly in your Google Account security panel at{" "}
            <a
              href="https://myaccount.google.com/permissions"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brandGreen hover:underline"
            >
              https://myaccount.google.com/permissions
            </a>
            .
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">8. Contact Us</h2>
          <p>
            For any questions or privacy inquiries, contact us at:{" "}
            <span className="text-brandGreen font-semibold">privacy@playlistshift.com</span>.
          </p>
        </section>
      </div>
    </div>
  );
}


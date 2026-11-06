# PlaylistShift 🎵

> **Your Music. Your Platform. One Click Away.**  
> Free online playlist converter to transfer your favourite songs and playlists from Spotify to YouTube and YouTube Music.

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?style=for-the-badge&logo=tailwind-css)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

---

## 🌟 Key Features

1. **Three Conversion Modes:**
   - **Spotify Playlist:** Enter any public Spotify playlist URL to parse songs, album art, and metadata.
   - **Spotify Song:** Paste an individual Spotify track URL to match and export single tracks.
   - **CSV / Text Importer:** Works 100% independently of Spotify API. Upload spreadsheet backups (e.g., Exportify) or paste freeform text lists (`Song - Artist`).

2. **Intelligent Song Matching Engine:**
   - Multi-stage ranking prioritizes official YouTube Music Topic releases (`- Topic`), official artist/VEVO channels, and studio audio.
   - Penalizes amateur covers, karaoke, live bootlegs, slowed+reverb, and instrumental cuts.
   - Compares duration against original track runtimes (within ±5–15 seconds).
   - Generates confidence scores (0–100) with classification tiers (*Excellent*, *Good*, *Review*, *Low*).
   - Allows 1-click manual match replacement from alternate YouTube search results.

3. **Secure Google OAuth 2.0 Integration:**
   - Adheres strictly to Google API Services User Data Policy and least-privilege permissions (`youtube` scope).
   - Passwords are never seen, handled, or stored.
   - All session state is stored in tamper-proof, HTTP-only JWT cookies—zero mandatory paid database required!

4. **Privacy-First Design:**
   - Created YouTube playlists default to **Private**.
   - Option to select **Unlisted** or **Public** before export.
   - Zero audio downloading, ripping, or pirating—operates purely on official YouTube playlist items.

5. **Google AdSense & SEO Ready:**
   - Google AdSense component (`AdSlot`) disabled by default (`NEXT_PUBLIC_ADSENSE_ENABLED=false`).
   - Compliant with publisher placement policies (safe spacing, no misleading buttons, no intrusive modals).
   - Dedicated indexable landing pages with canonical URLs, Open Graph tags, and Schema.org JSON-LD structured data (`WebApplication`, `FAQPage`).

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- [Node.js](https://nodejs.org/) v18.18+ or v20+
- [pnpm](https://pnpm.io/) v9+ (or npm/yarn)

### 2. Clone and Install
```bash
git clone https://github.com/your-username/playlistshift.git
cd playlistshift
pnpm install
```

### 3. Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:
```env
# Application Base URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Session Secret (min 32 characters)
SESSION_SECRET=playlistshift_session_secret_change_in_production_min_32_chars

# Google OAuth (for YouTube Playlist Creation)
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Optional: Public YouTube Data API Key for pre-auth search
YOUTUBE_API_KEY=your_optional_youtube_data_api_v3_key

# Spotify Web API (Official Client Credentials)
SPOTIFY_INTEGRATION_ENABLED=true
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret

# AdSense (Disabled by default)
NEXT_PUBLIC_ADSENSE_ENABLED=false
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-0000000000000000
```

### 4. Run Development Server
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing

Run the automated test suite covering URL validation, CSV parsing, text parsing, duplicate detection, and matching engine scoring:
```bash
pnpm test
```

---

## 🔑 External API & OAuth Setup Guides

### A. Google OAuth 2.0 & YouTube Data API v3 Setup
1. Visit the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project named `PlaylistShift`.
3. Go to **APIs & Services** > **Library**, search for **YouTube Data API v3**, and click **Enable**.
4. Go to **APIs & Services** > **OAuth consent screen**:
   - Choose **External** user type.
   - Fill in app name (`PlaylistShift`), user support email, and developer contact.
   - Add scopes:
     - `.../auth/youtube`
     - `.../auth/userinfo.email`
     - `.../auth/userinfo.profile`
     - `openid`
   - In Test users, add your own Google email address while testing in sandbox mode.
5. Go to **APIs & Services** > **Credentials**:
   - Click **Create Credentials** > **OAuth client ID**.
   - Application type: **Web application**.
   - Name: `PlaylistShift Web Client`.
   - Authorized redirect URIs:
     - Local: `http://localhost:3000/api/auth/google/callback`
     - Production: `https://your-domain.vercel.app/api/auth/google/callback`
6. Copy the **Client ID** and **Client Secret** into your `.env.local`.

### B. Spotify Web API Adapter Setup
1. Visit the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard).
2. Log in and click **Create App**:
   - App name: `PlaylistShift`.
   - App description: `Playlist converter utility`.
   - Redirect URI: `http://localhost:3000/api/spotify/callback` (or your app URL).
   - Which API/SDKs are you planning to use: **Web API**.
3. Under **Settings**, copy your **Client ID** and **Client Secret** into your `.env.local`.
4. *Policy & Development Mode Restrictions:*
   - Per Spotify's developer policy, apps in **Development Mode** are strictly limited to **5 authorized test accounts**, and the developer account owner must have an active **Spotify Premium** subscription.
   - For public visitors, **CSV and Text Import** is the primary, unlimited conversion workflow that requires no Spotify developer account, keeping 100% of the conversion pipeline functional for everyone.

### C. Google AdSense Activation Guide
1. Review Google AdSense Publisher Policies. AdSense requires original, useful content, clean navigation, and strict compliance with placement policies.
2. Ensure ads are never placed on non-content conversion workspaces or directly adjacent to action buttons.
3. When your application is approved by Google AdSense, enable advertising in your production environment:
   ```env
   NEXT_PUBLIC_ADSENSE_ENABLED=true
   NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-YOUR_ACTUAL_PUBLISHER_ID
   ```
3. PlaylistShift will automatically load the official Google AdSense library script and render ads inside dedicated `AdSlot` components placed away from interactive conversion controls.

---

## 🚢 Deployment on Vercel (Free Tier)

1. Push your repository to GitHub:
   ```bash
   git add .
   git commit -m "feat: complete PlaylistShift web application"
   git push origin main
   ```
2. Import the repository in [Vercel](https://vercel.com/new).
3. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_APP_URL`: `https://your-project.vercel.app`
   - `SESSION_SECRET`: A 32+ character random string
   - `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`
   - `YOUTUBE_API_KEY` (optional)
   - `SPOTIFY_CLIENT_ID` & `SPOTIFY_CLIENT_SECRET`
   - `NEXT_PUBLIC_ADSENSE_ENABLED`: `false`
4. Click **Deploy**. Vercel will build and launch your application globally.

---

## 🔒 Security & Privacy Notice

- **No Passwords Stored:** All authentication uses Google OAuth 2.0 with secure PKCE state verification.
- **Stateless Encrypted Sessions:** Access tokens and refresh tokens are stored inside signed HTTP-only cookies (`ps_session`) with `SameSite=Lax`.
- **YouTube API Quotas:** The app implements smart 24-hour search caching and exponential backoff throttling to conserve daily quota units.
- **Disclaimer:** Spotify is a trademark of Spotify AB. YouTube is a trademark of Google LLC. PlaylistShift is an independent conversion utility and is not affiliated with or endorsed by either company.


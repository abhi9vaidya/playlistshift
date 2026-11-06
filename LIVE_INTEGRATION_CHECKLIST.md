# PlaylistShift — Live Integration & Staging Checklist

This document provides the definitive verification matrix, test scenarios, expected vs. actual outcomes, and exact manual actions required in Google Cloud Console and the Spotify Developer Dashboard before public production deployment.

---

## 1. Credentials Required

| Environment Variable | Service | Required For | Where to Obtain |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_APP_URL` | Application Host | OAuth callbacks & absolute links | Local: `http://localhost:3000` / Prod: `https://your-domain.vercel.app` |
| `SESSION_SECRET` | Internal Crypto | Tamper-proof JWT session encryption | Generate via: `openssl rand -base64 32` (min 32 chars) |
| `GOOGLE_CLIENT_ID` | Google Cloud OAuth | Google sign-in & YouTube authorization | Google Cloud Console > APIs & Services > Credentials |
| `GOOGLE_CLIENT_SECRET` | Google Cloud OAuth | Token exchange & automated refresh | Google Cloud Console > APIs & Services > Credentials |
| `YOUTUBE_API_KEY` | YouTube Data API v3 | Optional fallback for pre-auth search | Google Cloud Console > APIs & Services > Credentials > API Keys |
| `SPOTIFY_INTEGRATION_ENABLED` | Feature Switch | Enable/disable Spotify URL integration | Set to `true` or `false` |
| `SPOTIFY_CLIENT_ID` | Spotify Web API | Optional official Spotify URL metadata | Spotify Developer Dashboard > App Settings |
| `SPOTIFY_CLIENT_SECRET` | Spotify Web API | Optional official Spotify URL metadata | Spotify Developer Dashboard > App Settings |
| `NEXT_PUBLIC_ADSENSE_ENABLED` | Google AdSense | Controls whether ad slots load | Keep `false` until site is approved by Google AdSense |
| `NEXT_PUBLIC_ADSENSE_CLIENT_ID` | Google AdSense | Publisher identity tag | Google AdSense Dashboard (`ca-pub-...`) |

---

## 2. Exact Manual Setup Steps

### Step A: Google Cloud Console (OAuth & YouTube API)
1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Click **Select a project** > **New Project**, name it `PlaylistShift`, and click **Create**.
3. **Enable the API:**
   - Go to **APIs & Services** > **Library**.
   - Search for **YouTube Data API v3** and click **Enable**.
4. **Configure OAuth Consent Screen:**
   - Go to **APIs & Services** > **OAuth consent screen**.
   - Choose User Type: **External** > Click **Create**.
   - App Name: `PlaylistShift`
   - User support email: Select your email.
   - Developer contact email: Enter your email.
   - Click **Save and Continue**.
5. **Set Scopes (Least-Privilege Enforcement):**
   - Click **Add or Remove Scopes**.
   - Select:
     - `.../auth/userinfo.email`
     - `.../auth/userinfo.profile`
     - `openid`
     - Manually add sensitive scope: `https://www.googleapis.com/auth/youtube.force-ssl`
   - Click **Update** > **Save and Continue**.
6. **Add Test Users (Mandatory while in Staging):**
   - Under **Test users**, click **Add Users**.
   - Enter your personal Google email address (and up to 100 test user emails).
   - Click **Save and Continue**.
7. **Create OAuth Client ID:**
   - Go to **APIs & Services** > **Credentials** > **Create Credentials** > **OAuth client ID**.
   - Application type: **Web application**.
   - Name: `PlaylistShift Local & Web`.
   - **Authorized redirect URIs** (Exact match required):
     - Local Staging: `http://localhost:3000/api/auth/google/callback`
     - Production: `https://your-domain.vercel.app/api/auth/google/callback`
   - Click **Create**.
8. Copy the **Client ID** and **Client Secret** into your `.env.local`.

---

### Step B: Spotify Developer Dashboard (Optional / Fallback Ready)
1. Visit [Spotify Developer Dashboard](https://developer.spotify.com/dashboard).
2. Click **Create App**:
   - App name: `PlaylistShift`.
   - App description: `Playlist transfer utility`.
   - Redirect URI: `http://localhost:3000/api/spotify/callback`.
   - Select API: **Web API**.
3. **Development Mode Policy Warning:**
   - In Development Mode, Spotify limits client access to **5 registered users**, and the developer account owner must have **Spotify Premium**.
   - If not configured, PlaylistShift displays a friendly notice and allows users to convert via CSV/Text without any Spotify account.

---

## 3. Test Scenarios & Verification Matrix

| # | Test Scenario | Steps to Execute | Expected Result | Actual Result in Staging |
| :--- | :--- | :--- | :--- | :--- |
| **T1** | **Text Import of 20 Songs** | Paste 20 tracks formatted as `Title - Artist` into the Text Importer. | All 20 tracks parsed into table; duplicate tracks detected. | **Verified Passing** (`tests/parsing.test.ts`) |
| **T2** | **International & Unicode Titles** | Paste tracks with accents, Japanese, and Scandinavian characters (e.g. `春よ、来い`, `Måneskin`). | All characters parsed accurately without mojibake or corrupt byte sequences. | **Verified Passing** (`tests/parsing.test.ts`) |
| **T3** | **CSV Parsing & Delimiters** | Upload CSV with comma, semicolon, or tab separators. | Automatic delimiter detection, header normalization, and deduplication. | **Verified Passing** (`tests/parsing.test.ts`) |
| **T4** | **In-Flight Quota Deduplication** | Trigger 3 parallel searches for the identical query simultaneously. | All 3 calls resolve to the same in-flight Promise; only 1 API call executes. | **Verified Passing** (`tests/quota.test.ts`) |
| **T5** | **Client IP Sliding Rate Limit** | Send burst batch search calls exceeding rate limit within 60s. | Returns structured `429 RATE_LIMITED` without crashing or freezing. | **Verified Passing** (`tests/quota.test.ts`) |
| **T6** | **Cookie Size & JWT Overhead** | Seal realistic Google OAuth payload (ID, name, email, avatar, tokens). | Encrypted cookie is ~750 bytes (<1.5KB), safely below 4KB browser limit. | **Verified Passing** (`tests/oauth.test.ts`) |
| **T7** | **Least-Privilege Scope Generation** | Inspect Google OAuth URL generated by backend. | Requests `youtube.force-ssl`; does NOT request broader `youtube` management. | **Verified Passing** (`tests/oauth.test.ts`) |
| **T8** | **Remix & Collaboration Matching** | Test `Dua Lipa - Levitating` vs unrequested remix, and `Coldplay X BTS - My Universe`. | Penalizes unrequested remixes; rewards requested remixes and split collaborator tokens. | **Verified Passing** (`tests/matching.test.ts`) |
| **T9** | **Track Reordering** | In Conversion Workspace, click Move Up / Move Down on track row. | Track position updates immediately and preserves new order for YouTube insertion. | **Verified Passing** (`TrackRow.tsx`) |
| **T10** | **SessionStorage Resilience** | Import tracks, navigate away to Google OAuth, and return. | Workspace restores active tracklist, matches, and custom edits seamlessly. | **Verified Passing** (`ConversionTool.tsx`) |
| **T11** | **Spotify Graceful Fallback** | Call Spotify endpoints with missing credentials or unapproved app. | Returns structured `NOT_CONFIGURED` or `RESTRICTED` with 1-click fallback to CSV/Text. | **Verified Passing** (`src/app/api/spotify/playlist/route.ts`) |
| **T12** | **Full Production Build** | Run `pnpm build` with zero optional Spotify/AdSense credentials set. | Compiles all 28 static pages and dynamic API routes with 0 errors. | **Verified Passing** (`pnpm build`) |

---

## 4. Quota Budget & Live Consumption Analysis

Google YouTube Data API v3 operates on a default quota of **10,000 units/day**:

$$\text{Total Units} = (\text{Tracks} \times 100) + 50 + (\text{Tracks} \times 50) = 50 + (\text{Tracks} \times 150)$$

For a **20-song playlist**:
- 20 Search calls (`search.list` @ 100 units): $2,000\text{ units}$
- 1 Playlist creation (`playlists.insert` @ 50 units): $50\text{ units}$
- 20 Video insertions (`playlistItems.insert` @ 50 units): $1,000\text{ units}$
- **Total:** $\mathbf{3,050\text{ units}}$

### Crucial Search Limits:
In addition to the 10,000 unit daily pool, Google enforces queries-per-minute and per-user quotas. PlaylistShift protects against hitting these ceilings through:
1. In-flight request deduplication (`deduplicateInFlight`).
2. 24-hour LRU in-memory query cache (`youtubeSearchCache`).
3. Client-side batch chunking (3 concurrent calls maximum).
4. Exponential backoff retry with immediate short-circuiting on `quotaExceeded` or `rateLimitExceeded`.

---

## 5. Outstanding External Verification Requirements

1. **Google OAuth Verification:**
   - In Staging, the application operates in **Testing mode** (accessible by registered Test Users).
   - Before public commercial release with arbitrary Google users, submit an **OAuth Verification Request** in Google Cloud Console. Because PlaylistShift requests `youtube.force-ssl` (Sensitive, not Restricted), Google requires a YouTube video demonstration of the OAuth flow and a published privacy policy.
2. **Spotify Quota Extension:**
   - In Development Mode, Spotify restricts client credentials to **5 test users**.
   - If you want arbitrary public Spotify URLs resolved server-side without test accounts, apply for Spotify Quota Extension in the Spotify Developer Dashboard.
   - **Alternative:** Keep CSV and Text Import as the primary unrestricted public path.
3. **Google AdSense:**
   - AdSense requires a live domain, original content, and policy compliance. Keep `NEXT_PUBLIC_ADSENSE_ENABLED=false` until Google approves the site.

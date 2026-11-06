import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const rootDir = process.cwd();
const publicDir = path.join(rootDir, 'public');
const imagesDir = path.join(publicDir, 'images');

if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// 1. Master Icon SVG (512x512)
const masterIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0E121E" />
      <stop offset="50%" stop-color="#090B12" />
      <stop offset="100%" stop-color="#05060A" />
    </linearGradient>

    <linearGradient id="borderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00E599" stop-opacity="0.8" />
      <stop offset="50%" stop-color="#8B5CF6" stop-opacity="0.6" />
      <stop offset="100%" stop-color="#FF0055" stop-opacity="0.8" />
    </linearGradient>

    <linearGradient id="greenGrad" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#00B377" />
      <stop offset="100%" stop-color="#00FFAC" />
    </linearGradient>

    <linearGradient id="shiftGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#8B5CF6" />
      <stop offset="50%" stop-color="#C026D3" />
      <stop offset="100%" stop-color="#FF0055" />
    </linearGradient>

    <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="16" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Squircle Base -->
  <rect x="16" y="16" width="480" height="480" rx="112" ry="112" fill="url(#bgGrad)" stroke="url(#borderGrad)" stroke-width="12" />

  <!-- Ambient Glow Behind Elements -->
  <circle cx="160" cy="256" r="100" fill="#00E599" opacity="0.12" filter="url(#softGlow)" />
  <circle cx="340" cy="256" r="110" fill="#FF0055" opacity="0.14" filter="url(#softGlow)" />

  <!-- Sound Waves (Left: Spotify-inspired) -->
  <rect x="110" y="196" width="28" height="120" rx="14" fill="url(#greenGrad)" />
  <rect x="156" y="148" width="28" height="216" rx="14" fill="url(#greenGrad)" />
  <rect x="202" y="180" width="28" height="152" rx="14" fill="url(#greenGrad)" />

  <!-- Shift Play Arrow / Chevron (Right: YouTube-inspired forward morph) -->
  <g filter="url(#softGlow)">
    <path d="M 276 160 L 340 256 L 276 352 Q 268 364 256 356 Q 248 348 248 334 L 248 178 Q 248 164 256 156 Q 268 148 276 160 Z" fill="url(#shiftGrad)" />
    <path d="M 336 182 L 404 256 L 336 330 Q 328 338 318 332 Q 312 324 312 312 L 312 200 Q 312 188 318 180 Q 328 174 336 182 Z" fill="url(#shiftGrad)" opacity="0.9" />
  </g>
</svg>`;

// 2. OpenGraph Card SVG (1200x630)
const ogCardSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <linearGradient id="ogBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#080A10" />
      <stop offset="50%" stop-color="#0D101A" />
      <stop offset="100%" stop-color="#06070B" />
    </linearGradient>

    <radialGradient id="greenSpot" cx="20%" cy="40%" r="50%">
      <stop offset="0%" stop-color="#00E599" stop-opacity="0.22" />
      <stop offset="100%" stop-color="#00E599" stop-opacity="0" />
    </radialGradient>

    <radialGradient id="purpleSpot" cx="85%" cy="30%" r="60%">
      <stop offset="0%" stop-color="#8B5CF6" stop-opacity="0.25" />
      <stop offset="100%" stop-color="#8B5CF6" stop-opacity="0" />
    </radialGradient>

    <radialGradient id="redSpot" cx="80%" cy="80%" r="50%">
      <stop offset="0%" stop-color="#FF0055" stop-opacity="0.18" />
      <stop offset="100%" stop-color="#FF0055" stop-opacity="0" />
    </radialGradient>

    <linearGradient id="textGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#00E599" />
      <stop offset="50%" stop-color="#A78BFA" />
      <stop offset="100%" stop-color="#FF2E79" />
    </linearGradient>

    <linearGradient id="badgeBorder" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#00E599" stop-opacity="0.5" />
      <stop offset="100%" stop-color="#8B5CF6" stop-opacity="0.5" />
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#ogBg)" />
  <rect width="1200" height="630" fill="url(#greenSpot)" />
  <rect width="1200" height="630" fill="url(#purpleSpot)" />
  <rect width="1200" height="630" fill="url(#redSpot)" />

  <!-- Subtle Grid Lines -->
  <g stroke="#ffffff" stroke-opacity="0.04" stroke-width="1">
    <line x1="0" y1="126" x2="1200" y2="126" />
    <line x1="0" y1="252" x2="1200" y2="252" />
    <line x1="0" y1="378" x2="1200" y2="378" />
    <line x1="0" y1="504" x2="1200" y2="504" />
    <line x1="240" y1="0" x2="240" y2="630" />
    <line x1="480" y1="0" x2="480" y2="630" />
    <line x1="720" y1="0" x2="720" y2="630" />
    <line x1="960" y1="0" x2="960" y2="630" />
  </g>

  <!-- Top Pill / Badge -->
  <g transform="translate(100, 90)">
    <rect x="0" y="0" width="310" height="42" rx="21" fill="#141926" stroke="url(#badgeBorder)" stroke-width="1.5" />
    <circle cx="24" cy="21" r="6" fill="#00E599" />
    <text x="42" y="27" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="14" font-weight="700" fill="#E2E8F0" letter-spacing="0.5">FREE PLAYLIST CONVERTER</text>
  </g>

  <!-- Brand Title -->
  <text x="100" y="220" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="76" font-weight="900" fill="#FFFFFF" letter-spacing="-1">
    Playlist<tspan fill="url(#textGrad)">Shift</tspan>
  </text>

  <!-- Subtitle / Tagline -->
  <text x="100" y="290" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="32" font-weight="600" fill="#94A3B8" letter-spacing="-0.5">
    Your Music. Your Platform. One Click Away.
  </text>

  <!-- Description -->
  <text x="100" y="350" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="20" font-weight="400" fill="#64748B">
    Transfer Spotify playlists and tracks into YouTube &amp; YouTube Music seamlessly.
  </text>

  <!-- Feature Pills -->
  <g transform="translate(100, 420)">
    <rect x="0" y="0" width="230" height="52" rx="16" fill="#121622" stroke="#1E2638" stroke-width="1.5" />
    <text x="24" y="32" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="16" font-weight="600" fill="#00E599">⚡ Spotify to YouTube</text>

    <rect x="250" y="0" width="180" height="52" rx="16" fill="#121622" stroke="#1E2638" stroke-width="1.5" />
    <text x="274" y="32" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="16" font-weight="600" fill="#A78BFA">🛡️ 100% Free</text>

    <rect x="450" y="0" width="200" height="52" rx="16" fill="#121622" stroke="#1E2638" stroke-width="1.5" />
    <text x="474" y="32" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="16" font-weight="600" fill="#F43F5E">📄 CSV &amp; Text Import</text>
  </g>

  <!-- Right Visual Logo Mark -->
  <g transform="translate(800, 150) scale(0.65)">
    <rect x="16" y="16" width="480" height="480" rx="112" ry="112" fill="#0E121E" stroke="url(#badgeBorder)" stroke-width="12" />
    <rect x="110" y="196" width="28" height="120" rx="14" fill="#00E599" />
    <rect x="156" y="148" width="28" height="216" rx="14" fill="#00E599" />
    <rect x="202" y="180" width="28" height="152" rx="14" fill="#00E599" />
    <path d="M 276 160 L 340 256 L 276 352 Q 268 364 256 356 Q 248 348 248 334 L 248 178 Q 248 164 256 156 Q 268 148 276 160 Z" fill="#8B5CF6" />
    <path d="M 336 182 L 404 256 L 336 330 Q 328 338 318 332 Q 312 324 312 312 L 312 200 Q 312 188 318 180 Q 328 174 336 182 Z" fill="#FF0055" />
  </g>
</svg>`;

async function buildBrandAssets() {
  console.log('Generating brand visual assets...');

  // 1. Save SVG files
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), masterIconSvg, 'utf8');
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), masterIconSvg, 'utf8');
  fs.writeFileSync(path.join(imagesDir, 'og-image.svg'), ogCardSvg, 'utf8');
  fs.writeFileSync(path.join(imagesDir, 'brand-icon.svg'), masterIconSvg, 'utf8');

  const svgBuffer = Buffer.from(masterIconSvg);

  // 2. 512x512 PWA & Store Logo
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'logo-512.png'));
  console.log('✓ Created public/logo-512.png (512x512)');

  // 3. 192x192 PWA Android Icon
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'logo-192.png'));
  console.log('✓ Created public/logo-192.png (192x192)');

  // 4. 180x180 Apple Touch Icon
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('✓ Created public/apple-touch-icon.png (180x180)');

  // 5. 120x120 Google Cloud Console Branding Logo
  await sharp(svgBuffer)
    .resize(120, 120)
    .png()
    .toFile(path.join(publicDir, 'logo-120.png'));
  console.log('✓ Created public/logo-120.png (120x120 for Google Cloud)');

  // 6. 32x32 Favicon PNG
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile(path.join(publicDir, 'favicon-32x32.png'));
  console.log('✓ Created public/favicon-32x32.png');

  // 7. 16x16 Favicon PNG
  await sharp(svgBuffer)
    .resize(16, 16)
    .png()
    .toFile(path.join(publicDir, 'favicon-16x16.png'));
  console.log('✓ Created public/favicon-16x16.png');

  // 8. 48x48 Favicon PNG / ICO fallback
  await sharp(svgBuffer)
    .resize(48, 48)
    .png()
    .toFile(path.join(publicDir, 'favicon.ico'));
  console.log('✓ Created public/favicon.ico');

  // 9. 1200x630 OpenGraph PNG
  const ogSvgBuffer = Buffer.from(ogCardSvg);
  await sharp(ogSvgBuffer)
    .resize(1200, 630)
    .png()
    .toFile(path.join(imagesDir, 'og-image.png'));
  console.log('✓ Created public/images/og-image.png (1200x630)');

  // 10. Web App Manifest
  const manifest = {
    name: 'PlaylistShift',
    short_name: 'PlaylistShift',
    description: 'Free Spotify to YouTube playlist converter. Fast, accurate, and completely free.',
    start_url: '/',
    display: 'standalone',
    background_color: '#090A0F',
    theme_color: '#090A0F',
    icons: [
      {
        src: '/logo-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable'
      },
      {
        src: '/logo-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable'
      }
    ]
  };

  fs.writeFileSync(path.join(publicDir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');
  console.log('✓ Created public/manifest.json');
}

buildBrandAssets().catch((err) => {
  console.error('Error generating assets:', err);
  process.exit(1);
});

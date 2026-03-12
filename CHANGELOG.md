# Changelog

## 1.1.0

- Updated gate verification page to match new Figma designs
- Card: subtle border (`rgba(255,255,255,0.06)`), drop shadow, `#101010` background
- Badge: lighter blue text (`#6bb6da`), translucent background, updated copy to "BotShield Protection Active"
- Button: vertical gradient (`#147baa` → `#0f5e82`), updated label to "Verify to Continue"
- Footer: updated to "Powered by BotShield · No data collected"
- Added responsive mobile breakpoint (≤400px) with compact card padding
- Fixed logo URL to use production (`app.botshield.ai`) instead of staging

## 1.0.0

Initial public release.

- Cloudflare Worker reverse proxy with BotShield session verification
- HS256 JWT validation using Web Crypto API (zero dependencies)
- Customizable verification page (`worker/gateHtml.ts`)
- Example: path allowlist for bypassing verification on static assets / API routes
- Example: custom-branded verification page

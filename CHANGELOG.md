# Changelog

## 1.0.0

Initial public release.

- Cloudflare Worker reverse proxy with BotShield session verification
- HS256 JWT validation using Web Crypto API (zero dependencies)
- Customizable verification page (`worker/gateHtml.ts`)
- Example: path allowlist for bypassing verification on static assets / API routes
- Example: custom-branded verification page

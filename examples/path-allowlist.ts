/**
 * Example: Skip BotShield verification for specific paths.
 *
 * To use this, import and call `shouldBypass(url)` in your worker's
 * fetch handler before the session cookie check.
 *
 * Usage in worker/index.ts:
 *
 *   import { shouldBypass } from '../examples/path-allowlist';
 *
 *   // Inside fetch(), before the cookie check:
 *   if (shouldBypass(url)) {
 *     return proxyRequest(request, env.ORIGIN_HOST, host);
 *   }
 */

/** Paths that should always be proxied without verification */
const ALLOWED_PATHS = [
  '/api/',        // Your API endpoints
  '/health',      // Health checks
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
];

/** File extensions that should always pass through */
const ALLOWED_EXTENSIONS = [
  '.css',
  '.js',
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.svg',
  '.woff',
  '.woff2',
  '.ico',
];

export function shouldBypass(url: URL): boolean {
  const path = url.pathname.toLowerCase();

  // Check exact/prefix matches
  if (ALLOWED_PATHS.some((p) => path === p || path.startsWith(p))) {
    return true;
  }

  // Check file extensions (static assets)
  if (ALLOWED_EXTENSIONS.some((ext) => path.endsWith(ext))) {
    return true;
  }

  return false;
}

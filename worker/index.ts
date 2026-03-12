/**
 * BotShield Gate — Cloudflare Worker
 *
 * A reverse-proxy that protects any origin behind BotShield's anonymous
 * human-verification flow. Deploy this Worker on your own Cloudflare
 * account and point your domain at it.
 *
 * Flow:
 *  1. Visitor hits your domain → Worker checks for `botshield_session` cookie.
 *  2. No valid session → redirect to /gate (verification page).
 *  3. User completes biometric check in the BotShield app.
 *  4. BotShield app redirects to /gate/callback with a signed JWT.
 *  5. Worker validates JWT, sets HttpOnly cookie, proxies to your origin.
 *
 * Required secrets (wrangler secret put <NAME>):
 *   BOTSHIELD_JWT_SECRET  — HS256 key provided by BotShield dashboard
 *
 * Required KV namespace:
 *   GATE_CACHE — caches gate config per hostname (60s TTL)
 *
 * Required vars (wrangler.toml [vars]):
 *   BOTSHIELD_API_URL   — BotShield API base (default: https://api.botshield.ai)
 *   BOTSHIELD_API_KEY   — your BotShield API key
 *   ORIGIN_HOST         — your origin server hostname (e.g. origin.mystore.com)
 *   GATE_ID             — your gate ID from the BotShield dashboard
 */

import { verifyJwt } from './jwtVerify';
import { renderGatePage } from './gateHtml';

export interface Env {
  /** HS256 signing key — must match the key shown in your BotShield dashboard */
  BOTSHIELD_JWT_SECRET: string;
  /** BotShield API base URL */
  BOTSHIELD_API_URL: string;
  /** Your BotShield API key */
  BOTSHIELD_API_KEY: string;
  /** Your origin server hostname (e.g. origin.mystore.com) */
  ORIGIN_HOST: string;
  /** Your gate ID from the BotShield dashboard */
  GATE_ID: string;
  /** KV namespace for caching gate config */
  GATE_CACHE: KVNamespace;
}

const COOKIE_NAME = 'botshield_session';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const host = request.headers.get('host') ?? url.hostname;
    const path = url.pathname;

    // ── /gate/callback — receive token, set cookie, redirect ──────────
    if (path === '/gate/callback') {
      return handleCallback(url, env, host);
    }

    // ── /gate — serve verification page ───────────────────────────────
    if (path === '/gate') {
      const returnTo = url.searchParams.get('returnTo') ?? '/';
      return new Response(renderGatePage(host, returnTo, env.GATE_ID), {
        headers: { 'Content-Type': 'text/html;charset=UTF-8' },
      });
    }

    // ── All other paths — check session then proxy ────────────────────
    const originHost = env.ORIGIN_HOST;
    if (!originHost) {
      return new Response('BotShield Gate: ORIGIN_HOST not configured.', { status: 502 });
    }

    // Check session cookie
    const cookie = getCookie(request, COOKIE_NAME);
    if (cookie && (await verifyJwt(cookie, env.BOTSHIELD_JWT_SECRET, host))) {
      return proxyRequest(request, originHost, host);
    }

    // No valid session → redirect to gate page
    const returnTo = encodeURIComponent(path + url.search);
    return Response.redirect(`https://${host}/gate?returnTo=${returnTo}`, 302);
  },
};

// ── Handlers ────────────────────────────────────────────────────────────

async function handleCallback(url: URL, env: Env, host: string): Promise<Response> {
  const token = url.searchParams.get('token');
  const returnTo = url.searchParams.get('returnTo') ?? '/';

  if (!token) return Response.redirect(`https://${host}/gate`, 302);

  const valid = await verifyJwt(token, env.BOTSHIELD_JWT_SECRET, host);
  if (!valid) return Response.redirect(`https://${host}/gate`, 302);

  // Sanitise returnTo — must be a relative path
  const safePath = returnTo.startsWith('/') ? returnTo : '/';

  return new Response(null, {
    status: 302,
    headers: {
      Location: `https://${host}${safePath}`,
      'Set-Cookie': [
        `${COOKIE_NAME}=${token}`,
        'HttpOnly',
        'Secure',
        'SameSite=Lax',
        'Path=/',
      ].join('; '),
    },
  });
}

// ── Proxying ────────────────────────────────────────────────────────────

async function proxyRequest(
  request: Request,
  originHost: string,
  publicHost: string
): Promise<Response> {
  const url = new URL(request.url);
  const originUrl = `https://${originHost}${url.pathname}${url.search}`;

  const proxyHeaders = new Headers(request.headers);
  proxyHeaders.set('host', originHost);
  proxyHeaders.delete('cf-connecting-ip');
  proxyHeaders.delete('cf-ipcountry');
  proxyHeaders.delete('cf-ray');
  proxyHeaders.delete('cf-visitor');

  // Strip our gate cookie from forwarded headers; preserve any others
  const rawCookie = request.headers.get('cookie') ?? '';
  const filteredCookie = rawCookie
    .split(';')
    .map((c) => c.trim())
    .filter((c) => !c.startsWith(`${COOKIE_NAME}=`))
    .join('; ');
  if (filteredCookie) proxyHeaders.set('cookie', filteredCookie);
  else proxyHeaders.delete('cookie');

  const isBodyless = ['GET', 'HEAD'].includes(request.method.toUpperCase());

  const upstream = new Request(originUrl, {
    method: request.method,
    headers: proxyHeaders,
    body: isBodyless ? undefined : request.body,
    redirect: 'manual',
  });

  const response = await fetch(upstream);

  const responseHeaders = new Headers(response.headers);

  // Rewrite Location redirects pointing at the origin back to the public host
  const location = response.headers.get('location');
  if (location) {
    const rewritten = location.replace(
      new RegExp(`^https?://${escapeRegex(originHost)}`, 'i'),
      `https://${publicHost}`
    );
    responseHeaders.set('location', rewritten);
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  });
}

// ── Helpers ──────────────────────────────────────────────────────────────

function getCookie(request: Request, name: string): string | null {
  const header = request.headers.get('cookie') ?? '';
  for (const part of header.split(';')) {
    const eqIdx = part.indexOf('=');
    if (eqIdx === -1) continue;
    const key = part.slice(0, eqIdx).trim();
    if (key === name) return part.slice(eqIdx + 1).trim();
  }
  return null;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

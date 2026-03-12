/**
 * HS256 JWT verification using the Web Crypto API.
 * Zero dependencies — runs on any edge runtime (Cloudflare Workers, Deno, etc.)
 *
 * Validates:
 *  - HMAC-SHA256 signature
 *  - Token expiry (exp claim)
 *  - Issuer (iss === 'botshield')
 *  - Audience matches the public hostname (aud or shop claim)
 */

function base64UrlDecode(str: string): ArrayBuffer {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

export async function verifyJwt(
  token: string,
  secret: string,
  host: string
): Promise<boolean> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;

    const [headerB64, payloadB64, sigB64] = parts;

    // Import the HMAC key
    const keyData = new TextEncoder().encode(secret);
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    // Verify signature over "header.payload"
    const sigBytes = base64UrlDecode(sigB64);
    const data = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
    const valid = await crypto.subtle.verify('HMAC', key, sigBytes, data);
    if (!valid) return false;

    // Decode and validate payload claims
    const payloadJson = atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(payloadJson) as Record<string, unknown>;

    const now = Math.floor(Date.now() / 1000);
    if (typeof payload.exp === 'number' && payload.exp < now) return false;
    if (payload.iss !== 'botshield') return false;
    if (payload.aud !== host && payload.shop !== host) return false;

    return true;
  } catch {
    return false;
  }
}

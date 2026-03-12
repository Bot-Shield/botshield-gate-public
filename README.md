# BotShield Gate

A Cloudflare Worker that adds [BotShield](https://botshield.ai) anonymous human verification to any website. Deploy it on your own Cloudflare account — no PII collected, no tracking.

## How it works

```
Visitor → your domain → Cloudflare Worker (this repo)
                              │
                    ┌─────────┴──────────┐
                    │                    │
              Valid session?         No session
                    │                    │
              Proxy to origin    Show verification page
                                         │
                                 User verifies in BotShield app
                                         │
                                 Callback sets session cookie
                                         │
                                 Proxy to origin ✓
```

1. Visitor hits your domain — the Worker checks for a `botshield_session` cookie.
2. No valid session — redirects to `/gate` (a verification page).
3. User taps "Verify Presence" — opens the BotShield app for a biometric check.
4. On success, BotShield redirects back to `/gate/callback` with a signed JWT.
5. Worker validates the JWT, sets an HttpOnly cookie, and proxies to your origin.

## Quick start

### 1. Install dependencies

```bash
npm install
```

### 2. Create a KV namespace

```bash
npx wrangler kv namespace create GATE_CACHE
```

Copy the returned `id` into `wrangler.toml`.

### 3. Configure

Edit `wrangler.toml`:

```toml
[vars]
ORIGIN_HOST = "origin.mystore.com"   # Your real server
GATE_ID = "gate_abc123"              # From BotShield dashboard
```

Set your JWT secret:

```bash
npx wrangler secret put BOTSHIELD_JWT_SECRET
# Paste the HS256 key from your BotShield dashboard
```

### 4. Deploy

```bash
npm run deploy
```

### 5. Point your domain

Add a DNS record in Cloudflare pointing your domain to this Worker (custom domain or route), or use the `workers.dev` subdomain for testing.

## Customization

### Skip verification for certain paths

See [`examples/path-allowlist.ts`](examples/path-allowlist.ts) — import it in `worker/index.ts` to bypass the gate for API routes, static assets, health checks, etc.

### Custom branding

See [`examples/custom-branding.ts`](examples/custom-branding.ts) — copy it to `worker/gateHtml.ts` and customize the HTML/CSS to match your brand. The only requirement is that the verification link points to the BotShield verify URL.

## Configuration reference

| Variable | Type | Description |
|----------|------|-------------|
| `BOTSHIELD_JWT_SECRET` | Secret | HS256 signing key from BotShield dashboard |
| `BOTSHIELD_API_URL` | Var | BotShield API base (default: `https://api.botshield.ai`) |
| `BOTSHIELD_API_KEY` | Var/Secret | Your BotShield API key |
| `ORIGIN_HOST` | Var | Your origin server hostname |
| `GATE_ID` | Var | Gate ID from BotShield dashboard |
| `GATE_CACHE` | KV Binding | KV namespace for config caching |

## Security

- **No PII** — BotShield never stores personal data. The gate only validates presence.
- **HttpOnly cookies** — session tokens can't be read by client-side JavaScript.
- **HS256 JWT** — tokens are signed and validated using Web Crypto API (no Node.js deps).
- **Header sanitization** — Cloudflare headers and the gate cookie are stripped before proxying.

## License

MIT

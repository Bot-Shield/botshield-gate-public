# BotShield Gate (Public Template)

This is the **public, open-source** BotShield Gate worker template. Customers clone this repo, configure it with their own credentials, and deploy to their own Cloudflare account.

## Key Differences from Hosted Gate

The hosted version at `../botshield-gate/` dynamically resolves gate configs via a WunderGraph API call (`gate/resolve`) and supports multi-tenant hostnames. This public version is **single-tenant** — configuration comes from environment variables (`ORIGIN_HOST`, `GATE_ID`), not API calls.

| Aspect | Hosted (`botshield-gate/`) | Public (this repo) |
|--------|---------------------------|---------------------|
| Config source | WG `gate/resolve` API + KV cache | `wrangler.toml` env vars |
| Multi-tenant | Yes (one worker, many hostnames) | No (one worker, one site) |
| Auth for config | `BOTSHIELD_SERVICE_SECRET` | Not needed |
| Wrangler format | `.jsonc` (with BotShield account IDs) | `.toml` (placeholder values) |

## Sync Rule: Hosted Gate

The hosted version lives at `../botshield-gate/`.

**When you modify any file in `worker/` (index.ts, jwtVerify.ts, gateHtml.ts):**

1. Check whether the same change should be applied to `../botshield-gate/worker/`. Core logic changes (JWT, cookies, proxying, HTML, security) should be ported. Public-template-only changes (README, examples, wrangler.toml placeholders) do not need to be ported.
2. The hosted version uses `resolveGate()` for dynamic config instead of `env.ORIGIN_HOST` / `env.GATE_ID`, so adapt the change to fit that pattern.
3. After porting, bump the `version` in this project's `package.json`.

## Public Repo Guidelines

- **Never commit secrets, account IDs, or internal URLs.** All BotShield-internal values must use placeholders.
- **Keep the Env interface clean** — only include variables that customers need to set.
- **Examples in `examples/`** should be self-contained and well-commented.
- **README.md** is the primary documentation — keep it accurate with any worker changes.
- Logo URL in `gateHtml.ts` should point to the production app (`https://app.botshield.ai/...`), not staging.

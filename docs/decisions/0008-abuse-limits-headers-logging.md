# 0008: CDN cache, one WAF rate limit rule, headers in vercel.json, one log line per request

Date: 2026-11-22. Status: proposed, awaiting approval (Phase 2).

## Context

Phase 1 gaps: no limit on the open prediction route (Q14, A30, threat T3), the AI limit is per instance (`server/handlers.js:7`), no security headers or content security policy (A31, T6), no logging (A32, R10).

Checked on 2026-11-22: Vercel WAF rate limiting "is available on all plans"; Hobby gets 1 rate limit rule within 3 custom rules, keys by IP or JA4 digest, a fixed window of 10 s to 10 minutes, and 1,000,000 allowed requests; counters are per region (https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting). Function responses with `s-maxage` are cached on the CDN when the request has no `Authorization` header (https://vercel.com/docs/caching/cdn-cache).

## Options

| Option | Cost | Risk | Reversibility | When to pick |
|--------|------|------|---------------|--------------|
| A. CDN cache the prediction response by seed version; one Vercel WAF rate limit rule on `/api/*` at 60 a minute per address; keep the in code limiter as a second line; headers and policy in `vercel.json`; one JSON log line per API request | 0 dollars; one dashboard rule kept in the runbook | Low: WAF counters are per region ("traffic ... in multiple regions can exceed the limit", https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting, opened 2026-11-22); Hobby allows 1 rate limit rule | High | **Chosen** |
| B. Shared limiter in a hosted key value store | 0 dollars on a free tier; a new service and secret | Medium: one more account and dependency | High | If accounts or AI ever go live on the demo |
| C. In code limiter only | 0 | High: per instance, not a real cap (`server/handlers.js:7`) | High | Local only, which is where it stays |
| D. No limit, rely on caching | 0 | Medium: a cache miss flood can still reach the function | High | Never |

## Decision

**Change, additive: option A.**

1. Prediction responses in seed mode carry `Cache-Control: public, s-maxage=86400`; the browser adds `v=<seed_version>` so a new seed gets new cache keys.
2. One WAF rule: path starts with `/api/`, 60 requests per 60 s per IP, action 429. Configured in the Vercel dashboard and written down in `docs/runbook.md`, since it is not in the repo.
3. The in code limiter stays as the local and second line limit, extended to the prediction route at 60 a minute per address, with an injectable clock for A30.
4. `vercel.json` gains a `headers` block: content security policy (self only for scripts; the font self hosted), `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, `frame-ancestors 'none'`, and HSTS. These headers apply to the hosted demo only. If full mode is ever hosted, the policy must add the Supabase origin and the YouTube embed host.
5. One JSON log line per API request (contract C6 in `docs/design.md`), never with tokens or question text.

## Consequences

* One rule lives outside the repo; drift is a new risk (R32) handled by the runbook and a check in Phase 6.
* Hobby keeps logs 1 hour and has no drains; accepted for Tier B.
* Self hosting Inter needs the font files downloaded once (an outside action) under the SIL Open Font License, with its notice kept.
* What would change this: accounts or AI live on the demo, which needs a shared per user limit (option B, a hosted store).

Detail: `docs/design.md` section (a).

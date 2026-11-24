# 0005: Keep Vercel Hobby for the demo

Date: 2026-11-22. Status: proposed, awaiting approval (Phase 2).

## Context

`vercel.json` already builds with `npm run build`, serves `dist`, and rewrites `/api/*` to the one function `api/index.js`. Nothing is deployed yet. Limits from https://vercel.com/docs/plans/hobby (page dated 2026-11-12, opened 2026-11-22): 1,000,000 CDN requests, 100 GB fast data transfer, 1,000,000 function invocations, 4 active CPU hours a month; 300 s function limit; runtime logs 1 hour; no drains; 3 WAF custom rules; past a limit the feature waits 30 days. Terms limit Hobby to personal, non commercial use (seen through search in Phase 1, page not opened).

## Options

| Option | Cost | Risk | Reversibility | When to pick |
|--------|------|------|---------------|--------------|
| A. Keep Vercel Hobby | 0 dollars | Medium: a 30 day pause if any limit is passed (R6); logs kept 1 hour | High: handlers use standard `Request` and `Response` | **Chosen.** Already configured |
| B. Cloudflare Pages with Pages Functions | 0 dollars | Medium: Functions count against the Workers Free limit of 100,000 requests a day and 10 ms CPU per request (https://developers.cloudflare.com/workers/platform/limits/, opened 2026-11-22); new config to write | High | If Vercel terms or limits change against the demo |
| C. Static host only (GitHub Pages) with predictions precomputed into JSON | 0 dollars | Medium: no API on the demo, the prediction route is no longer exercised (A18) | Medium | If the function ever costs money |
| D. Always on container or small virtual machine | 5 dollars a month and up (not checked today) | Medium: breaks Q10 | High | Never for Tier B at this scale |

## Decision

**Keep** Vercel Hobby. With the sample bundled (0004) and the prediction response cached (0008), the estimate in `docs/design.md` section (f) uses at most 41 percent of any limit at ten times expected traffic.

## Consequences

* 0 dollars, no card. The cost cap is the 30 day pause, which is also the main availability risk (R6).
* A Vercel account and project linked to the fork are outside actions for the user in Phase 3.
* Exit path: static files plus a handler taking a web `Request`; Cloudflare Pages with Functions (Workers Free: 100,000 requests a day, 10 ms CPU each, https://developers.cloudflare.com/workers/platform/limits/, opened 2026-11-22) or any Node host can take it. No data to export.
* What would change this: a change to Hobby terms or limits, or a measured Q2 or Q3 miss caused by the platform.

Detail: `docs/design.md` section (a).

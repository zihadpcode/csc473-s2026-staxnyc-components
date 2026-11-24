# 0004: The demo reads a bundled sample module; Supabase stays for full local mode

Date: 2026-11-22. Status: proposed, awaiting approval (Phase 2).

## Context

The app reads Supabase straight from the browser (`src/lib/api.js`). Decision 0002 chose a labeled sample seed for the demo. Phase 1 numbers that the hosted database fails on a read only demo:

* Q7, 99 percent a month: Supabase Free "paused after 1 week of inactivity" (https://supabase.com/pricing, opened 2026-11-22). Risk R7, high likelihood.
* Q10 and threat T3: 5 GB egress on the free plan that a bot can use up (same page).
* F5 and A9: a fresh clone has no database; the local stack needs a running container runtime.

GitHub disables scheduled workflows in a public repository after 60 days without activity (GitHub docs, seen through search on 2026-11-22; the wording was confirmed on Enterprise Server pages only), so a keep alive job can stop without notice.

## Options

| Option | Cost | Risk | Reversibility | When to pick |
|--------|------|------|---------------|--------------|
| A. Keep: hosted Supabase Free for the demo, a weekly keep alive ping from a GitHub Actions schedule | 0 dollars; an account, a project and a scheduled job | Medium: GitHub disables scheduled workflows in a public repo after 60 days with no activity (GitHub docs, seen via search 2026-11-22), so the ping can stop silently; policies must be right even for read only; egress open to bots | High | If the demo must show live writes or accounts (Tier C) |
| B. Generated sample module in the repo, read by a seed adapter in the browser and by the function; Supabase kept for full local mode | 0 dollars; one generator script, one adapter, contract tests | Low: nothing to pause, no database exposed on the demo; two data paths must stay in step (new R30) | High: set `APP_MODE=full` and point at a database | **Chosen.** Smallest moving parts for a read only demo |
| C. Precompute every page as static HTML at build time | Medium: a prerender step | Medium: a second rendering path, the prediction route stops being a live API | Medium | If Q1 fails after Phase 5 measurement |
| D. Another hosted database (serverless Postgres) | 0 dollars on a free tier; a new account | Medium: new service, the code is bound to `supabase-js` | Medium | Never on present evidence |

## Decision

**Change, additive: option B.** A generator writes `seed/sample-v1.js` (and `supabase/seed.sql` from the same rows). In seed mode the browser reads it through a seed adapter that answers the same seven read functions as `src/lib/api.js`, and the function reads it for predictions. Every existing Supabase read stays as the full mode path. One contract test runs both implementations.

## Consequences

* The demo has no database to pause, expose or exhaust. Boundaries 1, 3, 4 and 5 of the threat model do not exist on the demo.
* Two data paths can drift (new risk R30). The contract test and the shared generator are the guard.
* The demo does not exercise Supabase. Full mode is checked locally with the CLI stack (decision 0006).
* Exit path: the sample is a file in the repo. Moving to a hosted database means `APP_MODE=full` plus migrations and `supabase/seed.sql`.
* What would change this: accounts on the demo (Tier C), or a data source whose terms allow a regularly updated public database.

Detail: `docs/design.md` section (a).

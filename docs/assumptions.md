# Assumptions

Each one is unverified until marked otherwise.

## From Phase 0

1. The fork rebuild (`2e5224b`) is work the user wants to keep as the base. It came in two large commits that have not been reviewed line by line in this phase.
2. The remote refs seen locally are current enough. No fetch was run, so newer team or fork commits may exist.
3. Scale for six months: under 50 visitors a day, a few hundred players, one season of game logs.
4. Budget is 0 dollars a month on free tiers.
5. The public demo can be read only (no accounts, chat or AI) and still serve the portfolio goal.
6. Teammate roles in the brief are read from commit messages and blame; they need the user's confirmation.
7. The team SQL files in copy 5 history are close to the live schema. Not compared against any database.
8. The ignored env files in five copies hold only values that also exist in Supabase or provider dashboards. Their values were not read.
9. Copy 6 commit `09452e7` is not on any current remote. Based only on copy 5 no longer listing that branch.

## Defaults for the Phase 0 open questions

The user approved the brief on 19 November 2026 and asked that the brief's proposed defaults be used for every open question. Each one below was **default, user to confirm**; on 2026-11-22 the user approved the Phase 1 drafts with every default as written, so each is now **accepted 2026-11-22**.

10. **Teammate license.** Default: option A, with option B as the fallback. Until all three teammates (sushanta, Mh0five, Maisha) agree in writing, option B applies: no license file, a README Credits section naming each teammate and their part, a provenance table for derived files, and the words "all rights reserved, shown for portfolio review". The prototype MIT notice is kept for anything taken from it. Nobody has been contacted; asking is the user's step, by 1 December 2026. Default, accepted 2026-11-22.
11. **Demo scope.** Default: a read only public demo. Sign up, sign in, chat, profile edits, admin and AI are off on the demo and keep working locally with tests. The requirements in `docs/requirements.md` therefore assume Tier B for the demo. Default, accepted 2026-11-22.
12. **Data source.** Default: the brief's riskiest assumption experiment (one source, five players, one season, terms read first). Phase 1 research narrows it: see `docs/decisions/0002-demo-data-source.md`. The default taken is a small, labeled seed in the repo; real NBA.com data through `nba_api` only on the user's own machine. Default, accepted 2026-11-22.
13. **Player photos.** Default: treat the four files in `public/images/` as unlicensed until a source is found. The demo uses the initials fallback that already exists. Default, accepted 2026-11-22.
14. **Hours and deadline.** The brief proposed no hours figure. Default: the success check date, 15 December 2026, is the working deadline; hours per week stay unknown and the plan does not depend on a number. Default, accepted 2026-11-22.

## Added in Phase 1 (accepted 2026-11-22)

The quality targets marked "user to confirm" in `docs/requirements.md` section 2 (Q2 to Q7, Q10, Q11, Q14) were accepted as written on 2026-11-22.

The user approved these with the Phase 1 drafts. Accepted means the plan rests on them; it does not mean they were measured.

15. A season has about 450 to 540 rostered players (30 teams, 15 standard plus up to 3 two way spots). From general knowledge, not checked against an official page in this phase. Accepted 2026-11-22.
16. The API reads at most 82 game rows per player (`server/handlers.js:107`), so one season is at most about 45,000 rows in `player_games`. Accepted 2026-11-22.
17. A hiring reviewer spends a few minutes and opens the home, player and compare pages. Not measured. Accepted 2026-11-22.
18. Supabase Auth applies its own default limits on sign in and password reset. Not checked in a project dashboard. Accepted 2026-11-22.

## Added in Phase 2 (proposed 2026-11-22, unverified)

19. The Vercel CDN cache key includes the query string, so adding `v=<seed_version>` to the prediction URL separates seed versions. The cache docs list method, status and header rules but this exact point was not read. Check on the first deploy (Phase 3 slice 3.7).
20. Traffic per visit for the cost estimate: 5 page views, about 27 CDN requests, about 0.7 MB, 3 prediction calls with at most half missing the cache, plus an uptime check every 5 minutes. Not measured; no build was run, so the bundle size is unknown.
21. The model takes about 1 ms per call (Phase 1 reading of the code); the budget allows 20 ms. Not measured.
22. Vite puts the dynamically imported sample module in its own chunk of roughly 150 KB before compression (30 players, at most 2,100 game rows). Not built or measured.
23. Vercel supports the Node 22 major used by `package.json` engines. Not checked today; Phase 3 reads the supported versions page before pinning.
24. Vercel passes a request id header to the function that can be reused as `request_id`. Not checked; the design falls back to a random UUID.
25. GitHub Actions minutes are free for a public repository. Not checked today; Phase 3 checks before adding CI.

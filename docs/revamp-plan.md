# StaxNYC: revamp plan

Written 16 November 2026. Each phase still waits for the user's go ahead.

## Phases from here

| Phase | State today | Evidence |
|-------|-------------|----------|
| 0 Frame | In progress | This folder |
| 1 Requirements and risk | Partly met. Flows and limits are written in prose | `README.md` Features, `docs/FEATURE_AUDIT.md`. No numbers, no data classes, no threat model, no license check |
| 2 Design | Partly met. Stack chosen and working | `vite.config.js`, `server/`, `vercel.json`. No decision notes, no diagram, no schema in repo |
| 3 Scaffold | Partly met | Lockfile and test runner yes. No CI, lint, format, type check, logging. No deploy, no rollback |
| 4 Slices | Mostly met in code | 19 pages, browser specs claim 26 scenarios. Not verified against real data |
| 5 Harden | Not met | Defects in `docs/current-state.md` section 6 |
| 6 Deploy | Not met | No live demo found |
| 7 Validate | Not met | No users tested |
| 8 Maintain | Not met | |

## Restructuring proposed

* **Copies.** Follow the consolidation table in `docs/current-state.md`. Save three pieces of unique work as patches first. No deletes without the user's yes.
* **Branches.** Make the fork's `main` the rebuild line once the user approves (today `main` is still HW6). Keep a `team-final` tag or note that points to the team repo commit `9c9aadd` for history.
* **Repo layout.** Add `supabase/migrations/` with the schema and policies the app needs, `supabase/seed/` with a small legal data sample, `docs/architecture.md`, `docs/runbook.md`, `.github/workflows/ci.yml`, `.nvmrc`.
* **Dead or heavy code.** `src/legacy.css` (1,226 lines) under `src/index.css` (1,670 lines): measure what is used, then cut. Move `WembyAnimDemoPage.jsx` (786 lines, mostly sushanta's) behind a lazy route or out of the core build. Decide on the four player photos.
* **Naming.** `package.json` name `staxnyc-workspace` versus README title; pick one.

## First slices, in order

Each slice is small, testable and lands with its own check.

1. **Credits and license.** README Credits section naming each teammate and what they built, a `NOTICE` that carries the prototype MIT notice, a provenance table for derived files, and the license chosen in the brief (MIT if teammates agree). Check: every file with more than 0.5 line similarity to team code is listed (script in Phase 1).
2. **Prove the build.** Install from the lockfile, run `npm test`, `npm run build`, `npm run test:browser`, record output, add CI running them plus a secret scan and `npm audit`. Check: CI green on a branch in the fork.
3. **Own the data (riskiest assumption).** Schema and RLS policies as migrations in the repo, restored from the team SQL and the tables the app reads; seed five players with 20 or more games from a source whose terms are recorded. Check: a fresh local Supabase plus seed shows a real projection; a policy test proves a member cannot edit another profile or set `role`.
4. **Fix the known defects.** The wrong error text (`src/lib/api.js:161`, `:183`), search escaping (`:30`), the update allow list (`:209`), passing the clock into the model (`server/prediction.js:16`). Check: one unit test per fix.
5. **Cap the open paths.** Rate limit and cache placement for `/api/player-prediction`, a shared limit or AI off on the demo, security headers and a content security policy in `vercel.json`. Check: tests for 429 and the headers.
6. **Read only demo deploy.** Tier B demo with sign up, chat and AI off, a runbook and one rehearsed rollback. Check: the success outcome dry run.

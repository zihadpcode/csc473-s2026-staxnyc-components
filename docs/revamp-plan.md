# StaxNYC: revamp plan

Written 16 November 2026. Updated 2026-11-22 in Phase 2 so the Phase 3 and 4 slices match `docs/design.md`. Each phase still waits for the user's go ahead.

## Phases from here

| Phase | State on 2026-11-22 | Evidence |
|-------|---------------------|----------|
| 0 Frame | Approved 19 November 2026 | `docs/brief.md` |
| 1 Requirements and risk | Approved 2026-11-22 | `docs/requirements.md`, `docs/threat-model.md`, `docs/risks.md`, `docs/acceptance-tests.md` |
| 2 Design | Written, awaiting approval | `docs/design.md`, decisions 0003 to 0009 |
| 3 Scaffold | Partly met | Lockfile and test runner yes. No CI, lint, format, type check, logging, deploy or rollback |
| 4 Slices | Mostly met in code, not on data | 19 pages; no seed, no policies |
| 5 to 8 | Not met | `docs/current-state.md` sections 5 and 6 |

## Restructuring proposed

* **Copies.** Follow the consolidation table in `docs/current-state.md`. Save three pieces of unique work as patches first. No deletes without the user's yes.
* **Branches.** Make the fork's `main` the rebuild line once the user approves (today `main` is still HW6). Keep a `team-final` tag or note that points to the team repo commit `9c9aadd` for history.
* **Repo layout.** Add `supabase/migrations/` and `supabase/tests/` with the schema and policies the app needs, `scripts/seed/` and `seed/` for the labeled sample (decision 0004), the architecture diagram (now in `docs/design.md` section (g)), `docs/runbook.md`, `.github/workflows/ci.yml`, `.nvmrc`.
* **Dead or heavy code.** `src/legacy.css` (1,226 lines) under `src/index.css` (1,670 lines): measure what is used, then cut. `WembyAnimDemoPage.jsx` (786 lines, mostly sushanta's) is already lazy loaded (`src/App.jsx:10`); seed mode hides it (decision 0009). Decide on the four player photos.
* **Naming.** `package.json` name `staxnyc-workspace` versus README title; pick one.

## Outside actions, in one place

Slices with a code in the Outside column need a step that reaches off this machine: a network install, an account, a push to a remote, a dashboard change or a deploy. Each needs the user's yes at the time.

| Code | Outside action |
|------|----------------|
| O1 | Network install from the lockfile (`npm ci`) and new dev dependencies |
| O2 | Push a branch to the user's fork so GitHub Actions runs |
| O3 | Vercel account, a project linked to the fork, project settings (`APP_MODE`, `VITE_APP_MODE`) |
| O4 | Deploy, and promote a previous deployment for rollback |
| O5 | Vercel dashboard: WAF rate limit rule, deployment protection on previews |
| O6 | Docker running and the Supabase CLI local stack (pulls container images) |
| O7 | Download the Inter font files for self hosting |
| O8 | Message the three teammates about the license |

## Phase 3: scaffold and walking skeleton

| # | Slice | Design link | Check | Outside |
|---|-------|-------------|-------|---------|
| 3.1 | Prove the build: install from the lockfile, run `npm test`, `npm run build`, `npm run test:browser`, record output | D1 | All suites run; failures listed, not hidden | O1 |
| 3.2 | Tooling: `.nvmrc`, lint, format, `tsc --checkJs` on `server/` and `src/lib/` | D1, decision 0003 | Each command exits 0 on the current code or the failures are listed | O1 (new dev dependencies, ask first) |
| 3.3 | CI: lint, types, unit tests, browser tests in seed mode, secret scan, `npm audit` | master prompt 3 | Green run on a branch of the fork | O2 |
| 3.4 | Config: `server/config.js`, `APP_MODE` and `VITE_APP_MODE`, `.env.example` updated, fail closed rules | C5, decision 0009 | Unit tests for each refusal (service role key, AI key in seed mode, unknown mode) | None |
| 3.5 | Logging and health: one JSON line per API request, `x-request-id`, error body with `request_id`, health reports `app_mode` and `seed_version` | C2, C6, decision 0008 | Unit test captures the line and finds no token (A32) | None |
| 3.6 | Walking skeleton: generator, `seed/sample-v1.js`, seed adapter for `getPlayerById` and `getPlayerGames`, server seed source, `now` passed to the model, sample label, cache header | (h), decisions 0004, 0008 | Fresh clone `npm ci` and `npm run dev` opens a sample player with a projection; generator determinism test; contract test for the two reads | O1 |
| 3.7 | Deploy the skeleton: Vercel project, settings, first deploy, `headers` block in `vercel.json`, WAF rule written in `docs/runbook.md` and created | D3, D6 | Production URL serves the player page; `/api/health` says `seed`; headers present (A31) | O3, O4, O5 |
| 3.8 | Prove rollback: promote the previous deployment once, time it, record it | master prompt 3 | Previous version served; steps in the runbook | O4 |

## Phase 4: vertical slices

Ordered by user value and risk. The data assumption is already settled by decision 0002, so the first slice takes the largest remaining high damage risk (R1).

| # | Slice | Acceptance tests | Risks | Outside |
|---|-------|------------------|-------|---------|
| 4.1 | Credits and license: README Credits naming each teammate and part, `NOTICE` with the prototype MIT notice, provenance table, option B wording until all three say yes in writing | A10 | R1, R8, R22 | O8 (the user asks the teammates) |
| 4.2 | F1 projection on the seed for all 30 players: not enough data state, response fields, in code limiter on the prediction route with a fake clock | A1, A2, A3, A29, A30, A18 on the deploy | R6, R16, R17 | O4 to measure on the demo |
| 4.3 | F2 search and directory through the seed adapter; escape fix in the Supabase path (`src/lib/api.js:30`); contract tests for both | A4, A5, A20, A21 | R13, R30 | None |
| 4.4 | F3 compare in seed mode with the AI section hidden and the AI routes answering 404 | A6, A7 | R14 | None |
| 4.5 | F4 standings and rosters from the seed; decide the old snapshot file | A8 | R34 | None |
| 4.6 | Seed mode route hiding (accounts, chat, admin, highlights, animation demo), sample label on every page, self hosted font, content security policy tightened | A31 | R11, R31 | O7 |
| 4.7 | F5 fresh clone: README rewritten for seed mode (two commands) and full mode; timed fresh clone by the user | A9 | R26 | None |
| 4.8 | Full local mode: migrations, policies, `approve_change_request`, `supabase/seed.sql`, policy tests; `updateFeaturedPlayer` allow list; the wrong error text at `src/lib/api.js:161` and `:183`; realtime filter id check; body size counted in bytes | A11 to A16 | R4, R18, R33 | O1, O6 |

Phase 5 then measures Q1 to Q5 on the deploy and runs the security, reliability, accessibility and dependency passes.

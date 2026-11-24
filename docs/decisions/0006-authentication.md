# 0006: Keep Supabase Auth, off on the demo, tested locally

Date: 2026-11-22. Status: proposed, awaiting approval (Phase 2).

## Context

Accounts use Supabase Auth with email and password (`src/lib/auth.js`). Admin is decided in the browser from `profile.role` (`src/lib/AuthContext.jsx:71`). The database policies that really enforce access are not in the repo (R4, threats T1 and T2). The demo is read only (assumption 11), so accounts are C, local only.

The Supabase CLI runs the full stack locally in containers and installs as a project dev dependency (https://supabase.com/docs/guides/local-development/cli/getting-started, opened 2026-11-22). On this machine the Docker command exists (29.8.0) but its daemon was not running on 2026-11-22.

## Options

| Option | Cost | Risk | Reversibility | When to pick |
|--------|------|------|---------------|--------------|
| A. Keep Supabase Auth; off on the demo; locally run the Supabase CLI stack (`npx supabase start`) with migrations, seed and policy tests | 0 dollars; the `supabase` dev dependency and a container runtime | Medium: needs Docker running (the CLI is at `/usr/local/bin/docker`, version 29.8.0, but the daemon was not running on 2026-11-22) | High | **Chosen.** Policies become reviewable and testable without a hosted project |
| B. Keep Supabase Auth; locally use a free hosted project the user owns | 0 dollars; one account and project | Medium: pauses after a week idle, uses one of two free projects, tests touch a remote | High | Fallback if Docker cannot run |
| C. Cut accounts, chat and admin entirely | Low | Low; loses F6 and F7 and much of the team work | Low: code removed | If the policy work does not fit by 15 December 2026 |
| D. Another identity provider | High: rewrite of `src/lib/auth.js` and `AuthContext.jsx` | Medium | Medium | Never on present evidence |

## Decision

**Keep** Supabase Auth and keep it off on the demo (0009 hides the routes). Write the schema, policies and an `approve_change_request` function as migrations in `supabase/migrations/`, with one SQL test per rule, run against the local CLI stack. Fallback: a free hosted project the user owns, if Docker cannot run.

## Consequences

* Policies become reviewable and testable (A11, A12, A14, A16).
* New dev dependency `supabase` and a running container runtime for full mode only; seed mode needs neither.
* Phase 4 compares the team SQL files in copy 5 history, read only, before the first migration.
* What would change this: accounts going live on the demo (Tier C, with backups and a rehearsed restore), or no time for policy work before 15 December 2026 (then option C, cut the features).

Detail: `docs/design.md` section (a).

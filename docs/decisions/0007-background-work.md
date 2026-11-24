# 0007: No background work

Date: 2026-11-22. Status: proposed, awaiting approval (Phase 2).

## Context

The team filled its tables with sync jobs that live outside this repo. Decision 0002 rules out NBA.com and Sports Reference data on the demo. Decision 0004 removes the database from the demo, so nothing needs to stay awake.

## Options

| Option | Cost | Risk | Reversibility | When to pick |
|--------|------|------|---------------|--------------|
| A. No background work; the seed is generated offline and committed | 0 | Low | High | **Chosen** |
| B. A scheduled sync from NBA.com through `nba_api` | 0 dollars | High: NBA.com terms reserve a regularly updated statistics database for consent (R3, decision 0002) | Medium | Never on the demo |
| C. A keep alive ping for a hosted Supabase | 0 | Medium: silent stop after 60 days idle | High | Only if D2 option A is ever taken |

## Decision

**Keep none.** The seed is generated offline by `scripts/seed/generate.mjs` and committed. No schedule, queue or worker. The copy 6 scripts are not reused. A private `nba_api` loader on the user's own machine stays in the backlog.

## Consequences

* No silent job failure to monitor (master prompt section 9).
* Data on the demo changes only with a commit and a deploy.
* What would change this: a source whose terms allow regular public updates, recorded in decision 0002.

Detail: `docs/design.md` section (a).

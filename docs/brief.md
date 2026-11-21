# StaxNYC: Phase 0 brief

Status: draft, awaiting approval. Written 16 November 2026.

## Problem

**Who.** NBA fans who want quick answers about players: how is this player doing, how does he compare, what might he score next.
For the revamp there is a second reader: a hiring reviewer who opens the user's portfolio.

**What they do today.** Fans use NBA.com, Basketball Reference or ESPN. Those have the stats but give no honest next game estimate with its error shown.
The reviewer today finds a class project spread over two team repos, a fork with one HW6 commit on `main`, no license, and teammates not named.

**What changes.** One repo the user owns, with teammates credited by name, a clear license story, and a demo that runs on data and services the user controls.
The core view stays: search a player, see recent games, see a projection next to a naive baseline with the measured error.

## Success outcome

By **15 December 2026**, a person who has never seen the project clones the fork, follows the README with at most three commands,
and completes 5 of 5 core flows (search, player page with projection, compare, standings, sign in) against a demo the user owns.
Checked by one friend or classmate on that date, with what confused them logged in `docs/progress.md`.

## Out of scope

* Pushing anything to the Sushanta451 repos, or using the team's live Supabase project for the demo.
* Betting advice, injury aware or opponent aware models, claims of model accuracy beyond the measured validation error.
* Mobile apps, payments, new social features.
* Restoring every team feature (chat, Wemby demo, admin highlights) before the core five flows work.
* Rebuilding the team's sync jobs before a data source and its terms are chosen.

## Prior art

Search on 16 November 2026 (results only, no code run):

* NBA.com, Basketball Reference, ESPN: complete stats, no open projection with error.
* `nba_api` (Python, MIT license; data is under NBA.com terms). The team already used it.
* Open repos: Ballr (player comparison), ShotGeek (Django comparisons), CourtIQ (React and FastAPI with an expected points model, reported MIT). None combines this project's flows.

| Option | Cost | Risk | Reversibility | When to pick |
|--------|------|------|---------------|--------------|
| Build: keep the fork rebuild, add own schema, seed data and credits | Medium, mostly docs, SQL and tests | Medium, data rights and the large unreviewed rebuild | High, it is all in the user's repo | The user wants a piece they can explain end to end |
| Adopt: point readers to the team final repo | Lowest | High, the user owns nothing and no license | High | Only if the portfolio entry is just a link |
| Adapt: rebase on a public project like CourtIQ | High | High, new stack and a new license to honor | Medium | If the prediction model were the whole point |

**Recommendation: build** on the fork rebuild. It already has the most features, tests and honest caveats, and it sits in the user's own account.

### License and credit options

| Option | Cost | Risk | Reversibility | When to pick |
|--------|------|------|---------------|--------------|
| A. Ask teammates (sushanta, Mh0five, Maisha) to agree in writing to MIT on the components work, then add MIT with all names | One message | Low, if they agree | High | Best outcome; the prototype repo is already MIT |
| B. No license yet; README credits each teammate by name and lists files derived from their work; state "all rights reserved, shown for portfolio review" | Low | Medium, others cannot reuse it, but it is honest | High | If teammates do not answer by the date below |
| C. Remove or rewrite every file with teammate lines, then license only the user's own code | High | Medium, easy to miss a file | Medium | If a teammate objects |

**Recommendation: A, with B as the fallback.** Either way, the README gets a Credits section naming each teammate and their part
(sushanta: team lead, live games, chat, predictions modal, profile and Wemby demo; Mh0five: nba_api sync, standings, rosters, team branding, compare; Maisha: animations and UI).
Roles are drawn from commit messages and need the user's confirmation. The MIT notice from the prototype repo must be kept for anything taken from it.

## Riskiest assumption

That the user can get real NBA data into a Supabase project they own, legally and for free, enough for a projection (20 or more games per player).
If false, the demo has no real players and the success outcome fails.

**Cheapest experiment (about one hour).** Create a free Supabase project, apply the team's three migration files from copy 5 history,
load one season of game logs for five players from one source, and open one player page.
Read that source's terms first. Disproved if the schema does not fit the app or no source allows this use.

## Rigor tier

**Tier C as built** (accounts, emails, chat, an optional paid AI key). That is heavy for a portfolio demo.

Proposal: run the public demo as **Tier B** by turning off sign up, chat and AI on the demo (read only data, no personal data),
and keep the account features working locally with tests. Tier B skips the written threat model in full, the rehearsed restore and the on call runbook,
because no personal data or money would be held. If the user wants accounts live on the demo, the tier is C and those items return.

## Open questions

| Question | Who | By |
|----------|-----|----|
| Will the teammates agree to MIT on the components work? | User asks them | 1 December 2026 |
| Accounts and chat on the public demo, or a read only demo? | User | 24 November 2026 |
| Which data source, and do its terms allow a free public demo? | User with Phase 1 research | 1 December 2026 |
| Where did `public/images/*.png` come from? | User or teammates | 1 December 2026 |
| Hours per week and any deadline (applications, interviews)? | User | 24 November 2026 |

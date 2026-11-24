# StaxNYC: requirements

Phase 1. Written 19 November 2026. Status: approved by the user on 2026-11-22.

## Which tier these requirements assume

**As built, the code is Tier C.** It has email and password accounts, display names, bios, avatar links, chat messages tied to user ids, admin roles and an optional paid AI key (`src/lib/auth.js:2` to `18`, `src/lib/api.js:317` to `334`, `server/services.js:49`).

**These requirements assume Tier B for the public demo.** The user took the brief's default (assumption 11): a read only demo with sign up, chat, profile edits, admin and AI switched off, holding no personal data and no paid key. A portfolio reviewer needs to see players, projections and comparisons, not to create an account. Tier B lets the project skip the rehearsed restore and the on call runbook, and costs nothing.

**The account features still exist locally.** Where a requirement covers accounts, chat or AI, it is marked **C, local only** and is checked with tests against a local database, not on the demo. If the user later wants accounts live on the demo, every item marked C becomes a demo requirement, and a backup and restore plan becomes mandatory (free Supabase has no automatic backups, see section 4).

## 1. User flows

Ordered by value to the two readers in the brief: a fan, and a hiring reviewer.

### F1. See a player's projection with its error (B)

* **Actor:** visitor, no account.
* **Trigger:** opens `/player/:id` from search, the directory or a link.
* **Steps:** page loads season stats and the ten most recent games; the chart shows points, rebounds or assists; the page calls `GET /api/player-prediction?player_id=…`.
* **Result:** a projected points value, a historical error range, the validation error next to the naive baseline error, and the number of games used. With fewer than 20 valid games, a clear "not enough data" state instead (`server/prediction.js:54` to `61`).

### F2. Find a player (B)

* **Actor:** visitor.
* **Trigger:** types a name in the home search or opens `/players`.
* **Steps:** search suggests up to 12 names (`src/lib/api.js:26` to `34`); keyboard selection works; the directory filters by team and sorts by a stat.
* **Result:** lands on the right player page. An empty search result says so.

### F3. Compare two to four players (B)

* **Actor:** visitor.
* **Trigger:** opens `/compare` or adds players from the directory stack.
* **Steps:** picks two to four players; sees the radar, the nine stat table and the deterministic insights; the selection is in the URL.
* **Result:** a bookmarkable comparison. The AI explanation button is hidden or explains that AI is off on the demo.

### F4. Read standings and a team roster (B)

* **Actor:** visitor.
* **Trigger:** opens `/standings`, then a team.
* **Steps:** standings load from the database, or the labeled snapshot when the table is empty or missing; the roster route lists that team's players for the season.
* **Result:** standings with their source and date shown, and a roster that links to player pages.

### F5. Run the project from a fresh clone (B)

* **Actor:** a reviewer or the user on a new machine.
* **Trigger:** clones the fork and opens the README.
* **Steps:** at most three commands (install, prepare the local database with the seed, start).
* **Result:** the four flows above work on seed data. This is the success outcome in `docs/brief.md`.

### F6. Sign in, edit a profile, chat during a game (C, local only)

* **Actor:** member.
* **Trigger:** signs up or signs in, opens `/profile` or a game's chat.
* **Steps:** bio edits save at once; name and avatar changes become requests; chat accepts 1 to 500 characters and shows new messages in real time.
* **Result:** the member changes only their own data. Another member's profile and role cannot be changed.

### F7. Curate and moderate as an admin (C, local only)

* **Actor:** admin.
* **Trigger:** opens `/admin`.
* **Steps:** approves or rejects profile requests; adds, orders, shows, hides and removes featured players; hides highlights; removes chat messages and games.
* **Result:** changes take effect for all visitors; a non admin who tries the same calls is refused by the database.

## 2. Quality requirements

Nothing below has been measured. No database or deploy exists to measure against (`docs/current-state.md` section 4). Every number is either derived from evidence named beside it or is a **target the user must confirm**.

| # | Quality | Number | Basis |
|---|---------|--------|-------|
| Q1 | Page load, key pages (home, player, compare) | Largest contentful paint within 2.5 s, interaction to next paint within 200 ms, layout shift within 0.1, at the 75th percentile, phone profile | Master prompt section 7 default |
| Q2 | `GET /api/player-prediction`, warm | p95 within 800 ms, server side | Target, user to confirm. Two database reads plus about 1 ms of math (`server/handlers.js:95` to `121`) |
| Q3 | `GET /api/player-prediction`, first call after idle | p95 within 3 s | Target, user to confirm. Serverless cold start plus the same two reads. The code already caps each read at 12 s (`server/services.js:43`) |
| Q4 | Player search suggestions | p95 within 500 ms from keystroke pause to list | Target, user to confirm |
| Q5 | Player directory load | p95 within 1.5 s for one season (about 540 rows) | Target, user to confirm. Today it pulls every column in pages of 500 (`src/lib/api.js:236` to `252`) |
| Q6 | AI explanation (C, local only) | p95 within 8 s; hard stop at 20 s | 20 s timeout in code (`server/services.js:70`); 8 s is a target, user to confirm |
| Q7 | Demo availability | 99 percent per calendar month (about 7 hours down) | Target, user to confirm. Tier B accepts a provider outage. Free Supabase pauses a project after one week with no activity (pricing page, checked 19 November 2026), so the demo needs either a weekly visit or a static fallback |
| Q8 | Data volume | Demo seed: at most 30 players, one season, at most 2,500 game rows, under 10 MB. Local full season: at most about 540 players and 45,000 game rows, under 100 MB | Assumptions 15 and 16. Free Supabase database limit is 500 MB (pricing page, checked 19 November 2026) |
| Q9 | Concurrency | Designed for 10 visitors at once; load tested at 30 | Assumption 3 (under 50 visitors a day) gives a peak near 5; 10 is headroom, 30 is three times that, per Phase 7 |
| Q10 | Monthly cost ceiling | 0 dollars for the demo. If the user enables AI locally, a prepaid DeepSeek balance of at most 5 dollars | Assumption 4. The 5 dollar figure is a target, user to confirm. Vercel Hobby pauses usage instead of billing when a limit is passed (Hobby docs, checked 19 November 2026) |
| Q11 | Recovery time | Demo rebuilt from the repo within 2 hours | Target, user to confirm. Possible only once schema and seed live in the repo (revamp plan slice 3) |
| Q12 | Acceptable data loss | Demo: none, because all demo data is the seed in the repo. Accounts (C, local only): any, since local accounts are test data. If accounts ever go live: at most 24 hours, which needs backups the free tier does not include | Supabase pricing page, checked 19 November 2026 |
| Q13 | Prediction honesty | Every shown projection states games used, validation error, baseline error and whether it beats the baseline; no projection below 20 valid games | `server/prediction.js:54`, `:89` to `109`, brief out of scope list |
| Q14 | Abuse limit on the open prediction route | At most 60 calls per minute per address, answered with 429 beyond that | Target, user to confirm. Today there is no limit (`server/handlers.js:91` to `128`) |

Items from the master prompt that Tier B relaxes here: the rehearsed restore (Q11 and Q12 show why it is not needed for seed data), alerting to a phone, and a second provider for backups.

## 3. Data classification

Classes: public, internal, personal, secret. "Anyone" means any visitor holding the publishable key, which ships in the browser bundle by design.

| Data | Class | Where stored | Who can read it today | Notes |
|------|-------|--------------|-----------------------|-------|
| Player season stats (`player_stats`) | Public, third party rights | Supabase table | Anyone (browser reads it, `src/lib/api.js:3`) | Rights depend on the source, see section 4 |
| Game logs (`player_games`) | Public, third party rights | Supabase table | Anyone | Same |
| Schedules and scores (`live_games`) | Public, third party rights | Supabase table | Anyone | Same |
| Standings (`nba_standings`) and snapshot | Public, third party rights | Supabase table; `src/data/standings.js` in the repo | Anyone | Snapshot is in the public repo |
| Rosters (`nba_team_rosters`) | Public, third party rights | Supabase table | Anyone | |
| Stored game predictions (`game_predictions`) | Public | Supabase table | Anyone | Written by a team job outside this repo |
| Highlights (`game_highlights`) | Public | Supabase table; video on YouTube | Anyone | Only video ids are stored |
| Featured players (`featured_players`) | Public | Supabase table | Anyone reads; only admins should write | Write rule lives in unseen policies |
| Model output (projection) | Public | Computed per request; cached in function memory 5 minutes (`server/handlers.js:123` to `126`) | Anyone | |
| Saved player stack | Public, per browser | Browser local storage (`src/hooks/usePlayerStack.jsx:10`, `:18`) | That browser only | Player ids only |
| Supabase URL and publishable key | Public by design | `.env` (ignored), browser bundle | Anyone | Must never be a secret or service role key (`server/services.js:15` to `35`) |
| Email address | Personal | Supabase Auth | The member; project owners in the Supabase dashboard | C, local only on the demo plan |
| Password | Secret | Supabase Auth, hashed by the provider | Nobody in the app | Hashing is the provider's; not checked here |
| Session access and refresh tokens | Secret | Browser local storage (supabase-js default) | Any script running on the site's origin | Why a content security policy matters |
| Display name, avatar link, bio, join date (`user_profiles`) | Personal, shown publicly by design | Supabase table | Anyone through the public profile route (`src/lib/api.js:286` to `295`) | The member chooses what to publish |
| Role (`user_profiles.role`) | Internal | Supabase table | The member and admins, by the intended policy | Must not be writable by members |
| Profile change requests | Personal | Supabase table | The member and admins, by the intended policy | |
| Chat messages | Personal | Supabase table, sent over Supabase Realtime | Anyone, by the current design (`src/lib/api.js:306` to `316`) | Tied to a user id |
| AI questions and stored prediction rows sent for explanation | Personal (question text) and public (row) | Sent to DeepSeek; not stored by the app | DeepSeek, under its privacy policy | C, local only. DeepSeek's policy states no fixed retention for inputs (search, 19 November 2026) |
| `DEEPSEEK_API_KEY` | Secret | Server environment only | Server process | Never `VITE_` prefixed (`.env.example`) |
| Supabase service role key | Secret | Must not exist in this app | Nobody | Refused by code (`server/services.js:16`, `:21` to `34`) |
| Env files in five old copies | Secret, values unknown | Old local copies, ignored by git | The user | Not read in either phase |
| Logs | Internal | None exist today | Not applicable | Gap, see the threat model |

## 4. Licenses, data rights and terms of service

This is not legal advice. It records what the pages say on the date checked. Links were opened or searched on **19 November 2026** unless noted.

### Project code, credits and teammate consent (open items)

| Item | What the evidence shows | Open item and owner |
|------|-------------------------|---------------------|
| License of the fork | None. No `LICENSE` on `main` or the rebuild branch (`docs/current-state.md` section 2) | Pick option A or B from the brief. User |
| Teammate code inside the rebuild | Line similarity 0.67 to 1.00 for `src/lib/teamBranding.js`, `src/lib/nbaTeamIds.js`, `src/pages/WembyAnimDemoPage.jsx`, `src/lib/nbaSeason.js`; designs and table contracts of chat, rosters, profiles and the prediction modal come from teammates (`src/lib/api.js:254`) | Written consent from sushanta, Mh0five and Maisha for option A. Not contacted. User, by 1 December 2026 |
| Credits | README says "newer team component files" and names nobody (`README.md:3`) | Credits section with each name and part; roles need the user's confirmation (assumption 6). Slice 1 |
| Prototype repo code | MIT, "Copyright (c) 2026 Sushanta451" (`docs/current-state.md` section 2) | Keep that notice in a `NOTICE` file for anything taken from it. Slice 1 |
| Commit history | One author in the fork history while the code carries four people's work | Provenance table in the README or `NOTICE`. Slice 1 |
| Work in old copies | Copy 1 `a355196` changes mock player data; copy 3 has three uncommitted UI files; copy 6 `09452e7` holds a standings migration and sync scripts (`scripts/sync_nba_to_supabase.py`, `scripts/fetch-current-nba-data.mjs`). Read only in this phase | Authorship of copy 6 scripts not yet checked by blame. Decide before reusing any of it. User |
| Player photos `public/images/*.png` | Four photos of real players, no source recorded | Default: unlicensed, use the initials fallback on the demo (assumption 13). User or teammates to name the source |

### Outside data sources

| Source | Terms found | What it means here | Link |
|--------|-------------|--------------------|------|
| NBA.com (data behind `nba_api`, used by the team) | Terms last updated 13 July 2026. Statistics may be used "for legitimate news reporting or private, non-commercial purposes" with prominent attribution. A service that "features a database … of comprehensive, regularly updated statistics" needs prior consent. Downloads are for "personal, noncommercial use" on a single computer | A private local copy for study fits the wording. A public demo serving a regularly synced stats database appears to need consent. Do not mirror NBA.com data on the public demo | https://www.nba.com/termsofuse |
| `nba_api` package | MIT. README says data "is subject to the NBA.com Terms of Use" and the project is not affiliated with the NBA | Code license is fine; the data question is NBA.com's | https://github.com/swar/nba_api |
| Sports Reference (copy 6 script scrapes basketball-reference.com) | Data use page: no "automated means to access or use the Site" without written permission; "you should not create websites or tools based on data you scrape"; no competing data store | The copy 6 scraper conflicts with these terms. Do not reuse it | https://www.sports-reference.com/data_use.html |
| balldontlie | Official pages seen in search: free key at 5 requests a minute; paid tiers 9.99 and 39.99 dollars a month; several reports say game stats need a paid tier. Its terms of service were **not found or read** | Possible seed source only after its terms are read and allow display. Open item | https://www.balldontlie.io/account/ , https://docs.balldontlie.io/ |
| YouTube embeds (`src/components/highlights/HighlightCard.jsx:29`) | Required Minimum Functionality: player at least 200 by 200 px, no autoplay unless more than half visible, send a Referer, do not block standard controls | Standard embed use. Check the size and Referer rules in Phase 5. Uses the `youtube-nocookie.com` host | https://developers.google.com/youtube/terms/required-minimum-functionality |
| Google Fonts, Inter (`index.html:11` to `16`) | Inter is under the SIL Open Font License 1.1 (from general knowledge, not checked today). Loading from Google sends visitor addresses to Google | Licensed for this use; a privacy and content security policy note. Self hosting is the alternative | https://fonts.google.com/specimen/Inter |

### Outside services

| Service | Terms and limits found | What it means here | Link |
|---------|------------------------|--------------------|------|
| Supabase, Free plan | 500 MB database per project, 50,000 monthly active users, 5 GB egress, 200 concurrent Realtime connections, 2 active free projects, **pauses after one week inactive**, **no automatic backups** | Fits the demo numbers in Q8 and Q9. Pausing threatens Q7. No backups is why accounts on the demo would push recovery out of reach | https://supabase.com/pricing |
| Vercel, Hobby plan | Free; 1,000,000 function invocations, 4 active CPU hours, 100 GB fast data transfer a month; 300 s function limit; usage past a limit pauses for up to 30 days; runtime logs kept 1 hour. Terms limit Hobby to "personal, non-commercial use" (search of vercel.com/terms, page itself not opened) | A portfolio demo is personal use as far as the wording shows. The pause behavior is the cost cap (Q10). One hour of logs limits incident review | https://vercel.com/docs/plans/hobby , https://vercel.com/terms |
| DeepSeek API (optional) | No free tier listed. deepseek-flash 0.15 to 0.30 dollars per million input tokens, 0.60 to 1.20 per million output. Privacy policy keeps inputs while the account exists; no zero retention option was found (search results, full terms not read) | 400 output tokens per call (`server/services.js:68`) is at most about 0.0005 dollars per call. Off on the demo. Questions leave the machine for a provider under Chinese law | https://api-docs.deepseek.com/quick_start/pricing , https://cdn.deepseek.com/policies/en-US/deepseek-open-platform-terms-of-service.html |

### Key dependencies

From `package-lock.json` (82 packages; checked 19 November 2026, license field as recorded in the lockfile, not from each package's own file):

| Package | Version | License |
|---------|---------|---------|
| react, react-dom | 18.3.1 | MIT |
| react-router-dom | 7.18.4 | MIT |
| @supabase/supabase-js | 2.101.0 | MIT |
| ai | 7.0.143 | Apache 2.0 |
| @ai-sdk/openai-compatible | 3.0.71 | Apache 2.0 |
| vite | 8.3.4 | MIT |
| @vitejs/plugin-react | 6.1.2 | MIT |
| @playwright/test | 1.63.0 | Apache 2.0 |

All 82: 55 MIT, 11 Apache 2.0, 12 MPL 2.0 (all `lightningcss` build packages, dev only, not shipped), 1 ISC, 1 BSD 3 Clause, 1 0BSD, 1 AFL 2.1 or BSD 3 Clause (`json-schema`). None of these blocks either license option. MPL 2.0 applies to changed files of that package only, and none are changed or shipped.

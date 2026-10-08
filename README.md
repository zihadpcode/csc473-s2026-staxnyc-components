# StaxNYC — Basketball Intelligence

A rebuilt basketball research workspace using the original repository's React components, Supabase data contract, standings dataset, game cards, charts, profile workflow, and admin tools.

## Run locally

Requires Node.js 22.12 or newer.

```sh
npm ci
cp .env.example .env
npm run dev
```

Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` to connect your existing Supabase project. The old `VITE_SUPABASE_KEY` anonymous-key setting remains supported. Without these values the site opens in Explore mode: navigation and the saved standings work, data screens explain the missing connection, and account forms are disabled. No fake NBA data is displayed.

## The workspace

- Overview: scoring leaders from the connected roster and shortcuts to research tools.
- Players: full player directory, name search, team filtering, and stat sorting.
- My stack: save up to 50 player IDs in this browser. Records and stats are read from the current connected roster. Unavailable saved records can be removed. The stack is shared across tabs in the same browser, not across accounts or devices.
- Player profile: season stats and the last 10 game logs, loaded independently.
- Compare: up to four players, distinct colors, chart visibility, raw-stat table, and bookmarkable selection in the URL.
- Game center: today's feed, refresh/retry, visible-tab polling, and explicit stale-data errors.
- Standings: original repository snapshot, with conference filters and team search. The original file has no season or update date and is not a live standings feed.
- Highlights: videos from the existing database feed, with loading/error/empty states.
- Accounts and administration: existing profile-change and featured-player workflows, with email/password authentication replacing the original shared test password.

The original repository did not contain a connected prediction API or model. The UI explicitly reports that limitation instead of inventing projections.

## Existing data contract

Retained tables: `player_stats`, `player_games`, `live_games`, `game_highlights`, `featured_players`, `user_profiles`, and `profile_change_requests`. No production database changes are included.

The existing deployment must enforce access with database row-level security. Browser admin checks control navigation only. Profile rows and roles still depend on the existing database provisioning workflow; the frontend does not grant itself an admin role or silently create missing profiles. New sign-ups may require email confirmation. Previous username-only test accounts cannot use the new email form without account migration or recovery outside this change.

## Validation

```sh
npm test
npm run build
npm run test:browser
```

Browser tests require Google Chrome and use synthetic test records by intercepting Supabase requests. They verify directory filtering/sorting, watchlist persistence/removal, player-to-comparison navigation, bookmark restoration, failed-feed recovery, mobile navigation, and route rendering. They do not contact production or validate production authentication, database policies, feed freshness, highlight provenance, or prediction accuracy.

A lockfile is committed for reproducible installs. The build tools and router were updated to patched releases. `src/legacy.css` retains styling for the original profile/admin components; `src/index.css` supplies the new responsive design.

## Repository provenance

Base: `zihadpcode/csc473-s2026-staxnyc-components`, commit `85ad787d9576b15b26b59129a9b5eedf4eba926e`. Work is isolated on `codex/staxnyc-rebuild`. Original components and data remain the implementation source; the team repositories have not been substituted for this personal project.

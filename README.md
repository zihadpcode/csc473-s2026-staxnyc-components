# StaxNYC — Basketball Intelligence

A responsive basketball research workspace built from the existing personal StaxNYC repository, with feature parity restored from the original prototype and newer team component files. The player images, team identity helpers, standings snapshot, game cards, charts, profile/admin workflows and animation demos are reused or adapted from those files.

## Run

Requires Node.js 22.12 or newer and npm.

```sh
npm ci
cp .env.example .env
npm run dev
```

Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` for the existing StaxNYC database. Legacy `VITE_SUPABASE_ANON_KEY` and `VITE_SUPABASE_KEY` settings are supported. Missing settings open Explore mode: navigation, the saved standings snapshot, and the animation demo remain available; data screens explain the missing connection.

The development and preview servers run the same API handlers used by the Vercel deployment. `vercel.json` routes `/api/*` requests to a shared Node API and all application routes to the SPA. No deployment is performed by the test commands.

## Features

- Homepage: keyboard-accessible player search, admin-curated featured lineup, scoring leaders and research shortcuts.
- Player directory: name search, team filter, stat sorting and browser-saved player stack (up to 50 IDs, shared across tabs).
- Player profiles: repository player images when available, season/shooting/defensive stats, ten recent games, an actual line chart with points/rebounds/assists selection, and a next-game points model.
- Predictions: linear regression on preceding-five-game averages, chronological validation, validation error and historical error range, explicit insufficient-data state, and a five-minute model cache keyed to the source logs.
- Comparisons: four players, six-stat radar, editable colors, visibility controls, nine-stat table, bookmarkable selection, deterministic comparison insights and optional authenticated AI explanation.
- Game center: selectable schedule date, live/scheduled/final grouping, refresh, visible-tab polling, stale-result preservation, stored winner predictions and rationale, optional AI questions, realtime game chat, and admin removal/moderation controls.
- Standings and rosters: connected standings with source metadata; explicitly labeled repository snapshot fallback; team roster routes with season-specific records and a labeled directory fallback.
- Highlights: embedded videos, title/team filtering, admin add/replace and hidden-marker removal compatible with the existing sync process.
- Accounts: email/password login/signup, profile creation, public profiles, direct bio editing, approval requests for name/avatar changes, password recovery and password updates.
- Administration: profile request approval/rejection, featured-player add/reorder/show/hide/remove, and the moderation controls above.
- Accessibility: responsive navigation, skip link, focus states, native modal focus trapping/Escape, reduced-motion support, and the existing optional animation demo.

The full comparison with the source feature set is in [docs/FEATURE_AUDIT.md](docs/FEATURE_AUDIT.md).

## Server configuration

The API uses public Supabase credentials and forwards the signed-in user's bearer token, preserving database authorization. Optional `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` override the public browser settings on the server. Do not use a service-role key.

Optional AI explanations retain the source project's DeepSeek integration, implemented through the current AI SDK. Set server-only `DEEPSEEK_API_KEY` and `DEEPSEEK_MODEL` to a currently available model in your provider account. Neither setting may use the `VITE_` prefix. AI requests require a verified account, use database-fetched stats, limit input/output, and have an instance-local request limit. Apply a shared hosting rate limit/provider budget before enabling a public production AI service. Statistical predictions and deterministic comparison insights do not require an AI provider.

The original README described Flask and a model trained on 2023–24 data, but neither that backend nor the historical training artifact was present. The new Node API implements prediction serving from the supplied game logs. It does not claim historical training, a calibrated confidence probability, injury awareness, opponent adjustment, or verified production accuracy.

## Existing database contract

Core tables: `player_stats`, `player_games`, `live_games`, `game_highlights`, `featured_players`, `user_profiles`, `profile_change_requests`.

Newer-team contracts also used: `nba_standings`, `nba_team_rosters`, `game_predictions`, `chat_messages`. Those tables and the external feed-sync jobs were managed outside the supplied repository. No production schema, policies, records, schedules, emails or chat messages were changed during this work.

The existing database must enforce RLS and column restrictions: members must not edit roles or other people's profiles; only admins may curate/review/moderate; chat inserts must match the authenticated user; public profile reads must expose only intended fields. Realtime must be enabled for `chat_messages`. Profile creation attempts only the signed-in ID and display name and relies on database defaults/policies for role assignment. Password recovery requires the site's `/reset-password` URL in Supabase's allowed redirects and working email delivery.

Profile approval preserves the source project's two database writes. Returned rows are checked and a partial-success error is shown if the profile update succeeds but request status fails. Production deployments needing atomic multi-table reviews should move this operation into an authorized database transaction/RPC. Featured reordering is now one atomic upsert request.

## Verify

```sh
npm test
npm run build
npm run test:browser
```

The browser suite requires Google Chrome. It starts local development and unconfigured production-preview servers, intercepts database/auth/AI requests, simulates realtime messages, and captures desktop/mobile previews. Model/API tests exercise the Supabase SDK and AI SDK with intercepted upstream responses. No paid provider calls or real account messages are sent.

See [docs/REVAMP.md](docs/REVAMP.md) for results and integration limits. Tests do not establish production authentication, database authorization, feed freshness, scheduled syncing, email delivery, or real-world prediction accuracy.

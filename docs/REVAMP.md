# Rebuild verification

## Scope

The original personal StaxNYC component repository is rebuilt as a responsive basketball research workspace. Its Supabase table contract, standings data, radar, game cards, recent-games table, profile forms and admin components are reused. The app shell, overview, directory, saved stack, comparison, game center, data states and authentication forms are new implementations in the existing source structure.

## Evidence

- Production build succeeds with Vite 8 and React Router 7.
- Four data-handling tests cover combined filters, sorting, missing-stat formatting, untrusted saved storage, and local calendar rollover.
- Ten Chrome browser scenarios cover directory filters/sorting, saving/removal/reload, player profiles and comparison bookmarks, failed-feed retry, mobile navigation/overflow, primary routes, desktop/mobile screenshots, password payloads, stale-score preservation, the unconfigured production build, and preserving saved IDs during roster failure.
- npm audit reports zero known vulnerabilities in the resolved dependency tree.
- Desktop and mobile screenshots were inspected at 1440px and 390px. Screenshots use synthetic test players.

## Integration limits

The checkout has no production Supabase configuration. Browser data requests are intercepted with synthetic fixtures. The real database connection, authentication, profile provisioning, database authorization, feed update processes, and video records are not verified. No database schema or policy changes are included. The repository contains no connected prediction backend; projections remain unavailable.

New sign-ups use email/password and may require email confirmation. Previously created username-only test accounts require separate migration or recovery. Admin access still depends on the existing database role and row-level policies; UI gating is not database authorization.

The original standings file remains available and is explicitly labeled as an undated repository snapshot. It is not presented as the current NBA standings.

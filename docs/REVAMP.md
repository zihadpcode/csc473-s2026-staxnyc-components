# Rebuild verification — October 18, 2026

## Scope

The rebuild now covers the functional source feature set, beyond the original personal component subset. Restored features include homepage search/curation, a line trend chart, player prediction API, rosters, connected standings, chat, game prediction explanations, public profiles, highlight controls, extended comparisons and the optional animation demo. Added improvements include a date-selectable schedule, password recovery, explicit data states and request-boundary validation.

See [FEATURE_AUDIT.md](FEATURE_AUDIT.md) for a feature-by-feature comparison, evidence and outstanding external requirements.

## Verification

- 17 model/data/API tests cover temporal prediction validation, insufficient/invalid/future data, API routing and deployment rewrite handling, verified-user checks, authoritative database stats, real SDK request shaping with intercepted responses, video URL parsing, missing-value/tie handling, sorting, saved storage and local date rollover.
- 26 Chrome browser scenarios cover original and restored user flows, including featured curation, chart colors, predictions, connected standings/rosters, account recovery, profile creation/editing/review, highlight administration, chat sending and simulated realtime inserts, schedule-date changes/removal, mobile overflow and modal focus.
- Production build and whitespace checks pass. Dependency audit reports no known runtime vulnerabilities.
- Desktop/mobile previews are captured under ignored `test-results/`, using synthetic player and game records.

## Production limits

The real StaxNYC data connection, database authorization, sports-data sync jobs, email delivery, realtime setup and provider credentials are not verified. No production changes were made to those services. No real chat/email or paid AI request was sent by the tests.

The new regression service is implemented and fixture-tested, with at least 20 valid completed game logs required. It is not the missing original 2023–24 training artifact. Its historical error range is not a calibrated confidence interval or proof of accuracy on real NBA games.

Server code retains public-key/caller-token database authorization. AI requests require a verified user and use database-fetched records, with input limits, timeouts, output caps and an instance-local throttle; a public production deployment must also configure shared rate limits/provider budgets. Original multi-table profile approval is still two checked writes with a partial-success error; atomic review requires a separately authorized database transaction/RPC.

Missing season-roster/standings tables fall back explicitly to directory records or the existing repository snapshot. Snapshot records have no verified season/update date. User-visible labels identify these limitations.

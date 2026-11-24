# 0009: One APP_MODE setting decides seed or full mode

Date: 2026-11-22. Status: proposed, awaiting approval (Phase 2).

## Context

Acceptance test A7 fails because there is no demo switch: signed out visitors are told to log in for AI (`src/components/compare/CompareAiSection.jsx:43` to `51`). The demo must hide sign up, sign in, chat, profile, admin and AI (assumption 11), and it should not show highlights (embedded NBA videos) or the animation demo (mostly teammate code, license open) until those questions close.

## Options

| Option | Cost | Risk | Reversibility | When to pick |
|--------|------|------|---------------|--------------|
| A. One `APP_MODE` value: `VITE_APP_MODE` at build, `APP_MODE` at function startup, validated; seed mode hides routes and links | Low | Low: two names for one value must match (checked at startup through `/api/health`) | High | **Chosen** |
| B. Read the mode at runtime from `/api/health` | Low | Medium: a flash of hidden features before the call returns; one more request on every page | High | If the build cannot see the variable |
| C. A separate demo branch | Medium | High: two branches drift | Medium | Never |

## Decision

**Change, additive: option A.** `VITE_APP_MODE` at build and `APP_MODE` at function startup, each `seed` or `full`. Locally an unset value means `seed`, so a fresh clone works with no env file. On Vercel the value must be set; the function refuses to serve data when it is missing. In seed mode the app does not register the account, chat, admin, highlights and animation routes, removes their links, hides the AI section, and shows the sample label. `/api/health` reports `app_mode`, and a browser test checks both values agree.

## Consequences

* A7 becomes testable in seed mode.
* Two variable names for one value; a startup check and the health test guard against a mismatch.
* What would change this: the user deciding to show accounts on the demo, which moves the demo to Tier C.

Detail: `docs/design.md` section (a).

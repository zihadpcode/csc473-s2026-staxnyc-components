# 0003: Keep the language, framework and test tools; add a type check

Date: 2026-11-22. Status: proposed, awaiting approval (Phase 2).

## Context

The code is JavaScript ES modules: React 18.3.1, React Router 7.18.4, Vite 8.3.4, four Node handlers shared by Vite and one Vercel function, `node:test` and Playwright 1.63.0 (`package.json`). Phase 1 found no number that the stack fails. The definition of done (master prompt section 13) asks for lint, format and a type check, and none exist.

## Options

| Option | Cost | Risk | Reversibility | When to pick |
|--------|------|------|---------------|--------------|
| A. Keep JavaScript, React 18, Vite 8, Node handlers; add JSDoc types and `tsc --checkJs` on `server/` and `src/lib/` | Low: one dev dependency (`typescript`), comments on about 1,500 lines | Low | High: delete the config | **Chosen.** Meets the type check item without touching behavior |
| B. Convert to TypeScript files | High: 82 files renamed and typed | Medium: a large diff on code the user must still learn (R5) | Medium | Only if JSDoc proves too weak after Phase 4 |
| C. Move to a full stack framework (Next.js) | High | High: rewrite with no measured need | Low | Never on present evidence |
| D. Keep as is, no type check | None | Medium: the definition of done lists a type check | High | If the user declines any new dev dependency |

## Decision

**Keep** the stack. Add JSDoc types and run the TypeScript compiler in check only mode (`tsc --noEmit --checkJs`) over `server/` and `src/lib/` first. Pin the Node major in `.nvmrc` to the floor in `package.json` engines (22) after checking the Vercel supported versions page in Phase 3. Lint and format tools are chosen in Phase 3 with the user's yes, since each is a new dev dependency.

## Consequences

* One new dev dependency (`typescript`), installed from the network in Phase 3 with the user's yes.
* No file renames. The user keeps learning the code that exists (R5).
* What would change this: JSDoc checks that miss real defects in Phase 4, or a second developer who wants TypeScript files.

Detail: `docs/design.md` section (a).

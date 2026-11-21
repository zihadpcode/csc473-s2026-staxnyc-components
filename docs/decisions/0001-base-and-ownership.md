# 0001: Base the revamp on the fork rebuild branch

Date: 16 November 2026. Status: proposed, awaiting approval.

## Context

Seven local copies hold three lines of work: the team final (`9c9aadd` in the team components repo), the user's revamp on the team repo (`e3e0fce`), and the user's rebuild in the fork (`2e5224b`). The task asks for the user's fork unless another copy is clearly more complete.

## Options

| Option | Cost | Risk | Reversibility | When to pick |
|--------|------|------|---------------|--------------|
| Fork `main` (`85ad787`, HW6 only) | Most rework | Loses the rebuild and the team features | High | Never, it is a subset |
| Fork `origin/codex/staxnyc-rebuild` (`2e5224b`) | Low | Large unreviewed commits; contains teammate derived code | High | Chosen |
| Team `origin/main` (`9c9aadd`) | Medium | Not the user's repo, no license, no tests | High | Only for history |
| Team `origin/codex/staxnyc-revamp` (`e3e0fce`) | Medium | Older than the rebuild, lives on the teammate's remote | High | If the rebuild were rejected |

## Decision

Base the worktree on `origin/codex/staxnyc-rebuild` of the fork. It is in the user's own repo, it is the latest (18 October 2026), and it has the widest feature coverage, the only test suite of size and an honest feature audit. The fork's `main` is a strict ancestor, so no work is lost.

## Consequences

The worktree branch `revamp/phase-0` tracks the fork's rebuild branch. Teammate credit and license must be settled before anything is shown publicly (see `docs/brief.md`). The team repos stay as read only history.

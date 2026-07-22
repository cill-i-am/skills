# Worker Thread Template

Use this when dispatching a Codex worker thread.

## Mission

Implement Linear issue: `{ISSUE_ID}`.

## Required Context

- Project or PRD: `{PROJECT_OR_PRD}`
- Issue: `{ISSUE_LINK}`
- Fetched `origin/main` base SHA: `{BASE_SHA}`
- Worker worktree: `{WORKTREE_PATH}`
- Topic branch expectation: `codex/{ISSUE_ID}-{SLUG}`, created and owned by the worker
- Required skills: worker, worktree-isolation, `{SKILLS}`

## Scope

In scope:

- `{IN_SCOPE}`

Out of scope:

- `{OUT_OF_SCOPE}`

## Requirements

- Follow repo `AGENTS.md` and nested instructions.
- Read the live Linear issue, parent Project/PRD, blockers, and comments before planning. Treat this handoff as orientation only.
- Use the orchestrator-provisioned worktree created from the exact dispatched base SHA. Do not use local `main`, the coordinator's `HEAD`, or this handoff as base evidence.
- Create and own the topic branch inside that worktree.
- Before planning or editing, run a fresh fetch and report the isolated path, topic branch, `HEAD`, `origin/main`, merge-base, empty worktree status, ahead/behind `0 0`, install result, and baseline result or blocker.
- If `origin/main` advances before edit authority, hold work and notify the orchestrator. Refresh only through the non-destructive procedure in `worktree-isolation`, then rerun relevant baselines, revalidate the existing plan against the fresh base, and repeat focused review for affected deltas.
- Keep changes surgical and simple.
- Post one compact plan covering material architecture decisions, scope and explicit boundaries, the smallest end-to-end tracer, intended tests and verification, known risks, and deferred questions. Do not pre-specify every table, query, retry, operation count, or hypothetical failure path. Keep high-risk planning within approximately 60-90 minutes by default.
- Obtain one independent plan review. If changes are requested, make one targeted revision; do not replace the whole plan unless product scope or acceptance criteria materially changed.
- Never enter a third plan-review cycle without explicit human approval.
- Begin a bounded reversible implementation slice as soon as no classified `pre-edit blocker` remains. Build the smallest tracer, gather executable evidence, and open a draft PR as soon as it works.
- Stop and report if scope or product intent is wrong.
- Use Linear blockers for dependency issues.
- Use Browser verification for user-visible changes where practical.

## Verification

Run relevant checks and report exact commands/results.

## Done Evidence

Report changed files, verification, PR link, preview link if any, and residual risks.

# Worker Thread Template

Use this when dispatching a Codex worker thread.

## Mission

Implement Linear issue: `{ISSUE_ID}`.

## Required Context

- Project or PRD: `{PROJECT_OR_PRD}`
- Issue: `{ISSUE_LINK}`
- Branch/worktree expectation: isolated worktree by default
- Required skills: worker, worktree-isolation, `{SKILLS}`

## Scope

In scope:

- `{IN_SCOPE}`

Out of scope:

- `{OUT_OF_SCOPE}`

## Requirements

- Follow repo `AGENTS.md` and nested instructions.
- Read the live Linear issue, parent Project/PRD, blockers, and comments before
  planning. Treat this handoff as orientation only.
- Use `worktree-isolation` to verify or create the isolated workspace before
  editing.
- Do not implement until you can report the isolated path, branch, base commit,
  install result, and baseline check result or blocker.
- Keep changes surgical and simple.
- Post a short plan before implementation.
- Proceed after posting the plan unless the issue or orchestrator explicitly
  requires plan approval.
- Stop and report if scope or product intent is wrong.
- Use Linear blockers for dependency issues.
- Use Browser verification for user-visible changes where practical.

## Verification

Run relevant checks and report exact commands/results.

## Done Evidence

Report changed files, verification, PR link, preview link if any, and residual risks.

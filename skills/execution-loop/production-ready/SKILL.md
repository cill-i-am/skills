---
name: production-ready
description: Final evidence gate for Linear work or PRs. Use before worker completion, PR handoff, merge/done state, or when needing spec checks, review stacks, verification, PR updates, CI watch, and Linear evidence.
---

# Production Ready

Evidence before completion. A worker may not claim done until this gate passes
or reports a real blocker.

## Read First

- `docs/agents/execution-policy.md`
- `docs/agents/linear-workflow.md`
- `docs/agents/triage-states.md`
- the Linear issue, parent Project/PRD, and linked PR if one exists

## Simulation Mode

Use Simulation Mode when the user asks for a no-code gate, handoff rehearsal,
offline review, or expected production-ready evidence before implementation. In
Simulation Mode, do not require a branch, PR, CI run, Linear mutation, or live
GitHub comments. Produce the expected evidence checklist, likely verification
commands, reviewer/spec requirements, completion blockers, and final report
shape. Clearly label live checks as not run.

## Gate

### 1. Spec Checklist

Read Linear fresh before every production-ready pass. Treat worker handoff
context as orientation, not the operative source of truth. Check:

- acceptance criteria
- parent PRD/Project intent
- blockers and HITL decisions
- out-of-scope boundaries
- comments since worker assignment

Report gaps before running broad review. Fix only if the fix is within scope.

### 2. Detect Review Scope

Inspect the actual product diff:

- dirty working tree first: unstaged, staged, and untracked files
- otherwise branch diff against `origin/main`/`main`
- separate product code from agent instructions, generated lockfiles, and docs
  unless those files are the requested change
- classify touched surfaces by behavior: API/backend, frontend/UI, persistence,
  auth/trust boundary, infra/provider, shared packages, tests, docs, or config

### 3. Run Required Review Stack

Load the relevant skill bodies before finalizing:

- all changed code: `code-review`
- broad or risky diffs: `review-swarm`
- cleanup before wrap-up: `simplify`
- Effect code: `effect-ts`
- persistence/database changes: external database skills when installed,
  otherwise nearest repo persistence docs and `code-review`
- Better Auth/auth trust boundaries: external Better Auth skills when installed,
  otherwise nearest repo auth/security docs and `code-review`
- TanStack Start/Router/Query/React: `tanstack-routing` and
  `tanstack-react-best-practices`
- forms: `app-forms`
- UI composition/design: external UI/design skills when installed, otherwise
  nearest repo UI docs and `code-review`

If a stack-specific skill is not present in the current project, use the nearest
repo instructions and say what was unavailable. Do not invent old repo-only
review skills.

Fix material issues unless the user or orchestrator requested review-only mode.
Discard false positives with a short technical reason.

### 4. Fresh Verification

Run the narrowest relevant checks, then broaden when the change crosses
packages or contracts:

- focused package tests
- package typecheck
- browser/Playwright verification for UI workflows
- Drizzle migration generation/inspection for schema changes
- `pnpm check-types`, `pnpm test`, `pnpm lint`, `pnpm format` for
  cross-package or handoff-ready changes

Do not claim success without fresh command output.

### 5. PR And Linear Evidence

Open or update the PR when code is ready. Use the Linear issue title as the PR
title when it includes the issue key. Comment in Linear with:

- PR URL
- branch and commits
- review stack used
- verification commands and results
- initial GitHub PR comment/review-thread status
- CI/comment watcher automation if checks or comments are pending
- known risks or blockers

### 6. CI Watch

After PR creation, run `ci-watch` before the worker final report. It owns
pending checks, GitHub PR comments/review threads, new Linear comments,
actionable CI/comment fixes, follow-up commits, automation handoff, and Linear
CI evidence.

If CI or comments are still pending after a short inline watch, create or update
a 2-3 minute heartbeat automation for the worker thread with the Codex app
`automation_update` tool. The prompt must include the PR URL, Linear issue key,
branch, head SHA, pending checks/comments, retry/fix budget, Linear update
requirement, and stop condition. Reuse an existing watcher for the same PR.

Do not move Linear to its completed state until CI is green or the orchestrator
explicitly accepts a non-CI completion path.

## Completion Report

Final output must include:

- spec gate result
- review stack used
- verification evidence
- PR URL
- CI status
- Linear update status
- blockers or residual risk

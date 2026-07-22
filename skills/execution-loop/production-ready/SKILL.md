---
name: production-ready
description: Final evidence gate for Linear work or PRs. Use before worker completion, PR handoff, merge/done state, or when needing spec checks, review stacks, verification, PR updates, CI watch, and Linear evidence.
---

# Production Ready

Evidence before completion. A worker may not claim done until this gate passes or reports a real blocker.

This skill is the coordinator for readiness. It invokes review, simplification, verification, PR, and CI-watch steps, but it does not replace them:

- `code-review` proves standards-backed findings on changed code.
- `review-swarm` adds broad read-only review for risky or cross-boundary diffs.
- `simplify` removes unnecessary complexity before handoff.
- `ci-watch` owns PR checks and PR/comment follow-up after a PR exists.
- The orchestrator owns final acceptance and merge authority.

## Read First

- `docs/agents/execution-policy.md`
- `docs/agents/linear-workflow.md`
- `docs/agents/triage-states.md`
- the Linear issue, parent Project/PRD, and linked PR if one exists

If `docs/agents/*` is absent because the project has not run `linear-setup` yet or this is a bundle simulation, read the matching templates from `../linear-setup/assets/docs/agents/*` when available and state that the target repo still needs `linear-setup`.

## Simulation Mode

Use Simulation Mode when the user asks for a no-code gate, handoff rehearsal, offline review, or expected production-ready evidence before implementation. In Simulation Mode, do not require a branch, PR, CI run, Linear mutation, or live GitHub comments. Produce the expected evidence checklist, likely verification commands, reviewer/spec requirements, completion blockers, and final report shape. Clearly label live checks as not run.

## Gate

### 1. Spec Checklist

Read Linear fresh before every production-ready pass. Treat worker handoff context as orientation, not the operative source of truth. Check:

- acceptance criteria
- parent PRD/Project intent
- blockers and HITL decisions
- out-of-scope boundaries
- comments since worker assignment

The issue acceptance criteria control scope. Report gaps before running broad review. Fix only if the fix is within scope; route useful unrelated hardening to an outcome-named follow-up instead of silently expanding the issue.

### 2. Detect Review Scope

Inspect the actual product diff:

- dirty working tree first: unstaged, staged, and untracked files
- otherwise branch diff against `origin/main`/`main`
- separate product code from agent instructions, generated lockfiles, and docs unless those files are the requested change
- classify touched surfaces by behavior: API/backend, frontend/UI, persistence, auth/trust boundary, infra/provider, shared packages, tests, docs, or config

### 3. Run Required Review Stack

Load the relevant skill bodies before finalizing. Use the smallest review stack that covers the changed surfaces:

- all changed code: `code-review`
- broad, risky, security-sensitive, data-affecting, or cross-boundary diffs: `review-swarm`
- cleanup before wrap-up: `simplify`
- Effect code: `effect-ts`
- persistence/database changes: external database skills when installed, otherwise nearest repo persistence docs and `code-review`
- Better Auth/auth trust boundaries: external Better Auth skills when installed, otherwise nearest repo auth/security docs and `code-review`
- TanStack Start/Router/Query/React: `tanstack-routing` and `tanstack-react-best-practices`
- forms: `app-forms`
- UI composition/design: external UI/design skills when installed, otherwise nearest repo UI docs and `code-review`

If a stack-specific skill is not present in the current project, use the nearest repo instructions and say what was unavailable. Do not invent old repo-only review skills.

Fix material issues unless the user or orchestrator requested review-only mode. Discard false positives with a short technical reason. Do not run `review-swarm` as a substitute for `code-review`; use it for additional breadth when the risk justifies it.

Review the complete working diff before merge. Once implementation has begun, review the diff, tests, runtime evidence, and focused deltas; do not send the worker back through whole-package architecture or replacement-plan review. Classify every finding as exactly one of `pre-edit blocker`, `pre-merge blocker`, `deferred hardening`, or `question` using the execution policy definitions. Resolve concrete `pre-merge blocker` findings before merge unless the orchestrator explicitly accepts the residual risk. Deferred hardening and questions do not block readiness by themselves.

### 4. Fresh Verification

Run the narrowest relevant checks, then broaden when the change crosses packages or contracts:

- focused package tests
- package typecheck
- browser/Playwright verification for UI workflows, including console/network errors, loading states, FOUC, layout shift, interaction jank, duplicate requests, and double-submit prevention when relevant
- Drizzle migration generation/inspection for schema changes
- `pnpm check-types`, `pnpm test`, `pnpm lint`, `pnpm format` for cross-package or handoff-ready changes

Do not claim success without fresh command output. For user-visible changes, include concrete Browser, preview, or focused runtime test evidence, or explain why it could not be run. Treat blank screens, visible FOUC, incoherent layout shift, stuck loading states, console errors, failed critical requests, and duplicate submissions as material verification failures unless the orchestrator explicitly accepts the risk.

### 5. PR And Linear Evidence

Open or update the PR when code is ready. Use the Linear issue title as the PR title when it includes the issue key. Comment in Linear with:

- PR URL
- branch and commits
- review stack used
- verification commands and results
- initial GitHub PR comment/review-thread status
- CI/comment watcher automation if checks or comments are pending
- known risks or blockers

### 6. CI Watch

After PR creation, run `ci-watch` before the worker final report. It owns PR checks, GitHub PR comments/review threads, new Linear comments, actionable CI/comment fixes, follow-up commits, automation handoff, and Linear CI evidence. Production-ready should not duplicate CI-watch polling logic; it only starts or resumes that loop and records the result.

If CI or comments are still pending after a short inline watch, create or update a 2-3 minute heartbeat automation for the worker thread with the Codex app `automation_update` tool. The prompt must include the PR URL, Linear issue key, branch, head SHA, pending checks/comments, retry/fix budget, Linear update requirement, and stop condition. Reuse an existing watcher for the same PR.

Do not move Linear to its completed state until CI is green or the orchestrator explicitly accepts a non-CI completion path.

## Completion States

- **Ready:** spec gate passed, review stack resolved, verification passed, PR is linked, CI/comments are green or accepted by the orchestrator, and Linear has evidence.
- **Pending watch:** code/review/verification are ready, but CI or comments are still pending and `ci-watch` or its heartbeat owns the next check.
- **Blocked:** missing credentials, provider state, failing baseline, unresolved HITL, a concrete unresolved `pre-merge blocker`, or external CI/provider failure prevents completion. Out-of-scope reviewer feedback is follow-up input, not a blocker by itself.

## Completion Report

Final output must include:

- completion state: Ready, Pending watch, or Blocked
- spec gate result
- review stack used
- verification evidence
- PR URL
- CI status
- Linear update status
- blockers or residual risk

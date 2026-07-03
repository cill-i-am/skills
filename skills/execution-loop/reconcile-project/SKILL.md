---
name: reconcile-project
description: Reconcile Linear project state. Use at the start of orchestration loops or when issues, PRs, blockers, CI status, worker evidence, or the parent PRD may be stale or drifted.
---

# Reconcile Project

Make Linear truthful before dispatching or accepting more work.

## Read

- Linear Project/PRD, child issues, blockers, comments, assignees, statuses
- linked PRs and CI status
- worker/orchestrator evidence comments
- relevant source or architecture docs when spec drift is suspected

## Checks

Find and repair or report:

- blocker completed but dependent issue still blocked
- issue marked ready for agent work but missing acceptance criteria or verification
- worker assigned but stale with no recent evidence
- PR opened but Linear not linked
- PR merged but issue not moved to the completed/done state
- PR failed CI but no `ci-watch` is active
- issue marked completed/done without production-ready evidence
- parent PRD changed after issue dispatch
- issue scope no longer matches parent PRD or source reality
- duplicate or obsolete issues

## Actions

Use Linear updates for durable state:

- add or correct blockers
- move state to the live workflow equivalent of needs information, blocked,
  ready for agent work, in review, or completed
- add comments with evidence
- mark obsolete issues with rationale
- trigger or recommend `ci-watch` for PRs with pending/failing CI

Do not implement code. Do not close or mark done without evidence.

## Output

Report every touched item in exactly one bucket:

- `dispatchable`: issue is ready for an AFK worker and blockers are clear.
- `active-worker`: issue already has an active worker, reviewer, branch, PR, or
  heartbeat; include the owner and next check.
- `needs-ci-watch`: PR exists but checks, PR comments, review threads, or Linear
  comments still need monitoring.
- `blocked-hitl`: human decision, external provider state, credentials, or
  blocker relation prevents agent work.
- `ready-for-acceptance`: worker evidence exists and orchestrator gates should
  run.
- `inconsistent`: Linear, PR, worker evidence, or PRD state disagree; include
  the proposed correction or the update already made.

Completion criterion: Linear is truthful enough that the orchestrator can safely
dispatch, steer, accept, or pause each item without relying on stale handoff
context.

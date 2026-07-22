---
name: reconcile-project
description: Reconcile Linear project state. Use at the start of orchestration loops or when issues, PRs, blockers, CI status, worker evidence, or the parent PRD may be stale or drifted.
---

# Reconcile Project

Make Linear truthful before dispatching or accepting more work.

## Read

- Linear Project/PRD, parent/sub-Issue hierarchy, blockers, comments, assignees, statuses
- linked PRs and CI status
- worker/orchestrator evidence comments
- freshly fetched `origin/main` SHA and active worker/reviewer worktree evidence
- plan-review cycle count, edit-authority time, source diff, executable blocker, and draft-PR evidence for In Progress issues
- relevant source or architecture docs when spec drift is suspected

## Checks

Find and repair or report:

- blocker completed but dependent issue still blocked
- issue marked ready for agent work but missing acceptance criteria or verification
- worker assigned but stale with no recent evidence
- proposed or active worktree was based on local `main`, coordinator `HEAD`, handoff prose, or an unfetched/stale remote ref
- worker/reviewer pair does not share the same exact fetched `origin/main` base, the worker branch was not created from that base, or the reviewer is not detached/read-only
- pre-edit proof is missing, dirty, non-zero ahead/behind, or does not show `HEAD == origin/main == merge-base`
- `origin/main` advanced before edit authority without a held dispatch, clean non-destructive refresh, fresh baselines, existing-plan revalidation, and focused reviewer gate for affected deltas
- a third plan-review cycle started without explicit human approval
- an In Progress issue completed two plan-review cycles without a source diff or draft PR and the planning loop was not stopped
- several hours passed after edit authority without a source diff, executable blocker, or draft PR and no human stall notification was posted
- plan or code-review findings lack exactly one classification from `pre-edit blocker`, `pre-merge blocker`, `deferred hardening`, or `question`
- uncertainty or unrelated production hardening was treated as a pre-edit blocker, or reviewer feedback silently expanded the acceptance criteria
- PR opened but Linear not linked
- PR merged but issue not moved to the completed/done state
- PR failed CI but no `ci-watch` is active
- issue marked completed/done without production-ready evidence
- parent PRD changed after issue dispatch
- issue scope no longer matches parent PRD or source reality
- Issue title describes an internal technical task rather than an observable outcome, or uses unexplained codebase shorthand
- delivery outcome is orphaned or attached to the wrong parent capability outcome
- parent outcome is marked done while children remain incomplete, or all children are done but the combined parent outcome has not been verified
- duplicate or obsolete issues

## Actions

Use Linear updates for durable state:

- add or correct blockers
- rename outcome-equivalent titles and correct parent/sub-Issue relations when scope and ownership are clearly unchanged; report ambiguity instead of silently changing product meaning
- move state to the live workflow equivalent of needs information, blocked, ready for agent work, in review, or completed
- add comments with evidence
- hold dispatch or edit authority when base provenance is stale or unproven; use `worktree-isolation` for exact fetched-base provisioning or refresh
- stop stalled planning loops and notify the human with the issue, elapsed/cycle evidence, current blocker classification, and smallest available rescue tracer; never commission another complete plan as the response
- route useful non-blocking hardening to an outcome-named follow-up issue rather than expanding the active issue without orchestrator approval
- mark obsolete issues with rationale
- trigger or recommend `ci-watch` for PRs with pending/failing CI

Do not implement code. Do not close or mark done without evidence.

## Output

Report every touched item in exactly one bucket:

- `dispatchable`: issue is ready for an AFK worker and blockers are clear.
- `active-worker`: issue already has an active worker, reviewer, branch, PR, or heartbeat; include the owner, plan-review cycle count or edit-authority age, available executable evidence, and next check.
- `needs-ci-watch`: PR exists but checks, PR comments, review threads, or Linear comments still need monitoring.
- `blocked-hitl`: human decision, external provider state, credentials, or blocker relation prevents agent work.
- `ready-for-acceptance`: worker evidence exists and orchestrator gates should run.
- `inconsistent`: Linear, PR, worker evidence, or PRD state disagree; include the proposed correction or the update already made.

Completion criterion: Linear's outcome hierarchy, titles, blockers, and execution state are truthful enough that the orchestrator can safely dispatch, steer, accept, or pause each item without relying on stale handoff context.

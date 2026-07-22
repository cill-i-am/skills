---
name: reconcile-project
description: Repair meaningful drift between Linear, Codex tasks, branches, PRs, CI, reviewers, and watchers. Use before dispatch, acceptance, or when live evidence conflicts; do not reconstruct ceremonial history.
---

# Reconcile Project

Make live execution state truthful enough for the orchestrator's next decision.
Use `docs/agents/execution-policy.md` for authority; absence of ceremonial
packages or approval comments is not drift.

## Read

- live Linear Project/PRD, outcome hierarchy, blockers, comments, and statuses;
- active Codex worker/reviewer tasks;
- fetched remote-default SHA, branches, PRs, exact heads, checks, and comments;
- current acceptance proof, finding dispositions, and watcher ownership.

Treat handoffs and heartbeat text as orientation. Fetch/prune and dynamically
resolve `refs/remotes/origin/HEAD` before provenance-dependent conclusions.

## Reconcile Meaningful Drift

Find and repair or report:

- Ready issue missing outcome, testable acceptance, boundaries, dependencies,
  proof expectations, or genuine external gates;
- duplicate worker, reviewer, branch, PR, or watcher ownership;
- new worker lane based on local or stale state rather than the exact fetched
  remote default;
- active worker without executable movement or a concrete blocker;
- draft PR or exact head missing from Linear;
- review requested before a concrete implementation head exists for routine
  work, or exact-head review missing when evidence is ready;
- reviewer controlling edit, merge, or Linear state;
- material finding without one canonical disposition;
- fixable in-scope defect misclassified as human-blocked;
- acceptance claim without automated or physical/runtime proof;
- PR checks/comments with no single next-poll owner;
- stale watcher head/instructions, duplicate watcher, or watcher past its stop
  condition;
- merged/closed PR with stale issue state;
- parent outcome completed before combined outcome proof;
- source, issue, and PR scope materially disagreeing.

Do not repeatedly re-prove unchanged history when no decision or mutation
depends on it. Do not recreate plan-review cycles, approval chains, or complete
governance narratives.

## Actions

Use Linear and task/watcher tools only within delegated authority to:

- correct blockers, links, outcome-equivalent titles, hierarchy, and state;
- reuse or steer the existing owner and archive obsolete idle tasks;
- hold unsafe stale-base dispatch and route through `worktree-isolation`;
- activate one exact-head reviewer when concrete evidence is ready;
- create, update, or stop the one watcher that owns the next PR poll;
- route a concrete follow-up without expanding the active issue;
- present inconsistent product meaning or external authority to the
  orchestrator/human.

Do not implement code, merge, or mark outcomes done without evidence.

## Output

For each active issue report only:

- owner and phase: Dispatch, Build, Verify, or Decide;
- current exact branch/PR head when relevant;
- material proof or evidence gap;
- single next action and owner;
- watcher owner or stop action;
- genuine human/external gate, if any.

Completion criterion: the orchestrator can safely dispatch, steer, verify, or
decide from current state without duplicated ownership or stale policy history.

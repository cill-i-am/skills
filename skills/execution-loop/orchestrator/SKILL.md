---
name: orchestrator
description: Coordinate Linear project execution. Use when asked to reconcile work, select Ready issues, dispatch delivery owners, activate exact-head review, dispose findings, de-duplicate watchers, or keep a project moving.
---

# Orchestrator

The orchestrator coordinates and decides; it does not implement product code by
default. `docs/agents/execution-policy.md` is the canonical authority source.

## Read First

- `docs/agents/execution-policy.md`
- `docs/agents/linear-workflow.md`
- `docs/agents/triage-states.md`
- `docs/agents/domain.md`
- the live Linear Initiative/Project/PRD, issues, relations, and comments

If repo-local docs are absent, read the matching bundled templates under
`../linear-setup/assets/docs/agents/` and state that `linear-setup` is still
needed.

Use Linear for durable project state and Codex thread tools for user-visible
issue workers. When the user asks to orchestrate a Project, that authorizes
dispatch of user-visible worker tasks unless they request another model.

## Dispatch

1. Read live Linear, linked PRs, current tasks, branches, and watchers. Treat
   handoffs and heartbeat summaries as orientation.
2. Run `reconcile-project` at meaningful transitions: before new dispatch,
   before accepting a returned head, and when evidence conflicts.
3. Select an unblocked Ready leaf issue that maximizes useful downstream
   progress. Do not dispatch a parent outcome or an under-specified issue.
4. Choose Tier A, B, or C from the canonical policy. Use existing issue/comment
   space when recording the judgment; do not create a new form or approval
   chain.
5. Before creating a lane, fetch/prune the remote, dynamically resolve
   `refs/remotes/origin/HEAD`, and use `worktree-isolation` to provision one
   exact-base worker workspace. Never substitute local `main`, coordinator
   `HEAD`, or handoff prose.
6. Prove no active worker, branch, PR, or watcher already owns the issue. Reuse
   or steer the existing owner instead of duplicating it.
7. Dispatch one worker with the Ready issue, risk tier, exact base, scope,
   relevant capabilities, proof expectations, and genuine external gates.

Tier A workers begin immediately. Do not create a planner, pre-edit package, or
idle reviewer. For Tier B, create at most one focused, timeboxed pre-edit review
only when a named dangerous seam needs it. Tier C human approval gates the
external or irreversible effect, not safely separable internal proof.

Move the issue to the live in-progress state and record the owner, branch
expectation, exact base, risk tier, and external gates concisely.

## Build Oversight

Expect executable movement: a failing test or probe, source diff, vertical
tracer, physical proof, and early draft PR. TDD, debugging, Effect guidance,
coding standards, simplification, and architecture techniques are capabilities
inside Build, not sequential gates.

If movement stalls, ask for the concrete blocker and smallest executable tracer
or slice. Do not request another complete plan. A fixable compiler, tooling,
test, or runtime defect stays with the worker when in scope.

Directional drift signals, not SLAs: routine Dispatch should take minutes;
expect a first test, probe, or source diff within roughly 30 minutes, a working
tracer within 30–90 minutes, and a meaningful draft PR within 60–120 minutes.
Keep a focused Tier B boundary review within about 60 minutes, exact-head review
within 30–60 minutes of a stable request, and a normal correction pass within
30–90 minutes. When these drift, slice or surface the concrete blocker rather
than creating timer forms or another plan.

## Verify

Activate one independent read-only reviewer when there is a working diff, draft
PR, immutable head, and evidence. Provision its detached worktree from the
current exact fetched remote default when review begins, then fetch the requested
PR head without mutating it. Review the exact implementation head rather than a
hypothetical plan.

The reviewer checks acceptance, correctness, simplicity, tests, and physical
proof and returns findings using the canonical four dispositions. `review-swarm`
is exceptional: use it only when explicitly requested or justified by broad,
security/privacy-sensitive, data-affecting, or genuinely cross-boundary risk.

Normally allow one focused correction pass for `Fix before merge` findings and
verify only the necessary delta. A newly proven serious defect must still be
fixed or consciously escalated, but it does not reopen pre-edit planning.

## Decide

For each finding, choose exactly one action:

- fix before merge;
- accept as residual risk;
- create a concrete follow-up;
- ask the human for a genuine decision.

Dismiss speculative blockers with a short technical reason. “Wait for more
review” is not a decision unless a specific evidence gap is named.

When delegated merge authority exists, merge only after the exact head,
acceptance-to-proof mapping, checks, finding dispositions, external gates, and
residual risks are current. Record the decision in Linear. Move the issue and
parent outcomes only when their claimed outcomes are actually proven.

## Watcher Ownership

At most one watcher owns a PR's next poll. Before creating or updating a
heartbeat with `automation_update`, find any watcher for the same PR and reuse,
replace, or stop it. The watcher stores only the issue, owner, PR, exact head,
pending delta, next action, retry/fix budget, stop condition, and last meaningful
observation. Do not also create a project watcher for the same event.

Stop and clean up the watcher when the PR is green, merged, closed, or genuinely
blocked. Linear and GitHub remain the durable evidence stores.

## Simulation Mode

For a no-mutation rehearsal, do not create tasks, Linear changes, automations,
branches, commits, or PRs. Apply the same readiness, risk, authority, proof, and
decision rules and label every live action as not run.

Completion criterion: every active issue has one owner and one next action;
review and watcher ownership are not duplicated; every material finding has an
orchestrator disposition; and no human is asked to decide an ordinary technical
problem.

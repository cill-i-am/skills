---
name: orchestrator
description: Coordinate Linear project execution. Use when asked to fan out issues, dispatch user-visible Codex worker/reviewer threads, manage blockers, reconcile drift, review returned PRs, or keep a project moving.
---

# Orchestrator

The orchestrator coordinates work. It does not implement by default.

## Worker Thread Dispatch

When the user asks to orchestrate a Linear Project, treat that as an explicit
request to create user-visible Codex worker threads for dispatchable Linear
issues unless the user says to use internal subagents instead.

Prefer `create_thread` for issue workers. Create one new Codex thread per
Linear issue, with a worktree environment and explicit reasoning effort. Each
thread should own exactly one issue and report progress through Linear and the
thread itself.

If `create_thread` is not in the active tool list, search for the thread tool
before considering a fallback. Do not silently substitute internal subagents for
issue workers because the thread tool was not loaded yet.

For every non-trivial implementation worker, also create a user-visible
read-only reviewer/spec thread at dispatch time. The reviewer thread may stay
mostly idle until the worker posts a plan or PR, but it should exist from the
start so the user and orchestrator have a visible side channel for spec
adherence, simplicity, and quality review.

Use internal multi-agent subagents only for bounded side investigations,
additional review depth, or when the user explicitly asks for subagents.

## Read First

- `docs/agents/linear-workflow.md`
- `docs/agents/triage-states.md`
- `docs/agents/execution-policy.md`
- `docs/agents/domain.md`
- parent Linear Initiative/Project/PRD and child issues

Use the Linear skill/app for Linear reads and writes. Use Codex thread tools
when available to create or steer user-visible worker threads.

## Loop

1. **Load project state.** Read the Project/PRD, issues, blockers, comments,
   statuses, linked PRs, and recent worker evidence live from Linear. Treat any
   handoff or previous heartbeat summary as orientation, not the operative
   source of truth.
2. **Reconcile.** Run `reconcile-project` before dispatching new work.
3. **Build the dependency graph.** Use Linear blocker relations as the graph.
   Do not infer blockers only from prose unless you also update Linear.
4. **Pick dispatchable issues.** Prefer unblocked AFK issues in the live Linear
   state that means "ready for agent work" and maximize downstream unblocking.
   Skip HITL issues until the human decision is captured.
5. **Spawn workers.** Use `create_thread` by default. Create one user-visible
   Codex thread per dispatchable Linear issue, with a worktree environment and
   explicit reasoning effort. Include the Linear issue, parent PRD/Project,
   blockers, relevant comments, branch naming convention, and instruction to use
   the `worker` skill. Tell workers to refresh live Linear before planning or
   implementing. Require explicit plan approval only for high-risk work or when
   the issue/orchestrator says approval is required.
   - For every non-trivial worker, create a paired user-visible read-only
     reviewer/spec thread. Include the worker thread, Linear issue, parent
     PRD/Project, expected skills/standards, and instruction to use the
     reviewer thread template. Tell the reviewer to stay idle until the worker
     posts a plan or PR if there is nothing useful to inspect yet.
   - Tell every worker that after opening or updating a PR it must run
     `ci-watch`, monitor CI plus GitHub PR comments/review threads and Linear
     comments, fix actionable in-scope failures or comments, and keep watching
     until checks are green or genuinely blocked.
   - Tell every worker to create or update a 2-3 minute heartbeat automation for
     its worker thread when PR checks or comments are still pending after a
     short inline watch. The heartbeat prompt should include the PR URL, Linear
     issue key, branch, head SHA, current blockers, comment-review requirement,
     retry/fix budget, Linear update requirement, and stop condition.
6. **Track status.** Move assigned issues to the live Linear in-progress state
   and comment with the worker thread, branch expectation, and dispatch time.
7. **Set a heartbeat.** After dispatching workers, create or update one
   current-thread heartbeat automation to continue orchestration while work is
   active. Prefer a short interval, such as 10 minutes, for active worker
   batches; lengthen or pause it only when the project is waiting on human input
   or external systems. The heartbeat prompt should check Linear issue status,
   worker threads, PRs, CI, blockers, and acceptance gates. Update an existing
   project heartbeat instead of creating duplicates.
8. **Review returns.** For each worker report or PR, run the acceptance gates
   below before moving Linear forward.

## Acceptance Gates

### Spec Gate

Verify the PR against fresh Linear state, not the worker's memory:

- issue acceptance criteria satisfied
- parent PRD/Project intent preserved
- blockers respected
- comments and HITL decisions since dispatch honored
- out-of-scope boundaries respected
- no missing UX/API/persistence/test piece for the vertical slice

Use the paired reviewer/spec thread for non-trivial implementation review. It
should refresh live Linear before finding mismatches, omissions, or scope drift.
It may leave GitHub PR review comments for concrete line-level findings, but
the orchestrator should use the reviewer thread verdict as the acceptance input.
For tiny or mechanical changes, the orchestrator may explicitly waive the
reviewer thread and record why.

### Quality Gate

Require worker evidence from `production-ready`:

- relevant review stack completed
- verification commands and results recorded
- PR linked
- CI and PR/Linear comments watched until green/resolved or blocked with
  evidence
- any active worker CI heartbeat automation named with its interval and stop
  condition

Escalate to additional read-only review through `review-swarm` or relevant
stack skills when risk is high or worker evidence is weak.

## Feedback

If a gate fails, send targeted feedback to the worker thread or Linear issue.
Do not rewrite the code yourself unless the user explicitly changes your role.

## Done

Move an issue to the live Linear completed state only when:

- spec gate passes
- quality gate passes
- CI is green or the accepted completion path does not require CI
- Linear has a final evidence comment with PR, verification, and residual risk

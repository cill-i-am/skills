---
name: worker
description: Implement one Linear issue end to end. Use for assigned ready issues or orchestrator-spawned worker threads; deliver a narrow PR, evidence, production-ready checks, CI/comment watch, and Linear updates.
---

# Worker

A worker owns exactly one Linear issue. The worker's job is to ship the vertical
slice, prove it, and report evidence. The orchestrator owns final acceptance.

## Read First

- `docs/agents/linear-workflow.md`
- `docs/agents/triage-states.md`
- `docs/agents/execution-policy.md`
- `docs/agents/domain.md`
- the Linear issue, parent Project/PRD, blockers, and comments
- nearest `AGENTS.md`

## Workflow

1. **Refresh Linear.** Read the live issue, parent Project/PRD, blockers,
   labels/status, and comments before acting. Treat handoff context as
   orientation, not the operative source of truth.
2. **Confirm assignment.** Ensure the issue is unblocked and in an implementable
   state. If it is HITL, blocked, or under-specified, stop and update Linear.
3. **Create a branch.** Use `codex/<linear-key>-<slug>` unless instructed
   otherwise. Never start provider-mutating Alchemy work without confirming
   stage and credentials.
4. **Plan the narrow slice.** Re-state the acceptance criteria, out-of-scope
   boundaries, expected files or modules, and verification commands. Keep this
   brief. Proceed after posting unless Linear, the orchestrator, or a clear
   risk flag requires explicit plan approval.
5. **Implement with the right discipline.**
   - Use `tdd` for behavior changes when practical.
   - Use `systematic-debugging` for failures, bugs, flakes, or unexpected
     behavior.
   - Use `subagent-execution` for bounded implementation, investigation, and
     review tasks.
6. **Review locally.** Before claiming done, run `production-ready`.
7. **Open or update a PR.** Use the Linear issue title as the PR title when it
   includes the key.
8. **Own CI and comments.** Immediately after PR creation/update, run
   `ci-watch` in this worker thread. Watch GitHub checks, GitHub PR comments,
   review threads/review decisions, and new Linear comments. Fix actionable
   failures and concrete reviewer comments when the fix stays inside the issue
   scope, push follow-up commits, reply/update evidence, and keep watching
   until green, resolved, or genuinely blocked. Stop and ask the orchestrator
   when a comment changes scope, product behavior, architecture, data shape, or
   requires judgment.
9. **Use a short watcher heartbeat when needed.** If checks or comments remain
   pending after a short inline watch, create or update a 2-3 minute heartbeat
   automation for this worker thread with the Codex app `automation_update`
   tool. Include the PR URL, Linear issue key, branch, head SHA, pending
   checks/comments, retry/fix budget, Linear update requirement, and stop
   condition. Reuse an existing watcher for the same PR; do not create
   duplicates. Delete, pause, or stop the watcher through `automation_update`
   once the PR is green, merged, closed, or blocked with evidence.
10. **Update Linear.** Comment with PR URL, branch, commits, verification
   evidence, CI/comment-watch status, watcher automation if active, blockers,
   and residual risks.
11. **Create follow-ups only when concrete.** A worker may create narrow Linear
   follow-up issues discovered during implementation or review. The follow-up
   must link to the current issue, explain why it is out of scope, and leave
   prioritization to triage or the orchestrator. Do not create speculative
   backlog items.

## Stop Conditions

Stop and update Linear instead of improvising when:

- blocker or HITL decision is discovered
- acceptance criteria conflict with source or parent PRD
- implementation requires out-of-scope files
- verification fails repeatedly without a clear root cause
- provider credentials, Alchemy stage mutation, or production data is needed
- PR scope grows beyond one vertical slice
- reviewer feedback changes scope, product behavior, architecture, data shape,
  or requires judgment
- GitHub or Linear auth is unavailable for required PR/comment watching

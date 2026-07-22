---
name: worker
description: Implement one Linear issue end to end. Use for assigned ready issues or orchestrator-spawned worker threads; deliver a narrow PR, evidence, production-ready checks, CI/comment watch, and Linear updates.
---

# Worker

A worker owns exactly one Linear issue. The worker's job is to ship the vertical slice, prove it, and report evidence. The orchestrator owns final acceptance.

## Read First

- `docs/agents/linear-workflow.md`
- `docs/agents/triage-states.md`
- `docs/agents/execution-policy.md`
- `docs/agents/domain.md`
- the Linear issue, parent Project/PRD, blockers, and comments
- nearest `AGENTS.md`

If `docs/agents/*` is absent because the project has not run `linear-setup` yet or this is a bundle simulation, read the matching templates from `../linear-setup/assets/docs/agents/*` when available and state that the target repo still needs `linear-setup`.

## Workflow

1. **Refresh Linear.** Read the live issue, parent Project/PRD, blockers, labels/status, and comments before acting. Treat handoff context as orientation, not the operative source of truth.
2. **Confirm assignment.** Ensure the issue is unblocked and in an implementable state. If it is HITL, blocked, or under-specified, stop and update Linear.
3. **Activate and prove isolation.** Use `worktree-isolation` to verify the orchestrator-provisioned detached worktree came from the exact freshly fetched `origin/main` SHA. Create and own `codex/<linear-key>-<slug>` inside that worktree. After a fresh `git fetch --prune origin`, do not plan or edit until the tree is clean, `HEAD == origin/main == merge-base`, and ahead/behind is `0 0`. Report the isolated path, branch, all three SHAs, ahead/behind, install result, and baseline result or blocker. Local `main`, coordinator `HEAD`, and handoff prose are not base evidence. Never start provider-mutating Alchemy work without confirming stage and credentials.
4. **Plan the narrow slice.** Post one compact plan covering material architecture decisions, scope and explicit boundaries, the smallest end-to-end tracer, intended tests and verification, known risks, and deferred questions. Do not attempt to pre-specify every table, query, retry, operation count, or hypothetical failure path. High-risk planning should normally fit within approximately 60-90 minutes.
   - Obtain one independent plan review by default.
   - If findings require changes, make one targeted revision. Do not replace the whole plan unless product scope or acceptance criteria materially changed.
   - Do not enter a third plan-review cycle without explicit human approval.
   - Begin a bounded reversible implementation slice as soon as no classified `pre-edit blocker` remains.
5. **Implement the tracer and learn.** Build the smallest vertical tracer first. Prefer realistic fixtures, provider-free fakes, outbound-call traps, measured operation counts, and crash/replay or lifecycle-transition tests over more planning prose. Open a draft PR as soon as the tracer works.
   - Use `tdd` for behavior changes when practical.
   - Use `systematic-debugging` for failures, bugs, flakes, or unexpected behavior.
   - Use `subagent-execution` for bounded implementation, investigation, and review tasks.
6. **Review locally.** Before claiming done, run `production-ready`.
7. **Open or update a PR.** Use the Linear issue title as the PR title when it includes the key.
8. **Own CI and comments.** Immediately after PR creation/update, run `ci-watch` in this worker thread. Watch GitHub checks, GitHub PR comments, review threads/review decisions, and new Linear comments. Fix actionable failures and concrete reviewer comments when the fix stays inside the issue scope, push follow-up commits, reply/update evidence, and keep watching until green, resolved, or genuinely blocked. Stop and ask the orchestrator when a comment changes scope, product behavior, architecture, data shape, or requires judgment.
9. **Use a short watcher heartbeat when needed.** If checks or comments remain pending after a short inline watch, create or update a 2-3 minute heartbeat automation for this worker thread with the Codex app `automation_update` tool. Include the PR URL, Linear issue key, branch, head SHA, pending checks/comments, retry/fix budget, Linear update requirement, and stop condition. Reuse an existing watcher for the same PR; do not create duplicates. Delete, pause, or stop the watcher through `automation_update` once the PR is green, merged, closed, or blocked with evidence.
10. **Update Linear.** Comment with PR URL, branch, commits, verification evidence, CI/comment-watch status, watcher automation if active, blockers, and residual risks.
11. **Create follow-ups only when concrete.** A worker may create narrow Linear follow-up issues discovered during implementation or review. The follow-up must use a plain-language outcome title, link to the current issue, sit under the nearest correct parent outcome when known, explain why it is out of scope, and leave prioritization to triage or the orchestrator. Put code symbols and implementation details in the body. Do not create speculative backlog items.

## Stop Conditions

Stop and update Linear instead of improvising when:

- blocker or HITL decision is discovered
- fetched `origin/main` does not equal the worker base before edit authority
- the worktree is dirty, has non-zero ahead/behind, or cannot prove the required `HEAD == origin/main == merge-base` equality
- acceptance criteria conflict with source or parent PRD
- implementation requires out-of-scope files
- verification fails repeatedly without a clear root cause
- provider credentials, Alchemy stage mutation, or production data is needed
- PR scope grows beyond one vertical slice
- a classified `pre-edit blocker` shows that even a bounded reversible slice is unsafe or likely to encode the wrong product meaning
- reviewer feedback materially changes product scope or acceptance criteria; ordinary `pre-merge blocker`, `deferred hardening`, and `question` findings do not restart whole-plan review
- GitHub or Linear auth is unavailable for required PR/comment watching

If `origin/main` advances before edit authority, hold work and notify the orchestrator. Use only the non-destructive exact-base refresh in `worktree-isolation`; then rerun relevant baselines, revalidate the existing plan against the fresh base, and repeat focused review for affected deltas. Do not reset, rebase speculatively, commission a replacement plan without material scope change, or continue from stale handoff state.

---
name: subagent-execution
description: Delegate bounded support work to focused subagents without replacing user-visible worker/reviewer threads. Use inside worker or orchestrator sessions for parallel investigations, implementation subtasks, spec checks, or risk reviews.
---

# Subagent Execution

Use subagents as support workers, not as the main project operating model. For
non-trivial Linear implementation, user-visible Codex worker and reviewer/spec
threads remain the default because the human and orchestrator can inspect and
steer them directly.

## Good Uses

- bounded codebase investigation
- isolated reproduction or debugging help
- read-only spec, security, architecture, or simplicity review
- cheap read-only Browser or runtime smoke checks for UI-facing PRs
- independent implementation subtask with a clear file owner
- CI failure triage where multiple checks can be inspected in parallel

Do not use subagents when the task needs continuous user conversation, broad
system judgment, or concurrent edits to the same files.

## Prompt Shape

Give each subagent only the context it needs:

- issue/PRD summary or acceptance criteria
- exact scope and files, if known
- constraints and out-of-scope boundaries
- whether it is read-only or may edit
- required verification commands for edit agents
- local URL, preview URL, dev command, target flows, viewports, or focused test
  subset for runtime verification agents
- expected output format

Subagents do not inherit your context. Point to exact files or include the
minimal raw artifacts they must inspect. Avoid giving them your intended answer
when the goal is independent review.

## Batch Contract

Before spawning a batch, define each subagent's role, file or artifact scope,
authority, stop condition, and expected output. Do not assign two edit-capable
subagents to the same files at the same time. If work overlaps, serialize it or
make one subagent read-only.

## Defaults

- Review/spec subagents are read-only.
- Investigation subagents should return evidence, not opinions.
- Runtime verification subagents may click, type, refresh, and inspect local or
  preview targets, but must not edit files or mutate production/provider state.
- Edit subagents must own a narrow file set and report their diff plus checks.
- The controller verifies results before acting on them.
- Subagent output is advisory until the controller checks it against source,
  tests, Linear/spec context, or the current diff.

## Stop Conditions

Stop delegating and escalate to the worker/orchestrator when:

- a subagent is blocked twice on missing context
- the needed change leaves the issue scope
- tests fail repeatedly without root cause
- the Linear issue, PRD, or architecture direction appears stale
- a decision affects product behavior, data shape, cost, security, or provider state

Completion criterion: every subagent result is either accepted with local
verification, rejected with a reason, or converted into a blocker/follow-up that
the worker or orchestrator owns.

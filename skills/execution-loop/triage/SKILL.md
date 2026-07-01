---
name: triage
description: Triage Linear issues, Projects, PRDs, bugs, and feature requests through the repo's Linear state machine. Use when the user wants to create, classify, clarify, label, unblock, close, or prepare Linear work for human or agent execution.
---

# Triage

Move Linear work through the state machine defined in
`docs/agents/triage-states.md`. Triage is about making work truthful: either
ready for an AFK worker, waiting for information, blocked, ready for a human, or
explicitly out of scope.

## Read First

- `docs/agents/linear-workflow.md`
- `docs/agents/triage-states.md`
- `docs/agents/domain.md`
- relevant Linear issue/Project/PRD/comments
- relevant source and architecture docs for the area

Use the Linear skill/app for reads and writes. If Linear tools are unavailable,
stop and ask the user to connect Linear.

## Show What Needs Attention

When asked what needs attention, query Linear and group oldest first using the
live workflow states that correspond to:

1. Untriaged or unlabeled work.
2. needs grooming.
3. needs information with new reporter or maintainer activity.
4. blocked work whose blockers changed.
5. in-review work missing PR, CI, or orchestrator evidence.

Show counts and one-line summaries. Let the user pick unless they asked for a
specific issue.

## Triage A Specific Issue

1. **Gather context.** Read the full issue, comments, labels/status, parent
   Project/PRD, blockers, assignee, and related PRs. Check relevant source or
   docs rather than trusting stale issue prose.
2. **Classify.** Recommend category and state:
   `bug`, `enhancement`, `chore`, `spike`; and one of the states in
   `docs/agents/triage-states.md`.
3. **Reproduce bugs when possible.** Trace the likely code path and run focused
   commands when cheap. If reproduction needs credentials, provider state, or an
   Alchemy stage, state that clearly.
4. **Clarify if needed.** Use `grilling` in Docs Mode for real domain ambiguity.
   Capture resolved decisions in Linear comments or the parent PRD.
5. **Prepare for execution.** If ready for an agent, ensure the issue has
   acceptance criteria, blockers, verification expectations, out-of-scope
   boundaries, and AFK/HITL classification.
6. **Apply Linear updates.** Update status/labels/relations and add a concise
   comment explaining what changed.

## Ready Checklist

Before moving an issue to the live Linear state that means "ready for agent
work", verify:

- parent Project/PRD is linked or intentionally absent
- acceptance criteria are concrete and testable
- blockers are represented as Linear relations
- no unresolved HITL decision is hidden in prose
- out-of-scope boundaries are explicit
- verification expectations are realistic
- likely review stack and risk tier are noted

## Wontfix / Out Of Scope

For rejected enhancements, record the reasoning durably:

- Prefer a Linear Project/issue comment or linked document if this is purely
  product scope.
- Use a repo doc only when the decision affects future architecture or agent
  behavior.

The reason must be durable. "Not now" is usually needs information or deferred
work, not a final won't-do decision.

## Follow-Up Issues

Workers may create follow-up issues only for narrow, concrete work discovered
during implementation or review. Triage those issues like any other intake:
verify the link to the source issue, confirm why the work was out of scope, and
prioritize it deliberately. Do not preserve speculative backlog grooming just
because a worker generated it.

## Comments

Every triage comment should include:

- current recommendation
- evidence or code/docs checked
- open questions or blockers
- next state and why

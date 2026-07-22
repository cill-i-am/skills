---
name: production-ready
description: Aggregate current delivery evidence for an orchestrator decision. Use to summarize exact-head scope, acceptance proof, physical/runtime evidence, CI, review findings, external gates, and residual risk without initiating another review stack.
---

# Production Ready

This skill is an evidence aggregator and decision input. It does not grant
authority, start a review stack, merge, or change Linear state. Use
`docs/agents/execution-policy.md` for authority and dispositions.

## Read

- live Linear issue, Project/PRD, blockers, comments, and linked PR;
- exact implementation head and complete diff;
- acceptance criteria and scope boundaries;
- automated, physical/runtime, CI, preview, and external evidence;
- exact-head reviewer findings and orchestrator dispositions;
- current watcher owner and pending delta, if any.

Treat handoff prose as orientation. Refresh the live sources before reporting.

## Aggregate

### Outcome

- What observable outcome was requested?
- What exact head and scope implement it?
- Did scope remain inside the Ready issue?

### Proof

Map each material acceptance criterion to:

- automated proof and fresh result;
- physical/runtime proof through the real changed seam;
- or an explicit unproven external gate.

Do not claim that types or unit tests alone prove a runtime or user-visible
outcome. For UI, CLI, persistence, migration, replay, recovery, or workflow
claims, name the actual interaction, disposable fixture, durable artifact, or
failure/restart probe used.

### Review And Findings

Record the immutable head reviewed, reviewer confidence, and every material
finding with its canonical disposition: Fix before merge, residual risk,
follow-up, or human decision required. Confirm focused corrections were verified
against the necessary delta.

`code-review` and `simplify` are Build capabilities. One independent exact-head
review is the normal Verify step. `review-swarm` is exceptional and must be
explicitly requested or justified by broad, security/privacy-sensitive,
data-affecting, or cross-boundary risk. Do not recursively invoke them here.

### CI, Preview, And Watch

Record current checks, preview state, comments, and head SHA. If something is
pending, name exactly one `ci-watch` or heartbeat owner for the next poll. Do not
duplicate polling or restate historic approvals.

### External Gates And Risk

State credentials, provider, production, publication, customer-data,
destructive, spend, legal/policy, or irreversible gates precisely. Separate
them from provider-free proof when the issue allows a safe bounded slice.

## Decision Readout

Return:

- **Ready for decision:** acceptance-to-proof mapping is complete, exact-head
  review and checks are current, findings have dispositions, and external gates
  and residual risks are explicit.
- **Pending evidence:** a named proof, check, comment, or exact-head review is
  outstanding and has one owner and next action.
- **Human decision required:** product meaning or an external/irreversible
  authority choice cannot be delegated.

Do not label an in-scope fixable technical defect as human-blocked. Name it as
`Fix before merge` with the smallest correction and owning worker.

Completion criterion: the orchestrator can choose fix, accept residual risk,
create a follow-up, or ask the human without starting another planning or review
cycle.

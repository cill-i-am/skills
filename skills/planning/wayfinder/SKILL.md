---
name: wayfinder
description: Map decision discovery for work too uncertain or too large to become a PRD in one session. Use when the destination can be named but the route is still foggy, important decisions depend on one another, or a Linear-native discovery map is needed before to-prd.
---

# Wayfinder

Wayfinder discovers the route to a named destination. It is for work whose
product or architecture decisions are too uncertain or interdependent to become
a trustworthy PRD in one session.

Wayfinder owns decision discovery, not implementation slicing. It plans and
records decisions; it does not create delivery issues, dispatch workers,
implement code, or grant execution authority. `docs/agents/execution-policy.md`
remains the authority source once delivery begins.

## Lifecycle

```txt
grilling
  -> wayfinder when the route is still foggy
  -> to-prd
  -> to-issues
  -> orchestrator
```

Skip Wayfinder when grilling has already resolved enough product intent for
`to-prd`. Never hand unresolved decision tickets directly to `to-issues` or an
implementation worker.

## Read First

- the conversation and existing planning artifacts;
- relevant Linear Initiative, Project, documents, issues, relations, and
  comments when available;
- `docs/agents/domain.md`, `docs/agents/linear-workflow.md`, and relevant PRDs,
  vision docs, architecture docs, ADRs, code, and tests;
- `../grilling/` and `../domain-modeling/` when the destination or domain
  language needs sharpening.

Use Linear for real map reads and writes. If Linear is unavailable, the user
asks for a draft, or tracker mutation is not authorized, use Draft Mode.

## The Linear Map

The low-resolution map is a Linear Project plus a draft PRD or Project document.
Use the Project to name the destination and hold the map; use decision Issues to
hold precise questions and native blocker relations.

The map contains:

```md
## Destination

<One or two lines naming what becomes possible when discovery is complete.>

## Decisions So Far

- <Decision issue link by descriptive title> — <one-line gist, not a duplicate>

## Not Yet Specified

<In-scope fog that cannot yet be phrased as a precise decision question.>

## Out Of Scope

<Explicit boundaries beyond this destination.>

## Completion Condition

<What must be decided for to-prd to take over without inventing intent.>
```

The map is an index. Each decision's detail has one durable owner: normally the
resolution comment on its decision Issue until `to-prd` incorporates the settled
product intent into the PRD. Elsewhere, use a short gist and link.

## Decision Issues

A decision Issue contains one sharp question, the evidence needed to resolve
it, and whether it is HITL or AFK. Keep decision Issues visibly distinct from
delivery Issues; do not mark them implementation-ready or place them in the
orchestrator queue.

Useful decision modes are:

- **Grilling (HITL):** a person must choose product meaning, preference, scope,
  or risk. Use one-question-at-a-time grilling and domain modeling.
- **Research (AFK):** source-backed facts can narrow the decision. Use available
  research tools or an explicitly authorized research lane; do not assume a
  particular subagent exists.
- **Prototype (usually HITL):** a cheap, reversible artifact raises the fidelity
  of a decision. Creating it requires the normal filesystem or tool authority
  and must not silently become destination implementation.
- **Enabling task (HITL or AFK):** bounded manual work is necessary to expose a
  fact, such as obtaining access or sampling data. It may unblock a decision but
  must not deliver the destination.

Use Linear blocker relations to represent decision dependencies. The frontier
is the open, unblocked decision Issues. One decision Issue per session is the
focus default, not a rigid invariant; combine or parallelize only when doing so
does not blur ownership or require unavailable capabilities.

## Fog, Frontier, And Scope

- **Decision Issue:** the question can be stated precisely now, even if its
  answer is unknown or blocked.
- **Not yet specified:** the area is in scope, but an upstream answer is needed
  before the question can be made precise.
- **Out of scope:** the area is beyond the named destination and does not
  graduate into a decision Issue unless the destination changes.

Do not pre-slice fog into implementation work. As decisions resolve, graduate
newly precise questions into decision Issues, add blocker edges, and remove the
corresponding fog entry.

## Chart The Map

1. Use grilling and domain modeling to name the destination, explicit scope,
   and completion condition.
2. Explore breadth-first across the decision space. Separate known decisions,
   sharp open questions, in-scope fog, and out-of-scope work.
3. If there is no meaningful fog or multi-session decision graph, stop and hand
   the context to `to-prd` instead of creating ceremony.
4. In Draft Mode, return the proposed Project, draft document, decision Issues,
   HITL/AFK modes, and blocker graph inline.
5. When authorized to publish, create or update the Linear Project and draft
   document, create decision Issues, then add blocker relations after the Issues
   exist. Use live workspace conventions rather than hard-coded labels,
   assignees, or statuses.
6. Stop after charting. Do not resolve the map and do not create delivery Issues
   in the same step.

## Resolve A Decision

1. Refresh the map, frontier, concurrent changes, and relevant evidence.
2. Choose one frontier decision by default, or use the one the user named.
3. Resolve it through the appropriate HITL or AFK mode. Cross-check claims with
   code, docs, and domain language.
4. In Draft Mode, return the proposed resolution and map delta without mutating
   Linear.
5. When authorized, record the decision once on its Issue, update the map index
   with a short linked gist, and apply the live resolution state.
6. Add newly visible decision Issues and blocker edges; graduate or remove fog;
   move revealed scope exclusions to Out Of Scope.
7. Stop at the decision boundary. The urge to implement is normally evidence
   that this decision is ready for the next planning stage.

## Draft And Mutation Rules

- Read-only discovery works without Linear access.
- Real Linear changes require a user request or workflow authorization that
  clearly includes those mutations.
- Filesystem artifacts, prototypes, ADRs, and glossary changes require their
  normal write authority; use `domain-modeling` for their placement and
  threshold rules.
- Do not duplicate settled product intent across the map, PRD, glossary, ADR,
  and issue comments. Name one owner and link elsewhere.

## Completion And Handoff

Wayfinding is complete when:

- the destination and out-of-scope boundary are stable;
- every decision needed for the PRD is resolved and indexed;
- no in-scope fog remains that would force `to-prd` to invent intent;
- durable domain language and qualifying ADRs have named owners;
- the draft PRD can be completed without converting decision Issues into
  delivery Issues.

Hand the Project, map document, resolved decision links, domain-language owners,
ADRs, remaining non-blocking unknowns, and completion evidence to `to-prd`.
`to-prd` owns consolidation into product truth; `to-issues` begins only after
that PRD is ready.

Completion criterion: the route to a PRD is clear, decision and delivery work
remain distinct, every real or proposed mutation is authorized, and execution
authority still belongs solely to Lean Execution policy.

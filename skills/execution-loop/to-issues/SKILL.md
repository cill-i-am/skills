---
name: to-issues
description: Break a Linear PRD, Project, plan, or feature brief into dependency-aware Linear issues using AFK-ready vertical slices. Use when the user wants implementation tickets, issue DAGs, blockers, worker-ready tasks, or to convert a PRD into Linear work.
---

# To Issues

Break a PRD or plan into independently assignable Linear issues. Linear is the
source of truth for the issue graph, blockers, status, worker evidence, and PR
links.

## Read First

- `docs/agents/linear-workflow.md`
- `docs/agents/triage-states.md`
- `docs/agents/domain.md`
- relevant parent Linear Initiative/Project/PRD
- relevant `docs/architecture/*`

If `docs/agents/*` is absent because the project has not run `linear-setup` yet
or this is a bundle simulation, read the matching templates from
`../linear-setup/assets/docs/agents/*` when available and state that the target
repo still needs `linear-setup`.

Use the Linear skill/app for reads and writes when publishing real issues. If
the user asks for read-only planning, simulation, or draft issue slices, use
Draft Mode instead of stopping for missing Linear access.

## Draft Mode

Draft Mode produces issue slices without mutating Linear. Use it for simulations,
offline planning, PRD review, or when the user wants Linear-ready markdown before
publishing. In Draft Mode:

- read the available PRD, Project brief, plan, or conversation context;
- produce issues in the same shape as the issue body template;
- include dependency/blocker notes in prose instead of Linear relations;
- mark each issue `draft`, `AFK-ready`, or `HITL`;
- state what would need to happen before publishing to Linear.

## Process

1. **Gather source material.** Read the PRD, Project, Initiative, linked issues,
   comments, and current source/architecture docs where needed.
2. **Identify vertical slices.** Each issue should cut through the necessary
   layers end-to-end and produce a demoable or independently verifiable result.
   Avoid horizontal tickets like "add schema", "add API", then "add UI" unless
   each is truly independently useful.
3. **Classify each slice.**
   - `AFK`: worker can implement without more human input.
   - `HITL`: needs design, product, credentials, provider action, or manual
     validation before implementation.
4. **Build the dependency graph.** Use Linear blocker relations, not just prose.
   Prefer dependency order that unblocks the most work earliest.
5. **Quiz before publishing when interactive.** Show the proposed issue list with
   type, dependencies, risk, and covered user stories. Ask for approval if there
   is meaningful ambiguity.
6. **Publish in dependency order.** Create blockers first so later issues can
   link to real Linear IDs.
7. **Prepare orchestrator handoff.** Each issue should be self-contained for a
   fresh worker session and include review/verification expectations.

In Draft Mode, stop after the proposed issue list, dependency summary, and
publishing notes.

## Issue Body Template

```markdown
## Parent

Linear Project/PRD: <link>
Initiative: <link or omit>

## What to build

Describe the end-to-end behavior this vertical slice delivers. Use stable
domain, interface, and workflow language. Avoid step-by-step implementation
unless a specific implementation decision is part of the PRD.

## Acceptance criteria

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Verification expectations

- Tests or checks expected for this slice.
- Browser, migration, auth, API, or CI evidence required if relevant.

## Risk and review

- Risk: low | medium | high
- Expected review stack: production-ready, code-review, review-swarm for broad
  risk, simplify before wrap-up, and any stack-specific skills relevant to the
  changed surfaces.

## Blockers

- None - can start immediately
- Or: blocked by <Linear issue>

## Out of scope

- Adjacent work that should not be touched by this issue.
```

## Slicing Rules

- Prefer many thin AFK slices over a few broad issues.
- Mark real decision work as HITL instead of pretending it is implementable.
- Include blockers/dependencies as Linear relations.
- Do not close or modify the parent PRD/Project except to link the new issues
  and summarize the issue graph.
- Do not assign work to a worker until all blockers are represented in Linear.

## Linear Updates

After publishing, update the parent Project/PRD with:

- issue list in recommended execution order
- blocker/dependency summary
- HITL decisions that remain
- which issues are ready for the orchestrator

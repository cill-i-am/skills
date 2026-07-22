---
name: to-issues
description: Break a Linear PRD, Project, plan, or feature brief into an outcome-named, dependency-aware Linear issue hierarchy using AFK-ready vertical slices. Use when the user wants implementation tickets, issue DAGs, blockers, worker-ready tasks, or to convert a PRD into Linear work.
---

# To Issues

Break a PRD or plan into independently assignable Linear issues. Linear is the
source of truth for the issue graph, blockers, status, worker evidence, and PR
links.

## Read First

- `docs/agents/linear-workflow.md`
- `docs/agents/triage-states.md`
- `docs/agents/execution-policy.md`
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
- show the proposed parent/child outcome hierarchy;
- include dependency/blocker notes in prose instead of Linear relations;
- mark each issue `draft`, `AFK-ready`, or `HITL`;
- state what would need to happen before publishing to Linear.

## Process

1. **Gather source material.** Read the PRD, Project, Initiative, linked issues,
   comments, and current source/architecture docs where needed.
2. **Derive the outcome hierarchy.** Name the overall Project outcome, then group
   work under a small set of parent capability outcomes. Keep technical
   decomposition out of the hierarchy unless it represents an independently
   meaningful operational outcome.
3. **Identify vertical slices.** Each leaf issue should cut through the necessary
   layers end-to-end and produce a demoable or independently verifiable result.
   Avoid horizontal tickets like "add schema", "add API", then "add UI" unless
   each is truly independently useful.
4. **Name outcomes.** Give every parent and child Issue a plain-language title
   that describes what becomes true, not the engineering activity. Apply the
   title test and examples in `docs/agents/linear-workflow.md`.
5. **Classify each slice.**
   - `AFK`: worker can implement without more human input.
   - `HITL`: needs design, product, credentials, provider action, or manual
     validation before implementation.
6. **Build both structures.** Use parent/sub-Issue relations for the outcome
   hierarchy and Linear blocker relations for execution order. Do not use one as
   a substitute for the other. Prefer dependency order that unblocks the most
   work earliest.
7. **Quiz before publishing when interactive.** Show the proposed hierarchy with
   outcome titles, type, dependencies, risk, and covered user stories. Ask for
   approval if there is meaningful ambiguity.
8. **Publish parents and blockers first.** Create parent outcome Issues before
   their children, and create blockers before later Issues need to link to them.
9. **Prepare orchestrator handoff.** Each leaf issue should be self-contained for
   one fresh delivery owner and include risk, physical proof, and genuine
   human/external gates. A Ready issue should not require a replacement plan.

In Draft Mode, stop after the proposed issue list, dependency summary, and
publishing notes.

## Issue Template

Use `docs/agents/issue-template.md` as the source of truth for issue body
shape. If the target repo has not run `linear-setup`, use the bundled template
at `../linear-setup/assets/docs/agents/issue-template.md` and state that the
target repo still needs setup.

## Slicing Rules

- Prefer many thin AFK slices over a few broad issues.
- Name parent and child Issues after observable outcomes, not code changes.
- Keep the Project -> parent outcome -> delivery outcome hierarchy shallow and
  readable. Dispatch only leaf Issues; parent Issues aggregate and verify
  outcomes.
- Keep technical tasks in Implementation Notes unless they need independent
  ownership or blocking and can be stated as a meaningful operational outcome.
- Mark real decision work as HITL instead of pretending it is implementable.
- Include blockers/dependencies as Linear relations.
- Do not close or modify the parent PRD/Project except to link the new issues
  and summarize the issue graph.
- Do not assign work to a worker until all blockers are represented in Linear.
- Each published issue must include an outcome, hierarchy role, parent context,
  in/out of scope,
  acceptance criteria, proof-of-outcome expectations, risk tier, human/external
  gates, blockers, and handoff notes sufficient for a fresh delivery owner.

## Linear Updates

After publishing, update the parent Project/PRD with:

- issue list in recommended execution order
- parent/child outcome hierarchy
- blocker/dependency summary
- HITL decisions that remain
- which issues are ready for the orchestrator

---
name: to-prd
description: Turn rough product context into a Linear Project or PRD. Use when the user wants a PRD, product spec, initiative/project framing, or source-of-truth product brief for later issue slicing.
---

# To PRD

Create or update the Linear source of truth for a product idea. Linear owns the
active PRD, Project, Initiative links, issue graph, decisions, and execution
state. The repo owns code and source-backed architecture docs.

## Read First

- `docs/agents/linear-workflow.md`
- `docs/agents/triage-states.md`
- `docs/agents/domain.md`
- relevant `docs/architecture/*`

If `docs/agents/*` is absent because the project has not run `linear-setup` yet
or this is a bundle simulation, read the matching templates from
`../linear-setup/assets/docs/agents/*` when available and state that the target
repo still needs `linear-setup`.

Use the Linear skill/app for Linear reads and writes when publishing. If Linear
tools are not available and Draft Mode does not apply, stop and ask the user to
connect the Linear app before attempting to publish the PRD.

## Process

1. **Gather context.** Use the current conversation, referenced docs, existing
   Linear Initiative/Project/issues, and source code. Do not interview by
   default; synthesize what is known. Ask only for decisions that cannot be
   resolved from Linear, source, or architecture docs.
2. **Choose Linear container.**
   - Existing Initiative/Project: update it.
   - New product area: create or propose a Project under the right Initiative.
   - Unknown team/project mapping: ask once with a recommended default.
3. **Stress-test with domain docs.** Use current repo vocabulary and verify any
   implementation claims against source. If the source contradicts the product
   idea, call that out in the PRD's open questions or implementation decisions.
4. **Sketch test seams.** Prefer existing public interfaces and vertical slices.
   Identify where worker issues should verify behavior.
5. **Write the PRD in Linear.** Prefer a Linear document attached to the Project
   when supported; otherwise use the Project description or a linked PRD issue.
6. **Record unresolved ambiguity.** Mark open questions as HITL instead of
   burying uncertainty.
7. **Prepare for issue slicing.** End with the recommended next step: run
   `to-issues` on the Linear Project/PRD.

## Draft Mode

Use Draft Mode when the user asks for a read-only PRD, a simulation, an inline
artifact, or Linear tools are intentionally unavailable. In Draft Mode, do not
stop for missing Linear access. Produce the PRD inline, mark it as draft or
ready for slicing, and state what would be published to Linear later.

## PRD Shape

Use this structure in Linear.

```markdown
# <Project / PRD title>

## Problem Statement

What user or business problem this solves, from the user's perspective.

## Goals

- Goal 1
- Goal 2

## Non-Goals

- Explicitly out-of-scope item

## User Stories

1. As a <actor>, I want <capability>, so that <benefit>.

## Solution

The intended product behavior and workflow.

## Implementation Decisions

- Stable module, interface, data, API, route, persistence, or workflow decisions.
- Avoid volatile file paths unless the path is itself a contract.

## Testing And Verification

- Public interfaces or workflows to verify.
- Similar tests or verification commands in this repo.
- Browser, migration, auth, or CI expectations when relevant.

## Risks And Rollout

- Product, migration, data, auth, infrastructure, or operational risks.
- Rollout or backout notes where relevant.

## Open Questions / HITL Decisions

- Question, recommended answer, and what is blocked by it.

## References

- Linear Initiative/Project/issues
- Architecture docs
- Relevant source-backed notes
```

## Publishing Rules

- Do not create implementation issues inside this skill unless the user
  explicitly asks; `to-issues` owns issue slicing.
- Link the PRD to the parent Initiative when one exists.
- If creating a Project, give it a title that can become the umbrella for child
  issues and PRs.
- Add a short Linear comment summarizing what changed and what remains open.
- If the PRD is ready for slicing, set or recommend the live Linear state that
  maps to "ready for issue slicing" or "needs grooming" according to
  `docs/agents/triage-states.md`.

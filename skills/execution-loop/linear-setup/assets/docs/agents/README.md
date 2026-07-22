# Agent Workflow Docs

These docs define the repo-local operating loop for Linear-backed agent work.

Use them with the bundled agent skills:

- `linear-workflow.md`: durable source-of-truth rules for Linear Projects, Issues, blockers, PRs, and Codex threads.
- `triage-states.md`: issue intake and routing states.
- `domain.md`: product/domain document conventions.
- `execution-policy.md`: canonical Dispatch, Build, Verify, Decide phases; role
  authority; risk tiers; finding disposition; physical proof; and watcher
  ownership.
- `prd-template.md`: template for Linear Project or PRD documents.
- `issue-template.md`: template for vertical-slice Linear Issues.
- `worker-thread-template.md`: template for Codex worker handoffs.
- `reviewer-thread-template.md`: template for read-only reviewer/spec threads.

Patch stable repo-specific domain terms during setup. Keep Linear team names,
statuses, labels, and Initiatives in Linear as the source of truth.

Role skills and these templates consume `execution-policy.md`; capability skills
provide techniques inside a phase and must not invent authority transitions.

Before a PRD exists, use `grilling` for focused decisions, `domain-modeling` for
canonical language and qualifying ADRs, and `wayfinder` when the destination is
known but the multi-session decision route is still foggy. Wayfinder hands to
`to-prd`; it does not create delivery Issues or dispatch workers.

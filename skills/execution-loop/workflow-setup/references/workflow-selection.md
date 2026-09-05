# Select The Project Workflow

Read the workflow declaration linked by the nearest applicable `AGENTS.md`. For a new project the default location is `docs/agents/workflow.md`; an existing unambiguous declaration at another path is equally valid. Resolve instructions using the host's precedence rules. A skill or template cannot override the user's request or applicable project instructions.

The declaration identifies one source for planning and delivery state: `linear` or `repo`, plus the canonical plan and work-item locations. Keep the choice there; other files link to it. Code, domain language, ADRs, and PR/check evidence retain their own authoritative homes.

Read only the guide matching that choice:

- `linear`: [Linear records](linear.md).
- `repo`: [Repository records](repo.md).

If the choice is absent or conflicting, ask once before creating or updating authoritative planning records. Read-only analysis, an explicitly requested draft, and already authorized implementation with adequate scope can continue. Do not require setup for an unrelated review, debugging task, or CI check.

An unavailable connector does not change the choice. Report the unavailable operation, continue independent work, and label unpublished proposals as drafts. Repository mode is a complete workflow; it is never a fallback or shadow copy of Linear.

Changing an existing choice requires an explicit request that includes the move. Identify the records and destination, preserve their identifiers and evidence links where possible, reconcile concurrent edits, and verify the new canonical records before changing the declaration. Retire superseded records with a pointer to the new owner; do not maintain two writable trackers. Surface unresolved scope or destination choices before the move.

For record shape, use the project's existing templates. Otherwise consult the bundled [PRD](../assets/docs/agents/prd-template.md) or [work item](../assets/docs/agents/issue-template.md) template only when creating that artifact. Read the project's execution and domain policies when the task involves their boundaries; bundled templates are adaptable defaults, not installed authority.

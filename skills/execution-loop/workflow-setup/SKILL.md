---
name: workflow-setup
description: Configure a project's choice of Linear or repository files for planning and delivery state.
---

# Workflow Setup

Establish one clear home for plans, work items, dependencies, status, and delivery decisions. Inspect the nearest `AGENTS.md` and existing workflow docs before choosing locations.

Use [workflow selection](references/workflow-selection.md) to preserve an existing choice or resolve a missing one. Read only the selected storage guide. A request to configure a new project authorizes writing its declaration; it does not authorize migrating an existing tracker or changing its product records.

Create or update a short declaration at the existing owner, or use the [workflow template](assets/docs/agents/workflow.md) at `docs/agents/workflow.md` when no owner exists. Record the chosen source, canonical plan/work-item locations, and the shared branch for repository mode. Resolve actual values, remove unused alternatives, and link to it from the relevant `AGENTS.md`. Keep that pointer short.

Persist enduring project choices only. Keep temporary limits such as "draft this today" or "do not publish this request" in the task's result instead of installing them as ongoing project rules.

Reuse the project's existing domain, readiness, and execution policies. The [template index](assets/docs/agents/README.md) offers defaults for missing guidance needed by the requested workflow; do not install every template or overwrite project decisions merely to match this bundle. Product records, glossaries, and ADR directories are created when there is content for them.

A fresh project can use either mode without installing a connector for the other. Linear access is needed for live Linear operations; existing project instructions can establish Linear as the choice even while access is unavailable. Report that access limitation without changing the choice.

Finish by verifying the declaration and its project links, identifying the selected source and canonical locations, and reporting unresolved access or publication steps. Once configured, ordinary skill use reads the declaration without repeating setup.

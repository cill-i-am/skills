---
name: linear-setup
description: Set up or refresh this repo's Linear-native agent workflow docs and AGENTS.md pointers. Use before first use of to-prd, to-issues, triage, orchestrator, worker, production-ready, ci-watch, or when agent workflow or domain-doc rules change.
---

# Linear Setup

Configure the repo context that the Linear-native skills assume.

## Read

- `AGENTS.md`
- `docs/agents/*` if present
- `docs/README.md`
- Linear teams, Projects, labels/statuses, and Initiatives when tools are
  available

## Ensure

The repo should have:

- `docs/agents/linear-workflow.md`
- `docs/agents/triage-states.md`
- `docs/agents/domain.md`
- `docs/agents/execution-policy.md`
- `docs/agents/prd-template.md`
- `docs/agents/issue-template.md`
- `docs/agents/worker-thread-template.md`
- `docs/agents/reviewer-thread-template.md`
- `docs/agents/README.md`
- an `## Agent Skills` section in `AGENTS.md` pointing at those docs
- `docs/README.md` linking to `docs/agents/README.md`

## Template Policy

Install `docs/agents/*` from bundled templates. Do not synthesize the workflow
docs from scratch on each setup run.

Template sources live under `assets/docs/agents/*` in this skill.

After copying or refreshing templates, patch only stable repo-specific values
such as project terms and domain-doc locations. Keep Linear teams, statuses,
labels, and Initiatives in Linear as the source of truth; read them live when a
skill needs them instead of persisting a second local mapping.

`execution-policy.md` is the canonical authority owner. Preserve its semantics
when adapting role templates; do not add project-local plan approval, reviewer
edit authority, routine pre-edit review, or duplicate watcher requirements.

Create missing files automatically. For existing files, patch conservatively by
section and preserve project-specific decisions. If an existing file has drifted
substantially from the bundled template, report the difference and ask before
replacing it.

## Process

1. Inspect the current files and Linear workspace context.
2. Identify missing or stale workflow docs.
3. Use bundled templates as the source for missing docs.
4. Create missing docs automatically.
5. Patch existing docs in place by section when possible; do not duplicate
   sections.
6. Ask before replacing substantially drifted existing docs.
7. Update `AGENTS.md` through `build-intent-layer` rules.
8. Report which skills will use the refreshed setup.

## Output

Keep the report short:

- files created or updated
- Linear access status and any live workspace assumptions used
- any missing Linear access or follow-up needed

Completion criterion: the repo has the expected `docs/agents/*` files, the
agent instructions point at them, and no repo-local copy of Linear teams,
statuses, labels, or Initiatives was introduced as a second source of truth.

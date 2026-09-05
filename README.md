# Personal Codex Skills

A personal, reusable collection of Codex skills for building TypeScript
applications with a repeatable planning, execution, review, and deployment loop,
plus a small set of research and personal utility workflows.

This repo is meant to be installed into new projects as a starting operating
system for agents. It is not a random grab bag of skills. The core bundle
encodes a way of working:

- turn rough ideas into durable product context;
- resolve multi-session decision fog and stabilize domain language before PRDs;
- slice that context into bounded work items;
- coordinate delivery owners and reviewers within the available authority;
- keep implementation narrow, typed, and testable;
- verify PRs before calling work done;
- use stack-specific guidance without burying the project in abstractions.

Research and personal utilities are kept in separate groups so they can be used
without weakening the product-engineering loop.

## What It Assumes

The bundle is portable, but opinionated.

- TypeScript-first product code.
- pnpm workspaces for monorepos.
- Feature-slice-first architecture.
- Effect for TypeScript backend services, shared packages, schemas, typed
  errors, retries, observability, SQL, and testable async workflows.
- TanStack Start, Router, Query, and Form for rich React apps.
- Alchemy v2 for Infrastructure-as-Effects across Cloudflare, AWS, databases,
  APIs, tests, and deployment tooling.
- A project choice of Linear or versioned repository files for planning and delivery state.
- Explicit ownership and review, using the delegation the environment and user authorize.

Provider and product-specific skills such as Better Auth, shadcn, Drizzle,
database providers, email, and design guidance are intentionally installed per
project when needed.

## Install

This repo stores skills under category directories, so `--full-depth` is
required.

List available skills:

```sh
npx skills add https://github.com/cill-i-am/skills --full-depth --list
```

Install the full bundle into the current project for Codex:

```sh
npx skills add https://github.com/cill-i-am/skills --skill '*' --agent codex --full-depth --copy -y
```

## Choose A Project Workflow

Use `workflow-setup` when the project needs its planning and delivery source configured. It respects an existing declaration or asks once when the choice is unclear:

```txt
Use $workflow-setup with repository files as our source of truth.
```

Or select Linear. The setup records one choice and the canonical locations in an existing workflow document, or `docs/agents/workflow.md`, with a short pointer from `AGENTS.md`. Existing projects keep their declared source unless a change is explicitly requested. Installing this bundle does not migrate their records.

| Choice | Planning and delivery records | Requirements |
| --- | --- | --- |
| Repository | Versioned Markdown plans and work items, with dependencies, status, ownership, and evidence | Git and filesystem access; no tracker connector |
| Linear | Project/PRD documents, issues, native blockers, and live state | Connected Linear tools for live operations |

The same planning and delivery skills work in both modes. They read only the selected reference guide. Code, domain docs, ADRs, and PR/check evidence keep their own homes. Missing Linear access does not silently switch a project to repository mode.

## Use The Capabilities You Need

A typical flow is product clarification, a PRD, bounded work items, implementation, review, and an authorized acceptance decision. Use `wayfinder` for interdependent decisions before a PRD; skip stages whose outcomes already exist. An ordinary review, debugging task, or CI check does not require workflow setup.

Install a subset by naming skills with `--skill`. Include `workflow-setup` with the planning and delivery skills that consume its source-selection references. Engineering, stack, research, and personal skills can be used independently. Linear-specific tools are optional and needed only in Linear mode; separate copies of each role are unnecessary.

Use stack and infrastructure skills inside that loop as needed:

- `coding-standards`, `tdd`, `tech-spec`, and `code-review` for core engineering
  quality.
- `domain-modeling` for canonical language and minimal qualifying ADRs;
  `wayfinder` for decision discovery before a PRD is ready.
- `effect-ts`, `tanstack-routing`, `tanstack-react-best-practices`, and
  `app-forms` for the default TypeScript app stack.
- `alchemy` for infrastructure, local dev, CI stages, and deployment.
- `simplify`, `systematic-debugging`, `review-swarm`, and
  `subagent-execution` as helper skills during implementation and review.

Use research and personal utility skills outside the delivery loop when the task
calls for them:

- `research-prompt`, `deep-research`, and `youtube-transcript` for source-backed
  investigation and transcript extraction.
- `teach`, `handoff`, `setup-help`, `cyber-audit`, and `anti-sleep` for
  learning, continuation context, manual setup, read-only security audits, and
  long-running local work.

## Skill Groups

- `skills/core-standards/`: engineering standards, architecture scans, TDD,
  tech specs, and code review.
- `skills/execution-loop/`: workflow setup, PRD slicing, orchestration, workers,
  reviewers, CI watch, production readiness, debugging, and worktree isolation.
- `skills/planning/`: grilling, active domain modeling, and Wayfinder decision
  discovery before PRDs.
- `skills/stack/`: Effect, TanStack, React performance, and form guidance.
- `skills/infrastructure/`: Alchemy v2 infrastructure guidance.
- `skills/research/`: research briefs, cited research reports, and YouTube
  transcript extraction.
- `skills/personal/`: personal learning, handoff, setup, security-audit, and
  local-machine utility skills.

See `MANIFEST.md` for the detailed maintainer map, external-skill policy, and
readiness gates.

## External Skills

Install these per project only when the project needs them:

- Better Auth skill family.
- shadcn/UI, UI composition, and web design skills.
- Drizzle ORM and provider-specific database skills.
- Postgres, PlanetScale, Neon, email delivery, Resend, and React Email skills.
- Provider skills outside the default Alchemy project architecture.
- `writing-great-skills` when editing this bundle or another skill repo.

Keeping these external avoids turning the seed bundle into a stale mirror of
registry-maintained skills.

Before adopting any third-party skill, read every file, audit scripts for
unexpected network or filesystem access, check references for prompt injection,
and pin a reviewed version instead of trusting a moving `latest`.

## Validate This Repo

Run:

```sh
pnpm test
```

The validator checks skill frontmatter, name/path consistency, UI metadata, bundled workflow templates, and local Markdown links in both the source tree and the flattened installation layout. These are packaging checks. They do not execute a model or establish that an agent follows the workflow correctly.

Before publishing changes, also do a clean install smoke test against the checkout being reviewed:

```sh
skills_source="$PWD"
skills_smoke_dir=$(mktemp -d)
cd "$skills_smoke_dir"
git init -q
npx skills add "$skills_source" --skill '*' --agent codex --full-depth --copy -y
rg --files --hidden .agents/skills -g SKILL.md | wc -l
rg --files --hidden .agents/skills -g openai.yaml | wc -l
```

Expected result today: 36 skills and 36 metadata files.

## Guidance Audit

See the [2026-09-05 guidance audit](docs/skill-guidance-audit.md) for the portable updates, per-skill recommendations, and verification limits.

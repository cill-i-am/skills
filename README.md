# Ceird Skill Seed

Portable Codex skills for building TypeScript product projects with a repeatable
planning, execution, review, and deployment loop.

This repo is meant to be installed into new projects as a starting operating
system for agents. It is not a random grab bag of skills. The bundle encodes a
way of working:

- turn rough ideas into durable product context;
- slice that context into small Linear issues;
- dispatch visible worker and reviewer threads;
- keep implementation narrow, typed, and testable;
- verify PRs before calling work done;
- use stack-specific guidance without burying the project in abstractions.

## What It Assumes

The bundle is portable, but opinionated.

- TypeScript-first product code.
- pnpm workspaces for monorepos.
- Feature-slice-first architecture.
- Effect for TypeScript backend services, shared packages, schemas, typed
  errors, retries, observability, SQL, and testable async workflows.
- TanStack Start, Router, Query, and Form for rich React apps.
- Alchemy v2 for Infrastructure-as-Effects, especially Cloudflare-backed
  projects.
- Linear as the planning and execution source of truth.
- Codex worker/reviewer threads as the default unit of non-trivial agent work.

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

## First Run In A Project

After installing the bundle, ask Codex to run:

```txt
Use $linear-setup to install the agent workflow docs for this repo.
```

That creates or refreshes the repo-local `docs/agents/*` workflow docs and root
`AGENTS.md` pointers expected by the execution-loop skills.

## Operating Loop

The intended path from idea to merged work is:

```txt
linear-setup
  -> grilling / to-prd
  -> to-issues
  -> orchestrator
  -> worker + reviewer
  -> production-ready
  -> ci-watch
```

Use stack and infrastructure skills inside that loop as needed:

- `coding-standards`, `tdd`, `tech-spec`, and `code-review` for core engineering
  quality.
- `effect-ts`, `tanstack-routing`, `tanstack-react-best-practices`, and
  `app-forms` for the default TypeScript app stack.
- `alchemy` for infrastructure, local dev, CI stages, and deployment.
- `simplify`, `systematic-debugging`, `review-swarm`, and
  `subagent-execution` as helper skills during implementation and review.

## Skill Groups

- `skills/core-standards/`: engineering standards, architecture scans, TDD,
  tech specs, and code review.
- `skills/execution-loop/`: Linear setup, PRD slicing, orchestration, workers,
  reviewers, CI watch, production readiness, debugging, and worktree isolation.
- `skills/planning/`: grilling for product and architecture interrogation.
- `skills/stack/`: Effect, TanStack, React performance, and form guidance.
- `skills/infrastructure/`: Alchemy v2 infrastructure guidance.

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

## Validate This Repo

Run:

```sh
pnpm test
```

The validator checks skill frontmatter, name/path consistency,
`agents/openai.yaml` metadata, `$skill-name` default prompts, required
`linear-setup` templates, and stale thread-tool references.

Before publishing changes, also do a clean install smoke test:

```sh
tmpdir=$(mktemp -d)
cd "$tmpdir"
git init -q
npx skills add https://github.com/cill-i-am/skills --skill '*' --agent codex --full-depth --copy -y
find .agents/skills -name SKILL.md | wc -l
find .agents/skills -path '*/agents/openai.yaml' | wc -l
```

Expected result today: 26 skills and 26 metadata files.

# Skill Seed

Portable skill bundle seed for bootstrapping new projects.

The goal is not a random pile of useful skills. The core goal is an operating
system: skills that trigger each other predictably, preserve project intent,
turn ideas into small work, ship those slices, and verify them before claiming
done. Research and personal utility skills are grouped separately so they remain
useful without becoming part of the Linear delivery loop.

## Layout

- `skills/core-standards/`: portable engineering standards and code-quality
  gates.
- `skills/execution-loop/`: Linear, worker, reviewer, CI, and production-ready
  workflow skills.
- `skills/planning/`: grilling and PRD/design-interrogation skills.
- `skills/stack/`: default TypeScript application stack skills.
- `skills/infrastructure/`: default infrastructure/deployment skills.
- `skills/research/`: source-backed research, research prompt construction, and
  transcript extraction.
- `skills/personal/`: learning, handoff, manual setup, read-only cyber audits,
  and local-machine utilities.

## Install

This repo stores skills under category directories, so use `--full-depth`:

```sh
npx skills add https://github.com/cill-i-am/skills --skill '*' --agent codex --full-depth --copy -y
```

After installing into a fresh project, run `linear-setup` before the first
Linear-backed planning or execution-loop task.

## Bundle Shape

### Core Standards

These define how agents should think and write code in any project:

- `build-intent-layer`
- `coding-standards`
- `code-review`
- `tdd`
- `tech-spec`
- `improve-codebase-architecture`

Current core-standard emphasis:

- instruction topology through semantic `AGENTS.md` nodes, with no
  tool-specific mirrors unless explicitly requested or required by tooling
- feature-slice-first architecture across frontend, backend, packages,
  integrations, and platform capabilities
- explicit public exports and package subpaths for schema/protocol/client
  boundaries
- data-flow ownership from persistence through API/MCP/sync/client caches to UI
  state

### Execution Loop

These define the Linear/project loop. Keep them together; they are less useful
as standalone skills.

- `linear-setup`
- `to-prd`
- `to-issues`
- `triage`
- `orchestrator`
- `worker`
- `production-ready`
- `ci-watch`
- `reconcile-project`
- `systematic-debugging`
- `subagent-execution`
- `review-swarm`
- `simplify`
- `worktree-isolation`

Encoded so far:

- `linear-setup` must carry deterministic templates/assets for the required
  `docs/agents/*` files, then patch only repo-specific Linear/workflow values.
- `linear-setup` must use `build-intent-layer` rules when writing or refreshing
  `AGENTS.md` instruction topology.
- `production-ready` uses only portable review skills from this bundle plus
  stack-specific skills that are present in the target project.
- `worker` and `ci-watch` depend on portable `systematic-debugging` and
  `subagent-execution` support skills in this bundle.
- `worker` and `orchestrator` use `worktree-isolation` to keep parallel agent
  work out of the caller's current workspace.

Current loop-tool assumptions:

- User-visible worker/reviewer threads are the default for non-trivial
  implementation.
- Thread lifecycle uses Codex app thread tools such as `create_thread`,
  `send_message_to_thread`, and `set_thread_archived`.
- Watcher and orchestration heartbeats use the Codex app `automation_update`
  tool, not raw automation directives.
- Pre-bootstrap simulations use the bundled `linear-setup/assets/docs/agents/*`
  templates as read-only fallbacks and report that the target repo still needs
  `linear-setup`.

### Planning And Interrogation

These help turn fuzzy ideas into durable plans and design decisions:

- `domain-modeling`
- `grilling`
- `wayfinder`

`grilling` owns both Interview Mode and Docs Mode. Do not keep separate
one-line aliases for "grill me" or "grill with docs"; they create cognitive load
without earning a distinct invocation path.

`domain-modeling` actively challenges canonical language, concrete scenarios,
and code/doc contradictions. It records an ADR only when the decision is hard to
reverse, surprising without context, and the result of a real tradeoff. It
resolves existing doc topology rather than forcing a root `CONTEXT.md`.

`wayfinder` is the Linear-native pre-PRD layer for a named destination whose
decision route remains foggy across sessions. Its Project/document map and
decision Issues are planning artifacts, never delivery Issues or a parallel
execution authority. The required handoff is `wayfinder -> to-prd -> to-issues`.

### Stack Skills

These encode the current preferred TypeScript application stack. Treat all four
as first-class bundled skills, not optional external add-ons:

- `effect-ts`
- `tanstack-routing`
- `tanstack-react-best-practices`
- `app-forms`

### Infrastructure Skills

These encode the default infrastructure/deployment operating model:

- `alchemy`

### Research Skills

These support source-backed work outside the delivery loop:

- `research-prompt`
- `deep-research`
- `youtube-transcript`

Keep these portable. Do not bake in a paid API, personal browser profile, or
vendor-specific key as the only execution path.

### Personal Utility Skills

These are useful to the user but intentionally separate from the reusable
product-engineering loop:

- `teach`
- `handoff`
- `setup-help`
- `cyber-audit`
- `anti-sleep`

Do not make delivery-loop skills depend on personal utility skills. Use them
opportunistically when the user asks for learning, setup, handoff, local audit,
or machine-awake behavior.

### External Skills To Install Per Project

These are intentionally not vendored in this bundle. Install them in projects
that need them, then let `production-ready` and the stack-specific workflow use
them when present:

- Better Auth skill family from the Better Auth team / skills registry
- `writing-great-skills` from Matt Pocock's skills repo for skill-authoring
  review and pruning
- shadcn/UI, UI composition, and web design skills for frontend-heavy projects
- Drizzle ORM, PlanetScale Postgres, Postgres/database, email delivery, Resend,
  and React Email skills from the registry when a project needs those operations
- Provider-specific platform skills that are not part of the default Alchemy
  project architecture

Before installing or vendoring a third-party skill, read every file in its
folder, audit scripts for unexpected network calls or filesystem access, check
references for prompt injection or hidden instructions, verify the name is not a
typosquat, and pin to a reviewed commit or release.

## Rewrite Policy

Old project-specific skills can be useful source material, but do not copy them
into this bundle unchanged. Rewrite them around portable triggers, target-project
language, current official docs where needed, and this bundle's operating loop.

Folded in:

- worktree ergonomics via `execution-loop/worktree-isolation`
- source-backed research and transcript extraction via `research/*`
- personal setup, handoff, learning, local audit, and anti-sleep utilities via
  `personal/*`

## Packaging Notes

- Keep skill bodies concise and route larger guidance through `references/`.
- Keep installable templates under `assets/`; do not require a fresh repo to
  already have old project docs.
- Remove or reshape stray auxiliary files in skill folders unless they are
  deliberate `references/`, `assets/`, `scripts/`, or `agents/openai.yaml`
  resources.
- Keep vendored TanStack package-copy skills out of the reusable repo; use
  `tanstack-routing` to route agents to official bundled TanStack skills in
  `node_modules`.
- Keep provider and operations guidance lean. `alchemy` is the default
  infrastructure skill; install additional provider skills per project only
  when the project needs them.
- Keep personal utilities out of the Linear execution path. They should not
  become hidden dependencies of worker, reviewer, production-ready, or CI
  workflows.

## Readiness Gates

Before considering this bundle ready for broad reuse:

1. Every skill has valid `name` and `description` frontmatter.
2. Every skill has `agents/openai.yaml` metadata with a default prompt that
   invokes the skill by `$skill-name`.
3. Every referenced skill either exists in this bundle or is intentionally
   external and documented as such.
4. Every referenced file path is bundled, generated by `linear-setup`, or scoped
   to the target repo.
5. The loop skills can bootstrap a blank repo by running `linear-setup` first.
6. A fresh agent can run a simulated flow:
   rough idea -> grilling -> optional Wayfinder -> PRD -> issues -> worker
   handoff -> production-ready checklist.

Run `pnpm test` before committing bundle changes. It checks skill frontmatter,
skill-name/path consistency, `agents/openai.yaml` prompt metadata, required
`linear-setup` templates, and stale thread tool references.

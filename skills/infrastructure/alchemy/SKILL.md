---
name: alchemy
description: Alchemy v2 Infrastructure-as-Effects for pnpm projects. Use when authoring, reviewing, debugging, or auditing alchemy.run.ts stacks, Cloudflare resources, GitHub provider resources, Drizzle/Neon/PlanetScale database wiring, CI stages, local dev, monorepos, custom providers, or Effect infrastructure boundaries.
---

# Alchemy

Use this skill as a first-principles Alchemy v2 suite. Do not rely on older local Alchemy skills. Prefer the live official docs and the current package/source in the user's repo whenever API details, versions, provider props, or CLI behavior matter.

## First Moves

1. Inspect the repo before editing: `alchemy.run.ts`, package manager lockfile, `package.json`, existing `src/` shape, tests, CI, and any local instructions.
2. If starting fresh, use pnpm. If a repo already has another package manager locked in, follow the repo, but do not introduce Bun as the default.
3. Read the narrow reference file for the task:
   - Code samples and copy-adaptable patterns: `references/code-samples.md`.
   - New app, tutorial path, concepts, or docs routing: `references/doc-map.md`.
   - Core Alchemy mental model, stacks, resources, phases, outputs, refs, state, providers: `references/core-model.md`.
   - Cloudflare provider setup, state, Workers, Vite, Storage, Hyperdrive, CI: `references/cloudflare.md`.
   - Cloudflare platform patterns and broad resource catalog: `references/cloudflare-platform.md`.
   - Drizzle provider setup, Schema, migrations, Postgres/MySQL runtime guidance: `references/drizzle.md`.
   - Neon provider setup, cheaper development Postgres, branches, Hyperdrive, Drizzle migrations: `references/neon.md`.
   - PlanetScale provider setup, Postgres/MySQL resources, branches, roles/passwords: `references/planetscale.md`.
   - Cross-provider database integration patterns for Hyperdrive, Drizzle, Neon, PlanetScale: `references/database-patterns.md`.
   - Effect service/Layer boundaries for Workers, providers, Actions, databases, tests, retries, and observability: `references/effect-infra.md`.
   - CLI, dev, tests, CI, stages, profiles, v1 migration: `references/operations-ci-testing.md`.
   - pnpm monorepos, workspace package layout, single-stack vs multi-stack deploys: `references/monorepos.md`.
   - GitHub provider resources, GitHub Actions, PR comments, credentials-as-code, webhooks/events: `references/github.md`.
   - Custom resource providers, Actions, custom state stores: `references/provider-extension.md`.
   - Final review, pre-deploy audit, or explicit audit/checklist tasks: `references/audit-checklist.md`.
   - Always load `references/gotchas.md` before finalizing nontrivial Alchemy work.
4. For version-sensitive decisions, browse official docs first. Start with `https://v2.alchemy.run/llms.txt`, then the narrow page.
5. Never run `pnpm exec alchemy deploy`, `pnpm exec alchemy destroy`, or commands that mutate live cloud resources without explicit user confirmation. `pnpm exec alchemy plan`, typechecks, and local tests are fine when they do not mutate production.
6. When writing new Alchemy code, load `references/code-samples.md` and adapt the closest pattern instead of inventing resource wiring from memory.

## Default Project Shape

Use one default-exported stack unless the repo intentionally passes a custom stack file:

```ts
import * as Alchemy from "alchemy";
import * as Cloudflare from "alchemy/Cloudflare";
import * as Effect from "effect/Effect";

export default Alchemy.Stack(
  "MyApp",
  {
    providers: Cloudflare.providers(),
    state: Cloudflare.state(),
  },
  Effect.gen(function* () {
    const bucket = yield* Cloudflare.R2Bucket("Bucket");
    return { bucketName: bucket.bucketName };
  }),
);
```

Merge only the providers the stack needs:

```ts
import * as Layer from "effect/Layer";

providers: Layer.mergeAll(
  Cloudflare.providers(),
  Drizzle.providers(),
  Neon.providers(), // or Planetscale.providers() when the stack uses PlanetScale
)
```

Prefer `Cloudflare.state()` for team and CI Cloudflare projects. Use local `.alchemy/` only for solo experiments or isolated examples, and keep it gitignored.

## beta.58 Platform Ergonomics

Alchemy 2.0.0-beta.58 changed the recommended platform and binding shapes:

- Layer-form Worker and Container tags are pure identity. Declare `export class Api extends Cloudflare.Worker<Api, Cloudflare.WorkerShape>()("Api") {}` and pass props to `Api.make(props, impl)`. Inline `Cloudflare.Worker("Api", props, impl)` remains supported.
- Resolve `Cloudflare.DurableObjectState` in the outer Durable Object init Effect when a Layer or service needs storage.
- Use resource capability namespaces for R2, KV, and Queues: `Cloudflare.R2.ReadWriteBucket(Bucket)`, `Cloudflare.KV.ReadWriteNamespace(Namespace)`, and `Cloudflare.Queues.WriteQueue(Queue)`, with matching `*Binding` or `*Http` Layers.
- Hyperdrive still uses `Cloudflare.Hyperdrive.bind(Hyperdrive)` in beta.58.
- Use `Cloudflare.WorkerLoader`, not `DynamicWorkerLoader`, and `yield* loader.load(...)`.
- Use `Command.Build`, `Command.Dev`, and `Command.Exec`; the old `Build` module is removed.

## Implementation Rules

- Keep logical IDs stable. Changing `"Bucket"` to `"Uploads"` is a replacement, even if the variable name change looked cosmetic.
- Treat resource declarations as values. Export resources or platform tags from modules and `yield*` them in the stack.
- Use `Output` operators (`map`, `interpolate`, `all`) instead of forcing values early.
- Let stages model ownership boundaries: default `dev_$USER`, `dev_shared` for shared development resources when needed, `pr-<number>` for previews, and `prod` for trunk. Do not create a long-lived staging gate by default.
- Pair profiles with credentials, not environments. Stages decide what is deployed; profiles decide how to authenticate.
- Resolve `effect/Config` in platform init, not inside `fetch`, so Alchemy can bind secrets at deploy time.
- In Effect Workers, bind resources in the outer init effect and provide the matching `*BindingLive` layer. Runtime work belongs inside returned handlers.
- In async Workers, declare `env` on the Worker resource and export/use `Cloudflare.InferEnv<typeof Worker>`.
- For Cloudflare frontends, use `Cloudflare.Vite` for Vite-based apps and `Cloudflare.StaticSite` for arbitrary build commands.
- In monorepos, default to one root stack with package resources as siblings; split into package-level stacks only for independent deploy cadence or ownership.
- For GitHub resources, add `GitHub.providers()` to the provider layer and load `references/github.md` before writing comments, secrets, variables, repository resources, webhooks, or GitHub Actions CI stacks.
- Use Neon as the default development Postgres choice unless the repo or user explicitly chooses another provider. Prefer one shared Neon project with per-stage branches over one project per dev/PR stage.
- For databases behind Workers, put Hyperdrive in front of the database origin. Use direct Neon origins, PlanetScale `PostgresRole.origin`, or PlanetScale `MySQLPassword.origin`.
- Use `Drizzle.Schema` plus provider-applied `migrationsDir` for Postgres flows. For PlanetScale MySQL, follow the checked-in migration directory and mysql2 runtime pattern.
- Use `Action` for deploy-time side effects that rerun when inputs change. Use a Resource when lifecycle, read, adoption, replace, or delete semantics matter.
- When writing Effect-based Alchemy code, apply `references/effect-infra.md`: model shared infrastructure as typed services/Layers, provide Layers at stack/Worker/test boundaries, and use dedicated Effect best-practices skills or docs for broader app/domain Effect design.

## Verification

Run the repo's existing typecheck/tests with pnpm. For infrastructure changes, run `pnpm exec alchemy plan` or `pnpm exec alchemy deploy --dry-run` before asking to deploy. For explicit reviews, audits, pre-deploy checks, or nontrivial infra changes, apply `references/audit-checklist.md`. For tests that create cloud resources, choose a safe stage and cleanup path. Report any command you could not run and why.

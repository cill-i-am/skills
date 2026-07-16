---
name: alchemy
description: Use when building, migrating, reviewing, auditing, debugging, or explaining pnpm-based Alchemy v2 Infrastructure-as-Effects projects across Cloudflare, AWS, GitHub, databases, APIs, tests, CI, containers, custom providers, and Effect runtimes.
---

# Alchemy v2

Treat Alchemy v2 as the production default. Use current v2 APIs and patterns; do not preserve v1 compatibility or historical transition guidance unless the user is explicitly migrating an existing v1 project.

Alchemy is Infrastructure-as-Effects: infrastructure resources, application runtimes, bindings, event sources, and deploy-time workflows form one typed Effect program. Use Effect throughout the backend where it improves composition, errors, concurrency, testing, or observability. Keep phase ownership explicit so plan-time declarations, runtime initialization, and request/event execution happen in the right place.

## First Moves

1. Inspect `alchemy.run.ts`, `package.json`, the lockfile, workspace layout, runtime modules, tests, CI, and local instructions before editing.
2. Follow the repository's package manager. For a new personal project, default to pnpm.
3. Confirm the installed Alchemy version and exports before writing version-sensitive code.
4. Open `https://alchemy.run/llms.txt`, then the narrow official page and generated provider API. Use `https://github.com/alchemy-run/alchemy` when docs and installed behavior need source verification.
5. Load only the references needed for the task, plus `references/gotchas.md` before finalizing nontrivial work.

## Task Router

- Concepts, stacks, resources, Actions, Outputs, references, lifecycle, providers: `references/core-model.md`.
- Official docs and source routing: `references/doc-map.md`.
- Effectful constructors, bindings, phases, Layers, event sources/sinks, runtime ownership: `references/effect-infra.md`.
- API modality and trust-boundary design: `references/apis.md`.
- Cloudflare Workers, data, frontends, messaging, AI, security, and local dev: `references/cloudflare.md`.
- AWS compute, data, events, networking, websites, IAM bindings, and bootstrap: `references/aws.md`.
- CLI planning, adoption, state inspection, deploy/destroy, logs, and migration: `references/cli-operations.md`.
- Stages, profiles, auth providers, secrets, state stores, local development, and CI: `references/environments-auth-state.md`.
- Stack, provider, integration, and observability tests: `references/testing.md`.
- Axiom, CloudWatch, OpenTelemetry, logs, metrics, dashboards, and alarms: `references/observability.md`.
- Docker, Kubernetes, and Command build/dev/process resources: `references/containers-toolchain.md`.
- Drizzle, Neon, PlanetScale, and cross-provider database composition: `references/drizzle.md`, `references/neon.md`, `references/planetscale.md`, and `references/database-patterns.md`.
- GitHub resources, events, Actions, PR previews, secrets, and variables: `references/github.md`.
- pnpm workspaces and stack ownership: `references/monorepos.md`.
- Custom resources, providers, Actions, state stores, auth, and runtimes: `references/provider-extension.md`.
- Reviews and pre-deploy evidence: `references/audit-checklist.md`.

## Current Install Rule

Use Node.js 22 or newer and the install command from the live Getting Started page. While the documented v2 channel is `alchemy@next`, keep that channel in setup guidance without hardcoding its resolved package version into durable instructions. Inspect the resolved package and lockfile before using a recently added API. Alchemy v2 uses Effect v4; install Effect and its platform packages at the ranges documented alongside Alchemy rather than guessing a compatible version.

## Default Stack

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
    const bucket = yield* Cloudflare.R2.Bucket("Bucket");
    return { bucketName: bucket.bucketName };
  }),
);
```

For multiple providers, merge only the required provider Layers:

```ts
import * as Layer from "effect/Layer";

providers: Layer.mergeAll(
  Cloudflare.providers(),
  Drizzle.providers(),
  Neon.providers(),
)
```

## Core Rules

- Keep logical IDs stable. Changing an ID is an identity and replacement decision, not a cosmetic rename.
- Treat resource constructors as descriptions. A resource enters the stack graph when its Effect is yielded.
- Compose unresolved values with `Output.map`, `mapEffect`, `all`, `interpolate`, `of`, `ref`, and `redacted`; do not force them early.
- Use a Resource when identity, read, adoption, drift, replacement, or deletion matters. Use an Action for idempotent deploy-time work keyed by inputs.
- Use one stack by default. Split stacks only for real ownership, lifecycle, blast-radius, or deploy-cadence boundaries.
- Stages select isolated infrastructure state; profiles select credentials. Never use profiles as an environment model.
- Prefer remote state for team and CI deployments. Keep local `.alchemy/` state gitignored.
- Use the canonical namespaced provider APIs shown in current docs, such as `Cloudflare.R2.Bucket`, `Cloudflare.KV.Namespace`, `Cloudflare.D1.Database`, and `Cloudflare.Queues.Queue`.
- Bind the narrowest runtime capability that code needs. A binding should wire both access and least-privilege policy where the platform supports it.
- Resolve `Config` and binding dependencies in runtime initialization so Alchemy can discover secrets and permissions. Keep request-, message-, or event-specific work in returned handlers.
- Prefer schemaless RPC for trusted internal services. Add Schema at trust boundaries through Effect RPC or Effect HTTP.
- Model expected provider, SDK, network, and database failures as typed Effect errors. Retry only failures known to be transient.
- Return useful, redacted stack outputs for tests and operators.

## Mutation Safety

Safe without additional confirmation when they do not have project-specific side effects:

- Typechecks, unit tests, formatting, static validation, and source inspection.
- `pnpm alchemy plan`.
- Read-only `alchemy state`, `logs`, `tail`, and profile inspection commands.

Require explicit user confirmation immediately before running:

- `alchemy deploy`, `destroy`, or `dev` when it creates or updates cloud resources.
- `deploy --adopt`, state clearing, provider bootstrap, credential/token creation, or other ownership/authentication changes.
- Any test suite that provisions real cloud resources.
- `alchemy unsafe nuke` under all circumstances.

Never infer approval for one stage, account, or command from approval for another. State the stack, stage, profile/account, mutation, and cleanup behavior before asking.

## Verification

1. Run the repository's existing format, typecheck, lint, and unit-test commands.
2. Run `pnpm alchemy plan --stage <explicit-stage>` when credentials and state access are available and planning is safe.
3. For integration tests, use a unique non-production stage, one stack deployment per suite, assertions against real resources, and guaranteed teardown.
4. For reviews or nontrivial infrastructure changes, apply `references/audit-checklist.md`.
5. Report the resolved Alchemy version, stage/profile assumptions, commands run, skipped checks, and whether any command could mutate cloud state.

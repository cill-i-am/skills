# Documentation Map

Use this map to choose the smallest docs surface before coding. The official index is `https://v2.alchemy.run/llms.txt`; check it first when API names, provider props, generated provider pages, or beta behavior might have changed.

## Official Starting Points

- Getting Started: `https://v2.alchemy.run/getting-started/`
- What is Alchemy: `https://v2.alchemy.run/what-is-alchemy/`
- Docs index for agents: `https://v2.alchemy.run/llms.txt`
- Source repository and examples: `https://github.com/alchemy-run/alchemy-effect`

## Tutorial Path

Read these in order for greenfield Cloudflare apps:

1. Part 1 - first stack: install, `Alchemy.Stack`, `Cloudflare.state()`, `Cloudflare.providers()`, R2 bucket, deploy.
2. Part 2 - Worker: platform init/runtime, resource modules, beta.58 capability bindings such as `Cloudflare.R2.ReadWriteBucket`, matching binding Layers, typed errors, stack outputs.
3. Part 3 - Testing: docs may show `alchemy/Test/Bun`; in pnpm projects prefer `alchemy/Test/Vitest` with the same helper shape, `beforeAll(deploy(Stack))`, `yield* stack`, HTTP assertions, CI cleanup.
4. Part 4 - Local Dev: `pnpm exec alchemy dev`, workerd, hot reload, `ALCHEMY_DEV=1`, `dev` flag in tests.
5. Part 5 - CI/CD: remote state, admin profile, scoped Cloudflare token as code, GitHub Actions stages, PR comments, cleanup.

Cloudflare add-ons:

- Durable Objects: `/tutorial/cloudflare/durable-objects/`
- Cross-worker Durable Object binding: `/tutorial/cloudflare/cross-worker-durable-object/`
- Hibernatable WebSockets: `/tutorial/cloudflare/hibernatable-websockets/`
- Vite SPA: `/tutorial/cloudflare/vite-spa/`
- Containers: `/tutorial/cloudflare/containers/`
- Workflows: `/tutorial/cloudflare/workflows/`
- AI Gateway: `/tutorial/cloudflare/ai-gateway/`
- AI Search / AutoRAG: `/tutorial/cloudflare/ai-search/`
- Artifacts: `/tutorial/cloudflare/artifacts/`
- Hyperdrive: `/tutorial/cloudflare/hyperdrive/`
- Drizzle ORM: `/tutorial/cloudflare/drizzle/`
- Shared database branches: `/tutorial/cloudflare/branch-from-shared-database/`
- Queue consumers: `/tutorial/cloudflare/queue-consumer/`
- RPC Worker: `/tutorial/cloudflare/rpc-worker/`
- RPC Durable Object: `/tutorial/cloudflare/rpc-durable-object/`

## Concepts

- Stack: deployment unit, outputs, stages, cross-stack handles.
- Resource: logical IDs, physical names, references, replacement, graph edges.
- Action: deploy-time Effect nodes with input hashes, no lifecycle.
- Inputs and Outputs: `Output<T>`, `map`, `mapEffect`, `all`, `interpolate`, `ref`.
- References: `Resource.ref`, typed stack handles, `Output.ref`, `Output.stackRef`.
- Resource Lifecycle: plan, reconcile, replace, delete, adoption, recovery.
- Provider: provider Layers, `reconcile`, `delete`, `diff`, `read`, `precreate`, logs.
- Platform: Workers/Lambdas/Containers as infrastructure plus runtime code.
- Phases: plantime/init/runtime, `ALCHEMY_PHASE`, Binding policy vs service.
- Binding: IAM/env/native bindings and typed SDKs.
- Secrets and Config: init-time `effect/Config` binding and runtime capture.
- Layers: infrastructure behind typed `Context.Service` interfaces.
- State Store: local and Cloudflare state, bootstrap, custom stores.
- Testing: Vitest helpers by default, `deploy`, `destroy`, `test.provider`.
- Local Development: cloud resources plus local workerd.
- Observability: OTel, dashboards, alarms.
- Profiles: credential bundles.
- Stages: isolated state and physical names.

## Guides

- Migrating from v1: convert async `await` stacks to v2, keep async handlers if desired.
- CLI Reference: `deploy`, `plan`, `destroy`, `dev`, `tail`, `logs`, `login`, `profile`, `state`, provider subcommands.
- Continuous Integration: PR previews, credentials as code, GitHub comments, cleanup.
- Monorepos: prefer one shared stack until independent deploy cadence justifies multi-stack references; see `references/monorepos.md`.
- Cloudflare provider: state, Workers, Vite, storage, Hyperdrive, CI, local ops; see `references/cloudflare.md`.
- Drizzle provider: Schema, migrations, Postgres runtime, MySQL runtime, relations; see `references/drizzle.md`.
- Neon provider: development Postgres, projects, branches, Hyperdrive origins, Drizzle migrations; see `references/neon.md`.
- PlanetScale provider: auth, Postgres/MySQL resources, branching, roles/passwords, Hyperdrive origins; see `references/planetscale.md`.
- Database integration patterns: cross-provider Hyperdrive, Drizzle, Neon, and PlanetScale recipes; see `references/database-patterns.md`.
- GitHub provider: comments, repositories, secrets, variables, webhooks, events, CI credentials-as-code; see `references/github.md`.
- Secrets and env vars: practical `OPENAI_API_KEY` style binding.
- Effect HTTP API: schema-validated HTTP APIs.
- Shared database across stages: `Resource.ref` to long-lived database projects.
- Effect RPC: typed RPC over HTTP.
- Frontend frameworks: `Cloudflare.Vite` and `Cloudflare.StaticSite`.
- Circular Bindings: platform tag plus `.make(props, impl)` for cycles; in beta.58 props live on `.make()` for layer-form Workers/Containers.
- Effect AI: model layers and config-driven keys.
- Infrastructure Layers: reusable service abstractions over bindings.
- Custom State Store: implement `StateService`.
- Custom Provider: declare Resource and provider lifecycle.

## Provider API Pages

Generated API pages live under `/providers/<provider>/...`. Use them for exact prop names, defaults, constraints, and examples. Do not guess resource props from memory.

Local skill provider references:

- Cloudflare: `references/cloudflare.md`; deeper platform details in `references/cloudflare-platform.md`.
- Drizzle: `references/drizzle.md`.
- Neon: `references/neon.md`.
- PlanetScale: `references/planetscale.md`.
- GitHub: `references/github.md`.
- Cross-provider database composition: `references/database-patterns.md`.

Cloudflare high-use pages:

- Workers: `Worker`, `WorkerRoute`, `RpcWorker`, `RpcDurableObjectNamespace`, `DurableObjectNamespace`, cron, version metadata, Workers for Platforms.
- Website: `Vite`, `StaticSite`.
- Storage and data: `R2Bucket`, `KVNamespace`, `D1Database`, `Hyperdrive`, `Queue`, `QueueConsumer`, `QueueSubscription`, `VectorizeIndex`.
- AI: `AiGateway`, `AiGatewayBinding`, `AiSearch`, `AiSearchInstanceBinding`, Workers AI through AI Gateway tutorials.
- Durable/stateful: Durable Objects, Workflows, Containers, Artifacts.
- Security and edge: DNS, Rulesets, Access, Tunnels, Turnstile, RateLimit, WAF/API Shield resources.

Database provider pages:

- Drizzle: `Drizzle.Schema`, `Drizzle.postgres`.
- Neon: `Neon.Project`, `Neon.Branch`.
- PlanetScale: `Planetscale.PostgresDatabase`, `PostgresBranch`, `PostgresRole`, `MySQLDatabase`, `MySQLBranch`, `MySQLPassword`.

GitHub provider pages:

- `GitHub.Comment`, `GitHub.Repository`, `GitHub.Secret`, `GitHub.Secrets`, `GitHub.Variable`, `GitHub.Variables`, `GitHub.Webhook`, `GitHub.events`.

## Source Examples To Search

In `alchemy-run/alchemy-effect`:

- `examples/cloudflare-worker` and `examples/cloudflare-worker-async`
- `examples/cloudflare-dev`
- `examples/cloudflare-neon-drizzle`
- `examples/cloudflare-planetscale-postgres-drizzle`
- `examples/cloudflare-planetscale-mysql-drizzle`
- `examples/monorepo-single-stack`
- `examples/monorepo-multi-stack`
- `packages/alchemy/src/Cloudflare/*`
- `packages/alchemy/src/Drizzle/*`
- `packages/alchemy/src/Neon/*`
- `packages/alchemy/src/Planetscale/*`

## Local Skill Code Samples

Use `references/code-samples.md` when generating or reviewing code. It contains compact, copy-adaptable patterns for stacks, async Workers, Effect Workers, Vite/StaticSite, Hyperdrive, Drizzle, Neon, PlanetScale Postgres/MySQL, Durable Objects, Queues, Actions, GitHub, tests, and CI. Use `references/database-patterns.md` for cross-provider database composition, and `references/monorepos.md` for pnpm workspace layout and single-stack/multi-stack deployment patterns.

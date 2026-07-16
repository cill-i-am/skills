# Documentation And Source Map

Use this map to reach the smallest authoritative surface before coding. Start at `https://alchemy.run/llms.txt`; it indexes every current documentation page with a one-line summary.

## Source Order

1. The target repository's lockfile and installed `alchemy` package.
2. The narrow page under `https://alchemy.run`.
3. Generated provider API pages under `/providers/<provider>/...` for exact props, outputs, defaults, and constraints.
4. Current examples and package source in `https://github.com/alchemy-run/alchemy`.
5. This skill for durable decisions, task routing, safety, and composition patterns.

Do not use blog posts as canonical API documentation. They are historical context. Prefer current guide pages and source.

## Start Here

- `/getting-started`: current install command, prerequisites, first stack, login, and deploy flow.
- `/what-is-alchemy`: product model and the relationship between infrastructure, application code, and bindings.
- `/migrating-from-v1`: explicit v1-to-v2 migration only.
- `/cli`: complete command map and non-interactive behavior.

## Infrastructure As Code

Route core graph questions to:

- `/infrastructure-as-code/stack`
- `/infrastructure-as-code/resource`
- `/infrastructure-as-code/action`
- `/infrastructure-as-code/outputs`
- `/infrastructure-as-code/references`
- `/infrastructure-as-code/resource-lifecycle`
- `/infrastructure-as-code/provider`
- `/infrastructure-as-code/custom-provider`

Use `core-model.md` for the local synthesis and `provider-extension.md` when implementing a provider.

## Infrastructure As Effects

Route runtime/application composition to:

- `/infrastructure-as-effects`
- `/infrastructure-as-effects/functions-and-servers`
- `/infrastructure-as-effects/bindings`
- `/infrastructure-as-effects/event-sources`
- `/infrastructure-as-effects/event-sinks`
- `/infrastructure-as-effects/phases`
- `/infrastructure-as-effects/layers`
- `/infrastructure-as-effects/infrastructure-layers`
- `/infrastructure-as-effects/circular-dependencies`
- `/infrastructure-as-effects/custom-runtime`

Use `effect-infra.md` for concrete ownership and Layer patterns.

## APIs

- `/apis`: modality chooser.
- `/apis/schemaless`: trusted internal service-to-service communication.
- `/apis/effect-rpc`: schema-validated RPC for Effect/TypeScript clients across trust boundaries.
- `/apis/effect-http`: schema-validated HTTP for browser, partner, or non-Effect consumers.
- `/cloudflare/apis/*` and `/aws/apis/*`: platform-specific host, binding, storage, and client wiring.

Use `apis.md` before choosing a protocol or introducing Schema at service boundaries.

## Environments And Operations

- `/environments/stages`
- `/environments/profiles`
- `/environments/auth-providers`
- `/environments/custom-auth-provider`
- `/environments/secrets`
- `/environments/local-development`
- `/environments/ci`
- `/state-store`
- `/state-store/custom-state-store`
- `/cli/adopting-resources`
- `/cli/inspecting-state`

Use `environments-auth-state.md` for ownership/authentication design and `cli-operations.md` for commands and incident workflows.

## Project Structure

- `/project-structure/file-layout`
- `/project-structure/single-stack`
- `/project-structure/multiple-stacks`
- `/project-structure/monorepo`

Use `monorepos.md` for pnpm-specific application layouts. Keep one stack until independent ownership or lifecycle justifies references between stacks.

## Testing

- `/testing/testing-a-stack`
- `/testing/testing-providers`
- `/testing/test-harness`
- `/testing/observability`

Use `testing.md`. Alchemy integration tests target real cloud resources, so stage isolation and cleanup are part of test correctness.

## Provider Hubs

- `/cloudflare`: Workers, Durable Objects, Containers, storage, messaging, AI, frontends, security, networking, and observability.
- `/aws`: Lambda, MicroVMs, ECS, EC2, EKS, data, messaging, networking, websites, security, and CloudWatch.
- `/github`: resources, events, comments, secrets, variables, and CI integration.
- `/drizzle`, `/neon`, `/planetscale`: schema/migration and managed database providers.
- `/axiom`: datasets, ingest, alerts, annotations, and dashboards.
- `/docker`: images, remote images, containers, networks, volumes, and local services.
- `/kubernetes`: setup, objects, and objects as runtime bindings.
- `/command`: build commands, dev servers, exec, and memoization.

Open the generated provider API page immediately before writing an unfamiliar resource. Provider catalogs move faster than durable architectural guidance.

## Source Tree Routes

In `alchemy-run/alchemy`:

- Docs: `website/src/content/docs`
- Agent docs index: `website/public/llms.txt`
- Package exports: `packages/alchemy/package.json`
- Core engine: `packages/alchemy/src`
- Provider implementations: `packages/alchemy/src/Cloudflare`, `AWS`, `Axiom`, `Docker`, `Drizzle`, `GitHub`, `Kubernetes`, `Neon`, and `Planetscale`
- Test harness: `packages/alchemy/src/Test`
- Worked applications: `examples`
- Provider lifecycle tests: `packages/alchemy/test`

When API spelling differs between an old project and current docs, inspect resource aliases in source. Use the canonical current name in new code; preserve aliases only while intentionally migrating existing state.

## Personal Defaults Versus Official Defaults

This skill defaults new personal projects to pnpm and Effect-heavy backend design. The official docs support multiple package managers and async handlers. Keep personal conventions clearly separated from claims about Alchemy itself.

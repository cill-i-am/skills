---
name: effect-ts
description: Effect v4 beta guidance for Effect-first TypeScript backends, workers, CLIs, SDKs, shared packages, and tests. Use when modeling domains with Schema and brands, implementing services and Layers, managing lifecycles or concurrency, handling typed errors, config, retries, caches, streams, HTTP/RPC, SQL, observability, or Effect tests.
---

# Effect v4 Expert

Build backend application code as Effect programs. Keep effects as values throughout services and workflows; execute them only where an external host requires a Promise, callback, synchronous value, or process lifecycle hook.

This skill targets Effect v4 beta only. Do not introduce v3 compatibility code, deprecated v3 patterns, or fallback APIs.

## Start Here

Before giving advice or editing code:

1. Read the nearest repository instructions and project-local Effect guidance.
2. Inspect `package.json`, the lockfile, and installed versions of `effect` and `@effect/*`.
3. Inspect nearby services, Layers, schemas, tests, and runtime entrypoints.
4. Resolve the installed Effect source with `pnpm exec opensrc path --cwd . effect` when API spelling or semantics matter.
5. Read every task branch below that matches the work.

Keep all `effect` and `@effect/*` packages on a compatible v4 beta line. Verify examples against the target project's exact pin; do not solve version drift with casts or v3 fallbacks.

## Task Router

- Architecture, Effect-first boundaries, function shapes, or runtime execution: read `references/principles.md`.
- Records, DTOs, IDs, brands, string avoidance, variants, optionality, decoders, or encoded forms: read `references/schema.md`.
- Repository-wide schema ownership, migration audits, semantic provenance, or anti-regression checks: read `references/schema-enforcement.md`.
- Services, module surfaces, Layers, dependency graphs, runtime wiring, or long-lived service work: read `references/services-layers.md`.
- Scope, acquisition/release, fibers, queues, coordination, interruption, or managed runtimes: read `references/resources-concurrency.md`.
- Typed errors, defects, recovery, redaction, logs, spans, or metrics: read `references/errors-observability.md`.
- Environment variables, bindings, secrets, `Config`, or `ConfigProvider`: read `references/configuration.md`.
- Retry, repeat, polling, timeout, backoff, jitter, pacing, or idempotency: read `references/scheduling.md`.
- Memoization, TTL caches, concurrent lookup deduplication, request batching, or cache lifecycle: read `references/caching.md`.
- Streams, async iterables, queues, pubsubs, pagination, consumers, or backpressure: read `references/streams.md`.
- Outbound HTTP, HttpClient, HttpApi, RPC, generated clients, transport decoding, or rate limits: read `references/http-rpc-clients.md`.
- SQL clients, row schemas, transactions, resolvers, migrations, or persistence adapters: read `references/sql.md`.
- Effect tests, test services, test Layers, virtual time, concurrency synchronization, cleanup, or live tests: read `references/testing.md`.
- Live source routes and exemplar repositories: read `references/source-lookup.md`.
- Evidence and design decisions behind this skill: read `references/source-study.md`.

## Core Defaults

- Backend operations return `Effect` by default. Public service methods and exported workflows should not return raw Promises.
- Compose multi-step work with `Effect.gen(function* () { ... })`.
- Define public and non-trivial internal operations with named `Effect.fn("Domain.operation")`.
- Use `Effect.fnUntraced` only when omitting stack-frame and span metadata is intentional.
- A tiny, total, synchronous leaf transform may remain a plain function. Call it inside the larger Effect workflow with `map`, `flatMap`, or `Effect.gen`.
- Use `Context.Service` plus explicit interfaces for application capabilities and `Layer` for implementations.
- Decode unknown values with Schema at ingress. Derive TypeScript types from schemas instead of duplicating interfaces.
- Avoid stringly typed domain contracts. Model IDs and scalar value objects with constrained Schema brands; model finite states, roles, event kinds, and modes with literals or tagged unions.
- Use `Schema.TaggedErrorClass` for schema-backed or boundary-visible expected errors.
- Read runtime config through `Config`; use Effect-native time, randomness, logging, HTTP, SQL, and concurrency services.
- Own resources and background work with `Scope`, scoped Layers, and structured concurrency.
- Use `Schedule`, `Cache`, `Stream`, Effect platform clients, and Effect test services before hand-rolling equivalent machinery.
- Provide Layers and call `run*` only in host adapters, runtime composition roots, and tests.

## Runtime Rule

"Run Effect only at host edges" restricts execution, not usage.

```ts
// Domain and application code compose Effect values.
export const registerUser = Effect.fn("Users.register")(function* (
  input: RegisterUserInput,
) {
  const users = yield* UserRepository;
  const welcome = yield* WelcomeEmail;
  const user = yield* users.create(input);
  yield* welcome.send(user);
  return user;
});

// The framework adapter executes the fully provided program once.
export const POST = (request: Request) =>
  registerFromRequest(request).pipe(
    Effect.provide(AppLayer),
    Effect.runPromise,
  );
```

Do not call `runPromise`, `runSync`, or `runFork` inside services to escape the Effect type. Preserve typed errors, requirements, interruption, and tracing until the host boundary.

## No-op Detection

This skill may have no useful guidance for isolated copy, formatting, static visual styling, or packaging metadata that neither belongs to backend application logic nor touches an Effect contract. Do not use that exception to keep backend orchestration, validation, configuration, errors, I/O, or state transitions outside Effect.

## Completion Criteria

Effect work is complete only when:

- The exact Effect v4 beta versions and local conventions were checked.
- Non-trivial or unstable APIs were verified against installed or current source.
- Raw boundary values are decoded once into Schema-derived domain types.
- Domain contracts avoid interchangeable raw strings where brands, literals, or tagged unions express the concept.
- Expected failures remain typed and defects are intentional.
- Service dependencies stay visible until a composition root supplies their Layers.
- Resources, fibers, queues, streams, caches, schedules, and timers have explicit ownership and interruption behavior.
- Runtime execution occurs at host edges rather than inside reusable application code.
- Focused tests cover success plus the important failure, retry, interruption, finalization, or concurrency path.

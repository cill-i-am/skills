---
name: effect-ts
description: Exact-pin Effect v4 guidance for TypeScript applications, services, Layers, Schema, lifecycles, errors, config, scheduling, caches, streams, HTTP/RPC, SQL, tests, runtime bridges, and repository enforcement.
---

# Effect v4 Expert

Build effectful application workflows as Effect programs. Keep pure, total, synchronous calculations as plain functions. Preserve Effect values through services and workflows, and execute them only at a clearly owned host or foreign-callback boundary.

This skill targets the target repository's **exact installed Effect v4 version**. Betas, release candidates, stable releases, and `effect/unstable/*` modules are pin-specific. Do not copy API spelling from another revision or exemplar without checking the target installation and compiling a focused compile probe. Do not introduce v3 compatibility branches or hide version drift with casts.

## Start Here

Before giving advice or editing code:

1. Read the nearest repository instructions and project-local Effect guidance.
2. Inspect `package.json`, the lockfile, the package manager, and the exact `effect` / `@effect/*` versions.
3. Inspect nearby schemas, services, Layers, tests, runtime entrypoints, and package boundaries.
4. Resolve and read the installed package's shipped guidance, declarations, implementation, and adjacent tests when API spelling or semantics matter.
5. Compile a narrow scratch probe with the target project's normal typecheck command for every non-trivial, unstable, or version-sensitive API used in the change.
6. Read each matching task reference below before implementing.

Keep all `effect` and `@effect/*` packages on a compatible line for the target pin. Fix version alignment rather than adding fallback imports or unchecked assertions.

## Task Router

- Architecture, Effect-first boundaries, function shape, package direction, or runtime execution: read `references/principles.md`.
- Records, DTOs, IDs, brands, variants, optionality, decoders, encoded forms, or Schema classes: read `references/schema.md`.
- Repository-wide Schema ownership, migration audits, semantic provenance, or anti-regression checks: read `references/schema-enforcement.md`.
- Services, module surfaces, Layers, dependency graphs, lifetimes, runtime wiring, or long-lived service work: read `references/services-layers.md`.
- Scope, acquisition/release, fibers, queues, coordination, interruption, races, keyed resources, or managed runtimes: read `references/resources-concurrency.md`.
- Host callbacks, transaction callbacks, SDK registrations, AsyncLocalStorage, FiberRef propagation, or Promise bridges: read `references/runtime-bridges.md`.
- Typed errors, defects, recovery, redaction, logs, spans, or metrics: read `references/errors-observability.md`.
- Environment variables, bindings, secrets, `Config`, or `ConfigProvider`: read `references/configuration.md`.
- Retry, repeat, polling, timeout, backoff, jitter, pacing, or idempotency: read `references/scheduling.md`.
- Memoization, TTL caches, concurrent lookup deduplication, request batching, or cache lifecycle: read `references/caching.md`.
- Streams, async iterables, queues, pubsubs, pagination, consumers, or backpressure: read `references/streams.md`.
- Outbound HTTP, HttpClient, HttpApi, RPC, generated clients, transport decoding, or rate limits: read `references/http-rpc-clients.md`.
- SQL clients, row schemas, transactions, post-commit work, resolvers, migrations, or persistence adapters: read `references/sql.md`.
- Effect tests, test services, test Layers, virtual time, concurrency synchronization, cleanup, or live tests: read `references/testing.md`.
- Lint rules, architecture checks, package-specific policy, exceptions, or enforcement rollout: read `references/repository-enforcement.md`.
- Live source routes, exact-pin verification, compile probes, and exemplar precedence: read `references/source-lookup.md`.
- Evidence and design decisions behind this skill: read `references/source-study.md`.

## Core Defaults

- Backend operations return `Effect` by default. Public Effect-native service methods and exported workflows do not return raw Promises.
- A tiny, total, synchronous leaf remains a plain function. Do not wrap pure calculations in `Effect.sync` merely for visual consistency.
- Use inline `Effect.gen(function* () { ... })` for one-off local composition.
- Use `Effect.fnUntraced` for a reusable generator wrapper that does not need its own tracing span or stack label.
- Use named `Effect.fn("Domain.operation")` when the operation is meaningful to callers or operators and deserves stable tracing metadata.
- Pass whole-function transforms as additional `Effect.fn` arguments. Do not pipe the function value as though it were an Effect.
- Use `return yield*` for terminal failures, interruption, and other never-returning effects.
- Do not use JavaScript `try` / `catch` inside `Effect.gen`. Use Effect constructors and typed recovery; keep JavaScript exception handling at genuine host or foreign-library boundaries.
- Define runtime capabilities with `Context.Service` and implementations with `Layer`. Keep authority-bearing dependencies explicit until a composition root supplies them.
- Decode unknown values with Schema at ingress and encode deliberately at egress. Derive serializable TypeScript types from their owning schemas instead of duplicating interfaces.
- Model semantically narrower IDs and scalar values with constrained Schema brands; model finite states, roles, event kinds, and modes with literals or tagged unions.
- Use the schema-backed tagged-error constructor exported by the target pin for boundary-visible expected errors. Current v4 RCs use `Schema.TaggedError`; older betas used `Schema.TaggedErrorClass`.
- Read runtime config through `Config`. Use Effect-native Clock, randomness, logging, HTTP, SQL, and concurrency services in Effect workflows.
- Own resources and background work with Scope, scoped Layers, `FiberSet`, `FiberMap`, caches with explicit lifetimes, or a host-owned managed runtime.
- Use `Schedule`, `Cache`, `ScopedCache`, `Stream`, Effect platform clients, SQL helpers, and Effect test services before hand-rolling equivalent machinery.
- Preserve exact Effect semantics during migrations: typed failures, defects, interruption, rollback, race behavior, retries, sharing, and finalization.

## Runtime And Callback Boundaries

Do not call `runPromise`, `runSync`, or `runFork` merely to erase an Effect's error or requirement type inside reusable application code.

Execution belongs at an ownership boundary. Usually that is an HTTP, CLI, worker, process, framework, or managed-runtime adapter. A foreign callback boundary may exist inside an adapter when the callback itself owns required ambient state, such as a database transaction, platform event, browser callback, or SDK registration.

Such a bridge must be centralized and reviewed. Preserve `Exit` / `Cause`, typed failure, defects, interruption, context and FiberRefs, rollback or cancellation, and Scope. Expose an Effect-native contract to the rest of the application.

```ts
// Application code keeps requirements and failures visible.
export const registerUser = Effect.fn("Users.register")(function* (
  input: RegisterUserInput,
) {
  const users = yield* UserRepository
  const welcome = yield* WelcomeEmail
  const user = yield* users.create(input)
  yield* welcome.send(user)
  return user
})

// The host owns provisioning and execution.
export const POST = (request: Request) =>
  AppRuntime.runPromise(registerFromRequest(request))
```

## Version-Sensitive API Gate

For every unstable or non-trivial API used in an answer or change, record enough evidence to reproduce the decision:

```md
Effect evidence
- target version: 4.0.0-...
- package manager / lockfile: ...
- installed source inspected: ...
- unstable imports used: ...
- exemplar revision, if any: ...
- compile or typecheck command: ...
- tests run: ...
```

Architecture may be learned from reference repositories. API spelling and semantics must be proved against the target installation.

## No-op Detection

This skill may have no useful guidance for isolated copy, formatting, static visual styling, or packaging metadata that neither belongs to application logic nor touches an Effect contract. Do not use that exception to keep orchestration, validation, configuration, errors, I/O, or state transitions outside Effect.

## Completion Criteria

Effect work is complete only when:

- The exact Effect v4 versions and local conventions were checked.
- Version-sensitive APIs were verified from installed source and a target-project compile probe.
- Non-trivial operations use a deliberate function shape rather than mechanically choosing named spans.
- Raw boundary values are decoded once into Schema-derived domain types.
- Expected failures remain typed and defects are intentional.
- Service dependencies and authority stay visible until an appropriate composition root supplies their Layers.
- Every resource, fiber, queue, stream, cache, schedule, timer, and runtime has a stated lifetime, owner, sharing policy, and disposal path.
- Runtime execution occurs only at owned host or foreign-callback boundaries and preserves Effect semantics.
- Package dependency direction and generated-contract ownership remain intact.
- Focused tests cover success plus the important failure, retry, race, interruption, rollback, finalization, or concurrency path.

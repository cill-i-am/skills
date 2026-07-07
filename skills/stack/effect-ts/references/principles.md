# Principles

Use this file to decide whether a design needs Effect and which primitive fits.

## Core Model

`Effect<A, E, R>` describes work that:

- succeeds with `A`
- fails with expected error `E`
- requires services `R`

Add Effect when at least one of those dimensions matters. Leave code plain when the work is pure, local, synchronous, and easier to test without a runtime.

## Boundary Ladder

Apply the first matching rung:

1. Unknown data: decode with Schema or a precise typed adapter.
2. Expected failure: return a tagged error in the Effect error channel.
3. External dependency: require a service and provide it with a Layer.
4. Owned lifetime: acquire in Scope or Layer and release with finalizers.
5. Concurrent workflow: use Fiber, Deferred, Queue, Ref, Semaphore, Exit, or Stream.
6. Retried or timed workflow: use Schedule, Clock, timeout, and TestClock.
7. Protocol or SDK boundary: use Effect platform clients and one authoritative contract.
8. Host edge: enter or leave Effect once with `runPromise`, `runSync`, `runFork`, or a managed runtime.

## Function Shape

- `Effect.gen`: inline composition and local orchestration.
- `Effect.fn("Name")`: reusable operation with a meaningful trace or stack-frame boundary.
- `Effect.fn`: reusable operation that needs traced-function behavior without a named span.
- `Effect.fnUntraced`: reusable low-level implementation, hot path, resolver, cache helper, or wrapper that intentionally omits trace capture.

Do not convert a helper into `Effect.fn` just because it returns an Effect. Name a reusable operation when the name improves tracing, recovery, composition, or review.

## Services And Layers

Prefer `Context.Service` class syntax in current v4-style code:

```ts
import { Context, Effect } from "effect";

class Users extends Context.Service<
  Users,
  {
    readonly get: (id: string) => Effect.Effect<User, UserNotFound>;
  }
>()("Users") {}
```

Use a service when callers need substitution, dependency tracking, lifecycle, or a runtime capability. Keep pure transforms as functions.

Layer rules:

- Construct live dependencies in Layers.
- Provide Layers at entrypoints and tests.
- Keep domain logic free of hidden local `Effect.provide`.
- Memoize runtime layers only at a deliberate app or process boundary.
- Add a layer graph abstraction only when the graph is large enough to need typed replacement or dependency validation.

## Schema Boundaries

Decode once at the edge:

```ts
const ConfigSchema = Schema.Struct({
  endpoint: Schema.String,
});

const config = yield * Schema.decodeUnknownEffect(ConfigSchema)(raw);
```

Use Schema for:

- HTTP/RPC payloads
- storage rows and persisted JSON
- environment/config values
- generated API contracts
- IDs that need brands
- wire-visible errors

Use named guards only when Schema is too heavy for a local branch and the guard has a precise return type.

## Error Semantics

Use a new error type only when callers need distinct recovery, HTTP status, UI behavior, retry policy, telemetry classification, or redaction.

Choose:

- `Schema.TaggedErrorClass`: public, encoded, schema-backed, or protocol-visible failures.
- `Data.TaggedError`: internal failures that do not need schema encoding.
- defects: impossible states, bugs, or host edges that cannot represent typed failure.

For schema tagged errors with no `message` field, add a `message` getter when logs, spans, or `Cause.pretty` need a useful label.

At true host boundaries, convert typed failures into the host's shape. Do not leak unknown JavaScript exceptions through domain code.

## Runtime Edges

Use `runPromise`, `runSync`, `runFork`, `runPromiseExit`, and managed runtimes at:

- worker/fetch handlers
- HTTP route handlers
- CLI commands
- test wrappers
- SDK callback bridges
- Durable Object or process lifecycle methods

Reusable domain functions return Effects. They do not run them.

## Source Discipline

Effect APIs move. Verify current source before copying old examples, especially for:

- `Effect.fn` and `Effect.fnUntraced`
- `Context.Service` / `Context.Tag`
- `HttpApi` and `HttpClient`
- `Schema` helpers
- retry and timeout combinators
- test helpers

Use the target project's pinned version first. Source exemplars refine local style; they do not override sound local conventions.

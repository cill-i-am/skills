# Testing Effect Applications

Use this file for Effect tests, test Layers, virtual time, retries, concurrency, streams, resources, protocol handlers, custom runners, and live integrations.

## Exact-Pin Gate

Test helpers, automatic services, Scope ownership, and virtual-time APIs can differ by Effect version and test adapter. Inspect the target project's installed test package and local harness before copying syntax.

## Defaults

- Use the project's adopted Effect test integration, such as `@effect/vitest`.
- Use Effect-aware tests for programs requiring services, Scope, virtual time, resources, or fibers.
- Use a normal synchronous test for pure calculations.
- Provide dependencies through Layers.
- Use TestClock for sleeps, schedules, TTLs, retries, leases, and timeouts.
- Synchronize concurrency with Deferred, Queue, Latch, Ref, or explicit hooks.
- Assert typed failures and lifecycle behavior, not only success values.

## Test Scope Ownership

At the audited `@effect/vitest` line, `it.effect` and `it.live` create and close a Scope for each test. Verify the installed adapter, and do not wrap the body in `Effect.scoped` solely to obtain Scope when the runner already owns it.

A custom Bun, Node, or framework runner must create and close Scope itself. Make ownership visible in the helper and prove finalization on failure.

Do not call `Effect.runSync` or `Effect.runPromise` inside an Effect test merely to nest execution. Yield or compose the Effect directly. Host-level test adapters may execute the final test program once.

## Basic Effect Test

```ts
import { assert, describe, it } from "@effect/vitest"

describe("Users", () => {
  it.effect("returns a stored user", () =>
    Effect.gen(function* () {
      const users = yield* UserRepository
      const user = yield* users.findById(UserId.make("usr_1"))
      assert.strictEqual(user.id, UserId.make("usr_1"))
    }).pipe(Effect.provide(UserRepositoryTestLayer)),
  )
})
```

Use Schema constructors in fixtures. Keep intentionally invalid fixtures unknown or encoded and assert that the real decoder rejects them.

## Test Layer Shapes

Use `Layer.succeed` for a small static dependency.

For reusable stateful fakes, expose the production interface plus a separate test-control service.

```ts
export const NotificationTestLayer = Layer.effectContext(
  Effect.gen(function* () {
    const sent = yield* Ref.make<ReadonlyArray<Notification>>([])
    const nextFailure = yield* Ref.make<Option.Option<NotificationError>>(
      Option.none(),
    )

    const service = NotificationTest.of({
      send: Effect.fnUntraced(function* (message: Notification) {
        const failure = yield* Ref.getAndSet(nextFailure, Option.none())
        if (Option.isSome(failure)) return yield* failure.value
        yield* Ref.update(sent, (messages) => [...messages, message])
      }),
      sent: Ref.get(sent),
      failNext: (error) => Ref.set(nextFailure, Option.some(error)),
    })

    return Context.empty().pipe(
      Context.add(Notification, service),
      Context.add(NotificationTest, service),
    )
  }),
)
```

Production code depends only on the production service. Tests use the control service for observation and failure injection.

Use partial mock helpers only for small local tests where omitted methods fail loudly.

## Isolated Versus Shared Layer Memoization

Test Layer acquisition is isolated by default. This prevents mutable service state, caches, queues, and fibers from leaking between tests.

Share a `Layer.MemoMap` across test runs only when the behavior under test depends on process identity, such as an in-process server and client needing the same event bus instance. Name the shared helper explicitly and document why isolation would be incorrect.

Do not share an expensive database or runtime merely to make tests faster unless cleanup and test isolation remain proven.

## Typed Failure Assertions

Assert the variant and meaningful fields, not merely that the Effect failed.

```ts
it.effect("rejects a duplicate email", () =>
  registerUser(command).pipe(
    Effect.flip,
    Effect.tap((error) =>
      Effect.sync(() => {
        assert.strictEqual(error._tag, "EmailAlreadyUsed")
        assert.strictEqual(error.email, command.email)
      }),
    ),
    Effect.provide(TestAppLayer),
  ),
)
```

Direct `_tag` assertions are appropriate for a test of the owned typed error contract.

## Virtual Time

Fork an Effect that sleeps or retries before advancing TestClock.

```ts
it.effect("retries twice then succeeds", () =>
  Effect.gen(function* () {
    const attempts = yield* Ref.make(0)
    const fiber = yield* flakyOperation(attempts).pipe(
      Effect.retry(retryPolicy),
      Effect.fork,
    )

    yield* TestClock.adjust("2 seconds")
    const result = yield* Fiber.join(fiber)

    assert.strictEqual(result, expected)
    assert.strictEqual(yield* Ref.get(attempts), 3)
  }),
)
```

Verify retry count and Schedule semantics against the target pin. Avoid production wall-clock sleeps in deterministic tests.

## Concurrent Synchronization

Use semantic events, not timing guesses.

```ts
it.effect("interrupts the worker on Scope close", () =>
  Effect.gen(function* () {
    const started = yield* Deferred.make<void>()
    const finalized = yield* Deferred.make<void>()

    yield* Effect.scoped(
      Effect.gen(function* () {
        yield* worker(started).pipe(
          Effect.ensuring(Deferred.succeed(finalized, undefined)),
          Effect.forkScoped,
        )
        yield* Deferred.await(started)
      }),
    )

    yield* Deferred.await(finalized)
  }),
)
```

The nested Scope is deliberate because the assertion must run after that Scope closes. Do not add `Effect.scoped` merely to duplicate the test runner's outer Scope.

Use Queue when the test drives a sequence of values, Latch for reusable gates, and Ref for non-blocking observations.

## Race Regression Tests

Promise mental models do not always match Effect semantics. Add focused regressions when migrating or upgrading:

- prefer-success race versus first-completion race;
- interruption of the losing branch;
- timeout versus typed failure;
- retry recurrence count;
- transaction rollback on typed failure and defect;
- finalizer ordering;
- callback arrival after owner disposal;
- shared versus isolated Layer acquisition.

## Config Tests

Use a test ConfigProvider when parsing is under test. Provide a decoded settings service when parsing is not the unit's concern. Test provider precedence explicitly and avoid global `process.env` mutation.

## Stream Tests

- finite transform: in-memory iterable then collect;
- interactive source: test-owned Queue;
- open fixture: finite source followed by never;
- first N values: take then collect;
- long-lived consumer: synchronize startup and assert interruption/finalization;
- callback source: assert its decode failure policy and unsubscribe behavior.

## Resource Tests

For each acquired resource, cover release after:

- success;
- typed failure;
- defect;
- interruption;
- partial acquisition;
- Layer or ManagedRuntime disposal.

For caches, queues, streams, fibers, and keyed resources, test shutdown and owner boundaries explicitly.

## HttpApiTest, HTTP, And RPC Tests

Prefer an in-memory typed protocol test client when the target HttpApi/RPC package provides one. Use live servers only for socket, streaming, TLS, proxy, or platform integration behavior.

## Live Tests

Separate live platform, database, filesystem, Git, child-process, and provider tests from deterministic unit tests. Mark external dependencies clearly, isolate data, and use scoped Layers so cleanup runs on failure.

## Completion Matrix

Choose tests from the behavior changed:

- Schema contract: valid, invalid, encode/decode round trip;
- brand: invalid form rejected and distinct brands do not mix;
- service: success plus each new typed error branch;
- retry: exact attempt count, non-retryable exit, exhaustion;
- race: both winner orders, early failure, loser cleanup;
- concurrency: ordering, bounds, interruption, no duplicate completion;
- resource: finalization on every exit;
- stream: source failure, backpressure, consumer shutdown;
- HTTP/RPC: status, malformed payload, transport failure, redaction;
- SQL: row decode, conflict, rollback, post-commit ordering;
- runtime bridge: context propagation, cancellation, disposal.

# Testing Effect Applications

Use this file for Effect tests, test Layers, virtual time, retries, concurrency, streams, resources, and live integrations.

## Defaults

- Use `@effect/vitest` and `it.effect` when the project has adopted it.
- Use `it.live` only when real time or live runtime services are the behavior under test.
- Provide dependencies through Layers.
- Use TestClock for sleeps, schedules, TTLs, retries, leases, and timeouts.
- Synchronize concurrent tests with Deferred, Queue, Latch, Ref, or explicit hooks.
- Assert typed failures and lifecycle behavior, not only success values.

```ts
import { assert, describe, it } from "@effect/vitest";

describe("Users", () => {
  it.effect("returns a stored user", () =>
    Effect.gen(function* () {
      const users = yield* UserRepository;
      const user = yield* users.findById(UserId.make("usr_1"));
      assert.strictEqual(user.id, UserId.make("usr_1"));
    }).pipe(Effect.provide(UserRepositoryTestLayer)),
  );
});
```

Use Schema constructors in fixtures. Do not bypass branded types with casts.

Keep intentionally invalid fixtures `unknown` or in their raw encoded form, then assert that the real decoder rejects them. Never cast malformed input to the domain type merely to reach the code under test.

## Test Layer Shapes

For a tiny static dependency, use `Layer.succeed`:

```ts
const ClockedFeatureTest = Layer.succeed(
  FeatureFlags,
  FeatureFlags.of({ checkoutV2: true }),
);
```

For reusable stateful fakes, expose the production interface plus a separate test-control service:

```ts
export const NotificationTestLayer = Layer.effectContext(
  Effect.gen(function* () {
    const sent = yield* Ref.make<ReadonlyArray<Notification>>([]);
    const nextFailure = yield* Ref.make<Option.Option<NotificationError>>(
      Option.none(),
    );

    const service = NotificationTest.of({
      send: Effect.fn("Notification.Test.send")(function* (message) {
        const failure = yield* Ref.getAndSet(nextFailure, Option.none());
        if (Option.isSome(failure)) return yield* failure.value;
        yield* Ref.update(sent, (messages) => [...messages, message]);
      }),
      sent: Ref.get(sent),
      failNext: (error) => Ref.set(nextFailure, Option.some(error)),
    });

    return Context.empty().pipe(
      Context.add(Notification, service),
      Context.add(NotificationTest, service),
    );
  }),
);
```

Production code depends only on `Notification`. Tests use `NotificationTest` for control and inspection. Use `Layer.mock` only for small local partial mocks where omitted methods should fail loudly.

## Typed Failure Assertions

Assert the error variant and meaningful fields:

```ts
it.effect("rejects a duplicate email", () =>
  registerUser(command).pipe(
    Effect.flip,
    Effect.tap((error) =>
      Effect.sync(() => {
        assert.strictEqual(error._tag, "EmailAlreadyUsed");
        assert.strictEqual(error.email, command.email);
      }),
    ),
    Effect.provide(TestAppLayer),
  ),
);
```

Do not merely assert that the Effect failed. Prove the recovery contract callers depend on.

## Virtual Time

Fork effects that sleep before moving TestClock:

```ts
it.effect("retries twice then succeeds", () =>
  Effect.gen(function* () {
    const attempts = yield* Ref.make(0);
    const fiber = yield* flakyOperation(attempts).pipe(
      Effect.retry(
        Schedule.spaced("1 second").pipe(Schedule.upTo({ times: 2 })),
      ),
      Effect.fork,
    );

    yield* TestClock.adjust("2 seconds");
    const result = yield* Fiber.join(fiber);

    assert.strictEqual(result, expected);
    assert.strictEqual(yield* Ref.get(attempts), 3);
  }),
);
```

Use `TestClock.setTime` for exact clock values and `TestClock.adjust` for elapsed behavior. Avoid arbitrary production `Effect.sleep` in tests.

## Concurrent Synchronization

Use semantic events, not timing:

```ts
it.effect("interrupts the worker on scope close", () =>
  Effect.gen(function* () {
    const started = yield* Deferred.make<void>();
    const finalized = yield* Deferred.make<void>();

    yield* Effect.scoped(
      worker(started).pipe(
        Effect.ensuring(Deferred.succeed(finalized, undefined)),
        Effect.forkScoped,
        Effect.zipRight(Deferred.await(started)),
      ),
    );

    yield* Deferred.await(finalized);
  }),
);
```

Use Queue when the test drives a sequence of inputs, Latch for reusable gates, and Ref for observations that do not require blocking.

## Config Tests

Exercise config decoding with `ConfigProvider.layer(ConfigProvider.fromUnknown(...))`. When config decoding is outside the unit's concern, provide the decoded app config service with `Layer.succeed`.

Do not mutate `process.env` globally when a provider Layer can isolate the test.

## Stream Tests

- finite transformations: `Stream.fromIterable` then `runCollect`
- interactive source: test-owned Queue plus `Stream.fromQueue`
- open subscription fixture: finite stream concatenated with `Stream.never`
- assert first N values: `Stream.take(n)` then `runCollect`
- long-lived consumer: synchronize startup and assert interruption/finalization on scope close

## Resource Tests

For each acquired resource, cover release after:

- success
- typed failure
- interruption
- partial acquisition where applicable
- Layer or managed-runtime disposal

For caches, queues, streams, and fibers, test shutdown and ownership explicitly.

## Live Tests

Separate live platform/database/provider tests from deterministic unit tests. Mark credentials and external dependencies clearly, isolate data, and use scoped Layers so cleanup still occurs on failure.

## Completion Matrix

Choose tests from the behavior changed:

- Schema contract: valid, invalid, encode/decode round trip
- branded value: constructor rejects invalid form and distinct brands do not mix at compile time
- service: success plus every new typed error branch
- retry: attempt count, non-retryable exit, exhaustion
- concurrency: ordering, bounds, interruption, no duplicate completion
- resource: finalization on all exits
- stream: source failure, backpressure, consumer shutdown
- HTTP/RPC: status, malformed payload, transport failure, redaction
- SQL: row decode, conflict, rollback, persisted corruption

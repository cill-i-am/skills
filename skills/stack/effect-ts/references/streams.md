# Streams

Use this file for event sources, async iterables, queues, pubsubs, pagination, backpressure, transformation, long-lived consumers, and callback adapters.

## Mental Model

`Stream<A, E, R>` is a lazy, effectful, many-valued source. It emits `A`, fails with expected `E`, requires `R`, supports interruption, and is pull-based with backpressure.

Use Stream for event sources, subscriptions, paginated APIs, files, stdin, sockets, provider callbacks, scheduled values, and pipelines that filter, batch, buffer, throttle, or process values concurrently.

For one recurring action that emits no meaningful values, use Effect repeat plus Schedule.

## Source Chooser

- in-memory values: stream constructors from values or iterables;
- callback producer: private Queue plus `Stream.fromQueue`;
- broadcast source: PubSub plus `Stream.fromPubSub`;
- current state and updates: SubscriptionRef;
- scheduled values: Stream from Schedule;
- paginated API: `Stream.paginate`;
- async iterable: `Stream.fromAsyncIterable`;
- Effect that acquires a Stream: `Stream.unwrap`.

Service contracts expose the Stream, not the producer handle:

```ts
export interface DomainEventsShape {
  readonly events: Stream.Stream<DomainEvent, EventSourceError>
}
```

Keep Queue, PubSub, callback registration, mutable refs, and SDK handles private to the adapter Layer.

## Callback Adapter

Bridge an external callback into an owned Queue and scoped callback runner:

```ts
export const ProviderEventsLive = Layer.effect(
  ProviderEvents,
  Effect.gen(function* () {
    const queue = yield* Queue.bounded<ProviderEvent>(256)
    yield* Effect.addFinalizer(() => Queue.shutdown(queue).pipe(Effect.asVoid))

    const runFork = yield* FiberSet.makeRuntime()
    const provider = yield* ProviderSdk

    yield* Effect.acquireRelease(
      Effect.sync(() =>
        provider.onEvent((raw) => {
          void runFork(
            decodeProviderEvent(raw).pipe(
              Effect.flatMap((event) => Queue.offer(queue, event)),
              Effect.catch((error) =>
                Effect.logError("ProviderEvents.invalidEvent", error),
              ),
            ),
          )
        }),
      ),
      (unsubscribe) => Effect.sync(unsubscribe),
    )

    return ProviderEvents.of({ events: Stream.fromQueue(queue) })
  }),
)
```

Verify `FiberSet.makeRuntime` against the target pin. Use an explicit FiberSet when the service must inspect or join callback fibers.

State the malformed-input policy explicitly: log and drop, fail the stream, dead-letter, or stop the source. A callback adapter must also restore any required non-Effect ambient context and define behavior after disposal.

## Transformation Chooser

- pure one-to-one: map;
- effectful one-to-one: effectful map;
- bounded concurrent mapping: effectful map with explicit concurrency;
- order irrelevant: opt into unordered execution when supported;
- zero or many outputs: flatMap;
- predicate: filter or effectful filter;
- stateful transform: map-accumulate;
- quiet-period control: debounce;
- throughput shaping: throttle.

Verify exact option objects and concurrency signatures against the target pin.

## Pagination

At current v4 RC lines, `Stream.paginate` expects an Effect producing an array of values plus an `Option` next state:

```ts
const pages = Stream.paginate(initialCursor, (cursor) =>
  provider.listPage(cursor).pipe(
    Effect.map((page) => [
      page.items,
      Option.fromNullable(page.nextCursor),
    ] as const),
  ),
)
```

Older betas may differ. Compile the exact step signature against the target installation.

Use a branded cursor when it is persisted or application-visible. Keep opaque provider cursors private to the adapter when only the provider interprets them.

## Consumption Chooser

- perform an Effect for each value: run-for-each;
- run and ignore elements: run-drain;
- collect a known finite stream: run-collect;
- collect the first N in tests: take then collect;
- fold to one value: run-fold;
- long-lived Layer consumer: consume then `Effect.forkScoped`.

Never collect an unbounded production stream.

## Long-Lived Consumer

```ts
export const UserProjectionWorkerLive = Layer.effectDiscard(
  Effect.gen(function* () {
    const events = yield* DomainEvents
    const projection = yield* UserProjection

    yield* events.events.pipe(
      Stream.mapEffect(projection.apply, { concurrency: 8 }),
      Stream.runDrain,
      Effect.forkScoped,
    )
  }),
)
```

The Layer owns the consumer. Preserve typed source failures unless the supervision boundary has an explicit restart, continue, dead-letter, or shutdown policy.

## Backpressure

Prefer natural pull backpressure. Add buffering only when producer and consumer must decouple.

- suspend: producers wait and completeness matters;
- dropping: discard new values;
- sliding: keep newest values by discarding old pending values;
- unbounded: only when an external invariant proves bounded growth.

Audit events usually require suspend; presence or UI refresh events may tolerate sliding.

## Keyed Processing

When values for one key must remain ordered while different keys run concurrently, use a named helper backed by FiberMap, keyed queues, or a keyed semaphore. State the policy:

- queue every value per key;
- coalesce to latest pending value;
- cancel and replace current work;
- reject while already running.

Do not scatter maps of mutable Promises or fibers through consumers.

## Verification

Test:

- finite transformations with an in-memory source;
- callback decode success and malformed-input policy;
- backpressure strategy under pressure;
- source and consumer failure;
- ordering and keyed concurrency;
- cancellation and shutdown;
- callback work after owner disposal;
- long-lived Scope cleanup without arbitrary sleeps;
- pagination termination and target-pin cursor signature.

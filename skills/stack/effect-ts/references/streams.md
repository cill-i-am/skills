# Streams

Use this file for event sources, async iterables, queues, pubsubs, pagination, backpressure, transformation, and long-lived consumers.

## Mental Model

`Stream<A, E, R>` is a lazy, effectful, many-valued source. It emits `A`, fails with expected `E`, requires `R`, supports interruption, and is naturally backpressured by its consumer.

Use Stream for:

- event and message sources
- subscriptions and provider callbacks
- paginated APIs
- file, stdin, socket, or platform streams
- scheduled values or ticks that feed a pipeline
- filtering, batching, buffering, throttling, or bounded concurrent processing

For one recurring action that emits no meaningful values, use `Effect.repeat` plus Schedule.

## Source Chooser

- in-memory values: `Stream.make(...)` or `Stream.fromIterable(...)`
- callback producer: private Queue plus `Stream.fromQueue(...)`
- broadcast source: PubSub plus `Stream.fromPubSub(...)`
- current state and updates: `SubscriptionRef`
- scheduled values: `Stream.fromSchedule(...)`
- paginated API: `Stream.paginate(...)`
- async iterable: `Stream.fromAsyncIterable(...)`
- Effect that acquires a Stream: `Stream.unwrap(...)`

Service contracts should expose the Stream, not the implementation's producer handle:

```ts
export interface DomainEventsShape {
  readonly events: Stream.Stream<DomainEvent, EventSourceError>;
}
```

Keep Queue, PubSub, callback registration, and mutable refs private to the adapter Layer.

## Callback Adapter

Bridge an external callback into an owned Queue, then expose a Stream:

```ts
export const ProviderEventsLive = Layer.effect(
  ProviderEvents,
  Effect.gen(function* () {
    const queue = yield* Queue.bounded<ProviderEvent>(256);
    const provider = yield* ProviderSdk;

    yield* Effect.addFinalizer(() => Queue.shutdown(queue).pipe(Effect.asVoid));

    const fibers = yield* FiberSet.make<void>();
    const runFork = yield* FiberSet.runtime(fibers)();

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
          );
        }),
      ),
      (unsubscribe) => Effect.sync(unsubscribe),
    );

    return ProviderEvents.of({
      events: Stream.fromQueue(queue),
    });
  }),
);
```

The `FiberSet` runtime is the host callback bridge, and the Layer scope owns every callback fiber. Scope closure unsubscribes the provider, interrupts callback work, and shuts down the Queue.

## Transformation Chooser

- pure one-to-one: `Stream.map`
- effectful one-to-one: `Stream.mapEffect`
- bounded concurrent mapping: `Stream.mapEffect(fn, { concurrency })`
- order irrelevant: add `unordered: true`
- zero or many outputs: `Stream.flatMap`
- predicate: `Stream.filter` or `Stream.filterEffect`
- stateful transform: `Stream.mapAccum` or `Stream.mapAccumEffect`
- debounce quiet periods: `Stream.debounce`
- shape throughput: `Stream.throttle` or `Stream.throttleEffect`

Use `Stream.paginate(...)` for pull pagination. Its step is effectful and returns the emitted chunk plus an optional next cursor.

```ts
const pages = Stream.paginate(initialCursor, (cursor) =>
  provider
    .listPage(cursor)
    .pipe(Effect.map((page) => [page.items, page.nextCursor] as const)),
);
```

Use branded cursor types when cursors are application-visible or persisted. Keep opaque provider cursor strings inside the adapter when only the provider interprets them.

## Consumption Chooser

- perform an effect for each value: `Stream.runForEach`
- run and ignore elements: `Stream.runDrain`
- collect a known finite stream: `Stream.runCollect`
- collect first N in tests: `Stream.take(n)` then `runCollect`
- fold to one value: `Stream.runFold`
- long-lived Layer consumer: `runForEach` then `Effect.forkScoped`

Never `runCollect` an unbounded production stream.

## Long-Lived Consumer

```ts
export const UserProjectionWorkerLive = Layer.effectDiscard(
  Effect.gen(function* () {
    const events = yield* DomainEvents;
    const projection = yield* UserProjection;

    yield* events.events.pipe(
      Stream.filter(JobEvent.guards.Finished),
      Stream.mapEffect(projection.apply, { concurrency: 8 }),
      Stream.runDrain,
      Effect.forkScoped,
    );
  }),
);
```

The Layer owns the consumer. Preserve typed stream failures unless this supervision boundary has an explicit continue, restart, or dead-letter policy.

## Backpressure

Prefer natural pull backpressure. Add buffering only when producer and consumer must decouple.

- suspend strategy: producers wait when full
- dropping strategy: discard new values when full
- sliding strategy: preserve newest values by dropping old ones
- unbounded: only when an external invariant proves bounded growth

Select the strategy from product semantics. Audit events usually require suspend; presence or UI refresh events may tolerate sliding.

## Keyed Processing

When values for one key must remain ordered but different keys can run concurrently, use a named helper backed by `FiberMap`, keyed queues, or a keyed semaphore. Do not scatter maps of mutable Promises or fibers through stream consumers.

State the policy explicitly:

- queue every value per key
- coalesce to the latest pending value
- cancel and replace current work
- reject when already running

## Verification

Test finite transformations with `Stream.fromIterable`. For interactive sources, use a test-owned Queue. Verify backpressure strategy, source failure, consumer failure, ordering, cancellation, shutdown, and long-lived scope cleanup without arbitrary sleeps.

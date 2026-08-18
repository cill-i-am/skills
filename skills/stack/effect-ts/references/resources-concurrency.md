# Resources And Concurrency

Use this file for acquisition, cleanup, Scope, fibers, queues, keyed resources, coordination, interruption, races, callback runners, and managed runtimes.

## Ownership First

Every resource and background fiber needs an owner whose lifetime is at least as long as the work:

- one operation: `Effect.acquireUseRelease`;
- current scope: `Effect.acquireRelease`, a scoped effect, or `Effect.addFinalizer`;
- service: a Layer whose acquisition uses Scope;
- dynamic group: `FiberSet` or `FiberMap`;
- keyed tenant/workspace/location: `ScopedCache`, `LayerMap`, or an equivalent keyed scope;
- host: a managed runtime.

Resources include connections, transactions, file handles, sockets, subprocesses, watchers, subscriptions, queues, caches, servers, and background fibers.

## Local Resource

Use `acquireUseRelease` when the resource must not escape one operation:

```ts
export const readSnapshot = Effect.fn("Snapshot.read")(function* (
  path: SnapshotPath,
) {
  return yield* Effect.acquireUseRelease(
    FileSystem.open(path, { flag: "r" }),
    (handle) => handle.readAll,
    (handle) => handle.close,
  )
})
```

The release action runs on success, expected failure, defect, and interruption.

## Scoped Resource

Use `acquireRelease` when downstream work needs the resource for the current scope:

```ts
const openSubscription = Effect.acquireRelease(
  broker.subscribe(Topic.UserEvents),
  (subscription) => subscription.close,
)
```

Do not return a scoped resource from `Effect.scoped`; its finalizer has already run when the value escapes. Move ownership into a scoped Layer or expose an operation that uses the resource before the scope closes.

## Structured Fibers

Prefer structured combinators when child work has one lexical owner:

```ts
const results = yield* Effect.forEach(accountIds, reconcileAccount, {
  concurrency: 8,
})
```

Use `Effect.forkScoped` for background work that should be interrupted when the current scope closes.

Use `FiberSet` when one owner supervises a dynamic collection. Use `FiberMap` when work is keyed and replacing or interrupting the current fiber for one key is meaningful.

Never call host-level `runFork` from ordinary service code merely to detach work. A Scope-owned callback runtime is a valid adapter because it preserves ownership.

## Callback Runner

When an external source invokes callbacks and only a scoped runner is needed:

```ts
const runFork = yield* FiberSet.makeRuntime()

const unsubscribe = provider.onEvent((raw) => {
  void runFork(decodeAndHandle(raw))
})

yield* Effect.addFinalizer(() => Effect.sync(unsubscribe))
```

Use an explicit `FiberSet` plus `FiberSet.runtime(set)()` when the service must inspect, join, count, or clear the set. Verify the exact signatures against the target pin.

A scoped runner does not automatically restore every host-local context. Follow `runtime-bridges.md` when AsyncLocalStorage, request locals, tenant/workspace identity, or other non-Effect ambient state must cross the callback.

## Coordination Chooser

- `Deferred<A, E>`: one-shot readiness, result handoff, approval, resume, or join signal.
- `Queue<A>`: bounded producer/consumer handoff with backpressure.
- `PubSub<A>`: broadcast each value to several subscribers.
- `SubscriptionRef<A>`: current value plus updates.
- `Latch`: reusable open/close gate.
- `Ref<A>`: atomic state without blocking coordination.
- `Semaphore`: bounded concurrency or a permit pool.
- keyed semaphore/mutex: serialize mutations per domain key rather than globally.
- `Exit<A, E>`: preserve a completed success or failure for replay, storage, or handoff.

Use semantic synchronization instead of arbitrary sleeps.

```ts
const ready = yield* Deferred.make<void>()
const completed = yield* Deferred.make<Exit.Exit<Result, WorkerError>>()

const fiber = yield* worker(ready).pipe(
  Effect.exit,
  Effect.flatMap((exit) => Deferred.succeed(completed, exit)),
  Effect.forkScoped,
)

void fiber
yield* Deferred.await(ready)
return yield* Deferred.await(completed).pipe(Effect.flatten)
```

## Queues And Shutdown

Choose capacity from product semantics:

- bounded/suspend: producers wait and completeness matters;
- dropping/sliding: freshness matters more than completeness;
- unbounded: only when an external invariant proves bounded growth.

The owner shuts down the Queue or PubSub. Consumers should observe shutdown or interruption rather than spin forever.

## Keyed Resource Lifetimes

Use a keyed scoped abstraction when each key owns a closeable client, database, worker, subscription, or Layer graph. The abstraction must define:

- key identity;
- acquisition deduplication;
- idle/TTL or explicit invalidation policy;
- concurrent lookup behavior;
- finalization on eviction and owner shutdown.

Do not store scoped values in a plain global Map.

## Interruption

Assume Effect operations are interruptible unless deliberately masked.

- Preserve interruption when handling broad Causes.
- Use typed recovery when only expected failures should be recoverable.
- Use `Effect.ensuring` for unconditional cleanup that is not itself acquisition.
- Use acquire/release for resource ownership.
- Keep uninterruptible regions narrow.

## Race Semantics

Choose the operator by product semantics and verify it against the target version:

- first completion, including failure, wins: first-completion race;
- first success may win while one failure waits for the other branch: prefer-success race;
- deadline versus work: a timeout combinator with explicit timeout recovery.

A prefer-success race can hide an early failure or wait forever when the other branch never succeeds. Test both winner orders, failure ordering, and loser interruption.

## Managed Runtime

Use a managed runtime when a host repeatedly invokes callbacks over one Layer graph:

```ts
export const AppRuntime = ManagedRuntime.make(AppLayer)
export const handle = (request: Request) => AppRuntime.runPromise(route(request))
export const dispose = () => AppRuntime.dispose()
```

Do not allocate it inside `handle`. A second runtime shares acquisitions only when both deliberately use the same `Layer.MemoMap`. The host owner must dispose the runtime.

## Verification

Test:

- release after success, expected failure, defect, and interruption;
- child interruption when the owning scope closes;
- queue behavior under pressure and shutdown;
- keyed serialization and cross-key concurrency;
- keyed resource eviction and finalization;
- both race winner orders and loser cleanup;
- callback context propagation and late callback behavior;
- managed-runtime disposal.

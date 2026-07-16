# Resources And Concurrency

Use this file for acquisition, cleanup, Scope, fibers, queues, coordination, interruption, races, and managed runtimes.

## Ownership First

Every resource and background fiber needs an owner whose lifetime is at least as long as the work:

- one operation owns it: `Effect.acquireUseRelease`
- the current scope owns it: `Effect.acquireRelease`, scoped effect, or `Effect.addFinalizer`
- a service owns it: a Layer whose acquisition uses Scope
- a group owns many fibers: `FiberSet` or `FiberMap`
- the host owns the application graph: managed runtime

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
  );
});
```

The release action runs on success, typed failure, defect, and interruption. Keep acquisition and release adjacent so ownership is reviewable.

## Scoped Resource

Use `acquireRelease` when downstream work needs the resource for the current scope:

```ts
const openSubscription = Effect.acquireRelease(
  broker.subscribe(Topic.UserEvents),
  (subscription) => subscription.close,
);

const consume = Effect.scoped(
  Effect.gen(function* () {
    const subscription = yield* openSubscription;
    yield* subscription.messages.pipe(Stream.runForEach(handleMessage));
  }),
);
```

Do not return a scoped resource from `Effect.scoped`; its finalizer has already run when the value escapes. Expose an operation that uses it, or move ownership into a scoped Layer.

## Structured Fibers

Prefer Effect's structured operators when all child work has the same lexical owner:

```ts
const results =
  yield * Effect.forEach(accountIds, reconcileAccount, { concurrency: 8 });
```

Use `Effect.forkScoped` for background work that should be interrupted when the current scope closes:

```ts
const fiber = yield * heartbeat.pipe(Effect.forkScoped);
yield * readiness.await;
```

Use a `FiberSet` when one owner supervises a dynamic collection. Use a `FiberMap` when work is keyed and replacing or interrupting the fiber for one key is meaningful.

```ts
const fibers = yield * FiberSet.make<void, WorkerError>();
yield * FiberSet.run(fibers, consumePartition(partition));
yield * FiberSet.join(fibers);
```

Never call host-level `runFork` from ordinary service code. That detaches the fiber from the service's Scope and hides its failure.

## Coordination Chooser

- `Deferred<A, E>`: one-shot readiness, result handoff, approval, resume, or join signal.
- `Queue<A>`: bounded producer/consumer handoff with backpressure.
- `PubSub<A>`: broadcast each published value to multiple subscribers.
- `SubscriptionRef<A>`: current value plus updates.
- `Latch`: reusable open/close gate.
- `Ref<A>`: atomic in-memory state without blocking coordination.
- `Semaphore`: bounded concurrency or one shared permit pool.
- keyed semaphore/mutex: serialize mutations per domain key, not globally.
- `Exit<A, E>`: preserve a completed success or failure for replay, storage, or handoff.

Use semantic synchronization instead of timing guesses:

```ts
const ready = yield * Deferred.make<void>();
const completed = yield * Deferred.make<Exit.Exit<Result, WorkerError>>();

yield *
  worker(ready).pipe(
    Effect.exit,
    Effect.flatMap((exit) => Deferred.succeed(completed, exit)),
    Effect.forkScoped,
  );

yield * Deferred.await(ready);
return yield * Deferred.await(completed).pipe(Effect.flatten);
```

## Queues And Shutdown

Choose capacity from the production pressure policy:

- bounded queue: producers wait and backpressure is required
- dropping/sliding strategy: freshness is more important than completeness
- unbounded queue: only when growth is externally bounded and reviewed

The owner shuts the queue or pubsub down. Consumers should observe shutdown or interruption rather than spin forever. A Layer-created queue belongs to that Layer's scope.

## Interruption

Assume Effect operations are interruptible unless deliberately masked. Finalizers and uninterruptible regions should be small.

- Preserve interruption when handling broad causes.
- Use typed-error recovery when only expected failures should be recoverable.
- Use `Effect.ensuring` for an unconditional action that is not itself resource acquisition.
- Use acquire/release for resource ownership rather than emulating it with `ensuring`.
- Do not wrap an entire request or worker in an uninterruptible region.

## Race Semantics

Choose race behavior by product semantics:

- first completion, including failure, must win: `raceFirst`
- first success may win and failures can wait for the other branch: prefer-success race
- deadline versus work: timeout combinator, then model timeout recovery explicitly

A prefer-success race can hide an early failure or wait forever when the other branch never succeeds. Test both winner orders and interruption of the loser.

## Managed Runtime

Use a managed runtime when a host repeatedly invokes callbacks but the Layer graph should live across invocations:

```ts
export const AppRuntime = ManagedRuntime.make(AppLayer);

export const handle = (request: Request) =>
  AppRuntime.runPromise(route(request));

export const dispose = () => AppRuntime.dispose();
```

The host owner must dispose the runtime. Do not allocate one inside `handle`.

## Verification

Test:

- release after success, expected failure, and interruption
- child interruption when the owning scope closes
- bounded queue behavior under pressure
- keyed serialization and cross-key concurrency
- race winner and loser cleanup
- runtime disposal and long-lived fiber shutdown

Red flags include leaked handles, detached fibers, arbitrary sleeps for coordination, unbounded queues without a proof, and resources escaping closed scopes.

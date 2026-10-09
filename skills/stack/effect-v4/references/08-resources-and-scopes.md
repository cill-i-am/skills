# Resources, scopes, and finalization

## Every resource needs an owner

A resource is anything that requires cleanup: file handles, sockets, database connections, subscriptions, child processes, worker threads, locks, timers, and background fibers. Acquisition and use must remain inside the lifetime that guarantees release.

```ts
import { Effect } from "effect"

export const withRecordedResource = (events: Array<string>) => Effect.scoped(
  Effect.gen(function*() {
    const resource = yield* Effect.acquireRelease(
      Effect.sync(() => {
        events.push("acquire")
        return { name: "demo" }
      }),
      () => Effect.sync(() => { events.push("release") })
    )
    events.push(`use:${resource.name}`)
    return resource.name
  })
)
```

The returned name is a value safe to keep. Returning a live socket from the same scoped program would be wrong: its owner would have closed before the caller could use it.

`Effect.acquireRelease` ties release to the active Scope. `Effect.scoped` supplies a scope and closes it when the scoped computation exits. `Effect.acquireUseRelease` is useful when acquisition, use, and release form one bounded operation. `Effect.addFinalizer` registers cleanup; `ensuring` attaches cleanup to an operation.

## Failure and interruption semantics

Acquire/release brackets protect critical lifecycle transitions. Do not assume that an arbitrary asynchronous acquisition can be interrupted midway without leaking a partially created resource. Understand which acquisition operations are masked and how the underlying API signals partial success.

Keep uninterruptible regions short. Do not make a whole request or a minutes-long network call uninterruptible just to protect one tiny state update. Cancellation is cooperative, and a non-cooperating foreign API may continue even when the Effect waiting for it is interrupted.

Finalizers should be bounded, reliable, and safe to invoke according to their contract. Decide how release failures are observed. Do not swallow failed transaction rollback or failed resource release without reporting it. Do not turn cleanup into an infinite retry that blocks process shutdown forever.

Structured cleanup is not a guarantee against `SIGKILL`, power failure, or a host terminating an isolate. Critical business work needs durable state and recovery rather than a finalizer alone.

## Streams and callbacks are common escape points

When returning a Stream, retain the scope that owns its data source until the consumer finishes or cancels. Constructing a scoped response, closing the scope, and returning a lazy body stream is a use-after-close bug. Test early consumer termination, not just complete consumption.

For callbacks, return an unsubscribe/cancel finalizer. If an external API invokes callbacks after cancellation, protect against stale completion and avoid accessing already-released state. A subscription without an unsubscribe path needs an explicit lifetime limitation or a different adapter.

For transaction APIs, all database operations must execute in the transaction's context before the callback returns. Starting detached work inside the transaction or returning a Promise backed by a separate runtime can move work outside the transaction.

## Pools and dynamically shared resources

Use a Pool when a bounded set of interchangeable resources should be acquired and returned. Use reference-counted keyed resources for expensive per-key clients that should live while in use, not indefinitely. Distinguish idle timeout, total capacity, maximum wait, and per-tenant fairness.

Do not cache a resource handle in an ordinary value cache without preserving its scope. Invalidation must release resources when no valid users remain. Reload should acquire a valid replacement before discarding the old resource when the application requires continuity.

## Tests that catch real leaks

Record acquisition and release and assert one release for success, expected failure, defect, timeout, and interruption. Test partial startup, failed acquisition, failed release, consumer cancellation, nested scopes, and runtime disposal. Use a deterministic synchronization signal to know the resource was acquired before interrupting the fiber; a guessed sleep can make the test pass without exercising the intended state.

## Official sources

- [Resource guide](https://effect.website/docs/v4/resource-management/introduction)
- [Scope](https://effect.website/docs/v4/api/effect/Scope)
- [Acquire/release API](https://effect.website/docs/v4/api/effect/Effect)
- [Pool](https://effect.website/docs/v4/api/effect/Pool)
- [ScopedCache](https://effect.website/docs/v4/api/effect/ScopedCache)

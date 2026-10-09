# Fibers and bounded concurrency

## Prefer structured operators before manual forks

For independent operations, start with `Effect.all` or `Effect.forEach` and a deliberate concurrency limit. Use a fiber handle when you need to await, interrupt, inspect, or supervise a specific task. A fiber is concurrent work inside a runtime; it is not automatically a CPU thread or a durable job.

```ts
import { Effect } from "effect"

export const enrichBatch = <A, B, E, R>(
  items: ReadonlyArray<A>,
  enrich: (item: A) => Effect.Effect<B, E, R>
) => Effect.forEach(items, enrich, { concurrency: 8 })
```

Choose the limit from downstream quotas, connection pools, memory, and latency goals. A limit of eight here is an example, not a universal recommendation. Nested loops can multiply concurrency. Bound the actual scarce operation with a shared permit when several call paths compete for one resource.

## Ownership comes first

`Effect.forkChild` ties a child's lifetime to its parent fiber. `Effect.forkScoped` ties work to a Scope. Other explicit fork/lifetime tools exist; inspect the exact semantics before detaching anything. Detached work needs an owner, failure reporting, an interruption path, and a reason it may outlive the request.

`Fiber.join` waits and re-exposes the task's result and failures. `Fiber.await` allows inspection of completion as an Exit. Interrupting a fiber and awaiting its cleanup is different from firing an immediate interruption request and continuing. Do not report “stopped” before finalization finishes.

Launching a child from a short-lived constructor is not the same as launching an application background worker. Use a scoped fork for layer-lifetime work. Do not solve accidental early cancellation by detaching every task.

## Cancellation is cooperative

Effect can coordinate cancellation with its own operations and supported foreign adapters. An arbitrary Promise, CPU-bound loop, remote server, or external side effect may not stop simply because the waiting fiber stops.

Pass AbortSignals to cancellable APIs. Insert appropriate cooperative boundaries for long computations, or move CPU-heavy work to actual workers. Keep uninterruptible sections as narrow as the invariant requires. Never describe a timeout as a hard guarantee that a remote mutation did not happen.

## Races and partial completion

Choose whether you need first success or first completion, including failure. Read the matching race operator rather than assuming all race variants mean the same thing. Ensure losing operations are interrupted and cleaned up where the operator promises that behaviour.

A failure in a parallel collection can leave external operations partially completed even if sibling fibers are interrupted. Structured concurrency is not distributed rollback. Use transactions, idempotency, or compensation to control externally visible effects.

For “collect every outcome,” explicitly turn each operation into a Result or Exit before traversal and decide how interruption should behave. Do not suppress cancellation as an accidental side effect of gathering errors.

## Supervision and operational visibility

Use `FiberSet`, `FiberMap`, or `FiberHandle` when a long-lived host needs to track dynamic work. Select them according to multiplicity and key ownership. Replacing keyed work must have an explicit cancellation policy. Avoid a handwritten array of fire-and-forget Promises with no cleanup or error handling.

Track active work, queue wait time, execution time, rejection/drop counts, and shutdown duration. A high concurrency setting can improve throughput until a downstream bottleneck makes everything slower.

## Tests

Assert the maximum observed concurrency, cancellation of a blocked task, cleanup after a sibling fails, and behaviour when the host stops. Use Deferred or Queue handshakes to create the intended interleaving. Do not rely on arbitrary sleeps to prove race safety.

## Official sources

- [Fibers guide](https://effect.website/docs/v4/concurrency/fibers)
- [Effect concurrency operators](https://effect.website/docs/v4/api/effect/Effect)
- [Fiber](https://effect.website/docs/v4/api/effect/Fiber)
- [FiberSet](https://effect.website/docs/v4/api/effect/FiberSet)
- [FiberMap](https://effect.website/docs/v4/api/effect/FiberMap)

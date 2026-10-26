# Queues, PubSub, Deferred, and semaphores

## Choose the communication semantics

| Need | Tool | Decision to make |
| --- | --- | --- |
| Hand each item to one worker | `Queue` | Capacity, overflow, completion, and shutdown |
| Broadcast to active subscribers | `PubSub` | Slow-subscriber policy and subscription lifetime |
| Complete a one-shot result | `Deferred` | Who completes it and what happens if that owner fails |
| Restrict access to a scarce resource | `Semaphore` | Permit count, fairness, and cancellation while waiting |
| Independent per-key limits | `PartitionedSemaphore` | Key cardinality and global capacity |
| A reusable gate | `Latch` | When it opens/closes and who owns that state |

These are in-process coordination tools, not message brokers or durable storage.

## Bounded producer/consumer example

```ts
import { Effect, Fiber, Queue } from "effect"

export const transferThree = Effect.scoped(Effect.gen(function*() {
  const queue = yield* Effect.acquireRelease(
    Queue.bounded<string>(2),
    (queue) => Queue.shutdown(queue)
  )
  const consumer = yield* Effect.forkChild(
    Effect.forEach([0, 1, 2], () => Queue.take(queue))
  )
  yield* Effect.forEach(["first", "second", "third"],
    (value) => Queue.offer(queue, value))
  return yield* Fiber.join(consumer)
}))
```

Production queues need a protocol for completion or failure rather than a hardcoded item count. The v4 queue type can represent terminal failure as well as values. Distinguish normal completion, failure, interruption, and shutdown; check whether buffered elements are drained or discarded by the operation you choose.

## Backpressure is a policy

A suspending bounded queue slows producers when it fills. A dropping queue rejects or discards according to its strategy. A sliding queue replaces older values according to its strategy. Inspect offer results and expose drop metrics. Silent dropping is not acceptable for payments, audit records, or must-deliver work.

Unbounded queues convert sustained overload into memory growth. They can be reasonable for a genuinely bounded test or tiny internal sequence, but not as a default production escape hatch. A producer and consumer can deadlock if the producer fills a queue before the consumer is started.

## PubSub and subscriptions

PubSub sends each message to subscribers according to the selected buffering policy. Own subscriptions with scopes and release them when consumers leave. Decide whether slow subscribers block the producer, drop messages, or disconnect. Do not infer durable replay or delivery to future subscribers merely from the word “publish.”

A state stream and an event stream are different. `SubscriptionRef` is often a better fit when consumers need current state plus subsequent changes. Persist events elsewhere when missing a message cannot be tolerated.

## Deferred and gating

Use Deferred to signal “resource acquired,” “worker ready,” or a single result. Handle failure of the completing fiber, duplicate completion, and interruption of waiters. A Deferred nobody will ever complete is a hidden hang. It is not a reusable queue.

Use a semaphore's bracketed permit operation instead of manually incrementing and decrementing a counter. Validate requested permits; a task waiting for more permits than the design can ever supply is not a retry problem. Do not hold permits while waiting on unrelated work if that can create a cycle.

In multi-tenant systems, a per-tenant limit may still allow an excessive global total. Combine per-key fairness with a global cap where needed. Bound the number of tracked keys.

## Test the overload path

Test a full queue, cancelled producers, cancelled consumers, slow subscribers, normal completion with buffered values, shutdown with waiters, and permit release after failure. Verify that a blocked request can still be cancelled. Measure queue age, not only queue length; an apparently short queue can still contain very old work.

## Official sources

- [Queue source and terminal states](https://github.com/Effect-TS/effect/blob/effect@4.0.2/packages/effect/src/Queue.ts)
- [PubSub](https://effect.website/docs/v4/api/effect/PubSub)
- [Deferred](https://effect.website/docs/v4/api/effect/Deferred)
- [Semaphore](https://effect.website/docs/v4/api/effect/Semaphore)
- [PartitionedSemaphore](https://effect.website/docs/v4/api/effect/PartitionedSemaphore)
- [Latch](https://effect.website/docs/v4/api/effect/Latch)

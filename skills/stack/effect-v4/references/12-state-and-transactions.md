# State and in-memory transactions

## Match the primitive to the invariant

Use `Ref` for an atomically updated in-process value. Use `SynchronizedRef` when an update itself is effectful and must be serialized. Use `SubscriptionRef` when consumers also need a stream of current state and changes. Use the `Tx*` family when an invariant spans multiple transactional values or collections.

A JavaScript single thread does not prevent interleaving across asynchronous boundaries. A read followed later by a write is not the same as one atomic update.

```ts
import { Effect, Ref } from "effect"

export const countVisits = Effect.gen(function*() {
  const visits = yield* Ref.make(0)
  yield* Effect.forEach([1, 2, 3, 4],
    () => Ref.update(visits, (n) => n + 1),
    { concurrency: 4 })
  return yield* Ref.get(visits)
})
```

Use `Ref.modify` when returning a result and updating state must be one operation. Avoid mutating the object held in a Ref in place; return a new value or explicitly own and synchronize mutable internals. Treat update callbacks as pure.

## Transactions across values

`Effect.tx` records transactional reads and writes and commits them together when the outer transaction succeeds. Conflicts and explicit transactional retries can re-execute the body. The transactional collections include refs, maps, sets, queues, priority queues, deferred values, semaphores, PubSub, and locks.

```ts
import { Effect, Schema, TxRef } from "effect"

class InsufficientStock extends Schema.TaggedError<InsufficientStock>()(
  "InsufficientStock", {}
) {}

export const moveOne = (
  available: TxRef.TxRef<number>,
  reserved: TxRef.TxRef<number>
) => Effect.tx(Effect.gen(function*() {
  const count = yield* TxRef.get(available)
  if (count < 1) return yield* new InsufficientStock()
  yield* TxRef.set(available, count - 1)
  yield* TxRef.update(reserved, (n) => n + 1)
}))
```

The rule concerns two values together; two independent Ref updates would not express the same invariant. This is in-memory atomicity, not a SQL transaction or durable inventory reservation. Process restart discards this state unless you separately persist it.

Do not perform irreversible external effects inside a transaction body that may be retried. Sending mail, charging a card, writing a file, or calling an API there can run more than once. Compute and commit the local decision, then use an explicitly coordinated external protocol.

`Effect.txRetry` waits for relevant transactional state to change. It is not a timed network retry and should not be used as an unbounded busy loop. Understand the watched read set and how cancellation wakes or stops waiters.

## Synchronized updates

An effectful update can serialize access while it executes. A slow network request inside a SynchronizedRef update can therefore block all competing updates. Prefer reading a version, doing slow work outside the lock, and committing with a deliberate conflict check when the domain allows it. Do not hold one lock while waiting for another in an inconsistent order.

## Subscriptions and state ownership

Own change-stream subscriptions with scopes. Test whether consumers receive the current value, subsequent changes, and terminal behaviour as expected. Do not use an in-memory subscription as the sole record of a business event.

Application state, tenant state, request state, and test state need different lifetimes. A module-level Ref may accidentally outlive a session; a Ref created on every call may never accumulate state at all. Make the allocation site visible.

## Tests

Use adversarial interleavings to test lost updates and multi-value invariants. Verify transactional rollback on expected failure and defect, cancellation while waiting, repeated conflict retries, and subscriber cleanup. Check that the sum or other invariant remains constant across parallel operations. Add restart tests for any design claiming persistence; a successful in-memory transaction test does not establish durability.

## Official sources

- [TxRef and transaction journal](https://github.com/Effect-TS/effect/blob/effect@4.0.2/packages/effect/src/TxRef.ts)
- [Ref](https://effect.website/docs/v4/api/effect/Ref)
- [SynchronizedRef](https://effect.website/docs/v4/api/effect/SynchronizedRef)
- [SubscriptionRef](https://effect.website/docs/v4/api/effect/SubscriptionRef)
- [Transaction operators](https://effect.website/docs/v4/api/effect/Effect)

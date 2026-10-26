# Distributed entities, clustering, sharding, and state

## An entity is a lifecycle and routing boundary

Effect's cluster family models entities with RPC operations and distributes their execution across runners. Entity identity, routing, handler concurrency, storage, and passivation are separate concerns. Inspect stability and driver requirements for the installed release before selecting the production topology.

```ts
import { Effect, Ref, Schema } from "effect"
import { Entity } from "effect/cluster"
import { Rpc } from "effect/rpc"

const Add = Rpc.make("Add", {
  payload: { amount: Schema.Int },
  success: Schema.Int
})
const Read = Rpc.make("Read", { success: Schema.Int })

export const Counter = Entity.make("ExampleCounter", [Add, Read])
export const CounterLive = Counter.toLayer(Effect.gen(function*() {
  const count = yield* Ref.make(0)
  return Counter.of({
    Add: ({ payload }) => Ref.updateAndGet(count, (n) => n + payload.amount),
    Read: () => Ref.get(count)
  })
}), { maxIdleTime: "5 minutes" })
```

This counter is in-memory while the entity is active. It resets if that state is discarded and the entity is created again. It is not a durable counter and the Add operation is not idempotent. The example teaches entity assembly, not production-safe financial or inventory state.

## Serialization and concurrency

The official example describes serialized handlers for an entity by default, with `Rpc.fork` as an explicit opt-out. Keep mutations serialized unless the state model and storage operations are safe under overlap. A read may also need ordering guarantees; enabling concurrency can change what a read observes.

Do not infer cluster-wide mutual exclusion from a local Ref or semaphore. Persistent authoritative state needs appropriate database constraints, ownership/fencing, and a recovery policy for the selected cluster implementation. Test network partitions and runner replacement rather than relying on normal-path routing.

## Messages versus state

The official cluster example marks persisted messages with `ClusterSchema.Persisted`; messages are otherwise volatile in that example. Persisting the message does not automatically persist an in-memory Ref updated by its handler. Likewise, storing a reply does not prove an external side effect happened only once.

Define message identity, redelivery handling, result retention, and recovery after a handler crashes. Use stable operation IDs for mutations and persist authoritative state according to the business requirements. Test crashes at state-write, reply-write, and acknowledgement boundaries.

## Passivation, resources, and tenant scale

`maxIdleTime` controls when idle entities can be stopped and recreated. Any active resource should be owned by the entity's lifetime and cleaned up on passivation. Do not assume an entity stays alive forever because a client holds its ID.

Capacity planning must include active entity count, resources per entity, mailbox/backlog size, storage growth, and hot-key behaviour. One busy tenant/entity can become a serialized bottleneck. Choose an identity granularity that matches required consistency rather than sharding arbitrarily for apparent parallelism.

`EntityResource`, runner health/storage, message storage, singleton support, cron integration, and cluster-backed workflow engines are indexed in the module atlas. Each changes a different boundary; read the matching API and deployment examples before combining them.

## Deployment and tests

Select the actual socket/HTTP runner implementation and SQL or other supported storage layers. Validate discovery, advertised addresses, authentication, TLS/network boundaries, readiness, and graceful rebalancing in the deployment environment.

`TestRunner.layer` is appropriate for fast single-process entity tests. It does not validate networking, multi-runner ownership, crash persistence, or deployment discovery. Add tests with real storage, runner death, repeated messages, slow handlers, partitions, passivation/reactivation, and rolling releases.

**Do** state exactly which entity data survives restart. **Don't** call an in-memory entity durable because it is addressed by ID.

**Do** test handler ordering before using `Rpc.fork`. **Don't** introduce concurrency only to make a benchmark faster while changing business semantics.

## Official sources

- [Official cluster entity example](https://github.com/Effect-TS/effect/blob/effect@4.0.2/ai-docs/src/80_cluster/10_entities.ts)
- [Entity](https://effect.website/docs/v4/api/effect/cluster/Entity)
- [ClusterSchema](https://effect.website/docs/v4/api/effect/cluster/ClusterSchema)
- [MessageStorage](https://effect.website/docs/v4/api/effect/cluster/MessageStorage)
- [Sharding](https://effect.website/docs/v4/api/effect/cluster/Sharding)
- [TestRunner](https://effect.website/docs/v4/api/effect/cluster/TestRunner)

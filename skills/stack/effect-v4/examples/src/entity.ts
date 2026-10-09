// Baseline: effect@4.0.2. See ../../references/33-cluster.md
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

// Baseline: effect@4.0.2. See ../../references/11-queues-and-coordination.md
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

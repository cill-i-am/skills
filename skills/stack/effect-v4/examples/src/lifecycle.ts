import { Deferred, Effect, Fiber, Ref } from "effect"

/** Proves acquisition happened before requesting interruption. */
export const interruptOwnedResource = Effect.gen(function*() {
  const events: Array<string> = []
  const started = yield* Deferred.make<void>()
  const worker = yield* Effect.forkChild(Effect.scoped(Effect.gen(function*() {
    yield* Effect.acquireRelease(
      Effect.sync(() => { events.push("acquire") }),
      () => Effect.sync(() => { events.push("release") })
    )
    yield* Deferred.succeed(started, undefined)
    yield* Effect.never
  })))
  yield* Deferred.await(started)
  yield* Fiber.interrupt(worker)
  return events
})

/** Cleanup also occurs for typed failure and defects. */
export const recordFinalization = <A, E, R>(body: Effect.Effect<A, E, R>) =>
  Effect.gen(function*() {
    const events: Array<string> = []
    const exit = yield* Effect.exit(Effect.scoped(Effect.gen(function*() {
      yield* Effect.acquireRelease(
        Effect.sync(() => { events.push("acquire") }),
        () => Effect.sync(() => { events.push("release") })
      )
      return yield* body
    })))
    return { events, exit }
  })

/** A bounded-concurrency probe, intended for virtual-time tests. */
export const observeConcurrency = Effect.gen(function*() {
  const active = yield* Ref.make(0)
  const peak = yield* Ref.make(0)
  const values = yield* Effect.forEach([1, 2, 3, 4, 5, 6], (value) =>
    Effect.scoped(Effect.gen(function*() {
      yield* Effect.acquireRelease(
        Effect.gen(function*() {
          const count = yield* Ref.updateAndGet(active, (n) => n + 1)
          yield* Ref.update(peak, (n) => Math.max(n, count))
        }),
        () => Ref.update(active, (n) => n - 1)
      )
      yield* Effect.sleep("10 millis")
      return value * 2
    })), { concurrency: 2 })
  return { values, peak: yield* Ref.get(peak), active: yield* Ref.get(active) }
})

// Baseline: effect@4.0.2. See ../../references/09-runtime-boundaries.md
import { Context, Effect, Layer, ManagedRuntime, Ref } from "effect"

class Counter extends Context.Service<Counter, {
  readonly next: Effect.Effect<number>
}>()("example/Counter") {}

const CounterLive = Layer.effect(Counter, Effect.gen(function*() {
  const state = yield* Ref.make(0)
  return { next: Ref.updateAndGet(state, (n) => n + 1) }
}))

export const makeCounterBoundary = () => {
  const runtime = ManagedRuntime.make(CounterLive)
  return {
    next: () => runtime.runPromise(Counter.use((counter) => counter.next)),
    dispose: () => runtime.dispose()
  }
}

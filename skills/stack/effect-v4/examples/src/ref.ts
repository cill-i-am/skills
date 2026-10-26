// Baseline: effect@4.0.2. See ../../references/12-state-and-transactions.md
import { Effect, Ref } from "effect"

export const countVisits = Effect.gen(function*() {
  const visits = yield* Ref.make(0)
  yield* Effect.forEach([1, 2, 3, 4],
    () => Ref.update(visits, (n) => n + 1),
    { concurrency: 4 })
  return yield* Ref.get(visits)
})

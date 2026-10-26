// Baseline: effect@4.0.2. See ../../references/14-caching-and-batching.md
import { Cache, Effect } from "effect"

export const cachedLengths = Effect.gen(function*() {
  const cache = yield* Cache.make({
    capacity: 128,
    timeToLive: "30 seconds",
    lookup: (key: string) => Effect.succeed(key.length)
  })
  return yield* Effect.forEach(["alpha", "beta", "alpha"],
    (key) => Cache.get(cache, key),
    { concurrency: 3 })
})

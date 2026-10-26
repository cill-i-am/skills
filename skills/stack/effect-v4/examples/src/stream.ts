// Baseline: effect@4.0.2. See ../../references/15-streams.md
import { Effect, Stream } from "effect"

export const squaredTotal = Stream.fromIterable([1, 2, 3, 4]).pipe(
  Stream.mapEffect((value) => Effect.succeed(value * value),
    { concurrency: 2 }),
  Stream.runFold(() => 0, (total, value) => total + value)
)

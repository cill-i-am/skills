// Baseline: effect@4.0.2. See ../../references/10-fibers-and-concurrency.md
import { Effect } from "effect"

export const enrichBatch = <A, B, E, R>(
  items: ReadonlyArray<A>,
  enrich: (item: A) => Effect.Effect<B, E, R>
) => Effect.forEach(items, enrich, { concurrency: 8 })

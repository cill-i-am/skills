// Baseline: effect@4.0.2. See ../../references/12-state-and-transactions.md
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

// Baseline: effect@4.0.2. See ../../references/01-mental-model.md
import { Effect, Schema } from "effect"

export const lineTotal = (unitPriceInCents: number, quantity: number): number =>
  unitPriceInCents * quantity

export class EmptyBasket extends Schema.TaggedError<EmptyBasket>()(
  "EmptyBasket", {}
) {}

export const totalBasket = Effect.fn("totalBasket")(
  function*(lines: ReadonlyArray<{ priceInCents: number; quantity: number }>) {
    if (lines.length === 0) return yield* new EmptyBasket()
    return lines.reduce(
      (sum, line) => sum + lineTotal(line.priceInCents, line.quantity), 0
    )
  }
)

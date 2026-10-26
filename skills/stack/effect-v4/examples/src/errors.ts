// Baseline: effect@4.0.2. See ../../references/03-errors-and-recovery.md
import { Effect, Schema } from "effect"

export class ItemMissing extends Schema.TaggedError<ItemMissing>()(
  "ItemMissing", { id: Schema.String }
) {}

export class InventoryUnavailable extends Schema.TaggedError<InventoryUnavailable>()(
  "InventoryUnavailable", {
    retryable: Schema.Boolean,
    cause: Schema.Defect()
  }
) {}

export const classifyInventoryFailure = (
  task: Effect.Effect<string, ItemMissing | InventoryUnavailable>
) => task.pipe(
  Effect.catchTag("ItemMissing", () => Effect.succeed("No matching item"))
)

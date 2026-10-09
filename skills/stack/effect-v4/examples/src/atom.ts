// Baseline: effect@4.0.2. See ../../references/28-reactivity-and-frontend.md
import { Effect } from "effect"
import { Atom } from "effect/reactivity"

export const quantity = Atom.make(1)
export const doubled = Atom.make((get) => get(quantity) * 2)
export const delayedLabel = Atom.make(
  Effect.sleep("100 millis").pipe(Effect.as("ready"))
)

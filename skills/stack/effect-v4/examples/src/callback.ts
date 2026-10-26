// Baseline: effect@4.0.2. See ../../references/02-creating-and-composing.md
import { Effect } from "effect"

export const callbackDelay = (milliseconds: number) =>
  Effect.callback<void>((resume) => {
    const timer = setTimeout(() => resume(Effect.void), milliseconds)
    return Effect.sync(() => clearTimeout(timer))
  })

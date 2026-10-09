// Baseline: effect@4.0.2. See ../../references/19-time-numbers-and-units.md
import { DateTime, Effect } from "effect"

export const makeExpiry = Effect.gen(function*() {
  const now = yield* DateTime.now
  const expiresAt = DateTime.add(now, { hours: 2 })
  return DateTime.formatIso(expiresAt)
})

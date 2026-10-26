// Baseline: effect@4.0.2. See ../../references/02-creating-and-composing.md
import { Effect, Schema } from "effect"

export class ProviderUnavailable extends Schema.TaggedError<ProviderUnavailable>()(
  "ProviderUnavailable", { cause: Schema.Defect() }
) {}

export const readRemoteText = Effect.fn("readRemoteText")(
  function*(url: string) {
    return yield* Effect.tryPromise({
      try: async (signal) => {
        const response = await fetch(url, { signal })
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return await response.text()
      },
      catch: (cause) => new ProviderUnavailable({ cause })
    })
  }
)

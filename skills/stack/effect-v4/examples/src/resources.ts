// Baseline: effect@4.0.2. See ../../references/08-resources-and-scopes.md
import { Effect } from "effect"

export const withRecordedResource = (events: Array<string>) => Effect.scoped(
  Effect.gen(function*() {
    const resource = yield* Effect.acquireRelease(
      Effect.sync(() => {
        events.push("acquire")
        return { name: "demo" }
      }),
      () => Effect.sync(() => { events.push("release") })
    )
    events.push(`use:${resource.name}`)
    return resource.name
  })
)

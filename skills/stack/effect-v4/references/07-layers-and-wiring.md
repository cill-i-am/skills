# Layers, memoization, and application wiring

## Read the type in the right direction

`Layer.Layer<ROut, E, RIn>` describes construction of output services `ROut`, possible construction errors `E`, and input services `RIn`. This order is different from the Effect type. A Layer is a recipe, not necessarily a running resource.

Use `Layer.succeed` for an existing implementation, `Layer.effect` for effectful construction, `Layer.effectDiscard` for scoped startup/background behaviour without a service, and `Layer.unwrap` when an Effect or configuration selects a Layer.

```ts
import { Context, Effect, Layer } from "effect"

class Prefix extends Context.Service<Prefix, { readonly value: string }>()(
  "example/Prefix"
) {}

class Formatter extends Context.Service<Formatter, {
  readonly format: (value: string) => string
}>()("example/Formatter") {}

const FormatterLive = Layer.effect(Formatter, Effect.gen(function*() {
  const prefix = yield* Prefix
  return { format: (value: string) => `${prefix.value}${value}` }
}))

const PrefixLive = Layer.succeed(Prefix, { value: "item: " })

export const FormatterOnly = FormatterLive.pipe(Layer.provide(PrefixLive))
export const FormatterAndPrefix = FormatterLive.pipe(
  Layer.provideMerge(PrefixLive)
)
```

`Layer.provide` supplies dependencies and exposes the target layer's outputs. `provideMerge` also retains the supplied outputs. `merge` and `mergeAll` combine outputs of sibling layers; merging is not a substitute for wiring one layer's requirements to another's outputs.

## Sharing depends on construction and scope

Reuse the same layer value for a shared resource. Layer memoization prevents repeated construction within the relevant build graph/memoization context; it does not mean “there is one instance of this service globally forever.” Building separate managed runtimes or repeatedly constructing fresh layer values can create separate pools, clients, subscriptions, and background tasks.

Make deliberate freshness explicit only when separate instances are needed. Do not defeat sharing accidentally with a factory called at every dependency site. Conversely, do not share a stateful service between tenants simply because memoization makes it convenient.

Inspect `Layer.build`, memoization facilities, and scope requirements when integrating with a custom host. Do not manually build a layer, discard its scope, and return a resource as though it remained valid.

## Application assembly

Keep a small composition root that chooses implementations, supplies configuration, installs telemetry, starts the host, and owns shutdown. Keep contracts importable without importing server startup or secrets. A shared API package should not start a server when a client imports a schema.

For long-running processes, `Layer.launch` can run the assembled application layer, with a platform runtime owning signals and shutdown. For foreign frameworks, build a `ManagedRuntime` with a lifecycle matching the application or request; see the runtime-boundaries reference.

A resource-owning service should use acquire/release inside `Layer.effect`. A background loop launched while constructing a layer should have the layer's scope as its owner. A plain `forkChild` from a short construction Effect can terminate as soon as that construction finishes; use the appropriate scoped fork for intended layer-lifetime work.

## Startup failures and cleanup

If service B fails after service A acquired a resource, verify that A is released. Treat startup retries as a deliberate deployment policy. An unbounded retry of invalid credentials can make a failing application look alive while never becoming ready.

Separate readiness from liveness. Readiness should depend on the application's ability to serve its supported requests. A startup log line does not prove that all required layers have acquired successfully.

Dynamic keyed resources may fit `LayerMap`, `RcMap`, or a pool. Reloadable services may fit `LayerRef`, `ScopedRef`, or related resource abstractions. Choose based on ownership and invalidation semantics; do not build an unbounded tenant-to-runtime Map without eviction and finalization.

## Review checklist

Can the reviewer identify every external resource and its scope? Is any expensive layer rebuilt per request? Are request secrets captured globally? Does providing a dependency intentionally hide or retain its service? Are test layers isolated? Does failed startup release already-acquired resources? Is shutdown awaited rather than just triggered?

## Official sources

- [Official Layer composition](https://github.com/Effect-TS/effect/blob/effect@4.0.2/ai-docs/src/01_effect/03_services/20_layer-composition.ts)
- [Layer API](https://effect.website/docs/v4/api/effect/Layer)
- [LayerMap](https://effect.website/docs/v4/api/effect/LayerMap)
- [Background layer example](https://github.com/Effect-TS/effect/blob/effect@4.0.2/ai-docs/src/01_effect/05_resources/20_layer-side-effects.ts)

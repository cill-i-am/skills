// Baseline: effect@4.0.2. See ../../references/07-layers-and-wiring.md
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

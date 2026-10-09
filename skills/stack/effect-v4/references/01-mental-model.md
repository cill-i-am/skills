# The mental model and application design

## Programs are values

`Effect.Effect<A, E, R>` describes a computation: a success value `A`, an expected failure `E`, and required services `R`. Describing the computation is different from executing it. Compose descriptions inside the application; execute at the boundary owned by the host.

`never` means no values can inhabit that channel. `Effect<A, never, R>` has no expected failures, but it can still contain a defect or be interrupted. `Effect<A, E, never>` needs no additional services; it does not mean that it is pure or synchronous. `void` is a successful result without a useful return value; it is not the same as `never`.

For a function returning `Effect<A, E, R>`, TypeScript helps callers supply services and handle expected failures. It cannot prove that an endpoint is authorised, that a remote write is idempotent, or that a user-provided URL is safe. Those remain explicit design and testing responsibilities.

## Keep four layers of responsibility clear

A useful application shape is: domain schemas and pure rules; use cases and service contracts; infrastructure implementations; and host adapters. This is a starting point, not a mandatory folder hierarchy.

A domain model should explain what values mean. A use case should explain what the application does. Infrastructure should explain how an external system is accessed. The entrypoint should explain how implementations are assembled and how the program lives and stops.

Do not leak a database row, raw provider response, HTTP request, or framework context through the entire domain simply because it is available. Decode at the boundary, make ownership explicit, and translate failure meanings at meaningful boundaries rather than wrapping every function in a new error class.

## Choose the simplest representation

| Need | Start with |
| --- | --- |
| Pure synchronous calculation | A normal function |
| Optional in-memory value | `Option` when its combinators improve clarity, otherwise an intentional nullable contract |
| Synchronous success or failure as data | `Result` |
| Effectful operation with typed failures | `Effect` |
| Replaceable capability or environment dependency | `Context.Service` and a `Layer` |
| Sequence arriving over time | `Stream` |
| Finalizer-owned resource | `Scope` and acquire/release |
| Shared in-process value | `Ref`, or stronger coordination when required |
| Work that must survive a process restart | Durable infrastructure; not an ordinary fiber |

Do not conflate these representations. A `Promise` is already running once created and does not carry an Effect service requirement. A `Stream` is a computation describing many values; collecting it changes its memory behaviour. A `Layer` describes service construction; it is not an object containing already-running dependencies.

## Example: keep the rule separate from the workflow

```ts
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
```

This example assumes prices and quantities were already validated. For real money, define supported currencies, units, bounds, rounding rules, and an overflow policy. Wrapping arithmetic in Effect does not make it financially correct.

## Design questions to answer explicitly

Name the success contract, expected errors, required capabilities, operation lifetime, retry safety, concurrency limit, and test seam. Ask whether a stream, cache, fiber, or transaction escapes the resource that owns it. Decide which failures callers can recover from and which indicate a broken invariant. Keep the public types readable enough that reviewers can answer these questions without reverse-engineering the implementation.

Prefer a vertical slice over a large speculative framework. Implement one real use case with its schemas, service, boundary, and tests; extract repetition only when it represents a stable concept.

## Official sources

- [Onboarding](https://effect.website/docs/v4/onboarding)
- [Effect API](https://effect.website/docs/v4/api/effect/Effect)
- [Result API](https://effect.website/docs/v4/api/effect/Result)
- [Official service examples](https://github.com/Effect-TS/effect/blob/effect@4.0.2/LLMS.md)

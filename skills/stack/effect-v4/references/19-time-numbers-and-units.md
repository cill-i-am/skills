# Time, numbers, randomness, and units

## Separate instants, durations, and civil time

An instant identifies a point in time. A duration is an elapsed amount. A local calendar time depends on a timezone and calendar rules. Treating all three as an unlabelled number is a common source of subtle errors.

```ts
import { DateTime, Effect } from "effect"

export const makeExpiry = Effect.gen(function*() {
  const now = yield* DateTime.now
  const expiresAt = DateTime.add(now, { hours: 2 })
  return DateTime.formatIso(expiresAt)
})
```

The example uses Effect's clock-aware current time. In tests, control time rather than depending on the wall clock. For durations, use Duration or clearly named units. A bare `5_000` should not require guessing whether it means bytes, milliseconds, seconds, or records.

Parse incoming dates safely and decide whether timezone-less values are acceptable. Reject ambiguous values at the boundary when the domain requires an instant. Preserve an IANA timezone for recurring civil-time events, not just a numeric offset observed once.

## Calendar arithmetic and deadlines

“Tomorrow at 09:00” is not always “24 hours from now.” Test daylight-saving transitions, month ends, leap days, and repeated/missing local times. Store and display according to the domain: a birthday is not necessarily a UTC instant, while an audit event usually is.

Use clock-aware APIs for testable scheduling. Distinguish timeouts measured by the runtime from business deadlines persisted across restarts. Recompute remaining budgets deliberately when work resumes; do not start a fresh full timeout every time a durable task retries unless that is the intended policy.

## Numeric correctness

Choose Number, BigInt, or BigDecimal according to required precision and operations. Number is not arbitrary precision. Integer cents can work for bounded fixed-scale money but still require currency, scale, safe-range, and rounding rules. BigDecimal does not choose a rounding policy on your behalf.

Validate finite values and bounds. Check division by zero, overflow into unsafe integer ranges, unsupported currencies, and conversions that silently round. Do not serialize a BigInt through ordinary JSON without an agreed codec.

Use brands or explicit record types for units that must not mix: metres versus millimetres, milliseconds versus seconds, or price cents versus item counts. A brand does not perform conversion or validate the underlying number by itself.

## Randomness and identifiers

Use the runtime's Random service when reproducible tests matter. Do not confuse deterministic test randomness with cryptographically secure randomness. Security tokens and cryptographic identifiers need the appropriate Crypto or host capability and entropy policy.

Generate a logical operation's ID once, then preserve it through retries. A new ID on every attempt defeats idempotency and makes tracing one action across attempts harder. For distributed IDs, investigate collisions, clock assumptions, uniqueness scope, and restart behaviour before choosing a scheme.

## Tests

Cover boundaries, timezone transitions, invalid inputs, round-trip encoding, safe-integer limits, decimal rounding, and stable operation IDs under retry. Avoid test assertions based on the developer machine's locale or timezone. Use explicit formatting settings for snapshots.

## Official sources

- [DateTime example](https://github.com/Effect-TS/effect/blob/effect@4.0.2/ai-docs/src/07_datetime/10_creating-and-formatting.ts)
- [DateTime](https://effect.website/docs/v4/api/effect/DateTime)
- [Duration](https://effect.website/docs/v4/api/effect/Duration)
- [BigDecimal](https://effect.website/docs/v4/api/effect/BigDecimal)
- [Random](https://effect.website/docs/v4/api/effect/Random)
- [Crypto](https://effect.website/docs/v4/api/effect/Crypto)

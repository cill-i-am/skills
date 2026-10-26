# Testing, virtual time, properties, and integration evidence

## Test the contract at the appropriate level

Use ordinary tests for pure functions. Use Effect-aware tests for dependencies, typed failures, resources, scheduling, and interruption. Use real adapter integration tests for database isolation, socket cancellation, worker startup, and durability. No single test style proves all three layers.

The official `@effect/vitest` integration supports `it.effect`, `it.live`, shared Layer suites, parameterized tests, and Schema-based property tests. Install a release whose peer dependencies match the project's Effect and Vitest versions. Do not force a peer-dependency mismatch with an ignore flag.

```ts
import { assert, describe, it } from "@effect/vitest"
import { Effect, Fiber, Schema } from "effect"
import { TestClock } from "effect/testing"

describe("timing", () => {
  it.effect("waits using virtual time", () => Effect.gen(function*() {
    const fiber = yield* Effect.forkChild(
      Effect.sleep("1 minute").pipe(Effect.as("complete"))
    )
    yield* TestClock.adjust("1 minute")
    assert.strictEqual(yield* Fiber.join(fiber), "complete")
  }))

  it.effect.prop("trimming is idempotent", [Schema.String], ([value]) =>
    Effect.gen(function*() {
      assert.strictEqual(value.trim().trim(), value.trim())
    })
  )
})
```

The property above checks idempotent normalization. Other useful application properties include encode/decode equivalence, conservation of balances, and deduplication. Do not pad a suite with tautologies and report increased confidence. The bundled executable tests use Node's test runner so the main examples need only Effect and TypeScript.

## Virtual time without deadlocks

Fork the timed operation before advancing the test clock, then join or await its result. Advancing time after synchronously waiting for a sleeping Effect cannot release that wait. For races involving registration, use a Deferred, observable state, or the test clock's documented suspension behaviour rather than a real sleep.

A TestClock controls Effect's clock, not arbitrary third-party timers, `Date.now`, or every host scheduler. Use live tests only when real time is the behaviour under test. Avoid mixing fake timers from multiple systems without understanding who owns each timer.

Test exact retry counts and eligibility separately from timing. An exponential delay cap is not an attempt cap. Test timeout cleanup and cancellation, not merely the presence of a timeout-shaped error.

## Errors and causes

Use `Effect.exit` or an appropriate result boundary to inspect expected failure, defect, and interruption. Check the failure type/tag and meaningful fields instead of snapshotting unstable full stack traces. A test that catches every cause and returns success can mask the very bug it is supposed to reveal.

For invalid external input, test malformed primitives, missing fields, excess fields, null/undefined distinctions, wrong encodings, limits, and maliciously large nested structures. For encoding, test the wire representation and round-trip laws appropriate to normalization; not every valid codec is an identity on its raw input.

## Layers and isolation

Provide narrow fake services for use-case tests and real Layers for integration tests. Allocate mutable fake state per test unless sharing is an explicit test condition. Build one Layer graph where shared resources are intended, and assert acquisition/disposal counts when wiring matters.

Shared Layer suites can improve test performance, but leaking state across cases makes test order part of the result. Reset state through a documented fixture boundary or choose isolated layers. Await every runtime and scope teardown.

## Lifecycle test matrix

For an acquired resource, test successful use, expected failure, defect, interruption, partial acquisition, and cleanup failure policy. For a background fiber, prove it starts, is owned, and stops when its owner ends. Use a start handshake before interrupting so the test does not pass simply because the resource was never acquired.

For a queue, test a blocked producer and a blocked consumer during shutdown. For PubSub, test slow subscribers and missed history. For a pool, test saturation, timeout, and resource replacement. For streams, test consumer cancellation and failure after partial output.

## Integration and end-to-end tests

Exercise both generated clients and raw invalid protocol inputs. Run database tests against the target engine, and deployment smoke tests against the actual bundle/host. Durable systems require a fresh process with persisted storage and controlled crash points.

Property tests should generate valid and invalid examples with bounded sizes and record seeds for reproducibility. Useful invariants include transaction conservation, no cross-tenant cache hits, at-most-one committed operation per idempotency key, decoder/encoder agreement, and bounded active concurrency.

## Evidence labels

“Source-reviewed” means the API was compared with official source. “Syntax-checked” means a parser accepted the text. “Typechecked” means the project compiled against identified dependencies. “Tested” must name which tests actually ran. “Production-validated” requires real deployment evidence. Do not collapse these labels.

## Official sources

- [Official Effect tests](https://github.com/Effect-TS/effect/blob/effect@4.0.2/ai-docs/src/09_testing/10_effect-tests.ts)
- [Official test guide](https://effect.website/docs/v4/testing/testclock)
- [TestClock](https://effect.website/docs/v4/api/effect/testing/TestClock)
- [TestSchema](https://effect.website/docs/v4/api/effect/testing/TestSchema)
- [TestConsole](https://effect.website/docs/v4/api/effect/testing/TestConsole)

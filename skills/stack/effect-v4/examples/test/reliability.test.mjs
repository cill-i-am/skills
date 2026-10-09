import test from "node:test"
import assert from "node:assert/strict"
import { Cache, Config, ConfigProvider, Deferred, Effect, Exit, Fiber, Ref } from "effect"
import { TestClock } from "effect/testing"
import { TransientFailure, withRetryBudget } from "../dist/retry.js"
import { observeConcurrency } from "../dist/lifecycle.js"

const options = { timeout: 5_000 }
const withClock = (program) => Effect.runPromise(program.pipe(Effect.provide(TestClock.layer())))

test("Effect sleep is controlled by TestClock", options, async () => {
  const result = await withClock(Effect.gen(function*() {
    const fiber = yield* Effect.forkChild(Effect.sleep("1 minute").pipe(Effect.as("done")))
    yield* TestClock.adjust("1 minute")
    return yield* Fiber.join(fiber)
  }))
  assert.equal(result, "done")
})

test("non-retryable failures execute once", options, async () => {
  const result = await withClock(Effect.gen(function*() {
    const attempts = yield* Ref.make(0)
    const task = Effect.gen(function*() {
      yield* Ref.update(attempts, (n) => n + 1)
      return yield* new TransientFailure({ retryable: false })
    })
    const exit = yield* Effect.exit(withRetryBudget(task))
    return { attempts: yield* Ref.get(attempts), failed: Exit.isFailure(exit) }
  }))
  assert.deepEqual(result, { attempts: 1, failed: true })
})

test("retryable failures stop after four retries plus the initial attempt", options, async () => {
  const result = await withClock(Effect.gen(function*() {
    const attempts = yield* Ref.make(0)
    const task = Effect.gen(function*() {
      yield* Ref.update(attempts, (n) => n + 1)
      return yield* new TransientFailure({ retryable: true })
    })
    const fiber = yield* Effect.forkChild(Effect.exit(withRetryBudget(task)))
    yield* TestClock.adjust("1 minute")
    const exit = yield* Fiber.join(fiber)
    return { attempts: yield* Ref.get(attempts), failed: Exit.isFailure(exit) }
  }))
  assert.deepEqual(result, { attempts: 5, failed: true })
})

test("overall timeout ends an operation that never succeeds or fails", options, async () => {
  const failed = await withClock(Effect.gen(function*() {
    const fiber = yield* Effect.forkChild(Effect.exit(withRetryBudget(Effect.never)))
    yield* TestClock.adjust("21 seconds")
    return Exit.isFailure(yield* Fiber.join(fiber))
  }))
  assert.equal(failed, true)
})

test("bounded concurrency cleans up all active work", options, async () => {
  const result = await withClock(Effect.gen(function*() {
    const fiber = yield* Effect.forkChild(observeConcurrency)
    yield* TestClock.adjust("1 second")
    return yield* Fiber.join(fiber)
  }))
  assert.deepEqual(result.values, [2, 4, 6, 8, 10, 12])
  assert.ok(result.peak > 0 && result.peak <= 2)
  assert.equal(result.active, 0)
})

test("simultaneous lookups share a cached value", options, async () => {
  const result = await withClock(Effect.gen(function*() {
    const calls = yield* Ref.make(0)
    const cache = yield* Cache.make({
      capacity: 10,
      timeToLive: "1 minute",
      lookup: (key) => Effect.gen(function*() {
        yield* Ref.update(calls, (n) => n + 1)
        yield* Effect.sleep("10 millis")
        return key.length
      })
    })
    const fiber = yield* Effect.forkChild(Effect.forEach(["same", "same", "same"],
      (key) => Cache.get(cache, key), { concurrency: 3 }))
    yield* TestClock.adjust("10 millis")
    return { values: yield* Fiber.join(fiber), calls: yield* Ref.get(calls) }
  }))
  assert.deepEqual(result, { values: [4, 4, 4], calls: 1 })
})

test("cached failures are reused until expiry or invalidation", options, async () => {
  const calls = await withClock(Effect.gen(function*() {
    const calls = yield* Ref.make(0)
    const cache = yield* Cache.make({
      capacity: 10,
      timeToLive: "1 minute",
      lookup: () => Effect.gen(function*() {
        yield* Ref.update(calls, (n) => n + 1)
        return yield* Effect.fail("offline")
      })
    })
    yield* Effect.exit(Cache.get(cache, "key"))
    yield* Effect.exit(Cache.get(cache, "key"))
    return yield* Ref.get(calls)
  }))
  assert.equal(calls, 1)
})

test("configuration default handles absence but does not conceal invalid present input", options, async () => {
  const name = Config.String("NAME").pipe(Config.withDefault("fallback"))
  assert.equal(await Effect.runPromise(name.parse(ConfigProvider.fromUnknown({}))), "fallback")
  const invalid = await Effect.runPromise(Effect.exit(name.parse(ConfigProvider.fromUnknown({ NAME: { invalid: true } }))))
  assert.equal(Exit.isFailure(invalid), true)
})

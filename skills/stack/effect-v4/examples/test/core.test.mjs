import test from "node:test"
import assert from "node:assert/strict"
import { Effect, Exit, Option, Ref, Schema, TxRef } from "effect"
import { totalBasket } from "../dist/basics.js"
import { decodeLineItem, encodeLineItem } from "../dist/schema.js"
import { decodeLabel } from "../dist/codecs.js"
import { UserDirectoryTest, greeting } from "../dist/services.js"
import { withRecordedResource } from "../dist/resources.js"
import { makeCounterBoundary } from "../dist/runtime.js"
import { transferThree } from "../dist/queue.js"
import { countVisits } from "../dist/ref.js"
import { moveOne } from "../dist/transaction.js"
import { cachedLengths } from "../dist/cache.js"
import { squaredTotal } from "../dist/stream.js"
import { sumOfMeasurements } from "../dist/sink.js"
import { configuredName } from "../dist/config.js"
import { displayName } from "../dist/option.js"
import { interruptOwnedResource, recordFinalization } from "../dist/lifecycle.js"
import { lookupNames } from "../dist/batching.js"

const options = { timeout: 5_000 }

test("basket computes a non-empty basket", options, async () => {
  assert.equal(await Effect.runPromise(totalBasket([
    { priceInCents: 250, quantity: 2 }, { priceInCents: 100, quantity: 1 }
  ])), 600)
})

test("empty basket has a typed domain failure", options, async () => {
  const result = await Effect.runPromise(totalBasket([]).pipe(
    Effect.catchTag("EmptyBasket", () => Effect.succeed("empty"))
  ))
  assert.equal(result, "empty")
})

test("domain schema decodes and encodes valid input", options, async () => {
  const input = { accountId: "account-1", sku: "sku-1", quantity: 2, state: "draft" }
  const output = await Effect.runPromise(decodeLineItem(input).pipe(Effect.flatMap(encodeLineItem)))
  assert.deepEqual(output, input)
})

for (const quantity of [0, -1, 1001, 1.2, "2", null]) {
  test(`quantity rejects ${JSON.stringify(quantity)}`, options, async () => {
    const exit = await Effect.runPromise(Effect.exit(decodeLineItem({
      accountId: "account-1", sku: "sku-1", quantity, state: "draft"
    })))
    assert.equal(Exit.isFailure(exit), true)
  })
}

test("text codec normalizes before checking non-empty output", options, async () => {
  assert.equal(await Effect.runPromise(decodeLabel("  label  ")), "label")
  assert.equal(Exit.isFailure(await Effect.runPromise(Effect.exit(decodeLabel("   ")))), true)
})

test("fake service supplies a genuine use case requirement", options, async () => {
  assert.equal(await Effect.runPromise(greeting("u-1").pipe(Effect.provide(UserDirectoryTest))), "Hello, Mina")
})

test("service preserves a tagged missing-record error", options, async () => {
  const result = await Effect.runPromise(greeting("missing").pipe(
    Effect.provide(UserDirectoryTest),
    Effect.catchTag("UserMissing", (error) => Effect.succeed(error.id))
  ))
  assert.equal(result, "missing")
})

test("resource release happens after successful use", options, async () => {
  const events = []
  assert.equal(await Effect.runPromise(withRecordedResource(events)), "demo")
  assert.deepEqual(events, ["acquire", "use:demo", "release"])
})

test("resource finalization survives a typed failure", options, async () => {
  const result = await Effect.runPromise(recordFinalization(Effect.fail("expected")))
  assert.deepEqual(result.events, ["acquire", "release"])
  assert.equal(Exit.isFailure(result.exit), true)
})

test("resource finalization survives a defect", options, async () => {
  const result = await Effect.runPromise(recordFinalization(Effect.die("defect")))
  assert.deepEqual(result.events, ["acquire", "release"])
  assert.equal(Exit.isFailure(result.exit), true)
})

test("interruption cleans an already acquired resource", options, async () => {
  assert.deepEqual(await Effect.runPromise(interruptOwnedResource), ["acquire", "release"])
})

test("ManagedRuntime shares state within one boundary and isolates new boundaries", options, async () => {
  const first = makeCounterBoundary()
  const second = makeCounterBoundary()
  try {
    assert.equal(await first.next(), 1)
    assert.equal(await first.next(), 2)
    assert.equal(await second.next(), 1)
  } finally {
    await Promise.all([first.dispose(), second.dispose()])
  }
})

test("bounded queue transfers every offered item in order", options, async () => {
  assert.deepEqual(await Effect.runPromise(transferThree), ["first", "second", "third"])
})

test("Ref updates retain all increments", options, async () => {
  assert.equal(await Effect.runPromise(countVisits), 4)
})

test("transaction moves inventory atomically", options, async () => {
  const result = await Effect.runPromise(Effect.gen(function*() {
    const available = yield* TxRef.make(2)
    const reserved = yield* TxRef.make(0)
    yield* moveOne(available, reserved)
    return [yield* TxRef.get(available), yield* TxRef.get(reserved)]
  }))
  assert.deepEqual(result, [1, 1])
})

test("failed in-memory transaction does not commit a tentative write", options, async () => {
  const result = await Effect.runPromise(Effect.gen(function*() {
    const value = yield* TxRef.make(1)
    const exit = yield* Effect.exit(Effect.tx(Effect.gen(function*() {
      yield* TxRef.set(value, 99)
      return yield* Effect.fail("abort")
    })))
    return { failed: Exit.isFailure(exit), value: yield* TxRef.get(value) }
  }))
  assert.deepEqual(result, { failed: true, value: 1 })
})

test("cache returns values for repeated keys", options, async () => {
  assert.deepEqual(await Effect.runPromise(cachedLengths), [5, 4, 5])
})

test("Stream folds without collecting all intermediate outputs", options, async () => {
  assert.equal(await Effect.runPromise(squaredTotal), 30)
})

test("Sink consumes the expected measurements", options, async () => {
  assert.equal(await Effect.runPromise(sumOfMeasurements), 51)
})

test("configuration can be supplied independently of process environment", options, async () => {
  assert.equal(await Effect.runPromise(configuredName), "test-worker")
})

test("optional data has a deliberate display fallback", () => {
  assert.equal(displayName(Option.none()), "Anonymous")
  assert.equal(displayName(Option.some("Cedar")), "Cedar")
})

test("request resolver completes every submitted entry", options, async () => {
  assert.deepEqual(await Effect.runPromise(lookupNames), ["Aster", "Birch"])
})

import { Effect, Exit, Request, RequestResolver, Schema } from "effect"

class MissingRecord extends Schema.TaggedError<MissingRecord>()("MissingRecord", {
  id: Schema.Int
}) {}

class LookupName extends Request.Class<
  { readonly id: number }, string, MissingRecord, never
> {}

/** In-memory source with the same completion contract as a remote batch. */
export const makeNameResolver = Effect.gen(function*() {
  const records = new Map<number, string>([[1, "Aster"], [2, "Birch"]])
  return yield* RequestResolver.make<LookupName>(Effect.fn(function*(entries) {
    for (const entry of entries) {
      const value = records.get(entry.request.id)
      entry.completeUnsafe(value === undefined
        ? Exit.fail(new MissingRecord({ id: entry.request.id }))
        : Exit.succeed(value))
    }
  }))
})

export const lookupNames = Effect.gen(function*() {
  const resolver = yield* makeNameResolver
  return yield* Effect.forEach([1, 2],
    (id) => Effect.request(new LookupName({ id }), resolver),
    { concurrency: 2 })
})

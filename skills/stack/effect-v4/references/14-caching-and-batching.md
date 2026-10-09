# Caching, request batching, and resource reuse

## Decide what is being cached

A value cache, a cached Effect result, a batched lookup resolver, a resource cache, and a persisted cache solve different problems. Choose based on lifetime, ownership, consistency, and failure behaviour—not just a shared word in their names.

```ts
import { Cache, Effect } from "effect"

export const cachedLengths = Effect.gen(function*() {
  const cache = yield* Cache.make({
    capacity: 128,
    timeToLive: "30 seconds",
    lookup: (key: string) => Effect.succeed(key.length)
  })
  return yield* Effect.forEach(["alpha", "beta", "alpha"],
    (key) => Cache.get(cache, key),
    { concurrency: 3 })
})
```

In an application, create the cache in the layer or scope that owns its intended lifetime. Recreating it for every lookup eliminates reuse. Sharing it forever without invalidation creates stale data and potentially security problems.

## Failure caching and single-flight behaviour

The baseline Cache stores both successful and failed lookups and shares in-progress work for the same missing key. Decide how long failures should remain cached. A brief provider outage can otherwise become an extended application outage. Use dynamic TTL facilities when success, absence, and failure need different expiry rules.

Test concurrent waiters, cancellation of one waiter, cancellation of all waiters, refresh failure, expiry, and invalidation during an in-flight lookup. Do not assume that invalidation cancels active work or that its eventual result cannot repopulate a value without checking the exact implementation.

## Keys are part of the security model

Include every input that affects the result: tenant, user or permission scope where appropriate, resource ID, locale, relevant version, and normalised query options. A resource ID alone is unsafe when two tenants can use the same ID.

Use unambiguous compound keys. Concatenating unrestricted strings with a delimiter can collide. Structural keys should have deliberate equality/hash behaviour; a newly allocated plain object may not behave like a value key. Do not include raw secrets in keys, metrics, or logs.

Permission changes and logout need an invalidation policy. A long TTL is not an authorisation guarantee. Enforce access control when serving a cached result, or design the cache so the result cannot cross the intended security boundary.

## RequestResolver batching

Model each logical request and group compatible requests into an external batch. The baseline `Request.Class` carries input fields, success, error, and optional requirements. `RequestResolver.make` receives entries that must all be completed, normally using `Exit.succeed` or `Exit.fail` with the completion API.

Complete every entry exactly according to the resolver contract, including missing records and partial backend failures. Map results by key; do not assume a database or HTTP batch returns rows in input order. Bound batch size and delay, and partition by tenant, credentials, backend capability, and transaction context where relevant.

A short batching delay trades latency for fewer calls. Do not batch unrelated requests together merely because they arrive at the same time. Preserve per-request tracing context or span links. Retry the failed subset only when that preserves the provider's semantics.

## Resource and persistent caches

Use `ScopedCache`, `RcRef`, `RcMap`, `LayerMap`, or a Pool for resources requiring cleanup, according to their ownership model. Do not put a live socket in Cache and let eviction forget it without release.

Persisted caches need a schema/version strategy, namespacing, expiry, and a policy for corrupt entries. Storage encryption and access controls are separate from `Redacted` display behaviour. Cache entries must not become the authoritative record of an irreversible business operation.

## Review questions

What is the key? Who owns the cache? Is failure cached? What invalidates it? Can data cross tenant or permission boundaries? What happens during stampedes? Is memory bounded? Is a resource released on eviction? How does restart change behaviour? Are metrics low-cardinality and free of sensitive keys?

## Official sources

- [Cache source](https://github.com/Effect-TS/effect/blob/effect@4.0.2/packages/effect/src/Cache.ts)
- [Batching example](https://github.com/Effect-TS/effect/blob/effect@4.0.2/ai-docs/src/05_batching/10_request-resolver.ts)
- [RequestResolver](https://effect.website/docs/v4/api/effect/RequestResolver)
- [ScopedCache](https://effect.website/docs/v4/api/effect/ScopedCache)
- [PersistedCache](https://effect.website/docs/v4/api/effect/persistence/PersistedCache)

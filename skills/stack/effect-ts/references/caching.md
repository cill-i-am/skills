# Caching, Memoization, And Request Dedupe

Use this file for memoizing Effect results, keyed TTL caches, concurrent lookup deduplication, cached resources, request batching, and Layer acquisition sharing.

## Select By Shape

- one Effect result, no key: the installed cached/cached-with-TTL helpers;
- keyed values with capacity and TTL: `Cache`;
- keyed resources that require finalization: `ScopedCache`;
- many distinct keys with a real batch endpoint: `Effect.request` plus a RequestResolver;
- many distinct keys with only per-item calls: bounded `Effect.forEach`, optionally through Cache;
- shared service acquisition across Layer builds/runtimes: `Layer.MemoMap`, not Cache.

Do not hand-roll Map, timestamp, prune-loop, or in-flight-Promise machinery when an Effect primitive fits.

## Keyed Cache In A Layer

Construct the cache once in the owning service Layer. Acquire clients before constructing the lookup so cache misses do not rebuild provider Layers.

```ts
export const ProfileCacheLive = Layer.effect(
  ProfileCache,
  Effect.gen(function* () {
    const profiles = yield* ProfileProvider;
    const cache = yield* Cache.make({
      capacity: 1_000,
      timeToLive: "10 minutes",
      lookup: (id: ProfileId) => profiles.get(id),
    });

    return ProfileCache.of({
      get: (id) => Cache.get(cache, id),
      invalidate: (id) => Cache.invalidate(cache, id),
    });
  }),
);
```

Concurrent gets for the same missing key should share one pending lookup according to the installed Cache semantics. Do not add a second in-flight map.

## Service Capture Timing

Some v4 Cache constructors distinguish services captured during cache construction from services required when each lookup runs. This can matter for request-local identity, transactions, or test overrides. Verify options such as `requireServicesAt` against the installed version and exercise the chosen capture lifetime; use a probe only when ordinary compilation or tests leave it uncertain.

Default to construction-time capture for long-lived provider clients. Choose lookup-time requirements only when the varying context is intentional and its lifetime outlives the lookup.

## Exit-Aware TTL

Use the installed dynamic-TTL constructor when success, stable not-found, transient failure, or degraded fallback need different lifetimes.

- cache successful stable values for their product TTL;
- use a short negative TTL for stable not-found only when it protects an upstream truthfully;
- use zero or near-zero TTL for transient failures and degraded values;
- never cache interruption as an ordinary failure.

Cause and Cache APIs are version-sensitive; verify exact signatures.

## Ownership

A cache created per request or per call rarely provides useful cross-call caching. Put it in the Layer whose lifetime matches the consistency policy.

Use `ScopedCache` for clients, handles, subscriptions, or other values with finalizers. Its owner must outlive entries and close on eviction and shutdown.

A shared `Layer.MemoMap` solves a different problem: preventing duplicate Layer acquisition. Use it only when separate Layer builds or ManagedRuntimes intentionally share service identity.

## Invalidation

Centralize write-plus-invalidate policy in the service that owns consistency.

- invalidate after authoritative writes when read-your-write behavior requires it;
- refresh when callers need recomputation without an empty window;
- use versioned keys for naturally immutable versions;
- do not scatter invalidation through unrelated workflows.

## Request Batching

Use Request/RequestResolver only when the backend can answer several distinct keys in one operation, such as SQL `IN (...)` or a batch provider endpoint. Complete every request exactly once and bound the batch size.

Looping over a per-item REST endpoint inside a resolver is not batching. Use bounded concurrency instead.

## Schema At Cache Boundaries

Hoist static row/provider decoders used by lookup functions. The cache should store decoded domain values or a deliberate adapter result, not unknown provider payloads.

## Verification

Test hit, miss, expiration, invalidation, refresh, capacity eviction, concurrent same-key deduplication, cross-key concurrency, failure TTL, service capture timing, ScopedCache finalization, and shared Layer memoization. Drive TTL tests with TestClock.

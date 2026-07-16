# Caching, Memoization, And Request Dedupe

Use this file for memoizing effects, keyed TTL caches, concurrent lookup deduplication, cached resources, and request batching.

## Select By Shape

- one Effect result, no key: `Effect.cached(...)` or `Effect.cachedWithTTL(...)`
- keyed values with capacity and TTL: `Cache`
- keyed resources that require finalization: `ScopedCache`
- many distinct keys and a real batch endpoint: `Effect.request` plus `RequestResolver`
- many distinct keys with only per-item API calls: bounded `Effect.forEach`, optionally through `Cache`

Do not hand-roll Map, timestamp, prune-loop, or in-flight-promise machinery when an Effect cache fits.

## Keyed Cache In A Layer

Construct the cache once in the service Layer. Use branded keys in the service contract.

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
      get: Effect.fn("ProfileCache.get")((id: ProfileId) =>
        Cache.get(cache, id),
      ),
      invalidate: Effect.fn("ProfileCache.invalidate")((id: ProfileId) =>
        Cache.invalidate(cache, id),
      ),
    });
  }),
);
```

Concurrent gets for the same missing key share one pending lookup. Do not add a second in-flight map.

## Exit-Aware TTL

Use `Cache.makeWith(...)` when success, stable failure, transient failure, or degraded fallback need different TTLs.

```ts
const cache =
  yield *
  Cache.makeWith((id: ProfileId) => loadProfile(id), {
    capacity: 1_000,
    timeToLive: (exit) => {
      if (Exit.isSuccess(exit)) return "10 minutes";
      return exit.cause.pipe(
        Cause.findErrorOption,
        Option.match({
          onNone: () => Duration.zero,
          onSome: (error) =>
            error._tag === "ProfileNotFound" ? "30 seconds" : Duration.zero,
        }),
      );
    },
  });
```

Return zero TTL for transient failures or degraded values that should not be cached. A short negative-cache TTL may protect an upstream from repeated stable not-found lookups.

Verify exact `Cache.makeWith` and Cause APIs against the target v4 beta pin before copying an exit-aware example.

## Acquisition And Ownership

A cache cannot repair an expensive lookup that acquires a client on every miss.

Bad:

```ts
const lookup = (id: ProfileId) =>
  provider.get(id).pipe(Effect.provide(ProviderClientLive));
```

Good:

```ts
const client = yield * ProviderClient;
const cache =
  yield *
  Cache.make({
    capacity: 1_000,
    timeToLive: "10 minutes",
    lookup: client.get,
  });
```

Acquire clients and caches in the owning Layer. A cache created per request or per call does not provide useful cross-call caching.

Use `ScopedCache` when cached values own resources such as clients, handles, or subscriptions. Its scope must outlive entries and close cleanly when the service shuts down.

## Invalidation

- `Cache.invalidate(cache, key)`: evict a known stale entry
- `Cache.refresh(cache, key)`: recompute it
- `Cache.has(cache, key)`: inspect without triggering a lookup
- invalidate after authoritative writes when read-your-write behavior requires it
- prefer versioned keys when immutable versions are natural

Do not scatter invalidation through unrelated domain code. Put write-plus-invalidate policy in the service that owns consistency.

## Request Batching

Use `Effect.request` and a `RequestResolver` only when the backend can answer several distinct keys in one call, such as SQL `IN (...)` or a batch provider endpoint.

```ts
class GetProfile extends Request.TaggedClass("GetProfile")<
  { readonly id: ProfileId },
  Profile,
  ProfileProviderError
> {}
```

The resolver receives pending requests and must complete each request exactly once. Bound provider batch size with the current v4 resolver combinators.

Do not call a per-item REST endpoint in a loop inside a resolver and call it batching. Use bounded `Effect.forEach` instead.

## Verification

Test:

- hit, miss, expiration, invalidation, and refresh
- concurrent same-key calls execute one lookup
- different keys can execute concurrently as intended
- transient failures are not accidentally cached
- stable negative results use the intended TTL
- capacity eviction
- ScopedCache releases values on eviction and scope close
- TestClock drives TTL tests without wall-clock sleeping

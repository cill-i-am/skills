# Durable Objects, identity, persistence, and realtime

## Choose an entity boundary

A Durable Object is addressed by identity and combines coordinated execution with per-instance storage. Useful boundaries include a room, document, account, game, or rate-limit partition. Do not put every tenant into one global object unless that serialization point is intentional. Derive object names from authenticated tenancy, not arbitrary caller input that can impersonate another entity.

The Alchemy declaration has an outer construction Effect and an inner activation Effect. The outer one resolves dependencies and the state handle; the inner one loads persisted state and returns methods. Request/activation I/O must not run while the infrastructure planner discovers bindings.

## Source-reviewed declaration

```ts
export default class Counter extends Cloudflare.DurableObject<Counter>()(
  "Counter",
  Effect.gen(function* () {
    const state = yield* Cloudflare.DurableObjectState;
    return Effect.gen(function* () {
      return {
        get: () => state.storage.get<number>("count"),
      };
    });
  }),
) {}
```

Yield the class in Worker construction to obtain a namespace and register its binding. During a handler, call a named instance:

```ts
const counters = yield* Counter; // construction
// runtime:
const value = yield* counters.getByName("tenant-a:counter-1").get();
```

The generic class ceremony preserves typed handles. It does not validate a caller's authorization or turn arbitrary inputs into domain objects.

## Durable state and concurrency

Do not treat a module variable as persistent storage. An isolate can restart, hibernate, or be replaced. Avoid keeping an in-memory cache that diverges when a storage write fails. Use the documented storage transaction/SQL primitive for multi-operation invariants; do not assume any sequence of asynchronous awaits is one atomic operation merely because it runs in a Durable Object.

Choose explicit storage keys and schema versions. Test activation after a restart, a failed write, duplicate requests, and concurrent calls. For an increment API, use a transaction or a single SQL update rather than presenting a read/await/write example as universally safe. The bundled read-only object skeleton intentionally leaves the mutation policy to the application's selected storage API.

## SQL migrations at activation

```ts
// Outer construction:
const migrations = yield* Cloudflare.SqlMigrations("./drizzle");
// Inner activation, before returning methods:
yield* migrations.apply().pipe(Effect.orDie);
```

Generate and commit files before deployment. Migrations apply when each object activates; a deployment does not mean every historical object has already migrated. Keep new code compatible with lazy activation and old persisted data. A failed migration should prevent serving an inconsistent object rather than silently continuing.

## WebSockets and alarms

For hibernatable WebSockets, use Cloudflare's hibernation-aware APIs and persist/reconstruct per-connection context through supported attachments. Do not rely exclusively on an in-memory socket map after wake-up. Authenticate the upgrade request, authorize room membership, limit message size/rate, and define reconnect behaviour.

Durable alarms or scheduled callbacks are appropriate for per-object work. Keep callbacks idempotent, checkpoint persistent progress, and handle duplicate/retried delivery. Use a Workflow for a multi-step process whose history, waiting, and retries are the main abstraction rather than manually rebuilding a workflow engine in one object.

## Moving ownership

A cross-Worker binding and a host migration are different operations. Follow the dedicated cross-Worker DO guide for `scriptName` and migration metadata. Preserve namespace/class identity and verify data continuity in a disposable rehearsal. Do not rename a class, remove a hosting Worker, or move an object to another stage as a cosmetic refactor.

Inspect all callers before changing an RPC method. A source-level typecheck does not validate compatibility with already-deployed callers. For public/browser access, route through an authenticated, schema-validated API rather than exposing a privileged namespace indiscriminately.

## Sources

- [cloudflare/compute/durable-objects](https://alchemy.run/cloudflare/compute/durable-objects/)
- [cloudflare/compute/hibernatable-websockets](https://alchemy.run/cloudflare/compute/hibernatable-websockets/)
- [cloudflare/compute/cross-worker-durable-object](https://alchemy.run/cloudflare/compute/cross-worker-durable-object/)
- [sql/effect-sql/migrations](https://alchemy.run/sql/effect-sql/migrations/)
- [infrastructure-as-effects/phases](https://alchemy.run/infrastructure-as-effects/phases/)

Reference baseline: Alchemy `2.0.0-beta.81`, upstream `fbe6ece368c6898234592e897d852bb47b88ebb1`, researched 7 October 2026. Check installed APIs before applying examples.

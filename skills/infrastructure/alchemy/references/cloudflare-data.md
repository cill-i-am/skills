# Cloudflare data: R2, KV, D1, and Hyperdrive

## Select by data semantics

Use R2 for objects, KV for read-heavy key/value distribution, D1 for relational SQLite data, and Durable Object storage for coordinated per-entity state. Use Hyperdrive to connect Workers to an existing or separately provisioned Postgres/MySQL system. Hyperdrive is a connection accelerator/pool, not a database or an ownership boundary.

Choose based on consistency, query pattern, object size, retention, and transactional requirements. Do not use KV as a lock or assume all bindings have identical error and consistency behaviour. Keep persistent data independent from disposable previews unless deletion is intentional.

## R2

```ts
export const Uploads = Cloudflare.R2.Bucket("Uploads");
// In Worker construction:
const objects = yield* Cloudflare.R2.ReadWriteBucket(Uploads);
// In a request handler:
yield* objects.put("documents/example.txt", "hello");
const object = yield* objects.get("documents/example.txt");
const text = object === null ? undefined : yield* object.text();
```

Provide `Cloudflare.R2.ReadWriteBucketBinding`; choose a narrower supported capability for read-only consumers. Stream large content rather than converting every object to text. Validate paths, tenant ownership, metadata, and upload size. For browser-direct uploads, read the presigned-URL guide; scope keys, expiry, content constraints, and finalization checks. A signed URL is a temporary capability, so do not log it indiscriminately.

A bucket does not automatically have a public website or custom domain. Make public access explicit, and treat origin/CORS configuration separately. Plan non-empty bucket deletion and retention before using a production data bucket in a disposable stage.

## KV

Declare a namespace and use the matching read/write binding:

```ts
export const Settings = Cloudflare.KV.Namespace("Settings");
// Construction excerpt; verify the matching Binding Layer in installed types.
const settings = yield* Cloudflare.KV.ReadWriteNamespace(Settings);
// Runtime:
yield* settings.put("theme", "dark");
const theme = yield* settings.get("theme");
```

Use KV for values whose access pattern tolerates its documented consistency. Encode and validate structured values rather than asserting that a string is a domain object. Define expiration and cache invalidation consciously. Strongly coordinated counters, uniqueness, and multi-key invariants need a more suitable primitive.

## D1 with committed migrations

```ts
export const Database = Cloudflare.D1.Database("Database", {
  migrations: "./migrations",
});
// Worker construction:
const db = yield* Cloudflare.D1.QueryDatabase(Database);
// Runtime; placeholders parameterize values:
const users = yield* db.prepare(
  "SELECT id, name FROM users WHERE id = ?",
).bind(1).all();
```

Provide `Cloudflare.D1.QueryDatabaseBinding`. `prepare` and `bind` build statements synchronously; execution methods return Effects. Do not concatenate untrusted strings into SQL. Specify result shapes and decode external data where the schema cannot establish the domain invariant.

The current migration integration tracks applied files in `__alchemy_migrations`. Existing Wrangler/Drizzle histories have an adoption path; inspect it before switching migration ownership. Generate migrations locally, review them, commit them, and apply that same set in CI. Do not run two migration owners against one database. Read [SQL and migrations](sql-and-migrations.md) for rollback and destructive changes.

For Effect SQL, `alchemy/SQL/D1` exposes `SQL.D1(d1)` and `SQL.D1Layer(d1)` over the same binding. The documented client is lazily acquired per execution, not one pool shared across unrelated requests. Native `raw` access exists for libraries that require a D1 object; keep that escape hatch at the integration boundary.

## Hyperdrive and external databases

Provision or reference the database first, establish credentials and a direct origin, then create Hyperdrive and bind it to the Worker. Use the matching Drizzle/Prisma/Effect SQL integration rather than passing a deployment admin URL to all application code. Keep direct migration credentials separate from pooled runtime credentials where needed.

Preview branches need independent schema/data where mutations are allowed. A preview pointing at staging or production is not isolated just because its Worker has a different stage name. Review branch cleanup, storage costs, credentials, and the parent database's retention together.

## Verification

Test read/write round trips, missing data, malformed input, tenant separation, duplicate operations, migration from an older schema, and a fresh empty database. Run the same committed migrations in local mode. Add live tests only for the specific consistency, permission, or networking behaviour that emulation cannot prove.

## Sources

- [cloudflare/data/r2](https://alchemy.run/cloudflare/data/r2/)
- [cloudflare/data/kv](https://alchemy.run/cloudflare/data/kv/)
- [cloudflare/data/d1](https://alchemy.run/cloudflare/data/d1/)
- [cloudflare/data/d1-drizzle](https://alchemy.run/cloudflare/data/d1-drizzle/)
- [cloudflare/data/hyperdrive](https://alchemy.run/cloudflare/data/hyperdrive/)
- [cloudflare/data/r2-presigned-urls](https://alchemy.run/cloudflare/data/r2-presigned-urls/)
- [cloudflare/data/shared-database](https://alchemy.run/cloudflare/data/shared-database/)

Reference baseline: Alchemy `2.0.0-beta.81`, upstream `fbe6ece368c6898234592e897d852bb47b88ebb1`, researched 7 October 2026. Check installed APIs before applying examples.

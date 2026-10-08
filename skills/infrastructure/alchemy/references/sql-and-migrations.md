# SQL, Drizzle, Prisma, and schema migrations

## Separate four responsibilities

Database provisioning creates the database and credentials. Migration generation computes candidate schema changes. Migration application changes a particular database. Runtime querying executes application work. Keep their permissions, environments, and verification distinct even when Alchemy models several in one graph.

Prefer one migration owner per database. Do not let Alchemy, Wrangler, Drizzle Kit, a framework startup hook, and a custom script all apply migrations independently. Inspect current history before adopting an existing database.

## The reviewed migration pipeline

For a Drizzle project, the normal production recommendation is:

```sh
pnpm exec drizzle-kit generate
# Review SQL and snapshots, then commit them with the code change.
```

Run the configured Alchemy deployment against those committed files. Do not generate new schema changes in CI and deploy them without review. If the installed integration can generate automatically, treat that as an explicitly chosen development capability, not the default release policy.

Verify both fresh creation and upgrading a database with the previous production schema. Test constraints, indexes, defaults, data backfills, and application compatibility. A migration that works on an empty test database can still fail on existing rows or take unacceptable locks.

## D1 and Durable Object SQLite

D1 accepts a migrations directory on the Database resource. Files are applied in order and recorded in Alchemy's migration table; inspect the release's support for existing Wrangler/Drizzle histories. D1's HTTP execution and batching do not imply every feature of a long-lived SQL transaction API.

Durable Object migrations are bundled during construction and applied on each object's activation. Keep migrations additive where old objects can awaken under new code. A deployment is not proof every historical instance has activated. An object that fails migration should not silently serve against a half-assumed schema.

## Effect SQL and connection scope

The documented low-level D1 integration is:

```ts
import * as SQL from "alchemy/SQL/D1";

const d1 = yield* Cloudflare.D1.QueryDatabase(Database);
const sql = yield* SQL.D1(d1);
// In a runtime Effect:
const rows = yield* sql`SELECT id, name FROM users WHERE id = ${userId}`;
```

Interpolated values are parameters, not SQL fragments. Dynamic table/column names need the library's identifier facilities and an allowlist. `SQL.D1Layer` can provide the generic SqlClient interface to services that should not know about D1.

Use the provider-specific Postgres/MySQL/SQLite integration for other engines. Do not import a Node TCP driver into a browser or Worker without checking its supported transport. Pools and clients must follow the runtime execution scope; a Workflow task attempt is not the same scope as the whole workflow's lifetime.

## Managed databases and branches

Use Neon, PlanetScale, or Prisma resources when Alchemy should own their lifecycle. Reference an existing database when ownership remains elsewhere. A preview may get a branch of a long-lived parent rather than a new cluster, but inspect copy-on-write, schema isolation, credentials, and cleanup semantics for the actual provider.

Avoid passing admin migration credentials to all request handlers. Hyperdrive runtime connectivity and direct migration connectivity can have different needs. Keep state-store databases separate from application data unless a deliberate failure-domain decision says otherwise.

## Expand, migrate, contract

For a consequential schema change, first add the new field/table/index while keeping old readers working. Deploy writers capable of both formats when necessary, backfill with bounded and restartable batches, verify completeness, then remove old reads and finally drop the old schema. Record which deploys can be rolled back at each point.

A destructive migration needs backups, restore proof, and an explicit target. A code revert is not a database rollback. Do not casually generate reverse SQL for a data-loss operation and claim recovery is solved. Prefer a roll-forward repair when that preserves valid data.

## Failure and concurrency

Serialize migration writers for the same database even when different app stacks reference it. Understand whether a failed migration can partially apply and how bookkeeping is updated. Retry only after checking the actual schema and history. Never mark a failed migration as applied just to unblock CI.

Observe duration, lock waits, connection counts, and errors without logging sensitive row data. A release gate should distinguish a provider provisioning problem from a schema compatibility problem. Keep migrations and their evidence tied to the source revision that introduced them.

## Sources

- [sql/drizzle/migrations](https://alchemy.run/sql/drizzle/migrations/)
- [sql/effect-sql/migrations](https://alchemy.run/sql/effect-sql/migrations/)
- [sql/effect-sql/lifecycle](https://alchemy.run/sql/effect-sql/lifecycle/)
- [sql/effect-sql/d1](https://alchemy.run/sql/effect-sql/d1/)
- [cloudflare/data/d1-drizzle](https://alchemy.run/cloudflare/data/d1-drizzle/)
- [cloudflare/data/drizzle](https://alchemy.run/cloudflare/data/drizzle/)
- [cloudflare/data/prisma](https://alchemy.run/cloudflare/data/prisma/)
- [neon](https://alchemy.run/neon/)
- [planetscale](https://alchemy.run/planetscale/)
- [prisma](https://alchemy.run/prisma/)

Reference baseline: Alchemy `2.0.0-beta.81`, upstream `fbe6ece368c6898234592e897d852bb47b88ebb1`, researched 7 October 2026. Check installed APIs before applying examples.

# SQL, repositories, model variants, and database transactions

## Driver, contract, and implementation

Use the `effect/sql` modules with a compatible concrete driver, such as a PostgreSQL or SQLite adapter. The Layer supplies the connection implementation; the application service exposes operations with meaningful domain failures. Driver interchangeability does not make SQL dialects, locking, isolation, or schema features interchangeable.

A typed SQL result parameter alone does not validate returned rows. Decode database results using `SqlSchema` or an appropriate model-backed repository.

```ts
import { Effect, Schema } from "effect"
import { SqlClient, SqlSchema } from "effect/sql"

const ItemRow = Schema.Struct({ id: Schema.Int, title: Schema.String })

export const makeItemQueries = Effect.gen(function*() {
  const sql = yield* SqlClient.SqlClient

  const find = SqlSchema.findAll({
    Request: Schema.Int,
    Result: ItemRow,
    execute: (id) => sql`SELECT id, title FROM items WHERE id = ${id}`
  })

  return { find }
})
```

Values are interpolated as parameters through the SQL tag. Do not put quotes around `${id}`, concatenate user text into raw SQL, or treat a value placeholder as a safe table/column identifier. Use the driver's supported identifier facilities and a trusted allowlist when identifiers must vary.

## Model variants

`Model.Class` from `effect/schema` supports related field sets for database and JSON operations. The official model pattern includes select/insert/update and JSON read/create/update variants. Use `Model.Field`, `FieldOnly`, and `FieldExcept` to express which operations own a field. Generated IDs and timestamps belong to the creating system, not arbitrary client input.

`SqlModel.makeRepository` is useful for ordinary model-backed CRUD. `SqlSchema` is useful for explicit queries or projections. Neither removes the need to review query plans, authorization predicates, uniqueness constraints, or transaction semantics. Avoid a generic repository framework when a few explicit queries describe the domain more clearly.

## Transaction boundaries

Use the installed `SqlClient` transaction combinator to wrap the complete atomic database operation. In the v4 SQL API, inspect `withTransaction` on the client and keep every participating query within the same Effect context. Do not call `runPromise` inside a repository or foreign callback to start a separate runtime: the new execution may not share the transaction.

A SQL transaction is not an `Effect.tx` in-memory transaction. Neither automatically makes a remote payment, email, or object-store write part of the same atomic unit. Use an outbox, durable workflow, or explicit compensation when several systems must coordinate.

Retries need a database-specific policy. Retrying an entire transaction after a serialization conflict differs from retrying a single statement after an ambiguous connection failure. Use uniqueness constraints and stable operation IDs for retryable writes. Test actual isolation and locking against the target engine.

## Database migrations and rollout

Use the driver's migration facilities or the project's established tool. Effect's SQL migrators can load ordered migration Effects from records or files. Run schema changes through a controlled deployment step or an explicitly coordinated startup process; avoid having every replica race an unreviewed migration at boot.

Treat schema changes and database data transformations as operational changes. Validate backups, lock duration, large-table effects, index creation options, recovery, and compatibility between simultaneously deployed application instances. A migration that passes against an empty in-memory database may still fail against production-shaped data.

## Pooling and streaming

Own pools with Layers and scopes. Set connection limits against the database's total budget across replicas, not only the per-process default. Avoid nested acquisition patterns that deadlock a small pool. Propagate cancellation and respect transaction cleanup on interruption.

Use `SqlStream` for large result sets where supported, and hold the connection only for the necessary stream lifetime. Do not buffer an unbounded query into memory or return a stream after its connection scope has closed.

## Failure policy and tests

Map expected absence or constraint conflicts to deliberate domain errors. Keep transient database unavailability recoverable when the caller must retry or return a service-unavailable response. `orDie` is appropriate only when that failure really is an unrecoverable invariant violation for this boundary, not because a smaller error union looks nicer.

Test malformed rows, injection attempts, tenant predicates, conflict handling, rollback on failure and interruption, pool exhaustion, migration ordering, and real-engine concurrency. A fake repository validates use-case logic; it does not validate SQL or transaction isolation.

## Official sources

- [Official SQL walkthrough](https://github.com/Effect-TS/effect/blob/effect@4.0.2/ai-docs/src/40_sql/10_basics.ts)
- [SqlClient](https://effect.website/docs/v4/api/effect/sql/SqlClient)
- [SqlSchema](https://effect.website/docs/v4/api/effect/sql/SqlSchema)
- [SqlModel](https://effect.website/docs/v4/api/effect/sql/SqlModel)
- [Model variants](https://effect.website/docs/v4/api/effect/schema/Model)
- [Migrator](https://effect.website/docs/v4/api/effect/sql/Migrator)
- [SqlStream](https://effect.website/docs/v4/api/effect/sql/SqlStream)

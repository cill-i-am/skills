# SQL, Transactions, And Persistence

Use this file for Effect SQL services, row schemas, repositories, transactions, foreign transaction callbacks, post-commit work, resolvers, migrations, and persistence boundaries.

## Repository Boundary

Application and domain code depend on repository capabilities whose contracts use domain values:

```ts
export interface OrderRepositoryShape {
  readonly findById: (
    id: OrderId,
  ) => Effect.Effect<Order, OrderNotFound | PersistenceError>
  readonly save: (order: Order) => Effect.Effect<void, PersistenceError>
}
```

Do not expose SQL clients, transaction handles, driver errors, table rows, or raw string IDs through this contract.

## Row Schema

Persisted data is a boundary. Decode rows before domain use:

```ts
const OrderRow = Schema.Struct({
  id: OrderId,
  customer_id: CustomerId,
  status: OrderStatus,
  total_minor: Schema.Int,
  currency: CurrencyCode,
  created_at: OrderCreatedAt,
})

const decodeOrderRow = Schema.decodeUnknownEffect(OrderRow)
```

Use explicit mapping when storage naming, joins, normalization, or domain invariants differ. Do not force one oversized Schema to represent command, domain, row, and wire shapes.

Hoist static row decoders and request encoders outside repeated repository calls.

## Effect SQL Schema Helpers

The audited upstream revision provides Schema-aware helpers under unstable SQL paths. Use them when they fit the target pin and query shape, for example helpers that return all rows, one row, or an optional row.

Verify exact constructor names, option fields, transaction APIs, driver errors, and generated result types against installed source. Map empty results into the repository's domain not-found error rather than leaking a generic collection or driver error.

## Native Effect Transaction

When the SQL client accepts an Effect transaction body, keep the body Effect-native:

```ts
const completeOrder = Effect.fn("OrderRepository.complete")(function* (
  order: Order,
  outbox: OrderCompletedOutbox,
) {
  const sql = yield* SqlClient.SqlClient

  yield* sql.withTransaction(
    Effect.gen(function* () {
      yield* updateOrder(sql, order)
      yield* insertOutbox(sql, outbox)
    }),
  )
})
```

Check the exact transaction method for the installed driver and pin.

## Foreign Promise Transaction Callback

Some database libraries supply the active transaction handle only inside a callback that must return a Promise. This is a legitimate local runtime boundary inside the persistence adapter.

The bridge must:

- run the Effect inside the callback because that callback owns the transaction;
- preserve the active transaction in Effect context for nested repository calls;
- inspect `Exit` rather than squashing every failure;
- reject or signal the driver so every non-success exit rolls back;
- reconstruct typed failure versus defect outside the callback;
- preserve cancellation or document the driver's limitation;
- remain private to the adapter while the public repository contract stays Effect-native.

See `runtime-bridges.md` for the full pattern. Compile Cause and transaction APIs against the target pin and driver.

## Ambient Active Transaction

A `Context.Reference<Transaction | null>` can be appropriate when nested repository calls should automatically reuse an already active transaction while ordinary calls use the base client.

Use it only for dynamic transaction context. The database capability itself remains a required `Context.Service`; do not hide persistence authority behind a default reference.

Test concurrent transaction isolation and nested behavior.

## Post-Commit Work

External side effects must not run before the authoritative transaction commits.

Use:

- an outbox for durable asynchronous work;
- a driver-supported after-commit hook;
- an adapter-owned hook queue that runs only after the outermost commit;
- a returned command/event that the caller executes after transaction success.

Nested pass-through transactions must not run "after commit" work while an outer transaction can still roll back. Discard queued hooks on rollback. Decide whether post-commit observer failures are best-effort, retried, or surfaced.

## Transaction Rules

- keep network calls, email, provider SDK calls, and slow external work outside authoritative transactions;
- keep transactions short and bounded;
- retry serialization failures only when the whole body is safe to repeat;
- preserve the same idempotency key across retried attempts;
- never swallow a transaction error and report success;
- classify begin/acquisition failures as part of the transaction contract;
- preserve typed failures, defects, interruption, rollback, and post-commit ordering during migrations.

## Resolvers And Batching

Use SQL resolvers when repeated keyed reads or writes can be grouped into real SQL batches. They can provide deduplication and batching while retaining typed errors.

- keyed reads must associate every result with the correct request;
- grouped writes must complete each request exactly once;
- batch size must respect database parameter and statement limits;
- ordering assumptions must be explicit;
- a loop of per-item statements is not automatically a batch.

## Errors

Map driver failures at the repository boundary into a small typed family such as:

- not found;
- unique or invariant conflict with a domain key;
- foreign-key conflict when a caller can respond;
- general persistence failure with a bounded operation label.

Keep raw driver causes in trusted diagnostics. Do not return SQL text, connection strings, filesystem paths, or database internals in public errors.

## Migrations And Startup

Migrations, pool creation, extension checks, schema compatibility, and connection validation belong in adapter or startup Layers. Decide whether failure prevents application acquisition. Do not run migrations from ordinary request workflows.

## Verification

Test repositories against a realistic database Layer where SQL semantics matter. Cover:

- row decode and malformed persisted data;
- not found and uniqueness conflicts;
- commit and rollback after typed failure and defect;
- transaction begin/acquisition failure;
- concurrent transaction isolation;
- nested transaction reuse;
- post-commit execution only after outer commit;
- outbox atomicity;
- safe retry and idempotency;
- resolver batching and result association;
- Layer acquisition and pool finalization.

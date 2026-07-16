# SQL And Persistence

Use this file for Effect SQL services, row schemas, repositories, transactions, resolvers, migrations, and persistence boundaries.

## Repository Boundary

Application and domain code depend on repository services whose contracts use domain types. The live Layer owns the SQL client and row translation.

```ts
export interface OrderRepositoryShape {
  readonly findById: (
    id: OrderId,
  ) => Effect.Effect<Order, OrderNotFound | PersistenceError>;
  readonly save: (order: Order) => Effect.Effect<void, PersistenceError>;
}
```

Do not expose SQL clients, driver errors, table row interfaces, or raw string IDs through this contract.

## Row Schema

Persisted data is a boundary. Decode rows before domain use.

```ts
const OrderRow = Schema.Struct({
  id: OrderId,
  customer_id: CustomerId,
  status: OrderStatus,
  total_minor: Schema.Int,
  currency: CurrencyCode,
  created_at: Schema.DateTimeUtcFromString,
});

const toOrder = (row: typeof OrderRow.Type): Order =>
  Order.make({
    id: row.id,
    customerId: row.customer_id,
    status: row.status,
    total: Money.make({ minor: row.total_minor, currency: row.currency }),
    createdAt: row.created_at,
  });
```

Use explicit mapping when storage naming, joins, normalization, or domain invariants differ. Do not force one oversized schema to represent command, domain, row, and wire shapes.

## Effect SQL Schema Helpers

Current v4 SQL modules provide Schema-aware helpers under unstable SQL paths. Prefer `SqlSchema.findAll`, `findOne`, `findOneOption`, or related helpers when they fit the query and target pin.

```ts
const findByIdQuery = SqlSchema.findOne({
  Request: Schema.Struct({ id: OrderId }),
  Result: OrderRow,
  execute: ({ id }) => sql`
    SELECT id, customer_id, status, total_minor, currency, created_at
    FROM orders
    WHERE id = ${id}
  `,
});
```

Verify exact constructor names and option fields in the installed v4 source. Map `Option.none` or empty rows into the repository's domain not-found error.

## Transactions

Use a transaction for writes that must commit or roll back together:

```ts
const completeOrder = Effect.fn("OrderRepository.complete")(function* (
  order: Order,
  outbox: OrderCompletedOutbox,
) {
  const sql = yield* SqlClient.SqlClient;

  yield* sql.withTransaction(
    Effect.gen(function* () {
      yield* updateOrder(sql, order);
      yield* insertOutbox(sql, outbox);
    }),
  );
});
```

Check the exact transaction API for the installed driver and v4 beta.

Transaction rules:

- Keep network calls, email, provider SDK calls, and slow external work outside authoritative transactions.
- Use an outbox, durable workflow, or post-commit action when external side effects must follow a committed write.
- Keep transactions short and bounded.
- Retry serialization failures only when the whole transaction body is safe to repeat.
- Never swallow a transaction error and report success.

## Resolvers And Batching

Use SQL resolvers when repeated keyed reads or writes can be grouped into real SQL batches. They can provide request deduplication and batching while retaining typed errors.

- `SqlResolver.findById`: keyed reads
- ordered or grouped resolvers: batch results must map reliably to requests
- void resolvers: grouped writes with no per-item result
- explicit batch size: respect database parameter and statement limits

Do not adopt a resolver when the query cannot truthfully batch or when request ordering cannot be reconstructed safely.

## Errors

Map driver errors at the repository boundary into a small typed family such as:

- unique conflict with a domain field or key
- foreign-key or invariant conflict when callers can respond
- not found
- general persistence failure with bounded operation label

Keep raw driver causes in trusted diagnostics. Do not return SQL text, connection strings, filesystem paths, or database internals in public errors.

## Migrations And Startup

Migrations, pool creation, extension checks, and connection validation belong in adapter or startup Layers. Decide whether migration failure should fail application acquisition. Do not run migrations from ordinary request workflows.

## Verification

Test repositories against a realistic database Layer where SQL semantics matter. Cover:

- row decode and malformed persisted data
- not found and uniqueness conflicts
- commit and rollback
- concurrent update policy
- outbox atomicity where used
- resolver batching and result association
- Layer acquisition and pool finalization

// Baseline: effect@4.0.2. See ../../references/24-sql.md
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

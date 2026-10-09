# Drizzle-first Alchemy applications

## Scope and version contract

For Cillian's new projects, use Drizzle as the default ORM and pnpm monorepos as the default packaging model. These are project preferences, not Alchemy requirements. Preserve an existing engine, migration owner, or ORM until its replacement is explicitly scoped. [SQL and migrations](sql-and-migrations.md) remains the alternative route for Effect SQL, Prisma, and non-Drizzle projects.

Research checked **9 October 2026**:

| Surface | Verified baseline | Meaning |
|---|---|---|
| Latest stable Drizzle ORM release on GitHub | `0.45.4`, published 8 October 2026 | Stable release track; do not assume its API includes the v1 Effect drivers. |
| Alchemy's documented Effect-compatible ORM and Kit pair | Both `1.0.0-rc.5-ab785fc` | Exact prerelease snapshot used in these new examples, not an assertion that this is the newest npm prerelease. |
| Drizzle source behind that suffix | `ab785fcd99710d6d136ffbfd121b7aeb96e4d51d` | Package source says `1.0.0-rc.5` and permits Effect/SQL peers `>=4.0.0-beta.105 || >=4.0.0`. |
| Alchemy/Effect for this skill | `2.0.0-beta.81` / `4.0.0` | Preserve this researched tuple until a separate upgrade is verified. |

The npm registry was unreachable in the authoring container. No current npm dist-tag or successful dependency installation is claimed. Registry resolution, lockfile generation, peer validation, and compilation are still required. Never use `--force` to hide a peer mismatch or replace the prerelease with `latest` to get installation unstuck.

Drizzle's stable package and its v1 prerelease are distinct tracks. `defineRelations`, Effect-native clients, and `drizzle-orm/effect-schema` in this chapter belong to the inspected v1 surface. Do not paste these patterns into a stable 0.45 project without checking its exports. Conversely, do not wrap a native Effect query in `Effect.tryPromise` just because an older tutorial used Promise-based Drizzle.

## Pick the runtime integration

| Database/runtime | Alchemy entry point | Required runtime peers | Important boundary |
|---|---|---|---|
| Worker + D1 | `alchemy/Drizzle/D1` → `D1(binding, { relations })` | `drizzle-orm`, `@effect/sql-d1` | Native D1 binding; no URL, `pg`, or Hyperdrive needed. |
| Worker + Neon/PlanetScale Postgres | `alchemy/Drizzle/Postgres` → `Postgres(hd.connectionString, { relations, client })` | `drizzle-orm`, `@effect/sql-pg`, `pg` | Hyperdrive binding, `nodejs_compat`, and scoped connections. |
| Worker + PlanetScale MySQL | `alchemy/Drizzle/MySQL` → `MySQL(hd.connectionString, { relations })` | `drizzle-orm`, `@effect/sql-mysql2`, `mysql2` | MySQL schema and semantics; not a Postgres adapter with a new URL. |
| Durable Object SQLite | `alchemy/Drizzle/Cloudflare` → `DurableObject({ migrations, relations })` | `drizzle-orm`, `@effect/sql-sqlite-do` | Construct in the inner activation Effect, after capturing migrations in the outer Effect. |
| Other Alchemy compute + Postgres | `alchemy/Drizzle/Postgres` | Postgres peers above | Use that host's connection capability and execution scope, not a Worker-only binding. |

Prefer the narrow driver subpath: a broad barrel can import optional drivers the selected runtime does not need. `drizzle-kit` is a development dependency. Register `Drizzle.providers()` only when actually using an Alchemy Drizzle resource such as `Drizzle.Schema`; it is not required for ordinary ORM queries or applying committed SQL through a database resource.

## Worked workspace, not disconnected fragments

The [worked workspace](../assets/examples/drizzle-monorepo/README.md) contains D1 and Neon/Postgres implementations of the same Notes service, a shared HTTP handler, a minimal Vite client that calls only public health, explicit package exports, generation configs, and root stack entrypoints. Read the setup and validation limits before using it. It is source-complete for that demonstration, but dependency compilation, migration generation, and integration execution remain unverified.

The sample uses one authenticated, shared dataset. It is **not** a multi-tenant authorization example and its token must never be put in browser code. The default D1 and alternative Postgres stacks have different names; selecting the latter creates a different example system, not a D1-to-Postgres data migration.

### D1: declaration, binding, client, query

The core of [NotesD1Live.ts](../assets/examples/drizzle-monorepo/packages/notes/src/NotesD1Live.ts) is:

```ts
import * as Cloudflare from "alchemy/Cloudflare";
import * as Drizzle from "alchemy/Drizzle/D1";
import * as Effect from "effect/Effect";
import { notes, relations } from "./sqlite-schema.ts";

export const makeQueries = Effect.gen(function* () {
  const database = yield* Cloudflare.D1.Database("NotesDatabase", {
    migrations: "./packages/notes/drizzle/sqlite",
  });
  const binding = yield* Cloudflare.D1.QueryDatabase(database);
  const db = yield* Drizzle.D1(binding, { relations });
  return {
    list: () => db.select().from(notes).limit(50),
    create: (id: string, title: string) =>
      db.insert(notes).values({ id, title }).returning(),
  };
}).pipe(Effect.provide(Cloudflare.D1.QueryDatabaseBinding));
```

This is a server composition excerpt; the full Layer maps errors and validates titles. Merely constructing the client does not run a query. The handlers call these methods later. Supplying the binding Layer is essential; adding broad account permissions does not satisfy a missing Effect service.

### Postgres: Neon, Hyperdrive, Effect-native Drizzle

[NotesPostgresLive.ts](../assets/examples/drizzle-monorepo/packages/notes/src/NotesPostgresLive.ts) includes the whole declaration. Its connection is:

```ts
const hyperdrive = yield* Cloudflare.Hyperdrive.Connection("NotesHyperdrive", {
  origin: branch.origin,
  dev: branch.pooledOrigin,
  caching: { disabled: true },
});
const hd = yield* Cloudflare.Hyperdrive.Connect(hyperdrive);
const db = yield* Drizzle.Postgres(hd.connectionString, {
  relations,
  client: { prepare: false },
});
```

Here `branch` is the `Neon.Branch` returned by the same construction Effect. Import `Drizzle` from `alchemy/Drizzle/Postgres`, provide `Cloudflare.Hyperdrive.ConnectBinding`, register both Cloudflare and Neon providers in the stack, and enable `compatibility: { flags: ["nodejs_compat"] }` on the Worker.

Use the direct origin behind Hyperdrive and the documented pooled origin when local development bypasses it. The disabled result cache is a deliberate consistency choice for this CRUD sample. Alchemy's Postgres source exposes `client.prepare: false` for transaction-mode poolers; verify the actual transport before changing this. Do not eagerly unwrap `hd.connectionString` in construction: the lazy helper resolves it inside the runtime execution.

Pools are per constructed client, per execution scope—not one application-global pool. Distinct `Drizzle.Postgres(...)` constructions can allocate distinct pools even within one request. Reuse the same database service where a feature set shares a database. Do not share a live Worker socket across requests, open a new client for each query, or keep a transaction open across Workflow steps. A task attempt gets its own scope under the Workflow bridge.

### PlanetScale connection variations

For Postgres, the official provider recipe returns a role; pass `role.origin` and `role.pooledOrigin` to Hyperdrive. For MySQL, it returns a password; use `password.origin` and the MySQL client. There is no equivalent pooled password origin in that recipe. Keep role/password creation and rotation with the database owner, not in every feature Layer.

Follow the exact [PlanetScale Drizzle guide](https://alchemy.run/planetscale/guides/drizzle/) for resource properties. The client substitution is:

```ts
import * as Drizzle from "alchemy/Drizzle/MySQL";
const db = yield* Drizzle.MySQL(hd.connectionString, { relations });
```

This is not a portable substitution for all SQL: change schema builders to `mysql-core`, generate MySQL migrations, verify insert-returning behavior, transaction support, indexes, and driver requirements. Do not copy Postgres `.returning()` assertions into a MySQL example unchanged.

## Tables, relations, and transport schemas are different contracts

Tables define storage. Relations describe typed query navigation; they do not create foreign-key constraints. Declare real constraints on the tables, then add v1 relation metadata:

```ts
import { defineRelations } from "drizzle-orm";
import { integer, pgTable, serial, text } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
});
export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  authorId: integer("author_id").notNull().references(() => users.id),
  title: text("title").notNull(),
});
export const relations = defineRelations({ users, posts }, r => ({
  users: { posts: r.many.posts() },
  posts: { author: r.one.users({ from: r.posts.authorId, to: r.users.id }) },
}));
```

Pass `{ relations }` when constructing Drizzle. In a runtime Effect, the v1 query shape is:

```ts
const author = yield* db.query.users.findFirst({
  where: { id: authorId },
  with: { posts: true },
});
```

The example names the relation on the `posts` side; check both directions and actual SQL in an integration test. Bound collections and paginate large relationships instead of loading an unbounded object graph.

The v1 validation integration can derive row schemas:

```ts
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-orm/effect-schema";

export const StoredNote = createSelectSchema(notes);
export const InsertNoteRow = createInsertSchema(notes);
export const UpdateNoteRow = createUpdateSchema(notes);
```

Use these at persistence/import boundaries where appropriate. A database insert shape is **not automatically a safe public request**: it can include tenant IDs, role flags, ownership fields, or server-managed timestamps. Prefer an explicit public `Schema.Struct` allowlist; derive trusted identity from authentication, then build an explicit `.values({ ... })` object. Never spread arbitrary decoded row input into a privileged write. Keep date/bigint/decimal transport encoding deliberate rather than assuming database values are JSON-safe.

## Query correctness and failures

Select only the columns the consumer needs. Parameterize values with Drizzle builders or its `sql` tag; validate identifiers separately rather than accepting arbitrary SQL fragments. Scope reads, updates, and deletes to the authorized tenant in a real multi-tenant app. Query typing does not implement authorization.

Prefer database constraints and a single atomic statement for uniqueness, counters, or compare-and-set. Do not implement `SELECT exists` followed by an unguarded `INSERT` as a concurrency control. Use the selected dialect's conflict API deliberately and test conflicts with different payloads; ignoring a duplicate can hide a failed idempotency contract.

For Postgres/MySQL multi-statement work, use the inspected Effect driver's transaction API and keep all operations on its transaction handle. D1 uses batches rather than interactive transactions; DO SQLite has a different instance/transaction model. `Effect.all` creates concurrency, not a transaction. An external API call and a SQL commit are not one atomic operation: use idempotency and an outbox/workflow design where the failure scenario needs it.

Inspect the actual inferred error channel. Drizzle Effect paths can expose `EffectDrizzleQueryError` wrapping an SQL error; transactions can add `SqlError`. Some guide prose simplifies this. Do not assume a catch on `SqlError` alone handles every query. Query errors may carry SQL and parameters: do not serialize or log the raw error to a client. The sample maps them to a sanitized service error. A production adapter should additionally classify known constraints and emit redacted operational diagnostics, not convert every database outage into a 404 or empty list.

## Generation and migration ownership

Use package-local Drizzle configs and generation commands, but one reviewed migration history per physical database. Generate SQL and snapshots locally, review and commit both, then have the chosen deployment owner apply them. The new fixture intentionally ships **no fabricated snapshots or generated migrations**; generation is an explicit setup step.

Alchemy's database `migrations` option applies files; `Drizzle.Schema` is an optional generation integration. Keeping an existing Drizzle Kit migration runner is valid. Do not turn on two writers, generate-and-apply unseen SQL in production CI, or switch history tables without the documented adoption process.

For a shared database, aggregate the owning features' tables into one schema entrypoint and put the generation config/history with the database owner. Separate packages do not imply separate migration histories. See [monorepos](monorepos.md) for root/package working directories and [SQL and migrations](sql-and-migrations.md) for expand/migrate/contract and recovery.

## Sources and remaining proof

- [Latest stable Drizzle release](https://github.com/drizzle-team/drizzle-orm/releases/tag/0.45.4)
- [Drizzle snapshot and peer contract](https://github.com/drizzle-team/drizzle-orm/blob/ab785fcd99710d6d136ffbfd121b7aeb96e4d51d/drizzle-orm/package.json)
- [Alchemy's pinned Cloudflare Drizzle recipe](https://github.com/alchemy-run/alchemy/blob/fbe6ece368c6898234592e897d852bb47b88ebb1/website/src/content/docs/cloudflare/data/drizzle.mdx)
- [D1 adapter source](https://github.com/alchemy-run/alchemy/blob/fbe6ece368c6898234592e897d852bb47b88ebb1/packages/alchemy/src/Drizzle/D1.ts)
- [Postgres adapter source](https://github.com/alchemy-run/alchemy/blob/fbe6ece368c6898234592e897d852bb47b88ebb1/packages/alchemy/src/Drizzle/Postgres.ts)
- [DO adapter and error channel](https://github.com/alchemy-run/alchemy/blob/fbe6ece368c6898234592e897d852bb47b88ebb1/packages/alchemy/src/Drizzle/Cloudflare.ts)
- [Connection lifecycle](https://alchemy.run/sql/effect-sql/lifecycle/), [Drizzle migrations](https://alchemy.run/sql/drizzle/migrations/), [Effect schemas](https://orm.drizzle.team/docs/effect-schema)

These are researched examples, not a compatibility certification. Follow the [iteration checklist](iteration-checklist.md) before treating the new fixture as a verified starter.

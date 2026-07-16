# Drizzle

Use this file for Alchemy's Drizzle provider and Drizzle runtime patterns. For provider-specific database details, load `neon.md` or `planetscale.md`; for full database stack examples with Hyperdrive, also load `database-patterns.md`.

## Contents

- Provider setup
- Schema and migrations
- Postgres runtime
- MySQL runtime on Workers
- Relations
- Monorepo guidance
- Testing
- Gotchas

## Provider Setup

Register the Drizzle provider whenever a stack uses `Drizzle.Schema`:

```ts
import * as Drizzle from "alchemy/Drizzle";
import * as Layer from "effect/Layer";

providers: Layer.mergeAll(
  Cloudflare.providers(),
  Drizzle.providers(),
  Planetscale.providers(),
)
```

Do not add `Drizzle.providers()` just for a runtime import from `drizzle-orm`. Add it when Alchemy owns schema generation or migration artifacts.

## Schema And Migrations

`Drizzle.Schema` is a deploy-time/build-time resource. It loads a schema module, runs Drizzle Kit programmatic generation, writes migration files, and exposes the migration directory to other resources.

```ts
const schema = yield* Drizzle.Schema("AppSchema", {
  schema: "./src/schema.ts",
  out: "./migrations",
  dialect: "postgres",
});
```

Defaults:

- `out`: `./migrations`
- `dialect`: `postgres`

Wire the generated directory into a migration-aware database branch:

```ts
const branch = yield* Planetscale.PostgresBranch("AppBranch", {
  database,
  migrationsDir: schema.out,
});
```

or:

```ts
const branch = yield* Neon.Branch("AppBranch", {
  project,
  migrationsDir: schema.out,
});
```

For MySQL, use `dialect: "mysql"` if Alchemy is generating MySQL migrations:

```ts
const schema = yield* Drizzle.Schema("AppSchema", {
  schema: "./src/schema.ts",
  out: "./migrations",
  dialect: "mysql",
});
```

PlanetScale MySQL examples often use checked-in migrations produced by `drizzle-kit generate` and pass `migrationsDir: "./migrations"` to `Planetscale.MySQLBranch`.

## Postgres Runtime

Use `Drizzle.postgres` with a redacted Hyperdrive connection string:

```ts
import * as Drizzle from "alchemy/Drizzle";
import * as Cloudflare from "alchemy/Cloudflare";
import * as Effect from "effect/Effect";
import { Hyperdrive } from "./infra.ts";
import { relations } from "./schema.ts";

export const DatabaseLive = Effect.gen(function* () {
  const hd = yield* Cloudflare.Hyperdrive.Connect(Hyperdrive);

  return yield* Drizzle.postgres(hd.connectionString, {
    relations,
  });
}).pipe(Effect.provide(Cloudflare.Hyperdrive.ConnectBinding));
```

Runtime notes:

- The connection string is an Effect of `Redacted<string>`.
- The actual pool is deferred until first query.
- The pool is memoized in the current execution context.
- Query builders return Effects, so use `yield* db.select().from(Users)`.
- Workers need `nodejs_compat` for `pg`.

Example query in a Worker handler:

```ts
const users = yield* db.select().from(Users).limit(10);
return Response.json({ users });
```

## MySQL Runtime On Workers

For PlanetScale MySQL, use the `mysql2` Drizzle adapter through Hyperdrive and disable eval:

```ts
import { drizzle } from "drizzle-orm/mysql2";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
import * as Cloudflare from "alchemy/Cloudflare";
import { Hyperdrive } from "./infra.ts";
import * as schema from "./schema.ts";
import { relations } from "./relations.ts";

class DatabaseQueryError extends Data.TaggedError("DatabaseQueryError")<{
  readonly cause: unknown;
}> {}

const program = Effect.gen(function* () {
  const hd = yield* Cloudflare.Hyperdrive.Connect(Hyperdrive);
  const connectionString = yield* hd.connectionString;

  const db = drizzle({
    connection: {
      uri: Redacted.value(connectionString),
      disableEval: true,
    },
    schema,
    relations,
    mode: "default",
  });

  return yield* Effect.tryPromise({
    try: () => db.select().from(schema.Users),
    catch: (cause) => new DatabaseQueryError({ cause }),
  });
}).pipe(Effect.provide(Cloudflare.Hyperdrive.ConnectBinding));
```

Use `disableEval: true` because Cloudflare Workers isolates do not allow the JIT/eval path used by mysql2 parsers.

When creating raw mysql2 connections, close them in `finally` or `Effect.ensuring`.

## Relations

Relations improve typed runtime query APIs but do not generate foreign keys. Define foreign keys in table definitions.

```ts
import { defineRelations } from "drizzle-orm";
import { Posts, Users } from "./schema.ts";

export const relations = defineRelations({ Users, Posts }, (t) => ({
  Users: {
    posts: t.many.Posts(),
  },
  Posts: {
    user: t.one.Users({
      from: t.Posts.userId,
      to: t.Users.id,
    }),
  },
}));
```

Pass `relations` to `Drizzle.postgres` or the MySQL Drizzle adapter when using relational query APIs.

## Monorepo Guidance

Keep schema and migrations owned by the package that owns the database contract:

```text
apps/api/
  alchemy.run.ts
  src/schema.ts
  migrations/
packages/db/
  src/schema.ts
```

For shared schema packages, avoid browser entrypoints that import infrastructure, `alchemy`, provider modules, `pg`, or `mysql2`.

Run package-scoped commands with pnpm:

```sh
pnpm --filter api exec alchemy plan
pnpm --filter api drizzle-kit generate
```

Only run a separate `drizzle-kit generate` step if the project intentionally does not use `Drizzle.Schema` for generation.

## Testing

Use Vitest helpers for Alchemy integration tests:

```ts
import * as Test from "alchemy/Test/Vitest";
import * as Layer from "effect/Layer";

const { test, beforeAll, afterAll, deploy, destroy } = Test.make({
  providers: Layer.mergeAll(
    Cloudflare.providers(),
    Drizzle.providers(),
    Planetscale.providers(),
  ),
  state: Cloudflare.state(),
  stage: "test",
});
```

Review generated migrations before committing. In CI, make migration generation deterministic and fail on unexpected diffs if the repo requires checked-in migrations.

## Gotchas

- `Drizzle.Schema` removal does not delete the migration directory.
- Do not run duplicate migration generation in CI when Alchemy owns migration generation.
- Do not expect Drizzle relations to generate FK SQL.
- Do not use Postgres runtime helpers for MySQL connections.
- Use `nodejs_compat` for `pg` and `mysql2` in Workers.
- Keep connection strings redacted until the driver boundary.
- Keep migration directories intentional: either checked in for team review or clearly treated as deploy artifacts.

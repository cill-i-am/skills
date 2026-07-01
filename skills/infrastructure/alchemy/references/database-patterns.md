# Database Patterns

Use this file for end-to-end database composition across Alchemy providers: Cloudflare Hyperdrive, Drizzle, Neon, and PlanetScale. For provider-specific props, auth, lifecycle behavior, and gotchas, load the provider file first:

- Cloudflare bindings and Hyperdrive: `cloudflare.md`.
- Drizzle schema/runtime details: `drizzle.md`.
- Neon projects/branches: `neon.md`.
- PlanetScale Postgres/MySQL resources: `planetscale.md`.

## Contents

- Provider combinations
- Default development Postgres
- Hyperdrive origin rules
- Neon Postgres plus Drizzle
- PlanetScale Postgres plus Drizzle
- PlanetScale MySQL plus Drizzle
- Shared resources across stages
- Integration gotchas

## Provider Combinations

Register the provider layers that match the selected database path.

Neon development Postgres:

```ts
providers: Layer.mergeAll(
  Cloudflare.providers(),
  Drizzle.providers(),
  Neon.providers(),
)
```

PlanetScale Postgres:

```ts
providers: Layer.mergeAll(
  Cloudflare.providers(),
  Drizzle.providers(),
  Planetscale.providers(),
)
```

PlanetScale MySQL:

```ts
providers: Layer.mergeAll(
  Cloudflare.providers(),
  Planetscale.providers(),
)
```

Add `Drizzle.providers()` for MySQL only when the stack uses `Drizzle.Schema` to generate migrations. Many PlanetScale MySQL flows keep checked-in Drizzle migrations and let `Planetscale.MySQLBranch` apply `migrationsDir`.

## Default Development Postgres

Prefer Neon for development Postgres unless the repo or user explicitly chooses another provider.

Recommended stage model:

- `dev_shared` owns the shared Neon project.
- `dev_$USER`, `test`, and `pr-<number>` create per-stage branches against that project.
- PR cleanup destroys only the branch, Hyperdrive, Worker, and other owned stage resources.
- `prod` owns its own protected project/branch or uses a deliberately selected production database provider.

The shared owner stage must be deployed before stages that use `Neon.Project.ref(...)`.

## Hyperdrive Origin Rules

Hyperdrive is the Worker-facing pooler. Feed it a direct provider origin, not a provider's pooled URI.

Use:

- Neon Postgres: `branch.origin` or `project.origin`.
- PlanetScale Postgres: `role.origin`.
- PlanetScale MySQL: `password.origin`.

```ts
export const Hyperdrive = Effect.gen(function* () {
  const { branch } = yield* NeonDb;

  return yield* Cloudflare.Hyperdrive("app-hyperdrive", {
    origin: branch.origin,
  });
});
```

Worker runtime rules:

- Bind Hyperdrive in Worker init.
- Enable `nodejs_compat` for `pg` and `mysql2`.
- Open one raw driver connection per request and close it.
- Prefer `Drizzle.postgres(hd.connectionString, { relations })` for Postgres.
- If multiple modules need database access, build a `DbLive`/repository Layer and expose domain operations instead of passing raw clients around.

## Neon Postgres Plus Drizzle

Use this as the default development database pattern.

```ts
export const NeonDb = Effect.gen(function* () {
  const { stage } = yield* Alchemy.Stack;

  const schema = yield* Drizzle.Schema("app-schema", {
    schema: "./src/schema.ts",
    out: "./migrations",
  });

  const project = stage.startsWith("pr-") || stage.startsWith("dev_") || stage === "test"
    ? yield* Neon.Project.ref("app-db", { stage: "dev_shared" })
    : yield* Neon.Project("app-db", {
        region: "aws-us-east-1",
      });

  const branch = yield* Neon.Branch("app-branch", {
    project,
    protected: stage === "prod",
    migrationsDir: schema.out,
  });

  return { project, branch, schema };
});

export const Hyperdrive = Effect.gen(function* () {
  const { branch } = yield* NeonDb;

  return yield* Cloudflare.Hyperdrive("app-hyperdrive", {
    origin: branch.origin,
  });
});
```

Runtime:

```ts
const hd = yield* Cloudflare.Hyperdrive.bind(Hyperdrive);
const db = yield* Drizzle.postgres(hd.connectionString, { relations });

const users = yield* db.select().from(Users);
```

For larger Workers, put the client behind a service:

```ts
class UsersRepo extends Context.Service<UsersRepo, {
  readonly list: () => Effect.Effect<Array<typeof Users.$inferSelect>>;
}>()("UsersRepo") {}

const UsersRepoLive = Layer.effect(UsersRepo)(
  Effect.gen(function* () {
    const hd = yield* Cloudflare.Hyperdrive.bind(Hyperdrive);
    const db = yield* Drizzle.postgres(hd.connectionString, { relations });

    return {
      list: Effect.fn("UsersRepo.list")(function* () {
        return yield* db.select().from(Users);
      }),
    };
  }),
).pipe(Layer.provide(Cloudflare.HyperdriveBindingLive));
```

## PlanetScale Postgres Plus Drizzle

Use this when the app intentionally targets PlanetScale Postgres.

```ts
export const PlanetscaleDb = Effect.gen(function* () {
  const schema = yield* Drizzle.Schema("app-schema", {
    schema: "./src/schema.ts",
    out: "./migrations",
  });

  const database = yield* Planetscale.PostgresDatabase("app-db", {
    region: { slug: "us-east" },
    clusterSize: "PS_10",
  });

  const branch = yield* Planetscale.PostgresBranch("app-branch", {
    database,
    migrationsDir: schema.out,
  });

  const role = yield* Planetscale.PostgresRole("app-role", {
    database,
    branch,
    inheritedRoles: ["postgres"],
  });

  return { database, branch, role, schema };
});

export const Hyperdrive = Effect.gen(function* () {
  const { role } = yield* PlanetscaleDb;

  return yield* Cloudflare.Hyperdrive("app-hyperdrive", {
    origin: role.origin,
    caching: { disabled: true },
  });
});
```

Runtime uses the same Postgres Worker pattern as Neon:

```ts
const hd = yield* Cloudflare.Hyperdrive.bind(Hyperdrive);
const db = yield* Drizzle.postgres(hd.connectionString, { relations });
```

## PlanetScale MySQL Plus Drizzle

Use this when the app intentionally targets PlanetScale MySQL or Vitess behavior.

```ts
export const PlanetscaleDb = Effect.gen(function* () {
  const database = yield* Planetscale.MySQLDatabase("app-db", {
    region: { slug: "us-east" },
    clusterSize: "PS_10",
    allowForeignKeyConstraints: true,
  });

  const branch = yield* Planetscale.MySQLBranch("app-branch", {
    database,
    isProduction: false,
    migrationsDir: "./migrations",
  });

  const password = yield* Planetscale.MySQLPassword("app-password", {
    database,
    branch,
    role: "readwriter",
  });

  return { database, branch, password };
});

export const Hyperdrive = Effect.gen(function* () {
  const { password } = yield* PlanetscaleDb;

  return yield* Cloudflare.Hyperdrive("app-hyperdrive", {
    origin: password.origin,
    caching: { disabled: true },
  });
});
```

Runtime uses the MySQL adapter, not `Drizzle.postgres`:

```ts
const hd = yield* Cloudflare.Hyperdrive.bind(Hyperdrive);
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
```

Use `disableEval: true` in Workers.

## Shared Resources Across Stages

Use references for expensive shared containers and owned resources for per-stage isolation.

```ts
const project = stage.startsWith("pr-")
  ? yield* Neon.Project.ref("app-db", { stage: "dev_shared" })
  : yield* Neon.Project("app-db", {
      region: "aws-us-east-1",
    });
```

Rules:

- Deploy the referenced upstream stage first.
- Destroy downstream stages first.
- References do not create upstream resources.
- Destroying a downstream stage does not delete referenced resources.
- Keep stage ownership obvious in code and CI.

## Integration Gotchas

- Do not put Neon pooled URIs behind Hyperdrive.
- Do not create a full database project or cluster for every PR when a branch is enough.
- Do not run separate `drizzle-kit generate` in CI when `Drizzle.Schema` owns generation.
- Do not treat PlanetScale MySQL and Postgres runtime patterns as interchangeable.
- Keep connection strings and passwords redacted until the driver boundary.
- Keep database clients behind service Layers when app code is Effect-based.
- Commit or intentionally manage generated migrations according to the repo's workflow.
- Use stable logical IDs for project/database, branch, role/password, Hyperdrive, and Worker resources.
- Make production protection derive from Alchemy `stage`, not a second environment model.

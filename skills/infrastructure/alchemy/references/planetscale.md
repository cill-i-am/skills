# PlanetScale

Use this file for Alchemy PlanetScale provider resources. For runtime Drizzle and Hyperdrive integration, also load `database-patterns.md` and `drizzle.md`.

## Contents

- Provider setup and authentication
- Postgres resources
- MySQL resources
- Branching and stages
- Hyperdrive integration
- Migrations
- CI and secrets
- Gotchas

## Provider Setup And Authentication

Register the provider whenever a stack declares PlanetScale resources:

```ts
import * as Planetscale from "alchemy/Planetscale";
import * as Layer from "effect/Layer";

providers: Layer.mergeAll(
  Cloudflare.providers(),
  Drizzle.providers(),
  Planetscale.providers(),
)
```

PlanetScale auth uses service-token credentials:

- `PLANETSCALE_API_TOKEN_ID`
- `PLANETSCALE_API_TOKEN`
- `PLANETSCALE_ORGANIZATION`

Stored credentials are written under:

```text
~/.alchemy/credentials/<profile>/planetscale-stored.json
```

OAuth is not the documented PlanetScale path for the Alchemy provider.

## Postgres Resources

Create a database, branch, and role:

```ts
export const PlanetscaleDb = Effect.gen(function* () {
  const schema = yield* Drizzle.Schema("AppSchema", {
    schema: "./src/schema.ts",
    out: "./migrations",
    dialect: "postgres",
  });

  const database = yield* Planetscale.PostgresDatabase("AppDatabase", {
    region: { slug: "us-east" },
    clusterSize: "PS_10",
  });

  const branch = yield* Planetscale.PostgresBranch("AppBranch", {
    database,
    migrationsDir: schema.out,
  });

  const role = yield* Planetscale.PostgresRole("AppRole", {
    database,
    branch,
    inheritedRoles: ["postgres"],
  });

  return { database, branch, role, schema };
});
```

Resource notes:

- `PostgresDatabase` owns the cluster. `clusterSize` is required.
- Region and architecture are replacement-sensitive.
- `PostgresBranch` forks a branch and can apply migrations from `migrationsDir`.
- Database, parent, and region changes are replacement-sensitive for branches.
- `PostgresRole` materializes credentials and an `origin` output suitable for Hyperdrive.
- Role TTL, database, branch, and inherited-role changes replace the role.

## MySQL Resources

Create a database, branch, and password:

```ts
export const PlanetscaleDb = Effect.gen(function* () {
  const database = yield* Planetscale.MySQLDatabase("AppDatabase", {
    region: { slug: "us-east" },
    clusterSize: "PS_10",
    allowForeignKeyConstraints: true,
  });

  const branch = yield* Planetscale.MySQLBranch("AppBranch", {
    database,
    isProduction: false,
    migrationsDir: "./migrations",
  });

  const password = yield* Planetscale.MySQLPassword("AppPassword", {
    database,
    branch,
    role: "readwriter",
  });

  return { database, branch, password };
});
```

Resource notes:

- `MySQLDatabase` is Vitess-backed and requires `clusterSize`.
- `MySQLBranch` requires `isProduction`.
- `MySQLPassword` materializes credentials and an `origin` output suitable for Hyperdrive.
- Password plaintext cannot be recovered. Adoption without cached output is impossible because PlanetScale never reissues plaintext.
- MySQL migration SQL is split on Drizzle `--> statement-breakpoint` markers before being sent to Vitess.

## Branching And Stages

Use stages to isolate app infrastructure and branches. Avoid creating full database clusters for every PR unless that cost and lifecycle are intended.

Recommended pattern:

```ts
const { stage } = yield* Alchemy.Stack;

const database = stage.startsWith("pr-")
  ? yield* Planetscale.PostgresDatabase.ref("AppDatabase", {
      stage: "dev_shared",
    })
  : yield* Planetscale.PostgresDatabase("AppDatabase", {
      region: { slug: "us-east" },
      clusterSize: "PS_10",
    });

const branch = yield* Planetscale.PostgresBranch("AppBranch", {
  database,
  migrationsDir: schema.out,
});
```

Use `Resource.ref` only for upstream resources that already exist in state. Deploy the upstream stage first. Destroying a PR stage should remove the PR branch, role/password, Hyperdrive, and Worker, not the referenced shared database.

For production, derive protection and naming from Alchemy's stage rather than from a second environment variable.

## Hyperdrive Integration

Use PlanetScale origin outputs directly behind Cloudflare Hyperdrive.

Postgres:

```ts
export const Hyperdrive = Effect.gen(function* () {
  const { role } = yield* PlanetscaleDb;

  return yield* Cloudflare.Hyperdrive.Connection("AppHyperdrive", {
    origin: role.origin,
    caching: { disabled: true },
  });
});
```

MySQL:

```ts
export const Hyperdrive = Effect.gen(function* () {
  const { password } = yield* PlanetscaleDb;

  return yield* Cloudflare.Hyperdrive.Connection("AppHyperdrive", {
    origin: password.origin,
    caching: { disabled: true },
  });
});
```

Bind Hyperdrive inside Workers and use `nodejs_compat` for `pg` or `mysql2`.

## Migrations

Postgres path:

- Use `Drizzle.Schema`.
- Pass `schema.out` to `Planetscale.PostgresBranch`.
- Let the branch resource apply the migrations.

MySQL path:

- Use checked-in Drizzle migrations or `Drizzle.Schema` with `dialect: "mysql"` if the project intentionally lets Alchemy generate them.
- Pass the directory to `Planetscale.MySQLBranch`.
- Review generated SQL because Vitess compatibility can be stricter than generic MySQL.

## CI And Secrets

Use GitHub secrets for PlanetScale credentials in CI:

```yaml
env:
  PLANETSCALE_API_TOKEN_ID: ${{ secrets.PLANETSCALE_API_TOKEN_ID }}
  PLANETSCALE_API_TOKEN: ${{ secrets.PLANETSCALE_API_TOKEN }}
  PLANETSCALE_ORGANIZATION: ${{ secrets.PLANETSCALE_ORGANIZATION }}
```

If managing those secrets as code, use `GitHub.Secret` with redacted values and load `github.md`.

## Gotchas

- Do not use OAuth as the assumed auth mechanism.
- Do not lose the cached output for `MySQLPassword`; plaintext cannot be re-read.
- Do not create clusters per PR by accident. Prefer branch-per-stage off a shared database.
- Do not destroy production databases from CI.
- Do not change region, arch, parent, database, or cluster shape casually; many fields are replacement-sensitive.
- Do not put pooled endpoints behind Hyperdrive. Use `role.origin` or `password.origin`.
- For MySQL on Workers, use `disableEval: true` and `nodejs_compat`.

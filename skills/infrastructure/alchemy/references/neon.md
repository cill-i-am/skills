# Neon

Use this file for Alchemy Neon provider resources and development database patterns. Neon is the preferred development Postgres provider in this skill unless the repo or user explicitly chooses another database. For full Worker database composition, also load `database-patterns.md`.

## Contents

- Official docs to check
- Provider setup and authentication
- Project resource
- Branch resource
- Development stage pattern
- Hyperdrive integration
- Drizzle migrations
- CI and secrets
- Gotchas

## Official Docs To Check

Start here when API details may have changed:

- Alchemy Neon Project: `https://v2.alchemy.run/providers/neon/project/`
- Alchemy Neon Branch: `https://v2.alchemy.run/providers/neon/branch/`
- Alchemy Hyperdrive tutorial: `https://v2.alchemy.run/tutorial/cloudflare/hyperdrive/`
- Alchemy Drizzle tutorial: `https://v2.alchemy.run/tutorial/cloudflare/drizzle/`
- Alchemy shared database branches: `https://v2.alchemy.run/tutorial/cloudflare/branch-from-shared-database/`
- Neon projects: `https://neon.com/docs/manage/projects`
- Neon branches: `https://neon.com/docs/manage/branches`
- Neon API keys: `https://neon.com/docs/manage/api-keys`

For exact props, also check source:

- `packages/alchemy/src/Neon/Project.ts`
- `packages/alchemy/src/Neon/Branch.ts`
- `packages/alchemy/src/Neon/Providers.ts`

## Provider Setup And Authentication

Register Neon alongside Cloudflare and Drizzle:

```ts
import * as Alchemy from "alchemy";
import * as Cloudflare from "alchemy/Cloudflare";
import * as Drizzle from "alchemy/Drizzle";
import * as Neon from "alchemy/Neon";
import * as Layer from "effect/Layer";

providers: Layer.mergeAll(
  Cloudflare.providers(),
  Drizzle.providers(),
  Neon.providers(),
)
```

Neon auth is API-key based:

- Env method reads `NEON_API_KEY`.
- Stored method writes under `~/.alchemy/credentials/<profile>/neon-stored.json`.
- Neon API keys are bearer tokens. The secret is displayed once when created, so store it securely.

Use local profile login for development:

```sh
pnpm exec alchemy login --configure
```

Use `NEON_API_KEY` in CI.

## Project Resource

`Neon.Project` creates the top-level serverless Postgres project. Creating a project also creates the default branch, default role, default database, and a read-write compute endpoint.

```ts
const project = yield* Neon.Project("app-db", {
  region: "aws-us-east-1",
  pgVersion: 17,
});
```

Important props:

- `name`: explicit Neon project name. If omitted, Alchemy generates one from stack/stage/id.
- `region`: defaults to `aws-us-east-1`; cannot be changed without replacement.
- `pgVersion`: defaults to `17`; cannot be changed without replacement.
- `defaultBranchName`: defaults to Neon's API/CLI default, usually `main`; create-only.
- `roleName`: default initial role, usually `neondb_owner`; create-only.
- `databaseName`: default initial database, usually `neondb`; create-only.
- `historyRetentionSeconds`: WAL history for point-in-time branching and restore; defaults to `86400`.
- `orgId`: optional Neon organization ID; create-only.
- `enableLogicalReplication`: can be enabled but not cleanly disabled.
- `migrationsDir`: SQL migrations to apply against the default branch.
- `migrationsTable`: defaults to `neon_migrations`.
- `importFiles`: seed/import SQL files applied after migrations and re-applied when their content hash changes.

Outputs to know:

- `projectId`, `projectName`, `region`, `pgVersion`
- `defaultBranchId`, `defaultBranchName`
- `databaseName`, `roleName`
- `connectionUri`
- `pooledConnectionUri`
- `origin`: parsed direct connection target for Hyperdrive

Prefer `Branch` for per-stage schema/data changes instead of mutating the project default branch.

## Branch Resource

`Neon.Branch` creates a copy-on-write branch in a project.

```ts
const branch = yield* Neon.Branch("app-branch", {
  project,
  migrationsDir: schema.out,
});
```

Important props:

- `project`: a `Neon.Project`, `{ project }`, or `{ projectId }`.
- `name`: explicit branch name. If omitted, Alchemy generates one.
- `parentBranch`: a `Neon.Branch`, `{ branchId }`, or `{ name }`; defaults to the project's default branch.
- `parentLsn`: create from a parent log sequence number; replacement-sensitive.
- `parentTimestamp`: create from a parent timestamp inside the restore window; replacement-sensitive.
- `protected`: protects from deletion/mutation where supported.
- `initSource`: `"parent-data"` by default, or `"schema-only"`.
- `expiresAt`: RFC-3339 timestamp for auto-deleting temporary branches.
- `endpoints`: endpoint config; at least one read-write endpoint is required to connect.
- `migrationsDir`, `migrationsTable`, `importFiles`: apply SQL to this branch.

Outputs to know:

- `branchId`, `branchName`, `projectId`
- `databaseName`, `roleName`
- `connectionUri`
- `pooledConnectionUri`
- `origin`: parsed direct connection target for Hyperdrive

Use `parentTimestamp` or `parentLsn` for point-in-time branch creation. Use `expiresAt` for short-lived dev/test branches that should self-clean.

## Development Stage Pattern

Use Neon for development by default. The cost-control pattern is one shared development Neon project, with cheap copy-on-write branches for `dev_*` and PR stages.

Recommended:

- `dev_shared` owns the shared development Neon project.
- Every developer, PR, or test stage creates only a branch, Hyperdrive, and Worker.
- PR cleanup destroys branches and app resources, not the shared project.
- Production can use Neon too, but protect production branches and be deliberate about restore windows, project limits, and backups.

```ts
import * as Alchemy from "alchemy";
import * as Cloudflare from "alchemy/Cloudflare";
import * as Drizzle from "alchemy/Drizzle";
import * as Neon from "alchemy/Neon";
import * as Effect from "effect/Effect";

export const NeonDb = Effect.gen(function* () {
  const { stage } = yield* Alchemy.Stack;
  const previewExpiresAt = process.env.PREVIEW_EXPIRES_AT;

  const schema = yield* Drizzle.Schema("app-schema", {
    schema: "./src/schema.ts",
    out: "./migrations",
  });

  const project =
    stage === "prod"
      ? yield* Neon.Project("app-db", {
          region: "aws-us-east-1",
          historyRetentionSeconds: 604800,
        })
      : stage === "dev_shared"
        ? yield* Neon.Project("app-db", {
            region: "aws-us-east-1",
          })
        : yield* Neon.Project.ref("app-db", { stage: "dev_shared" });

  const branch = yield* Neon.Branch("app-branch", {
    project,
    protected: stage === "prod",
    expiresAt: stage.startsWith("pr-") ? previewExpiresAt : undefined,
    migrationsDir: schema.out,
  });

  return { project, branch, schema };
});
```

Reference `dev_shared` from non-production stages and create branches there. Do
not introduce a long-lived staging release gate unless the user explicitly asks
for one.

Deploy the owning stage first:

```sh
pnpm exec alchemy deploy --stage dev_shared
pnpm exec alchemy deploy --stage pr-147
```

If the reference target does not exist, plan fails. Do not work around that by creating one project per PR.

## Hyperdrive Integration

Use the direct Neon origin behind Hyperdrive:

```ts
export const Hyperdrive = Effect.gen(function* () {
  const { branch } = yield* NeonDb;

  return yield* Cloudflare.Hyperdrive("app-hyperdrive", {
    origin: branch.origin,
  });
});
```

Rules:

- Use `branch.origin` for stage branches.
- Use `project.origin` only for the default branch.
- Do not put `pooledConnectionUri` behind Hyperdrive; Hyperdrive already pools.
- Workers that use `pg` or Drizzle Postgres need `nodejs_compat`.

## Drizzle Migrations

Use `Drizzle.Schema` and wire `schema.out` to `Neon.Branch.migrationsDir`:

```ts
const schema = yield* Drizzle.Schema("app-schema", {
  schema: "./src/schema.ts",
  out: "./migrations",
});

const branch = yield* Neon.Branch("app-branch", {
  project,
  migrationsDir: schema.out,
});
```

Alchemy's Drizzle flow:

1. Imports the TypeScript schema module.
2. Uses Drizzle Kit APIs to generate migration SQL under `out`.
3. `Neon.Branch` applies pending SQL transactionally.
4. Applied migrations are recorded in `neon_migrations` by default.

Do not run a separate `drizzle-kit generate` step in CI when this stack owns migration generation.

## CI And Secrets

Use `NEON_API_KEY` as a GitHub secret:

```yaml
env:
  NEON_API_KEY: ${{ secrets.NEON_API_KEY }}
```

For GitHub credentials-as-code, load `github.md` and write the key as `GitHub.Secret`, not `GitHub.Variable`.

Use explicit stages in CI:

```yaml
env:
  STAGE: ${{ github.event_name == 'pull_request' && format('pr-{0}', github.event.number) || (github.ref == 'refs/heads/main' && 'prod' || format('dev_{0}', github.run_id)) }}
```

On PR close, destroy only the PR stage:

```sh
pnpm exec alchemy destroy --stage "$STAGE" --yes
```

Guard `prod` and `dev_shared` before cleanup.

## Gotchas

- Do not create a Neon project for every dev, test, or PR stage; create branches off a shared project.
- Deploy the shared owning stage before any stage that uses `Neon.Project.ref`.
- Use `branch.origin`, not `branch.pooledConnectionUri`, behind Cloudflare Hyperdrive.
- Branches are cheap and copy-on-write, but old branches can increase storage usage. Use CI cleanup or a stable `expiresAt` value supplied by CI for temporary branches.
- Do not compute `expiresAt` from `Date.now()` inside the stack; it will drift on every plan.
- Deleting a branch deletes its databases, roles, and compute. Deleting a project deletes everything under it.
- `region`, `pgVersion`, default branch name, role name, database name, and org ID are create-only or replacement-sensitive.
- `enableLogicalReplication` can be turned on, but Neon does not support turning it off cleanly.
- If branching from a timestamp, the timestamp must be inside the project's restore window.
- Protect production branches and avoid destroy automation for production or shared development projects.

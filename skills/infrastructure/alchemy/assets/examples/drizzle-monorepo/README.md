# Drizzle monorepo example: D1 and Neon/Postgres

## What is implemented

A root Alchemy stack deploys an API and a minimal Vite browser app. `packages/contracts` has browser-safe runtime schemas. `packages/notes` has a pure title rule, a server service contract, and two feature-owned implementation Layers. Both implement the same HTTP handler; the Postgres host adds its compatibility flag. The browser calls only public `/health`; protected `/notes` GET/POST routes require `APP_API_TOKEN` and are for one shared demonstration dataset.

This is a source-complete demonstration with explicit setup still required. It is not a ready-to-deploy production starter, a multi-tenant identity system, or a tested D1-to-Postgres migration. Do not put the bearer token in the browser. The body decoder buffers input, so production deployment needs a suitable ingress size limit. Query errors are deliberately sanitized; production diagnostics and detailed constraint mapping remain to be added.

## Versions and evidence

This workspace uses Alchemy and providers 2.0.0-beta.87, Effect 4.1.4, and Drizzle ORM/Kit 1.0.0-rc.5. Both SQL dialects have committed migrations and snapshots. The root guard checks that the selected migration exists before deployment.

## First setup

From this workspace root:

```sh
pnpm install --frozen-lockfile
pnpm typecheck
pnpm test:unit
pnpm test:guards
pnpm test:local
```

The local test uses Bun, an isolated D1 stage and a synthetic API credential. After editing a schema run the corresponding db:generate command and review both SQL and snapshot. The Postgres variant is typechecked; running it needs its own database and provider configuration.

Copy `.env.example` to `.env` and set a non-empty local `APP_API_TOKEN`; do not commit it. The CLI's local/dev command still starts real local processes. Inspect the toolchain and graph before treating any dev command as cloud-free.

```sh
# Run from THIS workspace root; do not cd into apps/api for these commands.
pnpm dev --stage dev-notes-example
```

Live plan/deploy uses the same root convention but requires actual account/profile/stage authorization. `Alchemy.localState()` is intentional for a disposable example. Adopt an appropriate shared state backend before operating a continuing team/CI environment; switching state is not just replacing one line in a deployed project.

## Trying the alternate Postgres implementation

```sh
pnpm db:generate:postgres
# Review and commit PostgreSQL SQL/snapshots, distinct from the SQLite history.
pnpm dev:postgres --stage dev-notes-postgres-example
```

This path declares a Neon project/branch and Hyperdrive. Do not assume `dev` makes every provider operation local; verify local-provider coverage and any real targets first. The example region is illustrative, not a data-residency recommendation. Production should distinguish migration/admin credentials from runtime permissions.

`alchemy.postgres.run.ts` deploys **NotesPostgresExample**; `alchemy.run.ts` deploys **NotesExample**. Switching files does not migrate or delete the other database. Do not deploy both to an existing production environment as an experiment.

## Manual acceptance checks after a local environment is verified

Check public health from the browser. Call `/notes` without a token and expect 401. With the local demo token, POST a JSON body containing a non-blank title, then GET and verify persistence. Check malformed JSON, blank titles, and oversized titles return a client error, not a SQL diagnostic. Restart the local runtime and check data again. Run the same service contract checks against both database variants.

These are required acceptance checks, **not** completed results. Also inspect the browser build to verify it contains only the public URL/contracts and no Alchemy, Drizzle, database driver, or token. A dependency graph or source-text scan alone is not proof of the emitted bundle.

## Where to extend

[Drizzle integration](../../../references/drizzle.md) covers relations, Effect schemas, runtime scope, migration ownership, and database-specific caveats. [Monorepos](../../../references/monorepos.md) covers multi-stack variants and build invalidation. [Colocation](../../../references/infra-colocation.md) explains when to share one database Layer rather than giving each feature a database. The [iteration checklist](../../../references/iteration-checklist.md) distinguishes implemented guidance from remaining execution proof.

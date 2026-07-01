# Strict Best Practices, Do/Don't, Gotchas

Load this before finalizing any nontrivial Alchemy work.

## Hard Safety

- Do not run `pnpm exec alchemy deploy` or `pnpm exec alchemy destroy` without explicit user confirmation.
- Do not use `--yes` locally unless the user explicitly asked for it.
- Do not destroy `prod` from CI or scripts without a hard guard.
- Do not ask users to export Cloudflare env vars for normal local auth; use `pnpm exec alchemy login` profiles. CI may use env secrets.
- Do not commit `.alchemy/`.
- Do not commit raw secrets, generated credentials, or unredacted connection strings.

## Package Manager

- Use pnpm for new projects, commands, examples, CI, and local scripts.
- Prefer `pnpm exec alchemy ...` when invoking the Alchemy CLI from docs or automation.
- Prefer Vitest for test examples in pnpm projects.
- Do not introduce Bun, `bun install`, `bun alchemy`, or `alchemy/Test/Bun` unless the existing repo already uses Bun.

## Docs And Versions

- Alchemy v2 is beta and changes quickly. Check live official docs for exact props, CLI flags, and generated provider pages.
- Prefer source examples from `alchemy-run/alchemy-effect` when docs and package behavior differ.
- Do not copy Alchemy v1 async/await patterns into v2 stacks.
- Do not rely on old local skills or stale memory for provider props.

## Stack And State

Do:

- Export one default `Alchemy.Stack` per stack entrypoint.
- In monorepos, prefer one root stack until independent package lifecycles justify multi-stack references.
- Use `Cloudflare.state()` for team/CI Cloudflare projects.
- Keep `State.localState()`/`Alchemy.localState()` limited to examples, local experiments, and tests unless the user explicitly wants local state.
- Return operator/test-friendly outputs.

Don't:

- Split stacks prematurely.
- Split monorepo stacks just because packages live in separate directories.
- Use ad hoc environment variables as a second environment model.
- Change logical IDs casually.
- Force outputs into strings at declaration time.

## Monorepos

Do:

- Use `references/monorepos.md` before changing workspace layout, package exports, stack boundaries, or CI filters.
- Use `Cloudflare.Vite.rootDir` when a root stack builds a frontend package.
- Keep browser imports on client subpaths such as `@acme/api/Client`.
- Use `pnpm --filter <pkg> exec alchemy ...` for package-owned stacks.
- Deploy upstream stacks first and destroy downstream stacks first in multi-stack setups.

Don't:

- Let frontend bundles import Worker, Stack, provider, or database modules.
- Hide stage-pinning decisions. Use `yield* Backend` for same-stage references and `Backend.stage.prod` only when intentionally pinned.
- Expect cross-stack references to create upstream resources.

## Providers

Do:

- Load the provider-specific reference first: `cloudflare.md`, `drizzle.md`, `neon.md`, `planetscale.md`, or `github.md`.
- Merge every needed provider Layer exactly once.
- Add `Drizzle.providers()` when using `Drizzle.Schema`.
- Add `Planetscale.providers()` or `Neon.providers()` when using those resources.
- Keep provider sets minimal.

Don't:

- Use a resource without its provider and then silence the type error.
- Use provider CLI wrappers when Alchemy has native resources.

## Workers And Phases

Do:

- Bind resources in Worker init.
- Provide matching binding live layers.
- For beta.58 capability resources, use namespaced bindings such as `Cloudflare.R2.ReadWriteBucket`, `Cloudflare.KV.ReadWriteNamespace`, and `Cloudflare.Queues.WriteQueue` instead of old single-resource `.bind` helpers.
- Build shared Effect services as Layers and provide them at Worker init.
- Keep request/event work in returned runtime handlers.
- Resolve `Config` in init.
- Use `InferEnv` for async Workers.

Don't:

- `yield* Config` only inside `fetch`.
- Open raw database connections in Worker init.
- Run request-dependent effects during init.
- Put runtime-only `Alchemy.RuntimeContext` calls in plantime/init.
- Scatter `Effect.provide` through request/business logic.

## Cloudflare

Do:

- Use `Cloudflare.Vite` for Vite frameworks.
- Use `Cloudflare.StaticSite` for arbitrary build commands.
- Enable `nodejs_compat` for drivers/frameworks that need Node APIs.
- Use tagged class plus `.make(props, impl)` for circular Worker/DO/Lambda references; in beta.58 layer-form Worker/Container props live on `.make`.
- Retry first workers.dev checks in tests; subdomain propagation can lag.

Don't:

- Hand-roll env binding types when Alchemy can infer them.
- Add Workers to a minimal starter if the user only asked for the first bucket stack.
- Treat local dev as full emulation. `pnpm exec alchemy dev` uses real cloud resources and local Worker code.

## Hyperdrive And Databases

Do:

- Put Hyperdrive in front of Worker database access.
- Prefer Neon for development Postgres unless the repo or user explicitly chooses another provider.
- Use direct Neon origins behind Hyperdrive, not pooled Neon URIs.
- Create dev/PR Neon branches off a shared long-lived project when practical.
- For PlanetScale Postgres, use a `PostgresRole` for Hyperdrive origin.
- For PlanetScale MySQL, use a `MySQLPassword` for Hyperdrive origin.
- Use one raw driver connection per request when not using Drizzle.postgres.
- Close raw connections in `finally`/`ensuring`.
- Put Drizzle/raw clients behind a service Layer when multiple modules need database access.
- Use redacted values until the driver boundary.

Don't:

- Create a database project/cluster per dev, test, or PR stage when a branch off a shared project is enough.
- Forget to deploy the shared Neon project-owning stage before `Neon.Project.ref(...)` stages.
- Use a production branch without protection policy.
- Forget that PlanetScale MySQL password plaintext cannot be recovered.
- Assume MySQL and Postgres Drizzle runtime patterns are identical.

## Drizzle

Do:

- Wire `Drizzle.Schema(...).out` into `migrationsDir`.
- Review/commit generated migrations for team workflows unless the repo intentionally treats them as deploy artifacts.
- Pass `relations` to `Drizzle.postgres` when using relational `db.query.*`.
- Use `dialect: "mysql"` for MySQL schema generation when using `Drizzle.Schema` for MySQL flows.
- Use mysql2 `disableEval: true` in Workers.

Don't:

- Run a separate `drizzle-kit generate` step in CI if Alchemy owns migration generation.
- Delete migration directories because `Drizzle.Schema` was removed from the stack.
- Expect relations to generate FK SQL; define FKs in tables.

## References And Shared Resources

Do:

- Deploy upstream stages/stacks first.
- Use `Resource.ref` for single resources.
- Use typed stack handles for whole-stack outputs.
- Let PR stages own branches/roles/Hyperdrive/Workers while referencing long-lived database projects.

Don't:

- Expect a reference to create anything.
- Destroy a PR stage and expect referenced shared dev/prod resources to be deleted.
- Hide reference misses; fix by deploying upstream or correcting `{ stack, stage, id }`.

## CI

Do:

- Compute explicit stage in workflows.
- Use remote state.
- Manage credentials as code when feasible.
- Load `references/github.md` before writing GitHub provider resources.
- Scope Cloudflare CI tokens to needed services.
- Add cleanup for PR close.
- Include `pull-requests: write` only when PR comments are used.
- Use stable logical IDs for GitHub comments and credentials.

Don't:

- Let GitHub runners fall back to `dev_$USER`.
- Use a personal root/admin credential for normal app deploys.
- Create a new preview comment each push; keep the logical ID stable.

## GitHub

Do:

- Add `GitHub.providers()` whenever using `GitHub.Comment`, `Repository`, `Secret`, `Variable`, `Webhook`, or event subscriptions.
- Prefer `gh auth token` or a stored PAT locally; use `GITHUB_ACCESS_TOKEN`/`GITHUB_TOKEN` in CI.
- Use `GitHub.Secret` for sensitive values and `GitHub.Variable` only for non-sensitive config.
- Use `Redacted` for every secret value that does not already come from a redacted provider output.
- Treat repositories as retained by default; require explicit removal policy and `delete_repo` permission before deleting.
- Use webhook secrets for `GitHub.events(...).subscribe(...)`.

Don't:

- Put secrets into `GitHub.Variable`.
- Assume `GITHUB_TOKEN` can manage repository secrets or webhooks outside its workflow permissions.
- Delete PR comments by default; discussion history is preserved unless `allowDelete: true`.
- Use bulk `GitHub.Secrets`/`Variables` with duplicate keys in the same stack scope.

## Custom Providers

Do:

- Write convergent `reconcile`.
- Use `Effect.fn("Provider.Resource.operation")` for provider lifecycle bodies by default.
- Treat delete 404/not found as success.
- Implement `read` for adoption/recovery when possible.
- Guard unresolved inputs in `diff`.
- Wrap SDK/cloud failures in typed errors and use `Effect.tryPromise`.
- Use `Schedule`/`Effect.retry` only for retryable transient failures.
- Use `Redacted` for secrets.
- Test create/update/replace/delete/adoption paths.

Don't:

- Put lifecycle-managed cloud entities in `Action`.
- Treat Action side effects as idempotent automatically.
- Leak raw SDK errors or unredacted request/response payloads.
- Use `Effect.promise` for SDK calls whose errors should be typed/reportable.
- Use `Effect.fnUntraced` by default for new userland provider/action/service code.

## Effect Infrastructure

Do:

- Load `references/effect-infra.md` when writing Effect Workers, provider lifecycle code, Actions, database services, retries, observability, or app-level Effect tests.
- Model shared infrastructure capabilities as `Context.Service` plus named Layers.
- Provide Layers at app, Worker, stack, test, or subsystem boundaries.
- Use `Schema` for untrusted config, webhook, API, and database-result boundaries.
- Use `Schedule` instead of manual retry/sleep/poll loops.

Don't:

- Create SDK/database clients inside request handlers when a layer/init boundary can own them.
- Use `orDie` for config, cloud API, permission, network, or database errors operators can fix.
- Duplicate layer factories across call sites.
- Replace Alchemy stack/provider tests with generic Effect tests; use each for its own surface.

## Finish Checklist

- For explicit reviews, audits, pre-deploy checks, or broad infra changes, run `references/audit-checklist.md`.
- Typecheck passes or failure is reported.
- Existing tests pass or skipped failures are explained.
- `pnpm exec alchemy plan`/dry-run was run for infra changes when safe.
- No deploy/destroy was run without approval.
- Stage/profile assumptions are explicit.
- Generated migrations are intentional.
- New secrets/config are bound in init and documented.
- Stack outputs support verification.

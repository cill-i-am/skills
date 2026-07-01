# Audit Checklist

Use this file when reviewing an Alchemy diff, finishing a nontrivial infra change, preparing for CI/prod deploy, or answering an explicit audit/checklist request.

This is a router plus finalization checklist. Do not load every reference by default; identify touched surfaces and load only the narrow files needed.

## How To Run

1. Identify touched surfaces from the request, diff, files, stack outputs, package scripts, and CI workflow.
2. Load the matching references from the routing table.
3. Apply universal checks.
4. Apply surface-specific checks only for touched surfaces.
5. Report blockers, warnings, verification status, skipped checks, and assumptions.

## Reference Routing

- Stack/core model/state/refs/outputs: `core-model.md` and `gotchas.md`.
- Cloudflare Workers, Vite, StaticSite, storage, bindings, Hyperdrive, local dev: `cloudflare.md`; add `cloudflare-platform.md` for less common resources.
- Drizzle, Neon, PlanetScale, Hyperdrive database composition: `database-patterns.md`, plus the provider-specific `drizzle.md`, `neon.md`, or `planetscale.md`.
- GitHub resources, PR comments, secrets, variables, CI credential stacks, webhooks: `github.md`.
- pnpm workspaces, package boundaries, root vs package stacks, CI filters: `monorepos.md`.
- Effect Workers, Layers, typed provider errors, schedules, observability, app-level Effect tests: `effect-infra.md`.
- Custom providers, Actions, custom state stores: `provider-extension.md`.
- CLI, tests, stage/profile operations, CI deploy/destroy: `operations-ci-testing.md`.
- Copy-adaptable patterns: `code-samples.md`.

## Universal Checks

- Stage/profile assumptions are explicit and match the code, commands, and CI.
- No deploy or destroy was run without explicit approval.
- Logical IDs are stable unless replacement is intentional.
- Providers are registered exactly for the resources used.
- Remote state is used for team/CI cloud projects; `.alchemy/` is not committed.
- Outputs are useful for verification and operations.
- Secrets are redacted, bound in init when needed, and never logged.
- Migrations are intentional and match the repo workflow.
- Typecheck/tests were run or skipped with a concrete reason.
- `pnpm exec alchemy plan`/dry-run was run for infra changes when safe.

## Surface Checks

Stack and state:

- Default-exported stack entrypoint is clear.
- Stage controls resource ownership, production guards, preview naming, and database branch selection.
- References point to already-deployed upstream stages/stacks.
- Destroy order is safe for downstream references.

Cloudflare:

- Effect Workers bind resources in init and provide matching binding live layers.
- Async Workers use `env` plus `Cloudflare.InferEnv<typeof Worker>`.
- `Config` values needed at runtime are resolved in init.
- `nodejs_compat` is enabled only when drivers/frameworks need it.
- Hyperdrive receives direct provider origins, not pooled URLs.
- Local dev assumptions note that `alchemy dev` uses real cloud resources.

Databases:

- Neon is the default development Postgres unless another provider is chosen.
- Dev/PR stages use branches from shared projects when practical.
- Production branches are protected.
- Drizzle migration generation/application is owned by one clear workflow.
- Raw connections are request-scoped and closed.
- Redacted connection strings stay redacted until the driver boundary.

GitHub and CI:

- CI sets an explicit stage and cannot fall back to `dev_$USER`.
- Cleanup cannot destroy `prod`.
- PR comments use stable logical IDs.
- Secrets go to `GitHub.Secret`; non-sensitive config goes to `GitHub.Variable`.
- Tokens are scoped to needed resources.
- Credential stacks use admin profiles only where necessary.

Monorepos:

- A root stack is preferred unless package ownership/deploy cadence justifies splitting.
- Frontend bundles do not import Worker, stack, provider, or database modules.
- Workspace dependencies use `workspace:*`.
- Package-level stacks use `pnpm --filter <pkg> exec alchemy ...`.
- Cross-stack references are same-stage by default unless intentionally pinned.

Effect infrastructure:

- Shared infrastructure is modeled as `Context.Service` plus named Layers.
- Layers are provided at app, Worker, stack, test, or subsystem boundaries.
- Provider/action/service operations use named `Effect.fn` unless tracing is intentionally suppressed.
- SDK/cloud/database failures are typed and retry only when retryable.
- Schedules replace manual retry/sleep/poll loops.

Custom providers and Actions:

- `reconcile` observes live state, creates only if missing, syncs drift, and returns fresh attributes.
- `delete` is idempotent and treats not-found as success.
- `read` supports adoption/recovery where the API allows it.
- `diff` guards unresolved inputs and marks replacements intentionally.
- Actions are input-hashed, retry-tolerant, and not used for lifecycle-managed infrastructure.

## Reporting

For review or audit requests, report:

- Findings first, ordered by severity, with file/line references when available.
- Open risks, assumptions, and skipped checks.
- Verification commands and results.
- A brief pass summary only after findings.

For implementation tasks, do not dump the checklist. Summarize only the checks that matter: commands run, plan/dry-run status, stage/profile assumptions, skipped verification, migrations, and deployment safety.

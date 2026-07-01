# Operations, CI, Testing

## CLI

General shape:

```sh
pnpm exec alchemy <command> [file] [options]
```

If no file is passed, the CLI looks for `alchemy.run.ts`.

Common options:

- `--stage <name>`: target stage. Defaults to `dev_$USER`.
- `--profile <name>`: credential profile where supported.
- `--env-file <path>`: load env vars.

Commands:

- `pnpm exec alchemy plan`: preview diff, no apply.
- `pnpm exec alchemy deploy`: plan, prompt, apply.
- `pnpm exec alchemy deploy --dry-run`: same as plan.
- `pnpm exec alchemy destroy`: plan all state for deletion, prompt, apply.
- `pnpm exec alchemy dev`: deploy infrastructure, run Workers locally with hot reload.
- `pnpm exec alchemy tail --filter Worker`: live logs.
- `pnpm exec alchemy logs --filter Worker --since 1h --limit 50`: historical logs.
- `pnpm exec alchemy login --configure`: rerun provider credential setup.
- `pnpm exec alchemy profile show`: inspect redacted credentials.
- `pnpm exec alchemy state ...`: inspect/operate on state where supported by current CLI docs.
- `pnpm exec alchemy cloudflare bootstrap`: manually bootstrap or repair Cloudflare remote state.
- `pnpm exec alchemy cloudflare create-token`: mint a standalone Cloudflare token.

Safety:

- Use `--yes` only in CI or after explicit operator choice.
- Use `plan`/`--dry-run` before risky deploys.
- Do not destroy a production stage from automation without a hard safety check.

## Stages

Common mapping:

- Local: default `dev_$USER`.
- Shared development resource owner, when needed: `dev_shared`.
- Production: `prod`.
- PR previews: `pr-<number>`.

CI stage expression:

```yaml
STAGE: ${{ github.event_name == 'pull_request' && format('pr-{0}', github.event.number) || (github.ref == 'refs/heads/main' && 'prod' || github.ref_name) }}
```

Cleanup must guard against `prod`:

```sh
if [ "$STAGE" = "prod" ]; then
  echo "ERROR: Cannot destroy prod environment"
  exit 1
fi
```

## Profiles And Login

Default profile is `default`. Credentials live in `~/.alchemy/profiles.json` plus provider-specific credential files under `~/.alchemy/credentials/<profile>/...`.

Use:

```sh
pnpm exec alchemy login
pnpm exec alchemy login --configure
pnpm exec alchemy login --profile prod --configure
pnpm exec alchemy profile show --profile prod
```

For Cloudflare local app deploys, do not tell users to export `CLOUDFLARE_ACCOUNT_ID` or `CLOUDFLARE_API_TOKEN` as the normal path. Alchemy login/profiles handle local credentials. CI is different and usually uses env secrets.

## CI Credentials As Code

Load `references/github.md` before creating or editing `stacks/github.ts`, PR comments, GitHub Actions secrets/variables, or webhook/event wiring.
Load `references/neon.md` before wiring Neon development database credentials, shared project branches, or `NEON_API_KEY` in CI.

Recommended Cloudflare/GitHub pattern:

1. Create `stacks/github.ts`.
2. Use an `admin` profile only for this stack.
3. Mint a scoped `Cloudflare.AccountApiToken`.
4. Write it directly to `GitHub.Secret`.
5. Write account ID as secret/variable.
6. Use the scoped token in Actions deploy/cleanup jobs.

Admin profile requirements:

- Global API Key, or
- Token with `User > API Tokens > Write` and `Account > API Tokens > Write`.

Do not use the admin profile for day-to-day app deploys.

Cloudflare token permissions should be trimmed to the app. Sensible Workers defaults include Workers Scripts Write, KV Write, R2 Write, D1 Write, Queues Write, Pages Write, Account Settings Write, Workers Tail Read, and Secrets Store Write if using `Cloudflare.state()` in CI.

Why Secrets Store Write matters: CI reads the Cloudflare state-store secret through an edge-preview Worker binding; mounting that binding requires write permission.

For Neon-backed development databases, set `NEON_API_KEY` as a GitHub secret and use explicit stages. Deploy the shared project-owning stage, usually `dev_shared`, before PR stages that use `Neon.Project.ref(...)`.

## PR Preview Comments

Use `GitHub.Comment` with a stable logical ID so pushes update the same comment:

```ts
if (process.env.PULL_REQUEST) {
  yield* GitHub.Comment("preview-comment", {
    owner: "your-org",
    repository: "your-repo",
    issueNumber: Number(process.env.PULL_REQUEST),
    body: Output.interpolate`
      ## Preview Deployed

      URL: ${worker.url}
    `,
  });
}
```

Add `GitHub.providers()` to the stack provider Layer when using GitHub resources.

## Testing

Prefer Vitest in pnpm projects:

```ts
import * as Test from "alchemy/Test/Vitest";
import { expect } from "vitest";

const { test, beforeAll, afterAll, deploy, destroy } = Test.make({
  providers: Layer.mergeAll(Cloudflare.providers(), Planetscale.providers()),
  state: Cloudflare.state(),
  stage: "test",
});

const stack = beforeAll(deploy(Stack), { timeout: 300_000 });

afterAll.skipIf(!process.env.CI)(destroy(Stack));
```

Use `alchemy/Test/Bun` only in repos that already use Bun as the test runtime.

Helpers:

- `test(name, effect)`: Effect-aware test.
- `beforeAll(effect)`: runs once and returns lazy accessor.
- `deploy(Stack, opts?)`: plan/apply stack and returns outputs.
- `destroy(Stack, opts?)`: teardown desired stack.
- `test.provider`: scratch in-memory provider lifecycle tests.

Test options:

- `providers`: required.
- `state`: defaults to local state.
- `profile`: optional.
- `stage`: defaults to `test`; override per PR or run.
- `dev`: local workerd mode for Cloudflare Workers.

Use `afterAll.skipIf(!process.env.CI)(destroy(Stack))` when local speed matters and CI must clean up. Use unique stages for parallel suites.

Workers.dev URL propagation can lag after first enable; retry 404/temporary 5xx in integration tests.

For app-level Effect service tests, use `@effect/vitest` patterns when the repo already includes or needs them. Keep `alchemy/Test/Vitest` for stack/provider/deploy tests; generic Effect tests do not validate Alchemy planning, provider lifecycle, state, or cloud cleanup behavior.

Use `TestClock` for code that depends on `Schedule`, retry backoff, polling, or timeouts.

## Local Dev

`pnpm exec alchemy dev`:

- Creates real cloud resources.
- Runs Workers locally in workerd.
- Hot-reloads app code.
- Preserves cloud-backed resources across reloads.

Set custom port:

```ts
dev: { port: 3000 }
```

Run tests locally through workerd:

```sh
ALCHEMY_DEV=1 pnpm vitest run test/integ.test.ts
```

or set `dev: true` in `Test.make` for local-only tests.

## Migration From v1

v1:

- `await alchemy("name")`
- top-level `await Resource(...)`
- `entrypoint`
- `await app.finalize()`

v2:

- default export `Alchemy.Stack(...)`
- `yield* Resource(...)` inside the stack
- `main`
- no `finalize`
- provider Layers

Keep async Worker handlers during migration:

```ts
export type WorkerEnv = Cloudflare.InferEnv<typeof Worker>;

export const Worker = Cloudflare.Worker("Worker", {
  main: "./src/worker.ts",
  env: { Bucket },
});
```

v1 state is not compatible with v2. Plan migrations carefully; destroy/adopt intentionally.

## Monorepos

Load `references/monorepos.md` before changing monorepo layout, package exports, stack boundaries, CI filters, cross-stack references, or frontend/backend workspace wiring.

Default stance:

- Prefer one root `alchemy.run.ts` and one deploy/destroy per stage.
- Use package-level stacks only when ownership or deploy cadence truly differs.
- Keep pnpm workspace dependencies explicit with `workspace:*`.
- Use `pnpm exec alchemy ...` at the workspace root or `pnpm --filter <pkg> exec alchemy ...` for package-level stacks.

## Operational Checklist

- For explicit audits or release readiness checks, load `audit-checklist.md` and apply the touched-surface checks.
- Confirm stage/profile before deploy/destroy.
- Use remote state for CI.
- Use scoped CI credentials.
- Add prod destroy guard.
- Use `plan` before apply.
- Tail logs after deploy when verifying runtime behavior.
- Return stack outputs that let tests/operators verify the deployment.

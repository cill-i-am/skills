# Cloudflare

Use this file for Cloudflare-specific Alchemy work. For deeper platform patterns after loading this file, use `cloudflare-platform.md`.

## Contents

- Provider setup
- State and authentication
- Workers
- Vite and StaticSite
- Storage and data resources
- Durable Objects, Queues, and Workflows
- Hyperdrive and databases
- CI and GitHub integration
- Local development and operations
- Gotchas

## Provider Setup

Always register the Cloudflare provider when using Cloudflare resources:

```ts
import * as Alchemy from "alchemy";
import * as Cloudflare from "alchemy/Cloudflare";
import * as Effect from "effect/Effect";

export default Alchemy.Stack(
  "MyApp",
  {
    providers: Cloudflare.providers(),
    state: Cloudflare.state(),
  },
  Effect.gen(function* () {
    const bucket = yield* Cloudflare.R2Bucket("Uploads");
    return { bucketName: bucket.bucketName };
  }),
);
```

Merge Cloudflare with only the other providers the stack actually uses:

```ts
import * as Drizzle from "alchemy/Drizzle";
import * as GitHub from "alchemy/GitHub";
import * as Planetscale from "alchemy/Planetscale";
import * as Layer from "effect/Layer";

providers: Layer.mergeAll(
  Cloudflare.providers(),
  Drizzle.providers(),
  Planetscale.providers(),
  GitHub.providers(),
)
```

## State And Authentication

Prefer `Cloudflare.state()` for team projects, CI, and anything that should be recoverable outside one laptop. It stores Alchemy state remotely in Cloudflare-owned resources.

Local setup:

```sh
pnpm exec alchemy login
pnpm exec alchemy login --configure
pnpm exec alchemy profile show
```

Do not tell users to export raw Cloudflare tokens for normal local development. Profiles are the default local auth model. CI is different: use scoped GitHub secrets or variables, ideally managed by an Alchemy GitHub credentials stack.

Use local state only for small solo experiments:

```ts
import * as State from "alchemy/State";

state: State.localState()
```

Keep `.alchemy/` out of git.

## Workers

Use async Worker style for existing Workers that already expect native Cloudflare `env` bindings:

```ts
export const Worker = Cloudflare.Worker("Worker", {
  main: "./src/worker.ts",
  compatibility: {
    flags: ["nodejs_compat"],
  },
  env: {
    Bucket,
    API_KEY: Config.redacted("API_KEY"),
  },
});

export type WorkerEnv = Cloudflare.InferEnv<typeof Worker>;
```

Use Effect Worker style when the Worker is built around Effect services and Alchemy bindings:

```ts
export default class Api extends Cloudflare.Worker<Api>()(
  "Api",
  { main: import.meta.filename },
  Effect.gen(function* () {
    const bucket = yield* Cloudflare.R2.ReadWriteBucket(Bucket);

    return {
      fetch: Effect.gen(function* () {
        yield* bucket.put("health.json", JSON.stringify({ ok: true }));
        return Response.json({ ok: true });
      }),
    };
  }).pipe(Effect.provide(Cloudflare.R2.ReadWriteBucketBinding)),
) {}
```

Rules:

- Bind resources in Worker init, not inside request handlers.
- Keep request-specific work inside returned handlers.
- Resolve `effect/Config` in init so Alchemy can bind secrets.
- Use `Cloudflare.InferEnv<typeof Worker>` for async Workers.
- Enable `nodejs_compat` when drivers or frameworks need Node APIs.
- For shared Effect services, load `effect-infra.md`; model bindings as Layers and provide them at Worker init.

## Vite And StaticSite

Use `Cloudflare.Vite` for Vite-based apps and frameworks:

```ts
const web = yield* Cloudflare.Vite("Web", {
  rootDir: "apps/web",
  compatibility: {
    flags: ["nodejs_compat"],
  },
  env: {
    VITE_API_URL: api.url.as<string>(),
  },
});
```

Use `Cloudflare.StaticSite` when the build is not a Vite app:

```ts
const docs = yield* Cloudflare.StaticSite("Docs", {
  command: "pnpm --filter docs build",
  outdir: "apps/docs/dist",
});
```

In monorepos, prefer a root stack plus `rootDir` or package-scoped build commands before splitting stacks.

## Storage And Data Resources

Common resources:

- `Cloudflare.R2Bucket` for object storage.
- `Cloudflare.KVNamespace` for low-write key-value data.
- `Cloudflare.D1Database` and D1 migration resources for SQLite-like relational data at the edge.
- `Cloudflare.Hyperdrive` for Worker database access to external Postgres/MySQL origins.
- `Cloudflare.Queue`, `QueueConsumer`, and `QueueSubscription` for background processing.
- `Cloudflare.VectorizeIndex`, AI Gateway, AI Search, Analytics Engine, Pipelines, and other platform resources as needed.

Example R2 binding:

```ts
export const Uploads = Cloudflare.R2Bucket("Uploads");

const uploads = yield* Cloudflare.R2.ReadWriteBucket(Uploads);
yield* uploads.put("file.txt", "hello");
```

Read the generated provider API page before using less common Cloudflare resources. Exact prop shapes move quickly.

## Durable Objects, Queues, And Workflows

Durable Objects:

```ts
export const Counter = Cloudflare.DurableObjectNamespace<CounterClass>(
  "Counter",
  { className: "Counter" },
);
```

Queues:

```ts
const queue = yield* Cloudflare.Queue("Jobs");

yield* Cloudflare.QueueConsumer("JobsConsumer", {
  queueId: queue.queueId,
  scriptName: worker.workerName,
  settings: {
    batchSize: 10,
    maxRetries: 3,
    maxWaitTimeMs: 5000,
  },
});
```

Workflows:

- Use Workflow resources for durable multi-step processes.
- Put external I/O inside workflow task steps so retries and replay stay correct.
- Bind secrets/resources in init and use them inside tasks.

## Hyperdrive And Databases

Put Hyperdrive in front of database access from Workers:

```ts
export const Hyperdrive = Effect.gen(function* () {
  const { role } = yield* PlanetscaleDb;

  return yield* Cloudflare.Hyperdrive("AppHyperdrive", {
    origin: role.origin,
    caching: { disabled: true },
  });
});
```

Use direct origins:

- Neon: direct branch/project origin, not pooled connection strings.
- PlanetScale Postgres: `Planetscale.PostgresRole.origin`.
- PlanetScale MySQL: `Planetscale.MySQLPassword.origin`.

For raw drivers, open one client per request and close it. Hyperdrive handles pooling outside the Worker.

When database access is used by more than one module, hide the Drizzle/raw client behind an Effect service Layer and expose repository/domain operations to handlers. Keep Hyperdrive binding in Worker init or the database layer, not scattered through request code.

## CI And GitHub Integration

Use scoped Cloudflare tokens in GitHub Actions, not personal admin tokens. For credentials-as-code, load `github.md`.

Typical CI env:

```yaml
env:
  ALCHEMY_PASSWORD: ${{ secrets.ALCHEMY_PASSWORD }}
  CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
  CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

If CI uses `Cloudflare.state()`, the token normally needs Secrets Store write permissions in addition to resource-specific permissions.

## Local Development And Operations

Use pnpm commands:

```sh
pnpm exec alchemy plan
pnpm exec alchemy dev
pnpm exec alchemy tail --filter Worker
pnpm exec alchemy logs --filter Worker --since 1h
```

`pnpm exec alchemy dev` creates or reuses real cloud resources and runs Worker code locally in workerd.

## Gotchas

- Do not run deploy or destroy without explicit confirmation.
- Do not commit `.alchemy/`, raw tokens, connection strings, or generated credentials.
- Do not guess advanced Worker, D1, Access, WAF, or DNS props. Read provider docs/source.
- Do not treat local dev as a full Cloudflare emulator.
- Do not put pooled database URIs behind Hyperdrive.
- Do not hand-roll binding types when `Cloudflare.InferEnv` or binding live layers apply.
- Keep logical IDs stable; changing them replaces resources.

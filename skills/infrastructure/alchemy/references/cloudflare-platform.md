# Cloudflare Platform

Cloudflare is the primary Alchemy v2 tutorial path. Use native Alchemy Cloudflare resources instead of shelling out to Wrangler except for explicit external operations such as uploading sample R2 objects in a tutorial.

## Stack Baseline

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
    const bucket = yield* Cloudflare.R2Bucket("Bucket");
    return { bucketName: bucket.bucketName };
  }),
);
```

Use `Cloudflare.state()` for shared state. Expect first run of `plan`, `deploy`, or `dev` to prompt for state-store bootstrap.

## Worker Styles

Effect style is best for new Alchemy-native Workers:

- Resource modules export declarations or platform tags.
- Worker init binds resources and constructs services.
- Runtime handlers perform request/event work.
- Provide binding live layers.

Async style is best for existing Workers:

```ts
export const Worker = Cloudflare.Worker("Worker", {
  main: "./src/worker.ts",
  env: { Bucket, API_KEY: Config.redacted("API_KEY") },
});

export type WorkerEnv = Cloudflare.InferEnv<typeof Worker>;
```

Async handlers import `WorkerEnv` and use `env.Bucket`, `env.API_KEY`, etc.

## Worker Props To Check In Provider Docs

Common `Cloudflare.Worker` props include:

- `name`
- `url`
- `main` or `script`
- `assets`
- `env`
- `compatibility.date`
- `compatibility.flags`, including `nodejs_compat`
- `observability`
- `limits`
- `placement`
- `dev.port`
- routes/subdomain options

Do not guess exact prop shape for advanced Worker options. Open the generated provider page or source.

## Vite And Static Sites

Use `Cloudflare.Vite` for Vite-built frameworks: React, Vue, Astro, TanStack Start, SolidStart, Nuxt, SSR and SPAs.

```ts
const site = yield* Cloudflare.Vite("Website", {
  rootDir: "frontend",
  compatibility: { flags: ["nodejs_compat"] },
  env: { VITE_API_URL: backend.url.as<string>() },
});
```

`Cloudflare.Vite` hashes input files and lockfiles to skip unchanged builds. Use `memo.include` to narrow a large project. For SPAs, configure asset fallback options from provider docs. For custom pipelines, use:

```ts
const blog = yield* Cloudflare.StaticSite("Blog", {
  command: "hugo --minify",
  outdir: "public",
});
```

## R2, KV, D1

R2:

- Use `Cloudflare.R2Bucket`.
- Bind with the least-privilege beta.58 capability: `Cloudflare.R2.ReadBucket(Bucket)`, `Cloudflare.R2.WriteBucket(Bucket)`, or `Cloudflare.R2.ReadWriteBucket(Bucket)`.
- Provide the matching native or HTTP Layer, such as `Cloudflare.R2.ReadWriteBucketBinding` or `Cloudflare.R2.ReadWriteBucketHttp`.
- Catch `R2Error` or convert to declared API errors.

KV:

- Use `Cloudflare.KVNamespace`.
- Bind with the least-privilege beta.58 capability, such as `Cloudflare.KV.ReadWriteNamespace(Namespace)`.
- Provide the matching native or HTTP Layer, such as `Cloudflare.KV.ReadWriteNamespaceBinding`.
- Good fit for low-write config/session-ish data, not relational queries.

D1:

- Use generated API docs for `D1Database`, `D1Migrations`, `D1DatabaseBinding`, import/export/clone flows.
- For Drizzle with D1, confirm current D1 migration support in generated docs. Do not transfer Neon/PlanetScale assumptions blindly.

## Durable Objects

Regular DOs use `Cloudflare.DurableObjectNamespace<Self>()(...)`.

Patterns:

- Put the class/tag in its own module when other Workers need to bind to it.
- Resolve `Cloudflare.DurableObjectState` in the outer init Effect when services or Layers need storage; use the captured state in runtime methods.
- Cross-worker binding requires the correct type parameter/script identity from the tutorial.
- Only the hosting Worker provides the DO runtime layer.
- `Counter.from(Self)` is preferred inside Layers when the DO should bind to the containing Worker script.

Use `RpcDurableObjectNamespace` when the DO surface is an Effect RPC group and you want typed RPC clients instead of manual method bridging.

## Queues

Use:

- `Cloudflare.Queue` for the queue.
- `Cloudflare.Queues.WriteQueue(queue)` for a runtime sender.
- `Cloudflare.Queues.WriteQueueBinding` for a native Worker binding, or `Cloudflare.Queues.WriteQueueHttp` when the sender runs outside native Worker bindings.
- `Cloudflare.QueueConsumer` or `Cloudflare.messages(queue).subscribe(...)` for consumers.
- `QueueSubscription` for platform event subscriptions into a queue.

The Effect stream shape gives ack/retry semantics through the provider; still write idempotent consumers.

## Workflows

Use `Cloudflare.Workflow<Self>()(...)` for durable multi-step orchestration.

Strict rule: wrap I/O in workflow `task` steps so retries/replay semantics are correct. Bind resources/secrets in workflow init, then use them inside tasks.

`Alchemy.Secret("NAME")` can bind secrets for workflows. For Worker `Config`, prefer `effect/Config` in init.

## Containers

Cloudflare Containers are long-lived processes paired with Durable Objects. Use the tutorial for exact current shape. Expect typed RPC or HTTP proxy methods on the DO side and container image/bundle configuration in the resource.

## AI Gateway And AI Search

AI Gateway:

- Use `Cloudflare.AiGateway` plus binding/client resources.
- The binding can expose typed Effect LanguageModel layers.
- Use Gateway for provider observability, caching, rate limits, logs, and BYOK provider configs.

AI Search/AutoRAG:

- `Cloudflare.AiSearch` is a convenience construct that creates the common pipeline resources.
- Source can be R2 or a crawl URL.
- Bind the instance into a Worker for typed `ask`/search style runtime calls.
- Drop to `AiSearchInstance`, namespace, token, and binding resources when the helper is too opinionated.

## Artifacts, RPC, HTTP APIs

Artifacts support Git-compatible versioned repositories. Use the Artifacts tutorial for repository APIs and Durable Object metadata.

For larger APIs, prefer Effect `HttpApi` or Effect RPC over hand-rolled route parsing:

- Define schemas outside the Worker.
- Construct handler groups/layers in init.
- Return `fetch` as an `HttpEffect`.
- Provide platform/router/serialization layers as the guide requires.

## Circular Bindings

Use tagged-class platform declarations plus `.make(...)` implementations when Worker A and Worker B bind each other.

```ts
export class A extends Cloudflare.Worker<A, Cloudflare.WorkerShape>()("A") {}

export const ALive = A.make({ main: import.meta.filename }, Effect.gen(function* () {
  const b = yield* Cloudflare.Worker.bind(B);
  return { fetch: Effect.gen(function* () { return yield* b.fetch(req); }) };
}));
```

The stack imports both tags and both live layers, then provides them with `Layer.mergeAll(...)`. In beta.58 layer-form Worker and Container props live on `.make(props, impl)`; inline `Cloudflare.Worker("A", props, impl)` remains supported.

## Local Dev

`pnpm exec alchemy dev` deploys infrastructure to the cloud while Workers run locally in workerd with hot reload. Use `dev.port` for custom ports.

In monorepos, keep Worker local-dev scope to the owning package with `cwd` so generated files, `.alchemy/out`, and sibling app outputs do not cause restart loops. For Vite frontends that call local Workers, pair a stable API Worker `dev.port` with frontend `dev.env`; keep deploy/build env pointed at the deployed API URL.

Prove the local path in a browser before calling it working: API health on the local Worker port, frontend network traffic to that local URL, and one HMR edit that updates without a full stack restart.

For tests, use `Test.make({ dev: true })` or `ALCHEMY_DEV=1` to run Workers locally within the test process.

## Logs And Observability

Use `pnpm exec alchemy tail --filter Worker` for live logs and `pnpm exec alchemy logs --filter Worker --since 1h` for historical logs. Provider `tail`/`logs` support varies by resource.

Effect emits OpenTelemetry. Exporter/dashboards/alarms can be declared as Layers/resources when the stack needs operational infrastructure in code.

## Cloudflare Provider Catalog

The Cloudflare provider is broad. Generated docs are the source of exact props. Category families in current source include:

- Account, API Tokens, IAM, Organizations, resource sharing, tags.
- Workers, Worker routes, cron, RPC Workers, Durable Objects, Workers for Platforms.
- Website: Vite and StaticSite.
- Storage/data: R2, KV, D1, Hyperdrive, Queues, R2 Data Catalog, Vectorize, Pipelines, Analytics Engine.
- AI: AI Gateway, AI Search, AI Security.
- App security: API Shield, Bot Management, Firewall, RateLimit, Schema Validation, Token Validation, Turnstile, Page Shield, WAF-adjacent settings.
- Zero Trust: Access, Gateway, Devices, DLP, Tunnels, Risk Scoring.
- DNS/domains: DNS records/settings, zones, regional hostnames, custom hostnames, registrar, Web3.
- Media/email: Images, Stream, Calls/Realtime, Email Routing and sending.
- Networking/performance: Argo, Cache, Load Balancer, Magic Transit, Spectrum, Waiting Room, VPC service.
- Secrets and state: Secrets Store, StateStore.

When adding an uncommon Cloudflare resource, read its generated provider page and source JSDoc before writing code.

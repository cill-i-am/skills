# Cloudflare

Use this file for Cloudflare applications. Open the narrow current guide and generated provider API before writing exact props; the provider includes a large reference-only catalog beyond the common application primitives.

## Baseline

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
    const bucket = yield* Cloudflare.R2.Bucket("Uploads");
    return { bucketName: bucket.bucketName };
  }),
);
```

`Cloudflare.state()` is the normal team/CI state store. First-run bootstrap creates state infrastructure and credentials, so it requires confirmation. Use a distinct state worker name only when account/team ownership requires isolation.

## Application Router

| Need | Reach for |
| --- | --- |
| HTTP, RPC, cron, queue, or application compute | Worker |
| Strongly consistent keyed state, WebSockets, coordination | Durable Object |
| Arbitrary/long-running process | Container paired with a Durable Object |
| Durable multi-step work | Workflow |
| Pure Vite/full-stack Vite application | `Cloudflare.Vite` |
| Arbitrary static build output | `Cloudflare.StaticSite` |
| SQLite relational data | `Cloudflare.D1.Database` |
| Edge configuration/cache lookups | `Cloudflare.KV.Namespace` |
| Object storage | `Cloudflare.R2.Bucket` |
| External Postgres/MySQL | Hyperdrive plus the provider origin |
| Background work | `Cloudflare.Queues.Queue` |
| Internal service call | schemaless Worker/Durable Object binding |
| Public typed API | Effect RPC or Effect HTTP |

Cloudflare frontends are Workers-first. Use Pages only when the current project has a specific Pages constraint.

## Worker

```ts
import * as Cloudflare from "alchemy/Cloudflare";
import * as Effect from "effect/Effect";
import * as HttpServerResponse from "effect/unstable/http/HttpServerResponse";
import { Uploads } from "./resources.ts";

export default Cloudflare.Worker(
  "Api",
  { main: import.meta.url },
  Effect.gen(function* () {
    const bucket = yield* Cloudflare.R2.ReadWriteBucket(Uploads);

    return {
      fetch: Effect.gen(function* () {
        const object = yield* bucket.get("health.json");
        return HttpServerResponse.text(object === null ? "missing" : "ok");
      }),
    };
  }).pipe(Effect.provide(Cloudflare.R2.ReadWriteBucketBinding)),
);
```

Initialization binds resources and builds instance-scoped services. Returned handlers own request/event work and request scope. A finalizer added to Worker initialization cannot rely on an isolate teardown hook; acquire resources requiring cleanup inside an event scope.

Use class identity plus `.make(...)` when consumers need the Worker's RPC shape without importing its implementation or when bindings are circular. For async Worker modules, declare `env` on the resource and derive `Cloudflare.InferEnv<typeof Worker>` rather than hand-writing binding types.

## Bindings

Use canonical namespaced resources and least-privilege capabilities:

- R2: `ReadBucket`, `WriteBucket`, or `ReadWriteBucket` plus native/HTTP Layer.
- KV: read/write namespace capability plus matching Layer.
- Queues: `WriteQueue` plus `WriteQueueBinding` or `WriteQueueHttp`.
- Workers/Durable Objects: typed binding clients for schemaless RPC.
- Hyperdrive: current bind API and runtime Layer from the narrow guide.

Native Worker bindings stay on Cloudflare's in-account fabric. HTTP Layers are useful for non-Worker hosts or local/runtime topologies that cannot use a native binding. Keep the choice at the platform boundary.

## Data

### R2

Use `Cloudflare.R2.Bucket` and grant the narrowest read/write capability. Model object absence explicitly and handle typed `R2Error` values. Use streaming bodies for large objects. Review CORS, custom domains, lifecycle rules, event notifications, Sippy, and data-catalog resources only when the use case needs them.

### KV

Use `Cloudflare.KV.Namespace` for read-heavy, eventually consistent values such as configuration, sessions, or cache metadata. Do not treat KV as strongly consistent transactional storage.

### D1

Use `Cloudflare.D1.Database` and checked-in migrations. Keep one migration owner, review destructive SQL, and bind through the current D1 capability. Use Drizzle's D1 support when the application wants typed queries; do not route D1 through Hyperdrive.

### Hyperdrive

Put Hyperdrive between Workers and external Postgres/MySQL. Give it the direct provider origin documented for Neon or PlanetScale, not an already pooled URL. Build the Drizzle/driver client inside request scope so connections can close when the event settles.

Use `database-patterns.md` and the provider-specific database reference before wiring it.

## Queues And Events

```ts
export const Jobs = Cloudflare.Queues.Queue("Jobs");

const queue = yield* Jobs;
const sender = yield* Cloudflare.Queues.WriteQueue(queue);

yield* Cloudflare.Queues.consumeQueueMessages<Job>(
  queue,
  { batchSize: 10, maxRetries: 3, retryDelay: "1 second" },
  (messages) => Stream.runForEach(messages, processJob),
);
```

Provide `WriteQueueBinding` and `Queues.EventSourceLive` as required. Consumer registration creates the Cloudflare consumer resource and runtime listener together. Successful batches are acknowledged; failed batches retry according to settings. Design for duplicate delivery and configure a dead-letter queue where loss or poison messages matter.

Workers cron and GitHub repository events use the same event-source pattern: one declaration wires trigger, permissions/verification, and typed handler.

## Durable Objects, Containers, Workflows

- Durable Objects own keyed coordination/state. Resolve Durable Object storage in initialization and keep transaction/request work in handlers.
- Hibernatable WebSockets belong in Durable Objects when many mostly-idle connections must survive efficiently.
- Containers pair arbitrary runtime processes with a Durable Object interface and lifecycle. Verify image architecture, health, persistence, scale, and RPC contract.
- Workflows own replayable, checkpointed multi-step jobs. Keep steps deterministic/idempotent around retries and external side effects.

Use typed internal RPC for Worker/DO/Container communication. Add schema validation only where data crosses a trust boundary.

## Frontends

Use `Cloudflare.Vite` for Vite-native applications, including supported TanStack Start, React Router, SolidStart, Vue, Nuxt, and Astro patterns. Use `Cloudflare.StaticSite` for an arbitrary build command and output directory.

- Set the project/root directory explicitly in monorepos.
- Keep server/provider/database modules out of browser bundles.
- Bind API URLs and public config through Outputs.
- During `alchemy dev`, verify the browser calls the local Worker URL rather than a previously deployed URL.
- Put custom domains/routes in the same ownership graph as the Worker/site.

## AI

The Cloudflare provider covers AI Gateway, AI Search, Vectorize, Workers AI/Effect AI patterns, and related binding resources.

- Keep provider API keys redacted and bound during initialization.
- Put AI Gateway between runtimes and model providers when routing, observability, caching, or policy is required.
- Treat indexed documents and model responses as external data at trust boundaries.
- Review retention, tenant isolation, and cost before enabling logs or search ingestion.

## Networking, Security, Email

The provider catalog includes zones, DNS, Worker routes/domains, Access, Tunnels, Turnstile, rate limiting, WAF/API Shield, certificate/TLS controls, email routing, and many account/zone resources.

These resources can affect unrelated traffic. Before mutation, verify account, zone, hostname, ownership tags, existing routes/records, and replacement behavior. Prefer adopting existing zones/domains deliberately rather than recreating them.

## Local Development

`alchemy dev` uses real cloud resources while running supported Worker code locally. It can deploy dependencies and is therefore mutating.

- Use a personal stage.
- Choose ports explicitly when frontend and API run together.
- Prove the active URL through browser/network or an integration test.
- Expect real cloud data, queues, auth, and permissions.
- Check workerd/Miniflare support before raising compatibility dates.
- Set Worker `cwd` narrowly in monorepos to avoid reloads from generated or sibling output.

## Verification

- Plan targets the intended Cloudflare account, stage, profile, and state worker.
- Resource names use current namespaced APIs.
- Every runtime capability has the matching Layer and minimum access.
- Secrets resolve during initialization and remain redacted.
- Queue/workflow/event failure semantics are explicit.
- Worker URLs, custom domains, frontend-to-API routing, and RPC bindings are tested.
- Database connections are request-scoped and Hyperdrive origins are direct.
- Local dev traffic is observed hitting the intended local runtime.

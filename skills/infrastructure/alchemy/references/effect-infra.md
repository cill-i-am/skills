# Effect Infrastructure Patterns

Use this file when Alchemy work touches Effect Workers, provider implementations, Actions, custom state stores, database services, retries, observability, or tests.

This is the Alchemy-side bridge to Effect practices. It records the Effect patterns that materially change infrastructure correctness. For broader app/domain Effect architecture, also use the dedicated Effect best-practices skill or current Effect docs when available.

## Contents

- Boundary rules
- Services and Layers
- Workers
- Custom providers and Actions
- Databases
- Config, Schema, and secrets
- Retries and schedules
- Observability
- Testing
- Gotchas

## Boundary Rules

Use Effect at the same boundaries Alchemy cares about:

- Stack declarations and platform init.
- Worker request, queue, workflow, and scheduled handlers.
- Provider lifecycle operations.
- Deploy-time Actions.
- Database, SDK, and cloud API adapters.
- Tests that need typed services, layers, time control, or Effect assertions.

Prefer:

- `Effect.gen` for inline stack/init workflows.
- `Effect.fn("Name")` for reusable operations, provider methods, service methods, and deploy-time Actions.
- `Context.Service` plus `Layer.effect` for shared infrastructure capabilities.
- `Effect.tryPromise` to wrap SDK/driver calls whose failures should be typed.
- `Schedule`/`Effect.retry` for backoff, polling, and transient cloud failures.

Use `Effect.fnUntraced` only when it is a deliberate escape hatch: Alchemy core/provider internals that already use it, measured hot paths, or operations where tracing would be noisy and the loss is intentional.

## Services And Layers

Expose domain-shaped infrastructure services instead of leaking cloud primitives across the app.

```ts
import * as Cloudflare from "alchemy/Cloudflare";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

export const UploadsBucket = Cloudflare.R2Bucket("Uploads");

export class Uploads extends Context.Service<Uploads, {
  readonly put: (key: string, body: BodyInit) => Effect.Effect<void>;
}>()("Uploads") {}

export const UploadsLive = Layer.effect(Uploads)(
  Effect.gen(function* () {
    const bucket = yield* Cloudflare.R2.ReadWriteBucket(UploadsBucket);

    return {
      put: Effect.fn("Uploads.put")(function* (key, body) {
        yield* bucket.put(key, body);
      }),
    };
  }),
).pipe(Layer.provide(Cloudflare.R2.ReadWriteBucketBinding));
```

Rules:

- Name reusable layers as constants such as `UploadsLive`, `DbLive`, or `GitHubLive`.
- Prefer `Layer.effect` when construction depends on resources, Config, Scope, SDK clients, or other services.
- Use `Layer.succeed` only for pure values.
- Use `Layer.effectDiscard` for startup effects that do not provide a service.
- Compose and provide layers at app, Worker, stack, test, or subsystem boundaries.
- Avoid repeated layer factory calls; layer memoization is by layer reference.
- Avoid `Effect.provide` deep inside business logic unless intentionally overriding a boundary for a test or adapter.

## Workers

In Effect Workers:

- Bind Alchemy resources in the outer init effect.
- Build service layers during init.
- Return thin request/event handlers that call named operations.
- Provide the matching binding live layers once.
- Keep request-dependent work inside returned handlers.

```ts
export default class Api extends Cloudflare.Worker<Api>()(
  "Api",
  { main: import.meta.filename },
  Effect.gen(function* () {
    const uploads = yield* Uploads;

    return {
      fetch: Effect.fn("Api.fetch")(function* (request: Request) {
        yield* uploads.put("health.json", JSON.stringify({ ok: true }));
        return Response.json({ ok: true });
      }),
    };
  }).pipe(Effect.provide(UploadsLive)),
) {}
```

Resolve `effect/Config` in init, not only inside `fetch`, so Alchemy can discover and bind secrets.

## Custom Providers And Actions

Provider lifecycle methods are infrastructure operations. Make them observable, convergent, idempotent, and typed.

```ts
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import * as Schema from "effect/Schema";

class ProviderApiError extends Schema.TaggedErrorClass<ProviderApiError>()(
  "ProviderApiError",
  {
    operation: Schema.String,
    message: Schema.String,
    retryable: Schema.Boolean,
  },
) {}

const retryCloudApi = Schedule.exponential(500, 1.5).pipe(
  Schedule.jittered,
);

const createRemoteThing = Effect.fn("Example.Thing.create")(function* (
  name: string,
) {
  return yield* Effect.tryPromise({
    try: () => client.createThing({ name }),
    catch: (cause) =>
      ProviderApiError.make({
        operation: "createThing",
        message: cause instanceof Error ? cause.message : String(cause),
        retryable: isRetryable(cause),
      }),
  }).pipe(
    Effect.retry({
      schedule: retryCloudApi,
      while: (error) => error.retryable,
    }),
  );
});
```

Rules:

- Treat API not-found during delete as success.
- Model expected cloud/API failures as typed errors, not defects.
- Preserve enough cause/context for debugging, but never log raw secrets.
- Use `Action` for idempotent deploy-time side effects; use a Resource for lifecycle, read, adoption, replacement, or delete semantics.
- Use `Effect.orDie`/`Layer.orDie` only where failure is truly unrecoverable at that boundary.

## Databases

Keep database clients and query libraries at the infrastructure edge.

- For Drizzle, build the Drizzle client in Worker init or a `DbLive` layer and expose repositories/services.
- For Effect SQL, domain services should depend on `SqlClient` or repository services, not native drivers.
- For raw `pg`/`mysql2`, acquire one connection per request and release it with `ensuring`/`acquireRelease` or `try/finally`.
- Decode external row/API/webhook data with Schema where shape drift would hurt.
- Keep redacted connection strings redacted until the driver boundary.

## Config, Schema, And Secrets

Use Config and Schema at boundaries:

- Resolve `Config.redacted(...)` in platform init so Alchemy binds secrets.
- Use `Redacted` for tokens, passwords, connection strings, webhook secrets, and generated credentials.
- Use `Schema.TaggedErrorClass` for errors that cross module/process boundaries or need structured diagnostics.
- Use `Schema.decodeUnknownEffect` at webhook, API, env, and database-result boundaries when values are untrusted.

## Retries And Schedules

Use `Schedule` instead of manual loops for:

- Cloud API eventual consistency.
- First Workers.dev availability checks.
- Provider polling.
- Transient database/API/network failures.
- Queue/workflow retry policy helpers.

Retry only retryable failures. Do not retry validation errors, permission errors, missing required config, or deterministic migration failures.

## Observability

- Name reusable operations with `Effect.fn("Provider.Resource.operation")`.
- Add logs/spans/metrics at provider lifecycle, Action, request, job, workflow, and database operation boundaries.
- Attach stage, stack, resource type, logical ID, provider, and request/job IDs when available.
- Do not log raw props that may include secrets.
- Do not create OpenTelemetry exporters or SDK clients in business logic; provide them through layers at the app boundary.

## Testing

Use Alchemy's `alchemy/Test/Vitest` for stack/provider/deploy tests. Use `@effect/vitest` patterns for app-level Effect service tests when the repo already has or needs them.

Prefer:

- explicit test layers instead of production clients.
- `TestClock` for schedules, retries, polling, and timeouts.
- `test.provider` for provider lifecycle behavior.
- `alchemy/Test/Vitest` for resources that need plan/deploy/destroy semantics.

## Gotchas

- Do not create SDK, database, or HTTP clients inside request handlers when a layer/init boundary can own them.
- Do not scatter `Effect.provide` through implementation code.
- Do not use `Effect.promise` for failures that should be typed or retried.
- Do not use `fnUntraced` as the default for new userland provider/action/service code.
- Do not use `orDie` to hide config, permission, network, or cloud API errors that operators can fix.
- Do not duplicate layer factories in many call sites; name a layer and reuse it.
- Do not replace Alchemy stack tests with generic Effect tests. They test different surfaces.

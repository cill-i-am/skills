# Infrastructure As Effects

Use this file for Functions, Servers, bindings, event sources, sinks, Layers, runtime phases, or infrastructure abstractions. Alchemy and application logic can be one Effect program; the important boundary is phase and ownership, not whether Effect is allowed.

## Effectful Constructor

A Function/Server class is simultaneously:

- a Resource declaration;
- a typed identity other resources can bind;
- an initialization Effect;
- the runtime API returned by that Effect.

```ts
import * as Cloudflare from "alchemy/Cloudflare";
import * as Effect from "effect/Effect";
import * as HttpServerResponse from "effect/unstable/http/HttpServerResponse";

export default class Api extends Cloudflare.Worker<Api>()(
  "Api",
  { main: import.meta.url },
  Effect.gen(function* () {
    const bucket = yield* Cloudflare.R2.ReadWriteBucket(Uploads);

    return {
      fetch: Effect.gen(function* () {
        const item = yield* bucket.get("health.json");
        return HttpServerResponse.text(item === null ? "missing" : "ok");
      }),
    };
  }).pipe(Effect.provide(Cloudflare.R2.ReadWriteBucketBinding)),
) {}
```

The constructor's outer Effect is initialization. Returned functions/Effects/Streams form the runtime interface.

## Phase Ownership

Initialization runs twice for different purposes:

- Plan time: discovers resources, bindings, permissions, env, event mappings, and graph dependencies.
- Runtime cold start: builds live SDK clients and service Layers.

Returned handlers run per request/event only at runtime.

Put in initialization:

- resource and binding resolution;
- `Config` resolution needed for secret/env binding;
- SDK/client construction;
- service Layer assembly;
- event-source registration;
- long-lived instance-scoped resources.

Put in handlers:

- request/message/event decoding;
- request-scoped resources and transactions;
- business workflows;
- response construction;
- per-event tracing and correlation.

`RuntimeContext` requirements can run only inside returned runtime handlers. Do not branch user code on internal runtime guards; use the supplied binding Layers.

## Binding Contract And Layer

A binding separates a capability contract from the platform implementation Layer. Calling the capability in initialization records deploy-time access and returns the live runtime client when the program boots.

```ts
export const Uploads = Cloudflare.R2.Bucket("Uploads");

const bucket = yield* Cloudflare.R2.ReadWriteBucket(Uploads);
```

Provide the matching Layer once at the Function boundary. Use native-binding Layers when the host supports them and HTTP Layers when the topology requires a network transport. Avoid leaking binding implementation choices into domain services.

## Services And Infrastructure Layers

Wrap repeated resource capabilities in domain-shaped services:

```ts
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

export class UploadStore extends Context.Service<
  UploadStore,
  {
    readonly put: (key: string, body: BodyInit) => Effect.Effect<void>;
  }
>()("UploadStore") {}

export const UploadStoreLive = Layer.effect(
  UploadStore,
  Effect.gen(function* () {
    const bucket = yield* Cloudflare.R2.ReadWriteBucket(Uploads);
    return UploadStore.of({
      put: Effect.fn("UploadStore.put")(function* (key, body) {
        yield* bucket.put(key, body);
      }),
    });
  }),
).pipe(Layer.provide(Cloudflare.R2.ReadWriteBucketBinding));
```

Rules:

- Export stable Layer values; memoization is by Layer reference.
- Use `Layer.effect` for construction with dependencies and `Layer.succeed` for pure values.
- Provide Layers at Function, application, test, or subsystem boundaries.
- Keep domain interfaces provider-neutral when substitution has real value.
- Do not scatter `Effect.provide` through business logic.

## Event Sources

An event source binds a resource to a Function and invokes it when something happens. One declaration should own permissions, trigger/event mapping, and typed handler registration.

```ts
yield* Cloudflare.Queues.consumeQueueMessages<Job>(
  queue,
  { batchSize: 10, maxRetries: 3, retryDelay: "1 second" },
  (messages) => Stream.runForEach(messages, processJob),
);
```

Common sources:

- Cloudflare Queue, cron, and GitHub repository events.
- AWS SQS, Kinesis, DynamoDB Streams, S3 notifications, SNS, and EventBridge.

Batch sources expose Effect Streams. Configure batching, ordering, retry, record age, partial failure, and dead-letter behavior at the declaration. Assume at-least-once delivery unless the platform proves otherwise; handlers must be idempotent.

## Sinks

Sinks are the write-side dual of event sources: a bound resource becomes an Effect `Sink` for batching and backpressure.

Use a Sink when a Stream naturally terminates in SQS, Kinesis, DynamoDB, or another supported service. Prefer source-transform-sink pipelines over manual loops and ad hoc batching.

Review sink chunking, concurrency, retry, partial failure, ordering, and IAM scope. A stream completing does not imply external side effects are reversible.

## Circular Dependencies

When two Functions/Servers bind each other, declare stable class identities first and attach props/implementations through the current `.make`/constructor pattern documented for that platform. Keep the cycle at the binding graph; avoid cyclic module initialization and duplicated resource declarations.

Use circular bindings only when the domain truly requires bidirectional calls. An event, queue, shared service, or one-way dependency is often easier to operate.

## Custom Runtime

A custom runtime adapts an Effectful constructor to a host Alchemy does not yet support. It must define:

- how the runtime resource is declared and reconciled;
- how application code is bundled and started;
- which runtime API shape it exposes;
- how bindings record deploy-time policy/config and produce runtime clients;
- phase detection and runtime context;
- cleanup and test strategy.

Build a custom runtime only when a provider Resource plus existing host cannot express the workload. Verify it with a minimal binding, HTTP handler, event source if applicable, and real lifecycle tests.

## Config And Secrets

Resolve `Config` during initialization and capture the decoded/redacted value into handlers. Use Schema and branded types for untrusted configuration. Keep secrets redacted through Outputs, state, logs, and provider diagnostics.

## Errors, Retries, And Concurrency

- Wrap SDK/driver promises with `Effect.tryPromise` and typed errors.
- Use `Effect.fn("Provider.Resource.operation")` for reusable operations.
- Retry only tagged transient failures with a bounded `Schedule`.
- Use Effect concurrency operators rather than unmanaged Promise fan-out.
- Scope clients and resources to instance or request lifetime deliberately.
- Treat interruption and cleanup as part of handler correctness.

## Verification

- Initialization can execute during planning without performing runtime business work.
- Every capability has the correct implementation Layer.
- Runtime-only requirements remain inside returned handlers.
- Internal service clients are typed through bindings.
- Event handlers are idempotent and failure policy is explicit.
- Service Layers are reusable and provided once.
- Tests replace boundary Layers or deploy the real stack according to the surface under test.

# Patterns

Use this file while implementing or reviewing Effect code.

## Source And Local Convention Pass

Before changing code:

```bash
rg -n 'from "effect"|from "effect/|@effect/' .
rg -n 'Context\\.(Service|Tag)|Layer\\.|Effect\\.fn|Effect\\.gen|Schema\\.|TaggedError|runPromise|HttpClient|Deferred|Queue|Fiber|Schedule\\.' .
```

Read nearby implementation and tests before introducing a new style. Match the pinned Effect version.

## Schema And Data

- Parse unknown data once at the boundary.
- Prefer `Schema.decodeUnknownEffect(MySchema)(value)` for unknown values.
- Prefer `Schema.decodeUnknownEffect(Schema.fromJsonString(MySchema))(text)` or `Schema.decodeUnknownOption(Schema.parseJson())(text)` for JSON strings.
- Derive TypeScript types from Schema or runtime values.
- Use brands for IDs, tenant keys, session IDs, tool names, and protocol handles.
- Keep one logical model when multiple boundaries encode it differently; use transformations instead of duplicate schemas.

Reject:

- `JSON.parse(raw) as X`
- `as unknown as X`
- repeated `"field" in value` probing in domain code
- duplicate interface declarations beside schemas

## Typed Errors

Use typed errors at the failure site:

```ts
class UserNotFound extends Schema.TaggedErrorClass<UserNotFound>()(
  "UserNotFound",
  { id: Schema.String },
) {
  override get message() {
    return `User not found: ${this.id}`;
  }
}
```

Generator terminal failure:

```ts
return yield * new UserNotFound({ id });
```

Combinator failure:

```ts
Effect.fail(new UserNotFound({ id }));
```

Map third-party failures immediately:

```ts
Effect.tryPromise({
  try: () => client.send(input),
  catch: (cause) => new ProviderError({ cause }),
});
```

Keep `try/catch`, `throw`, `Promise.reject`, or unknown error formatting only at true host or adapter boundaries. Convert back into Effect failures, stable host payloads, or opaque logged defects.

## Services, Layers, And SDK Wrappers

Use services for capabilities:

- database clients
- HTTP clients
- filesystem/process access
- config/secrets
- queues and workflows
- telemetry
- clocks/randomness
- third-party SDKs

Third-party wrapper shape:

```ts
class Mailer extends Context.Service<Mailer>()("Mailer", {
  effect: Effect.gen(function* () {
    const apiKey = yield* Config.redacted("MAILER_API_KEY");
    const client = new MailerClient(Redacted.value(apiKey));

    return {
      send: Effect.fn("Mailer.send")(function* (message: Message) {
        return yield* Effect.tryPromise({
          try: () => client.send(message),
          catch: (cause) => new MailerError({ cause }),
        });
      }),
    };
  }),
}) {}
```

Provide at the edge:

```ts
program.pipe(Effect.provide(Mailer.Default));
```

Avoid accessors that only yield a service and call one method unless they add a real name, recovery policy, tracing, or composition boundary.

## HTTP, RPC, And Clients

- Model one authoritative protocol contract.
- Generate Promise and Effect clients from the same contract when both exist.
- Keep Promise clients free of Effect imports.
- Keep Effect clients free of server implementation imports.
- Use `HttpClient` / request builders in Effect-native SDK code.
- Transform requests with `HttpClient.mapRequest` for base URLs and headers.
- Test protocol code with local server layers or test clients, not global fetch patches.
- Use `.setPath(...)` with a Schema for `HttpApiEndpoint` path params.

Handlers stay thin:

1. Decode input.
2. Read request context.
3. Call services.
4. Map transport errors.

## Resources And Concurrency

Use Scope or Layer for anything that must close:

- sockets
- transports
- subprocesses
- database handles
- file watchers
- subscriptions
- caches
- servers
- background fibers

Use:

- `Effect.acquireUseRelease` for use-local resources.
- `Effect.acquireRelease` for scoped resources.
- `Effect.addFinalizer` when the current scope owns cleanup.
- `Effect.scoped` to bind a program to a lifetime.

Concurrency primitives:

- `Deferred`: one-shot handoff, approval, join, or resume.
- `Queue`: producer/consumer, pause/resume, subscriptions, event handoff.
- `Fiber`: owned background work.
- `Exit`: replay or persist a completed success/failure.
- `Semaphore` or keyed mutex: per-key mutation safety.

Pick race semantics intentionally. Use `raceFirst` when the first failure must win. A prefer-success race can hide failure or hang when the other side never succeeds.

## Observability, Time, Retries, And Config

- Name externally meaningful work with `Effect.fn("domain.operation")`.
- Add `Effect.withSpan` for nested work that needs its own span.
- Add span attributes that answer production questions.
- Use `Effect.log*` for events the operator can act on.
- Use `Schedule` for retry, polling, repeat, backoff, and bounded waits.
- Use `Clock` and `TestClock` for Effect code that depends on time.
- Use config/redaction primitives for secrets when available.
- Keep host-specific env or binding reads in adapters.

## SQL

For Effect SQL packages:

- Keep the SQL client in a service.
- Decode query results with Schema before domain use.
- Use transactions for multi-step writes that must commit together.
- Use resolvers/batching for repeated keyed reads.
- Keep migrations and raw driver setup at adapter boundaries.

## Tests

- Use `@effect/vitest` when the project has adopted it.
- Otherwise, run Effects only at the test boundary.
- Build test layers explicitly.
- Provide fake clocks, config, queues, storage, and HTTP clients through layers.
- Keep live platform tests separate from pure unit tests.
- Close scopes and print pretty causes on failure.
- Cover at least one failure path for every new typed error.
- Cover cleanup, interruption, or timeout behavior for every new owned resource.

## Red Flags

- Effect code added to pure synchronous logic.
- Boundary casts instead of Schema decoding.
- `try/catch` inside `Effect.gen` for expected failures.
- `Effect.runPromise` inside domain code.
- Hidden `Effect.provide` in the middle of a workflow.
- `Effect.orDie` or `Layer.orDie` for expected errors.
- Detached fibers with no owner, cleanup, or failure reporting.
- Raw `fetch` in an Effect-native SDK or protocol package.
- Global fetch monkeypatching in tests.
- Generated files edited by hand.

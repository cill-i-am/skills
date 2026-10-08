# Effect runtimes, bindings, phases, and Layers


## Separate construction from execution

A runtime declaration carries its infrastructure and application implementation. In an Effect-style Worker or Lambda, the outer Effect discovers dependencies, configuration, bindings, and handlers. It runs during planning and again when the runtime is constructed. The returned handlers execute in response to requests or events.

Resolve a capability in construction; call it in a runtime handler. Do not query a database, send an email, invoke a model, or consume a queue while the planner is discovering the graph. Do not yield request-local services outside a request handler.

Durable Objects have an additional per-instance activation constructor. Resolve the state handle in the outer Effect, but load storage and apply migrations in the inner runtime constructor. A normal in-memory variable is not durable just because it lives in a DO module.

## Resource, capability, implementation

A resource describes cloud infrastructure. A binding declares a particular capability against it. The binding implementation Layer explains how that capability works on the chosen runtime. All three matter:

```ts
const constructor = Effect.gen(function* () {
  const objects = yield* Cloudflare.R2.ReadWriteBucket(Uploads);
  return {
    fetch: Effect.gen(function* () {
      const object = yield* objects.get("example.txt");
      return HttpServerResponse.text(object ? "present" : "missing");
    }),
  };
}).pipe(Effect.provide(Cloudflare.R2.ReadWriteBucketBinding));
```

This is a composition excerpt; map `R2Error` at the HTTP boundary as shown in the complete Worker example. A missing binding Layer is not fixed by expanding provider credentials or manually adding a secret. Different Layers solve different requirements.

Use the narrowest supported read/write/operation binding. Avoid passing a cloud admin client or provider credential into application services. Generated capability wiring reduces manual permission work; it does not validate domain authorization or remove the need to review broad statements.

## Services that own their infrastructure

A feature Layer can create resources, bind their capabilities, and return a domain-facing service. Consumers depend on the service contract instead of on a global `env` object. This makes local fakes possible and keeps resource ownership near the feature that needs it.

For example, an `Uploads` service can own its bucket and expose `putDocument` and `getDocument`. A Worker provides that implementation once at its platform boundary. Tests of business logic provide an in-memory implementation; integration tests exercise the real binding. Avoid one generic “cloud service” that exposes every SDK operation.

Layer reuse is not the same as recreating a layer expression in every consumer. Inspect memoization and resource identity before composing multiple factories with the same logical IDs. Export stable Layers or use an explicit naming parameter when multiple instances are intentional.

## Internal and external calls

For trusted internal Worker/DO/Container or Lambda calls, consider the native typed RPC the runtime exposes. At an untrusted input boundary, use explicit schema validation and authentication; Effect RPC and Effect HTTP are documented ways to do that. TypeScript types do not authenticate the caller or validate arbitrary wire data.

Keep callback implementations and provider-only imports out of shared client contract modules. Do not accidentally bundle credential resolution or a deploy tool into a browser application.

## Scope and lifetime

Request-scoped streams, transactions, and connections must finish or be closed within their execution scope. Use the runtime's supported background-work mechanism rather than an untracked Promise or detached fiber. Choose a Queue or Workflow when the work must outlive the request reliably.

Capture configuration through the documented construction mechanism so it can be discovered and bound. Avoid reading secrets from `process.env` deep inside domain code. Redaction must survive logs, errors, outputs, and telemetry.

For cycles between services, prefer explicit contracts and tagged handles from the Circular Bindings guide. A circular module import and a circular runtime capability graph are not interchangeable problems.


## Sources

- [infrastructure-as-effects/runtime](https://alchemy.run/infrastructure-as-effects/runtime/)
- [infrastructure-as-effects/binding](https://alchemy.run/infrastructure-as-effects/binding/)
- [infrastructure-as-effects/layers](https://alchemy.run/infrastructure-as-effects/layers/)
- [infrastructure-as-effects/phases](https://alchemy.run/infrastructure-as-effects/phases/)
- [infrastructure-as-effects/circular-bindings](https://alchemy.run/infrastructure-as-effects/circular-bindings/)
- [infrastructure-as-effects/event-sources](https://alchemy.run/infrastructure-as-effects/event-sources/)
- [infrastructure-as-effects/sinks](https://alchemy.run/infrastructure-as-effects/sinks/)

Documentation snapshot: 7 October 2026. Resolve exact APIs against the target project’s installed version; see [version policy](version-policy.md).

# Cloudflare Workers and HTTP applications

## Pick the application form

Use an Effect-style Worker when bindings, Layers, typed errors, and runtime services are part of the app design. Use the documented async Worker form when hosting an existing framework or ordinary handler. Alchemy v2 infrastructure does not require rewriting every handler to Effect. In either form, keep one owner for the Worker deployment and its bindings.

A Worker normally lives in its own module with `main: import.meta.url`; the stack yields that declaration and returns `url`. Do not export the whole stack from the runtime entrypoint or import deployment-only code into a browser bundle.

## Effect-style skeleton

```ts
import * as Cloudflare from "alchemy/Cloudflare";
import * as Effect from "effect/Effect";
import * as HttpServerResponse from "effect/http/HttpServerResponse";

export default Cloudflare.Worker(
  "Api",
  { main: import.meta.url },
  Effect.gen(function* () {
    return {
      fetch: Effect.succeed(HttpServerResponse.text("healthy")),
    };
  }),
);
```

Resolve resource capabilities and configuration in the constructor. Resolve `HttpServerRequest` and perform reads/writes inside `fetch`. The [R2 application asset](examples.md) includes health, put/get, missing-key handling, authentication, and an integration test. Its intentionally small buffered-body example is not a large-upload gateway.

## Bind native resources to an async handler

The documented form uses `env`, not v1's `bindings`:

```ts
export const Api = Cloudflare.Worker("Api", {
  main: "./src/handler.ts",
  env: { UPLOADS: Uploads },
});
export type ApiEnv = Cloudflare.InferEnv<typeof Api>;
```

The handler imports `ApiEnv` with `import type`. Avoid handwritten copies of generated binding types. Do not access a binding through `process.env`; use the native environment object in the async form. Keep real secrets separate from public frontend build variables.

## HTTP correctness

Normalize relative and absolute request URLs consistently. Check methods and paths before touching storage. Validate untrusted JSON, headers, parameters, and queue payloads at runtime. TypeScript annotations do not validate bytes. Use a schema boundary for a public API and attach authorization based on the authenticated principal, not an arbitrary user ID in a URL.

Bound body size before buffering in production. Preserve content type and useful metadata when streaming. Enforce tenant-scoped storage keys. Treat CORS as browser policy, not authentication. Keep health responses free of credentials and infrastructure internals.

Map expected failures to deliberate statuses; log unexpected failures with a correlation ID and return a generic response. Do not expose cloud SDK error messages directly. If a sample uses `Effect.orDie` at an HTTP boundary, treat it as the runtime's unhandled-error path—not proof that all transient provider failures are programming defects.

## Multiple services and background work

For trusted Worker-to-Worker calls, use typed native RPC or service bindings instead of public URLs plus administrative tokens. For browser and partner callers, use explicit schemas and authentication. A returned RPC method still needs business authorization when callers can act for different tenants.

Use supported execution-context background work only for bounded best-effort tasks. Use Queues or Workflows for work whose completion matters after the response. Do not detach an unmanaged Promise/fiber and assume the isolate will stay alive.

## Deployment variants

Choose a full stage preview when the entire environment must be isolated. Worker previews and gradual deployments are different capabilities: a preview version does not necessarily duplicate every bound data store. Review which bindings and Durable Object namespaces are shared. For canaries, validate old/new schema compatibility, telemetry attribution, and rollback before changing live traffic weights.

For Python Workers, Worker Loader, Workers for Platforms, Browser Rendering, and custom routes, load the dedicated guide listed in [advanced Cloudflare](cloudflare-advanced.md). Do not translate Wrangler props or old Alchemy examples into assumed v2 fields.

## Sources

- [cloudflare/compute/workers](https://alchemy.run/cloudflare/compute/workers/)
- [cloudflare/tutorial/part-2](https://alchemy.run/cloudflare/tutorial/part-2/)
- [cloudflare/compute/previews](https://alchemy.run/cloudflare/compute/previews/)
- [cloudflare/compute/gradual-deployments](https://alchemy.run/cloudflare/compute/gradual-deployments/)
- [apis](https://alchemy.run/apis/)
- [cloudflare/security/access](https://alchemy.run/cloudflare/security/access/)

Reference baseline: Alchemy `2.0.0-beta.81`, upstream `fbe6ece368c6898234592e897d852bb47b88ebb1`, researched 7 October 2026. Check installed APIs before applying examples.

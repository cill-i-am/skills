# Runtime boundaries and foreign frameworks

## Execute at a real boundary

Use a runner at a process entrypoint, framework handler, browser lifecycle hook, or genuine foreign callback. Keep use cases and service implementations Effect-native. Running an Effect inside another Effect simply to recover a Promise loses the compositional guarantees you introduced Effect to obtain.

Use the platform runtime for a process you own. Use `ManagedRuntime` when a non-Effect host owns execution and you need reusable services. For native Effect HTTP routes, prefer the published server or web-handler adapter instead of inventing a parallel lifecycle abstraction.

```ts
import { Context, Effect, Layer, ManagedRuntime, Ref } from "effect"

class Counter extends Context.Service<Counter, {
  readonly next: Effect.Effect<number>
}>()("example/Counter") {}

const CounterLive = Layer.effect(Counter, Effect.gen(function*() {
  const state = yield* Ref.make(0)
  return { next: Ref.updateAndGet(state, (n) => n + 1) }
}))

export const makeCounterBoundary = () => {
  const runtime = ManagedRuntime.make(CounterLive)
  return {
    next: () => runtime.runPromise(Counter.use((counter) => counter.next)),
    dispose: () => runtime.dispose()
  }
}
```

The host must call and await `dispose` at the end of this boundary's lifetime. Do not create this boundary on every render or every request unless isolated per-request state is intentional. A shared runtime is appropriate for stable application services, not for permanently capturing the first request's credentials.

## A correct bridge preserves more than a return value

Check expected failures, defects, interruption, service context, tracing context, resource scope, and transactions. A bridge that returns the right JSON on success can still leak sockets or execute writes after a transaction has ended.

Pass the host's AbortSignal into the supported runner/HTTP adapter options and verify actual cancellation with the installed release. Do not assume a Promise rejection stops underlying work. When a body is streamed, tie the resource lifetime to body consumption or cancellation, not merely to returning the Response object.

For foreign callback APIs, capture and reuse the appropriate runtime context through the supported adapter. Do not create a fresh default runtime in each callback. A SQL transaction is a particularly important case: repository operations must remain in the transaction's fiber/context, not a separate unmanaged run.

## Shutdown is a protocol

Stop accepting new work, make readiness fail, allow bounded in-flight completion, interrupt work that should stop, and await finalizers and telemetry flush. Coordinate with the host's termination deadline. Do not invoke `process.exit` immediately after scheduling disposal and assume cleanup ran.

A framework already owning signal handlers should remain the owner. Avoid installing duplicate global handlers every time a module is imported or hot-reloaded. In tests, dispose runtimes in an awaited teardown and fail on unexpected resource leaks.

## Serverless, edge, and browser lifetimes

An isolate can be reused, but it is not a durable process. Do not rely on module-level fibers to finish after a response or survive eviction. Use the host's supported background-work facility for bounded best-effort continuation and a durable queue/workflow for work that must complete.

Only share resources that the host allows across requests. Bindings, sockets, credentials, and request contexts can have different lifetimes. A universal “one global runtime” rule is not safe across every platform.

Browser runtimes belong to a component subtree, application session, or another explicitly managed lifetime. Clean up subscriptions and requests on unmount where appropriate. Keep server secrets and database drivers out of client bundles; importing shared schemas must not pull in server startup.

## Do / don't

**Do** expose a small host adapter and an explicit disposal hook. **Don't** hide a runner inside every service method.

**Do** use an Exit-returning boundary when failure classification matters. **Don't** guess the shape of a rejected Promise.

**Do** test abort, shutdown, repeated requests, and concurrent identities. **Don't** validate only the first successful request.

## Official sources

- [ManagedRuntime integration](https://github.com/Effect-TS/effect/blob/effect@4.0.2/ai-docs/src/04_integration/10_managed-runtime.ts)
- [ManagedRuntime API](https://effect.website/docs/v4/api/effect/ManagedRuntime)
- [Native web handler example](https://github.com/Effect-TS/effect/blob/effect@4.0.2/ai-docs/src/51_http-server/10_basics.ts)

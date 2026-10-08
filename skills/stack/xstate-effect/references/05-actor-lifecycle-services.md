# Actor ownership, services, and resource lifetimes

## The actor is a scoped resource

`yield* createEffectActor(logic, options)` creates and starts the actor. Do not call `.start()` again. The surrounding Effect scope owns its lifetime; scope closure stops it and interrupts hosted work. Merely returning the handle from a short `Effect.scoped` program does not produce a usable long-lived service: its owner has already closed.

For a bounded operation, create, command, observe, and finish within one scope. For a workflow shared across requests, use an application-owned Layer/runtime or a longer-lived feature owner. Scope ownership must match business lifetime, not the convenience of a function boundary.

```ts
class ReviewService extends Context.Service<
  ReviewService,
  EffectActor<typeof reviewMachine>
>()('app/ReviewService') {}

const ReviewServiceLive = Layer.effect(
  ReviewService,
  createEffectActor(reviewMachine)
);
```

This fragment assumes `reviewMachine` and the imports; see [the complete service example](../examples/src/actor-service.ts). Provide required dependencies to this Layer before building its `ManagedRuntime`. Dispose the runtime when its owner shuts down. Do not create a process-global tenant-sensitive runtime in an SSR module by accident.

## Three lifetimes to distinguish

| Lifetime | Typical resource | Release condition |
| --- | --- | --- |
| One invoked task/stream | Request resource, temporary file, stream subscription | Task completes, fails, or is interrupted |
| Owning root Effect actor | Shared workflow cache/session | Root actor stops |
| Application Layer/runtime | Database pool, external client | Application owner closes |

`fromEffect`, `fromEffectStream`, and `fromEffectEventStream` get task scopes. Their acquired resources are released before successful/failed completion is reported. Cancellation can initiate cleanup while the parent continues in another state, so a dependent next operation may need an explicit cleanup acknowledgement.

Use `withActorScope` around an acquisition only when the resource must survive the task. The documented ownership is the **root actor created by `createEffectActor`**, including nested invocations; do not read it as “whichever child I happen to be in.” Broadening lifetimes increases memory and connection pressure.

Background actions use actor lifetime, not invocation lifetime. Stopping the actor interrupts them. Outer scope closure waits for hosted cleanup before completing its own cleanup. Avoid uninterruptible, unbounded finalizers that can hang shutdown.

## Layer order

Provide application services outside the actor's scoped program:

```ts
program.pipe(Effect.scoped, Effect.provide(AppLive));
```

This arrangement keeps services available during actor cleanup. In a Layer graph, make dependencies of the actor Layer explicit with `Layer.provide`. Do not rebuild services per event, capture a short-lived request-scoped resource in a long-lived actor, or share a request's security principal across subsequent unrelated users.

## Requirement inference

`RequirementsFrom` collects services from declared Effect actions, declared actor logic, inline invocations, and nested machines up to ten levels. Source overrides passed through `machine.provide` change the current required services. Scope requirements for hosted tasks are supplied automatically.

Inline `enq.spawn(fromEffect(...))` is rejected because that source is invisible to requirement inference. Register it and spawn the declared source. Beyond the inference depth, flatten the tree or explicitly supply the deeper dependency contract; a type-level limitation is not an excuse to hide a service in a singleton.

Creation has a `never` typed error channel, not a guarantee against defects or later actor failure. Observe `join`, snapshots, and error policy separately.

## Shutdown checklist

Stop accepting new commands; decide what happens to queued work; record any required durable checkpoint/intent using a supported design; close the actor owner; await finalizers; then close shared services. Decide whether incomplete remote work is cancelled, resumed, or reconciled. A local shutdown callback cannot guarantee a remote service undoes an already accepted operation.

Sources: [actor ownership](27-source-index.md#effect-actors), [alpha.6 createEffectActor source](27-source-index.md#released-actor-source), [task scopes](27-source-index.md#effect-logic).

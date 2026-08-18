# Effect-First Principles

Use this file for architecture decisions, function shape, package direction, dependency boundaries, and runtime execution.

## Application Model

`Effect<A, E, R>` is the default representation of effectful application work:

- `A` is the success value.
- `E` is the expected failure contract.
- `R` is the required capability set.

An Effect value is a lazy description. It does nothing until a runtime executes it. That lets the application compose validation, dependencies, failures, cancellation, resource safety, retries, and telemetry without converting to Promise-shaped code between steps.

Keep a total synchronous calculation as a plain function when its whole contract is input to output:

```ts
const normalizeDisplayName = (value: string): string => value.trim()

export const renameUser = Effect.fn("Users.rename")(function* (
  id: UserId,
  displayName: string,
) {
  const users = yield* UserRepository
  return yield* users.rename(id, normalizeDisplayName(displayName))
})
```

Do not turn a pure leaf into `Effect.sync` merely to make it look Effectful. Wrap it when laziness, typed failure, requirements, tracing, interruption, or resource ownership becomes part of its real contract.

## Primitive Chooser

1. Unknown input or encoded data: Schema decoder.
2. Scalar identity or value object: constrained Schema brand.
3. Finite domain state: literal schema, tagged enum, or tagged union.
4. Expected failure: tagged error in the Effect error channel.
5. Runtime capability: `Context.Service` and Layer.
6. Owned lifetime: Scope, scoped Layer, or acquire/release.
7. Concurrent coordination: Fiber, Deferred, Queue, PubSub, Latch, Ref, Semaphore, FiberSet, or FiberMap.
8. Retried or timed work: Schedule, Clock, timeout, or TestClock.
9. Multi-value work: Stream with an explicit source and consumer.
10. Protocol boundary: Effect platform client plus Schema-backed request and response contracts.
11. Host or foreign callback interop: one reviewed runtime bridge after provisioning.

## Function Shape

Use the shape that communicates the operation's role:

- **Plain function:** a total synchronous calculation with no Effect semantics of its own.
- **Inline `Effect.gen`:** one-off local orchestration.
- **`Effect.fnUntraced`:** a reusable generator wrapper that does not need a distinct span or stack label.
- **Named `Effect.fn("Domain.operation")`:** a caller- or operator-meaningful action that deserves stable tracing metadata.

```ts
const parseHeader = (value: string) => value.trim().toLowerCase()

const loadRows = Effect.fnUntraced(function* (id: UserId) {
  const repository = yield* UserRepository
  return yield* repository.loadRows(id)
})

export const completeCheckout = Effect.fn("Checkout.complete")(function* (
  command: CompleteCheckout,
) {
  const inventory = yield* Inventory
  const payments = yield* Payments
  const orders = yield* Orders

  yield* inventory.reserve(command.items)
  const payment = yield* payments.capture(command.payment)
  return yield* orders.complete(command, payment)
})
```

Pass policies that apply to the entire call—error classification, retry, timeout, annotations, or local provisioning—as additional transforms to `Effect.fn` where the target pin supports that shape. Keep branch-specific behavior in the generator body. Do not pipe the function value as though it were an Effect.

Use `return yield*` for terminal failures, interruption, or other effects that cannot return:

```ts
if (!user) return yield* new UserNotFound({ id })
```

Do not use JavaScript `try` / `catch` inside `Effect.gen`. Use `Effect.try`, `Effect.tryPromise`, `Effect.result`, `catchTag`, `catch`, or Cause-level APIs at the appropriate boundary.

## Composition And Execution

Compose effects throughout application code; execute them at an owner boundary.

Ordinary owner boundaries include:

- HTTP, worker, and framework callbacks that must return a Promise or Response;
- CLI entrypoints;
- process, actor, or Durable Object lifecycle methods;
- SDK callback adapters;
- framework test adapters;
- deliberately process-owned managed runtimes.

Reusable services, repositories, policies, and workflows return Effect values. They do not call `runPromise`, hide live `Effect.provide`, or manufacture a runtime merely to erase `E` or `R`.

A foreign callback protocol may require a local execution bridge inside an adapter—for example, a Promise transaction callback that owns the active database handle. That bridge must preserve `Exit`, `Cause`, interruption, ambient context, rollback or cancellation, and Scope. See `runtime-bridges.md`.

Prefer one managed runtime for a long-lived process or application graph. Do not build a runtime per request unless runtime isolation is itself a requirement.

## Package Direction

A scalable default dependency direction is:

```text
Schema and domain data
        ↓
Protocol and public contracts / generated clients
        ↓
Core application capabilities and workflows
        ↓
Adapters: SQL, HTTP, provider SDKs, platform bindings
        ↓
Hosts and composition roots
```

- Serializable contracts live in the lowest stable package that owns their meaning.
- Public Effect clients depend on Schema and Protocol, not server implementations.
- Core application code depends on capability contracts, not host or driver packages.
- Adapter Layers depend on databases, SDKs, environment bindings, and platform APIs.
- Hosts translate framework lifecycles and execute fully provided programs.
- Generated clients are regenerated, not hand-edited.
- Large monorepos should enforce dependency direction mechanically.

## Exact-Pin Discipline

Effect v4 APIs can move between betas, release candidates, stable releases, and unstable modules. Verify the target project's exact pin before using or changing:

- `Context.Service`, Layer constructors, Layer memoization, and managed runtimes;
- `Effect.fn` transforms, `Effect.fnUntraced`, race, timeout, and Cause APIs;
- Schema brands, unions, optional fields, transforms, classes, and error constructors;
- unstable HTTP, HttpApi, RPC, SQL, workflow, AI, and platform modules;
- Cache, Stream, Schedule, Scope, FiberSet, FiberMap, and test helpers.

Read installed source and compile a narrow target-project probe. Never respond to an API mismatch by adding v3 compatibility branches or unchecked casts.

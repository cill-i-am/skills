# Effect-First Principles

Use this file for architecture decisions, function shape, dependency boundaries, and runtime execution.

## Application Model

`Effect<A, E, R>` is the default representation of backend work:

- `A` is the success value.
- `E` is the expected failure contract.
- `R` is the required capability set.

An Effect value is a lazy description. It does nothing until a runtime executes it. That lets the application compose validation, dependencies, failures, cancellation, resource safety, retries, and telemetry without converting to Promise-shaped code between each step.

Use Effect throughout backend application and infrastructure workflows. The small exception is a total synchronous leaf calculation whose only contract is input to output:

```ts
const normalizeDisplayName = (value: string): string => value.trim();

export const renameUser = Effect.fn("Users.rename")(function* (
  id: UserId,
  displayName: string,
) {
  const users = yield* UserRepository;
  return yield* users.rename(id, normalizeDisplayName(displayName));
});
```

Do not turn a pure leaf into `Effect.sync` merely to make it look Effectful. Wrap it when laziness, typed failure, requirements, tracing, interruption, or resource ownership becomes part of its real contract.

## Primitive Chooser

The boundary ladder chooses an Effect primitive. It does not decide whether Effect belongs in an Effect-first backend.

1. Unknown input or encoded data: Schema decoder.
2. Scalar identity or value object: constrained Schema brand.
3. Finite domain state: literal schema, `Data.TaggedEnum`, or `Schema.TaggedUnion`.
4. Expected failure: tagged error in the Effect error channel.
5. Runtime capability: `Context.Service` and Layer.
6. Owned lifetime: Scope, scoped Layer, or acquire/release.
7. Concurrent coordination: Fiber, Deferred, Queue, PubSub, Latch, Ref, Semaphore, FiberSet, or FiberMap.
8. Retried or timed work: Schedule, Clock, timeout, or TestClock.
9. Multi-value work: Stream with an explicit source and consumer.
10. Protocol boundary: Effect platform client plus Schema-backed request and response contracts.
11. Host interop: one `run*` or managed-runtime bridge after provisioning.

## Function Shapes

Use the shape that communicates the operation's role:

- `Effect.gen`: local orchestration and readable multi-step workflows.
- `Effect.fn("Domain.operation")`: public service methods and reusable operations that deserve runtime identity.
- `Effect.fn`: reusable functions that need traced-function behavior without a named span.
- `Effect.fnUntraced`: low-level or hot-path internals where trace capture is deliberately unnecessary.
- plain function: tiny total synchronous leaf with no Effect semantics of its own.

Name operations using stable domain vocabulary, not implementation mechanics:

```ts
export const completeCheckout = Effect.fn("Checkout.complete")(function* (
  command: CompleteCheckout,
) {
  const inventory = yield* Inventory;
  const payments = yield* Payments;
  const orders = yield* Orders;

  yield* inventory.reserve(command.items);
  const payment = yield* payments.capture(command.payment);
  return yield* orders.complete(command, payment);
});
```

Use whole-function transforms on `Effect.fn` for policies that apply to the entire call, such as error classification, retry, timeout, annotations, or local provisioning. Keep branch-specific behavior in the function body.

## Composition And Execution

Compose effects everywhere the application needs them; execute once per host invocation or owned runtime.

Host edges include:

- HTTP or worker callbacks that must return a Promise or Response
- CLI command entrypoints
- SDK callback bridges
- process and Durable Object lifecycle methods
- framework test adapters
- deliberately process-owned managed runtimes

Reusable services, repositories, policies, and workflows return Effect values. They do not call `runPromise`, hide `Effect.provide`, or manufacture a new runtime.

```ts
// Good: requirements and failures remain visible.
const program = reconcileAccount(accountId);

// Composition root: provide once, execute once.
const handler = () => AppRuntime.runPromise(program);
```

Prefer one managed runtime for a long-lived process or application graph. Do not build a runtime per request unless runtime isolation is itself a requirement.

## Dependency Direction

- Domain and application code depend on service tags and domain contracts.
- Adapter Layers depend on SDKs, databases, environment bindings, and platform APIs.
- Composition roots assemble the Layer graph.
- Host adapters translate between framework values and the fully provided Effect program.

Keep `Effect.provide` out of ordinary domain workflows. A workflow that silently chooses its own live implementation is harder to test, replace, and audit.

## Source Discipline

Effect v4 beta APIs can move. Verify the target project's exact pin before using or changing:

- `Context.Service` and Layer constructors
- `Effect.fn` transforms and `Effect.fnUntraced`
- Schema brands, unions, optional fields, transforms, and constructors
- unstable HTTP, HttpApi, RPC, SQL, workflow, and platform modules
- Cache, Stream, Schedule, Scope, and test helpers

Use current v4 source to refine a design. Never respond to an API mismatch by adding v3 compatibility branches or unchecked casts.

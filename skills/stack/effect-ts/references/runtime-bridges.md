# Runtime And Foreign Callback Bridges

Use this file when Effect code must cross a host callback, Promise callback, SDK registration, framework event, browser callback, worker message, transaction callback, AsyncLocalStorage boundary, or another runtime.

## Default Rule

Keep application contracts Effect-native. Do not call `runPromise`, `runSync`, or `runFork` merely to hide a dependency or failure type.

A bridge is justified when the **foreign protocol owns necessary state or lifecycle** that cannot be represented by returning an Effect directly. Examples include:

- a database transaction API that supplies the transaction handle only inside a Promise callback;
- an SDK that invokes a registered JavaScript callback;
- a browser or platform event listener;
- a framework hook that requires a Promise or synchronous return value;
- a second managed runtime that must inherit selected ambient context.

Keep the bridge in an adapter or host module. Expose an Effect-returning contract to application callers.

## Preserve Effect Semantics

A correct bridge answers all of these questions:

- How are typed failures represented outside the callback?
- How are defects distinguished from expected failures?
- Does interruption cancel or abort the foreign operation?
- Which Effect context, services, FiberRefs, trace parent, and log annotations are captured?
- Which non-Effect ambient state—such as AsyncLocalStorage, request locals, tenant identity, or workspace identity—must be restored?
- Which Scope owns callback-created fibers and resources?
- What happens when a callback arrives after the owner is disposed?
- How does rollback, acknowledgement, cancellation, or retry map to the completed `Exit`?

Do not squash an `Exit` into a generic JavaScript error and later guess whether it was a typed failure, defect, or interruption.

## Promise Transaction Callback

A foreign database library may require a callback that returns a Promise. The adapter can execute the transaction body there, provided it reconstructs the Effect result outside the callback.

```ts
class TransactionFailure<E> {
  constructor(readonly error: E) {}
}

class TransactionDefect {
  constructor(readonly cause: Cause.Cause<unknown>) {}
}

const transaction = <A, E>(
  body: Effect.Effect<A, E>,
): Effect.Effect<A, E | PersistenceError> =>
  Effect.tryPromise({
    try: () =>
      driver.transaction(async (transactionClient) => {
        const exit = await Effect.runPromiseExit(
          body.pipe(Effect.provideService(ActiveTransaction, transactionClient)),
        )

        if (Exit.isSuccess(exit)) return exit.value

        const failure = Cause.findErrorOption(exit.cause)
        if (Option.isSome(failure)) throw new TransactionFailure(failure.value)
        throw new TransactionDefect(exit.cause)
      }),
    catch: (cause) => cause,
  }).pipe(
    Effect.catch((cause) => {
      if (cause instanceof TransactionFailure) {
        return Effect.fail(cause.error as E)
      }
      if (cause instanceof TransactionDefect) {
        return Effect.failCause(cause.cause)
      }
      return Effect.fail(
        new PersistenceError({ operation: "transaction", cause }),
      )
    }),
  )
```

This is a pattern, not pin-proof API spelling. Verify the target pin's Cause helpers and the driver's rollback contract. Some drivers roll back on any rejection; others need an explicit signal.

Use an ambient transaction `Context.Reference` only when nested repository operations must transparently reuse the active transaction. Required database authority remains a normal service dependency.

## Registered Callback With Scoped Fibers

When a foreign SDK invokes callbacks, create a scoped runner rather than calling host-level `runFork` for each event:

```ts
export const ProviderEventsLive = Layer.effect(
  ProviderEvents,
  Effect.gen(function* () {
    const queue = yield* Queue.bounded<ProviderEvent>(256)
    yield* Effect.addFinalizer(() => Queue.shutdown(queue).pipe(Effect.asVoid))

    const runFork = yield* FiberSet.makeRuntime()
    const provider = yield* ProviderSdk

    yield* Effect.acquireRelease(
      Effect.sync(() =>
        provider.onEvent((raw) => {
          void runFork(
            decodeProviderEvent(raw).pipe(
              Effect.flatMap((event) => Queue.offer(queue, event)),
              Effect.catch((error) =>
                Effect.logError("ProviderEvents.invalidEvent", error),
              ),
            ),
          )
        }),
      ),
      (unsubscribe) => Effect.sync(unsubscribe),
    )

    return ProviderEvents.of({ events: Stream.fromQueue(queue) })
  }),
)
```

`FiberSet.makeRuntime` exists at the audited upstream revision but must still be checked against the target installation. Use an explicit `FiberSet` plus `FiberSet.runtime` when the service must inspect, join, clear, or count fibers.

Decide explicitly whether a callback decode failure is logged and dropped, emitted as a stream failure, dead-lettered, or stops the source.

## Ambient Context Propagation

A scoped runner owns fibers but does not automatically restore every host-local context. When a system uses AsyncLocalStorage or framework locals:

1. Capture only the state that must cross the boundary.
2. Capture the Effect `Context` or selected services at the owning boundary.
3. Restore host-local state before invoking callback code.
4. Provide the captured Effect context to the bridged program.
5. Keep the bridge narrow and test concurrent isolation.

Do not make arbitrary global mutable state the transport for request or tenant identity.

## Managed Runtime Bridges

Use a managed runtime when a host repeatedly invokes callbacks over one Layer graph:

```ts
export const AppRuntime = ManagedRuntime.make(AppLayer)

export const handle = (request: Request) =>
  AppRuntime.runPromise(route(request))

export const dispose = () => AppRuntime.dispose()
```

If multiple runtimes must share Layer acquisitions, use a deliberately shared `Layer.MemoMap` and test disposal semantics. Separately created runtimes do not implicitly share services.

## Tests

Cover:

- typed failure, defect, and interruption mapping;
- cancellation or abort propagation;
- rollback on every non-success exit;
- context and tenant isolation under concurrent callbacks;
- callback arrival after disposal;
- finalizer execution and runtime disposal;
- no leaked or detached fibers;
- the exact foreign library semantics that justify the bridge.

## Red Flags

- `runPromise` inside a repository only to remove `R` or `E` from its signature;
- a new managed runtime per ordinary operation;
- host-level `runFork` with no Scope owner;
- flattening every failure into `Error.message`;
- losing interruption or treating it as retryable;
- transaction callbacks that report success after a failed Effect;
- implicit global ambient state with no concurrent-isolation test.

# Unit, integration, lifecycle, and type tests

## Use complementary test layers

**Pure decision tests** call `initialTransition` / `transition` from `xstate`. Assert allowed targets, context invariants, forbidden/unhandled events, and action descriptions without starting an actor. These tests do not execute an Effect service or prove resource safety.

**Effect-host integration tests** create the real machine with `createEffectActor`, provide fake services, send commands, and await outcomes. This is the essential layer for this skill. Do not replace it with vanilla actor tests just because they are easier to write.

**UI and transport tests** verify ownership, readiness, authorization/decoding, public DTOs, duplicate submission, and user-visible outcomes. **Recovery tests** verify persisted contracts only on a restore-capable verified package. **Type tests** prove service and event/input contracts instead of disabling strictness.

## Synchronize on facts

A deterministic test controls the producer and observes the outcome. Use `waitFor` to know a state is reached; use an Effect Latch/Deferred to hold a fake service until the test releases it. Use `TestClock` for timers. Avoid real sleeps and “flush five microtasks” helpers, which encode scheduling guesses rather than behavior.

```ts
// Test fragment with imports/owner supplied by the harness.
const started = yield* Latch.make();
const heldTask = Effect.gen(function* () {
  yield* started.open;
  return yield* Effect.never;
});
// Provide heldTask through the service, start the invocation, then:
yield* started.await;
// Now cancellation tests know the task actually started.
```

Use finalizer signals to assert cleanup. Merely observing `cancelled` is not proof that the old connection closed. Assert cleanup after closing the owning scope, or wait for an explicit cleanup signal. Check that resources acquired with `withActorScope` remain alive through task completion and close with the root.

## Success is not enough

For each operation cover typed failure, unexpected error, stop before result, self-interruption where relevant, cancellation while running, timeout, duplicate commands, stale result, and retry exhaustion. For background actions, cover a late failure after the machine has moved to a different state. For streams, cover no initial value, finite completion, failure, cancellation, and high-rate input policy.

Test a machine's business outcome separately from its actor status. A recoverable `failed` state may still be an active actor waiting for RETRY; a final `rejected` state may be a normal completed actor. A terminal actor error is a different failure category. Do not write success-only `waitFor` calls that leave failing tests blocked indefinitely.

## Control time carefully

Provide `TestClock.layer()` from `effect/testing` around the test's Effect. Advance just before and at a boundary to check no premature expiration. Observe the state/producer gate before advancing. Cover cancellation removing a pending timer and re-entry resetting it. A waiter timeout uses the same clock, so virtual-time tests also need a runner-level real-time watchdog.

The included example test runner has a watchdog solely to fail a hung test; production workflow behavior uses Effect's Clock. It does not treat the watchdog as evidence that cancellation is correct.

## Type tests and service replacements

Add `@ts-expect-error` assertions for missing required actor input, invalid event payload, nonexistent event names, and unsatisfied services. Let TypeScript fail when an expected error disappears. Use explicit expected assignments to check output and tagged-state narrowing. For `.provide` overrides, verify replacement services appear in `RequirementsFrom` and removed ones are no longer required.

Do not use blanket `any`, `as unknown as`, `@ts-ignore`, or fabricated declarations to make examples compile. A type test that never imports the real package proves nothing about package compatibility. Preserve a small negative-test file that is compiled but not executed.

## Evidence and CI

The [example project](../examples/README.md) contains runnable test code, but this bundle's build environment could not install dependencies. Read [VALIDATION](../VALIDATION.md): syntax checks are not semantic typechecking or runtime tests. In a connected environment, install, create a lockfile, run typecheck and tests, then commit the verified lockfile. Record commands/results and package versions in the PR.

Sources: [Effect testing guide](27-source-index.md#effect-testing), [pure transitions and testing](27-source-index.md#testing), [Effect primitives](27-source-index.md#effect-primitives).

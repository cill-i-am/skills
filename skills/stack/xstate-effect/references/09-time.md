# Delays, deadlines, debouncing, and time tests

## Pick the clocked mechanism by meaning

Use a state `after` transition for a timed change in behavior, an invocation/task timeout for a bounded operation, and Effect `sleep`/Schedule for execution policy within a task. Do not implement machine deadlines with independent `setTimeout` calls that survive state exit or evade Effect's test clock.

```ts
// State fragments. Numeric delays are milliseconds.
waiting: {
  after: { 30_000: { target: 'expired' } },
  on: { APPROVE: { target: 'publishing' } }
}

// v6 state deadline form; onTimeout is required with timeout.
waiting: {
  timeout: '30s',
  onTimeout: { target: 'expired' }
}
```

These are alternatives, not two deadlines to install on the same state by default. State exit cancels its scheduled transitions. A targetless edit does not exit/re-enter and therefore does not reset the deadline. A self-transition with `reenter: true` does reset state-owned work. Specify whether edits extend a form timeout or whether the original deadline must remain fixed.

XState duration syntax and Effect duration inputs are different APIs. The inspected v6 docs accept numbers, `250ms`, `5s`, and ISO 8601 durations such as `PT1M30S`; do not assume `5m` or `1h` are valid. Effect examples use `Effect.sleep('5 seconds')` and `waitFor(..., { timeout: '5 seconds' })`. Prefer numeric milliseconds for machine delays when portability and clarity matter.

## Debounce and throttle explicitly

The [search example](../examples/src/search.ts) enters `debouncing`, waits, then invokes the latest search. A new query exits the current invocation and re-enters the debounce state. Empty input routes to idle. Keep the current query in context; keep timers in the state model rather than storing timeout handles in context.

An alternative is `enq.raise(event, { delay, id })` with `enq.cancel(id)` before replacement. Use stable timer IDs within an actor and avoid accidental collision between unrelated event families. Delayed internal work must not become an externally spoofable command; distinguish public event schemas from internal events.

Throttle is not debounce: throttle limits frequency while retaining a specified leading/trailing policy; debounce waits for quiet. Choose based on UX and service capacity. Neither is appropriate for lossless processing of payment/approval commands.

## Test with Effect's clock

The integration routes delays through Effect's `Clock`. Use `TestClock` from `effect/testing`; provide `TestClock.layer()` and drive time with `TestClock.adjust`. First observe a state or a service gate proving the timer/work is installed, then advance the clock, then await the resulting state. Advancing time before a child has registered its sleep is a race, not a reliable test.

```ts
// Fragment inside an Effect test with TestClock.layer() provided.
yield* waitFor(actor, (s) => s.matches('waiting'));
yield* TestClock.adjust('30 seconds');
yield* waitFor(actor, (s) => s.matches('expired'));
```

A timeout on the observer is not a timeout on the operation. `waitFor(..., { timeout })` stops waiting but does not automatically stop the actor or cancel the task. Test under the same virtual clock carefully: a watchdog on that clock cannot rescue a test when virtual time never advances. Keep a separate test-runner wall-clock watchdog to diagnose deadlocks.

## Absolute deadlines and restart

A business deadline is often an absolute timestamp, not “30 seconds after the process last started.” Store deadline data and define clock-skew behavior at system boundaries. Obtain timestamps through Effect's Clock/service boundary, not ambient `Date.now()` in pure transitions. Events may carry a trusted timestamp supplied by the runtime/transport.

Alpha.6 does not expose snapshot restoration in `createEffectActor`. Source-preview alpha.7 preserves pending timer deadlines, but this is not a durable wakeup service while the process is absent. A durable host must arrange wakeups and reconcile overdue work. Test same-instant command/deadline races with a stated precedence policy rather than depending on unspecified external arrival order.

Sources: [delays and timeouts](27-source-index.md#time), [Effect tests](27-source-index.md#effect-testing), [release distinctions](00-version-contract.md).

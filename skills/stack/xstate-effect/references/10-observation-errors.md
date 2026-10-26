# Observing an actor and handling errors

## An event enqueue is not its outcome

```ts
import { Effect } from 'effect';
import { createEffectActor, send, waitFor } from '@xstate/effect';
import { publishMachine } from '../examples/src/approval.js';

// Illustrative composition; provide Publishing and a Scope at its owner.
const run = Effect.gen(function* () {
  const actor = yield* createEffectActor(publishMachine, {
    input: { documentId: 'doc-1', operationId: 'op-1' }
  });
  yield* send(actor, { type: 'APPROVE' });
  return yield* waitFor(actor, (s) => s.matches('published'), {
    timeout: '5 seconds'
  });
});
```

Do not immediately assert `actor.getSnapshot()` after a send. The mailbox runs asynchronously. Also avoid waiting only for success when failure is an equally valid outcome: a success-only predicate can hang on an active `failed` state. Wait for the relevant outcome set or use `join` when the whole actor is meant to finish. Correlate results for overlapping requests.

## Observation surface

| API | Contract to rely on |
| --- | --- |
| `send` | Effect that enqueues; direct and pipeable forms |
| `snapshots` | Current snapshot plus subsequent notifications; includes terminal/error snapshots |
| `waitFor` | Await a matching snapshot; supports type-predicate narrowing and optional timeout |
| `join` | Await final output or expose actor failure |
| `emitted` | Observe emitted notifications, not an event-history database |
| `inspect` | Observe actor-system inspection activity |
| `deadLetters` | Observe event rejection records |

Streams are lazy. Constructing `emitted(actor)` does not attach a running consumer. Install/activate consumers before the event they must observe. Do not claim a complete audit history from a subscription started after actor creation. For snapshots, an error is represented as a snapshot value; a consumer that ignores `status` can silently miss failure.

## Distinguish the failure channels

A task failure travels into its actor's error snapshot and the invocation's `onError`. `join` preserves a `fromEffect` task's typed error. An arbitrary machine can fail through arbitrary execution paths, so its joined error is `unknown`; inspect/narrow it rather than casting it to a convenient business error.

`ActorStoppedError` means the actor stopped before an awaited output; an unmatched `waitFor` can also report it when the actor errors. `EffectInterruptedError` represents self-interruption inside hosted Effect logic. State-exit/actor-stop interruption is a normal cancellation path, not that self-interruption failure. A timed `waitFor` fails with Effect's `Cause.TimeoutError`.

Do not mix Effect's timeout type with similarly named core XState timeout errors. An invocation timeout, a task's Effect timeout, a UI waiter timeout, and a provider HTTP timeout require different recovery actions. Convert an unknown error to a serializable public error code/message at a boundary; keep internal causes in protected diagnostics.

## Background actions and supervision

A declared Effect action is asynchronous background work, not a awaited state transition. An error can arrive after the machine has moved elsewhere and is handled according to its current state. A late audit failure must not accidentally fail an unrelated user flow. Either recover/log non-critical errors inside the action, or model critical work as an invocation whose outcome the machine owns.

Always give long-lived actors an explicit error observer/supervisor. A created actor is not automatically monitored by the application simply because it lives in a Scope. Record terminal state, reason, retry policy, and owner cleanup. Do not turn every defect into an indefinite retry.

## Rejected versus unhandled

`deadLetters` reports failed delivery/validation such as a stopped target, invalid event, or forbidden internal event. A well-formed event delivered to an actor but not handled in its current state is a different category. Use state-aware command responses, pure `isUnhandled` checks, or the supported inspection/host facilities. Do not promise alpha.6 vanilla `onUnhandledEvent` constructor-option parity.

Sources: [observing actors](27-source-index.md#effect-observation), [errors and tests](27-source-index.md#effect-testing), [transitions](27-source-index.md#transitions).

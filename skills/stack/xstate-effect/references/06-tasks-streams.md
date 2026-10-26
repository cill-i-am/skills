# Effect tasks, streams, and external APIs

## Choose the adapter by the consumer's contract

| Adapter | Meaning of successful work | What the consumer observes |
| --- | --- | --- |
| `fromEffect` | One operation finishes | Final `output`; invoking machine receives `event.output` |
| `fromEffectStream` | A sequence of values ends | Latest value in `context`; `undefined` before the first item; no final output |
| `fromEffectEventStream` | A sequence of workflow events ends | Items delivered to its parent machine; completion has no output |

All three belong under the Effect host. Use the function form for actor input, and the configuration form for schemas/validation. The task's source receives `input`, `self`, `system`, and `emit`. Task logic is not a general mailbox-driven reducer; model commands in a parent machine rather than assuming sending arbitrary messages into a task changes it.

```ts
import { Context, Effect, Schema } from 'effect';
import { fromEffect } from '@xstate/effect';

class Catalog extends Context.Service<Catalog, {
  readonly lookup: (sku: string) => Effect.Effect<{ name: string }, Error>
}>()('shop/Catalog') {}

export const lookup = fromEffect({
  schemas: { input: Schema.Struct({ sku: Schema.String }) },
  effect: ({ input }) => Catalog.use((api) => api.lookup(input.sku))
});
```

Register `lookup` in `setupEffect({ actors: { lookup } })`. Invoke it from a `loading` state and handle both outcomes. Keep service implementations outside the machine; use Layers for production and deterministic fakes for tests.

## SDK adaptation belongs in an Effect service

Wrap a Promise-producing SDK once, at the service boundary. Do not unwrap an Effect to a Promise only to rewrap it as actor logic. Forward interruption into a cooperative API and map unknown failures to a domain error:

```ts
import { Data, Effect } from 'effect';

class TransportFailure extends Data.TaggedError('TransportFailure')<{
  readonly cause: unknown
}> {}

export const readText = (url: string) => Effect.tryPromise({
  try: async (signal) => {
    const response = await fetch(url, { signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.text();
  },
  catch: (cause) => new TransportFailure({ cause })
});
```

This is an adapter example, not a safe arbitrary-URL fetch endpoint. A production service restricts destinations, bounds response size/time, redacts credentials, and applies domain-specific HTTP error policy. Do not treat all HTTP errors as transient or retry non-idempotent writes blindly.

## Stream ownership and termination

A stream invocation on an enclosing `connected` state stays alive while `connected` changes between its children. Putting it on each child tears it down and reconnects on each transition. Conversely, a subscription needed only while editing belongs to the editing state's invocation, not the application root.

Choose **latest-value semantics** for progress/telemetry and **event semantics** for facts that drive transitions. A displayed 60% can supersede 59%; an authorization decision cannot generally supersede a cancellation request without processing it. Distinguish normal feed completion, transport failure, and a domain event that explicitly means completion. Handle invocation `onError`; a silent disconnected feed must not leave the UI claiming live connectivity.

`fromEffectStream` has no value before the first emission. Render that state explicitly. Do not call `join` expecting the final stream item; consume `snapshots`, select `context`, or compute a task result from the stream when a single aggregate is wanted. [Complete stream examples](../examples/src/streams.ts) show both adapters.

## Backpressure and resource safety

An Effect Stream's producer/consumer semantics do not turn the actor mailbox into a bounded queue. Coalesce high-rate latest-value signals before crossing the actor boundary. For must-process events, use bounded ingress, acknowledgements, durable delivery where required, and explicit overflow behavior. Do not drop business events under a generic “debounce everything” optimization.

Acquire subscriptions with Effect scope-aware adapters and release them on completion/error/interruption. Resources needed by later tasks may use `withActorScope`, but only with a deliberate root-actor lifetime. Never capture an SDK connection from a request scope that closes before the actor.

Sources: [Effect actor logic](27-source-index.md#effect-logic), [Effect 4 primitives](27-source-index.md#effect-primitives), [lifetime source](27-source-index.md#released-actor-source).

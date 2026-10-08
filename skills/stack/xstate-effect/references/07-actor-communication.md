# Children, messages, notifications, and actor systems

## Model ownership separately from addressing

An invocation is attached to a state: leaving that state stops the invoked actor. A spawned actor has the parent's lifetime unless explicitly stopped. Use invocation for one current search, upload, connection, or approval task. Use spawning for a changing collection of independently managed jobs. A registry key is an address, not a resource owner or security permission.

In v6, a registered actor uses `registryKey`; `system.get(key)` retrieves an addressable actor. Do not import the old `systemId` assumption or pass root registry options to alpha.6 `createEffectActor`, whose options are narrower. Give children deterministic IDs where inspection or restoration depends on identity, and distinguish durable business IDs from an actor session's identity.

The core `createSystem({ registry })` builder can supply typed registry keys, but its documented `system.createActor` starts a core runtime. Do not copy that host into an Effect project. Until a compatible typed-builder/Effect-host path is verified, prefer direct typed child references and the integration-owned system. Always handle a missing registry key and avoid duplicate registrations.

## Register Effect-backed sources

```ts
// Fragment inside an Effect machine with a declared `worker` actor.
// `event.jobId` and the child input contract must be declared in schemas.
START: (args, enq) => {
  const child = enq.spawn(args.actors.worker, {
    id: `job-${args.event.jobId}`,
    input: { jobId: args.event.jobId }
  });
  return { context: { ...args.context, worker: child } };
}
```

For a complete registered spawn and lifecycle-subscription example, see [composition.ts](../examples/src/composition.ts).

Do not put this runtime reference in a public JSON DTO. Do not spawn inline `fromEffect(...)` logic: registration is how dependency requirements are known. Track spawned jobs and remove/stabilize their references after completion; stopping an actor is not the same as deleting an entry from your context map. Bound the collection and define duplicate-ID behavior before using dynamic spawning as a job queue.

## Commands, emitted notifications, and lifecycle events

A **command** is input to another actor (`send` or `enq.sendTo`). A **notification** is an emitted event intended for observers (`enq.emit` / source `emit`). A **lifecycle event** reports child completion, failure, or timeout. Do not use `emit` expecting a parent transition unless an explicit listener maps it into a command/event.

For a child invocation, prefer local `onDone`, `onError`, and `onSnapshot` handlers. For more flexible relationships use `enq.listen(child, eventType, mapper)` and `enq.subscribeTo(child, { done, error, snapshot })`. These create listener actors; retain the returned references when their lifetime should end before the parent. Entry-created listeners are not automatically tied to state exit. Use `enq.stop(listener)` or a state-owned invocation design.

A `subscribeTo` snapshot mapper handles active snapshots; completion/error mappings are separate. `listen` supports event selectors including prefixes, while direct `actor.on` has a different matching surface. Verify the exact API instead of transferring wildcard assumptions between them. Annotation may be needed for the emitted event mapper's payload; a string event name alone does not prove a fully inferred payload.

## Correlation and acknowledgement

Use a command envelope such as `{ type, commandId, workflowId, expectedRevision, ...payload }` at a transport boundary. The trusted transport supplies tenant and principal identity, not the untrusted payload. An acknowledgement should distinguish accepted, rejected, already-applied, and completed. `yield* send(actor, event)` does not provide any of those guarantees.

A waiter such as `waitFor(actor, s => s.matches('saved'))` is insufficient for overlapping saves: it might observe a previous operation's state. Also match a request/revision ID, or allocate one actor per operation. Keep an idempotency record outside an ephemeral actor when retries cross process lifetimes. An emitted acknowledgement without replay can be missed by a late subscriber; install the subscriber before sending or expose correlated durable/current state.

## Error and supervision boundaries

Each parent decides which child failures it owns. Expected validation/remote errors normally lead to recoverable states. Unexpected failures may terminate the child and trigger a supervisor policy. A new actor instance is not a safe automatic retry until its unfinished external work has been reconciled. Never construct an unbounded restart loop that leaks children, repeats charges, or swallows defects.

A local actor system is not a network transport, authentication layer, replicated data store, or guarantee of exactly-once delivery. Across tabs/processes/hosts, define serialization, authentication, ordering, deduplication, disconnection, and recovery independently.

Sources: [invoke and spawn](27-source-index.md#actor-composition), [listen and subscribe](27-source-index.md#listen-and-subscribe), [systems](27-source-index.md#systems), [Effect observations](27-source-index.md#effect-observation).

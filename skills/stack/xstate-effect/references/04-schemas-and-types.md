# Schemas, type inference, and trust boundaries

## Declare the public protocol

`setupEffect` accepts Effect schemas for input, context, events, output, emitted/internal events, and per-state contracts. Event-map values describe payloads; the key provides the event type.

```ts
const workflow = setupEffect({
  schemas: {
    input: Schema.Struct({ documentId: Schema.String }),
    events: {
      APPROVE: Schema.Struct({ reviewerId: Schema.String }),
      CANCEL: Schema.Struct({ reason: Schema.String })
    },
    emitted: {
      changed: Schema.Struct({ documentId: Schema.String })
    }
  }
}).createMachine({ /* state configuration */ });
```

The fragment illustrates contracts rather than a complete executable file. Prefer inferred `EventFromLogic`, `InputFrom`, `OutputFrom`, and `SnapshotFrom` over duplicated handwritten copies. Use `EffectActor<typeof machine>` for an owned runtime handle and `RequirementsFrom<typeof machine>` to inspect dependencies.

A TypeScript `as` assertion does not validate untrusted data. Avoid `as any`, `as unknown as ...`, and broad actor types that erase the event protocol to make a composition compile.

## Runtime checks are opt-in

Effect schemas in machine setup supply types. Add `validator: standardSchemaValidator()` from `xstate/validation` for runtime checking by the machine. Without that validator, do not describe the event path as runtime validated merely because a schema appears in setup.

XState's validator checks values; it does not replace them with decoded/transformed results. For this boundary, use synchronous, environment-free schemas whose encoded and decoded types agree. Do transformations, asynchronous refinements, and service-dependent decoding in Effect before delivery.

```ts
const ApprovePayload = Schema.Struct({ reviewerId: Schema.String });

const decodeApproval = (raw: unknown) =>
  Schema.decodeUnknownEffect(ApprovePayload)(raw);
```

A production command adapter should authenticate, decode, authorize the resource and tenant, establish a trusted command identity, then `send` a typed event. Decode failure is a request/domain error. Invalid actor input rejected during creation can instead surface as a defect. Pre-validation gives callers a clearer contract.

## Separate internal and external events

Use internal events for machine-owned coordination, not as an unprotected network protocol. The integration's dead-letter stream distinguishes invalid payloads and externally supplied internal events. A client must never be allowed to impersonate lifecycle notifications such as task completion. Whitelist public commands at the transport boundary regardless of TypeScript types.

Emitted events are outward notifications. They are not automatically commands back into the actor, do not constitute a durable event log, and are not replayed for late observers.

## State-specific data

Declare per-state context through `setupEffect({ states: { ... } })` when the available data genuinely changes with state. Then `taggedState(snapshot)` and `TaggedState<typeof machine>` support exhaustive `Match.tag` branches. See the complete [matching example](../examples/src/matching.ts).

For parallel machines the tag stops at the parallel node; a root parallel machine uses `'(machine)'`. It is not a Cartesian-product discriminator for every regional combination. Use `snapshot.matches`/regional selectors where needed.

Type narrowing is not authorization, schema migration, or removal of stale runtime fields. Test state-specific input and context transitions, especially when persisting snapshots or serializing a public view.

## Input and output

Actor input is construction data, not a live subscription to changing props. Send an event or construct a different instance when the workflow identity changes. Output exists on completion; use snapshots/selectors for progress. Model declined/cancelled/expired business outcomes as explicit final-state results rather than conflating them with unexpected machine failure.

A `fromEffect` actor preserves its typed error channel. A general machine can fail with arbitrary action/child errors, so `join(machineActor)` has an `unknown` error channel. Preserve this distinction in APIs and tests instead of asserting a narrower type without evidence.

Sources: [Effect schemas/actions](27-source-index.md#effect-schemas-actions), [matching states](27-source-index.md#matching-states), [Effect 4 schema API](27-source-index.md#effect-schema-api).

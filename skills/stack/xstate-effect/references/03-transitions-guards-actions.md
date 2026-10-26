# Transitions, guards, and actions

## Author v6 transitions

Use one transition configuration or synchronous function per event. Branch in the function rather than returning a v5 array of guarded alternatives. A targetless transition can edit context without leaving the current state.

```ts
on: {
  SUBMIT: ({ context }) => {
    if (context.title.trim().length === 0) return;
    return { target: 'saving' };
  },
  CHANGE: ({ context, event }) => ({
    context: { ...context, title: event.title }
  })
}
```

This is a configuration fragment; event and context schemas belong in `setupEffect`. A function that returns `undefined` **and enqueues nothing** does not handle the event. An action-only function can still handle an event. `{}` can represent handling without changing state. Do not assume all three cases have identical bubbling or observation behavior.

Conditions must be pure and synchronous. Use a named plain guard for a reusable policy; pass explicit inputs rather than reading ambient mutable state. If a policy needs I/O, enter a checking state and invoke an Effect, then branch on its result.

## Event resolution and hierarchy

Put shared transitions on the relevant parent. A child can declare an event as `undefined` to block the parent transition. A missing child handler is different: a parent may still handle the event. Test this distinction for cancellation restrictions and modal/wizard behavior.

Use exact handlers before broad event families. Wildcards (`'document.*'`, `'*'`) are useful for protocol edges but can hide misspelled events and forbidden commands. Do not use a catch-all that silently makes every command legal. `matches` is a shallow payload pattern; use primitive IDs rather than newly allocated nested objects.

Use relative/dotted paths or explicit `#id` targets consistently. Typed target checks help, but tests should still prove actual ancestor exit/entry behavior. A reentering transition can restart invocations and deadlines. Use `reenter: true` intentionally, not as a generic refresh flag.

## Context updates

Keep transitions deterministic. Do not mutate arrays/objects, read `Date.now()`, generate random IDs, perform network calls, or start fibers while calculating the next snapshot. Obtain time/IDs through Effect before sending an event or supply them as actor input.

The audited documentation conflicts about partial context update semantics. Preserve intended shared fields explicitly and add a pin-specific regression test. A shallow spread does not preserve nested members when you overwrite their parent object.

## Declared Effect actions

```ts
const setup = setupEffect({
  actions: {
    note: ({ event }) => Effect.log(`Command: ${event.type}`)
  }
});
// In the machine built from this setup:
// APPROVE: (args, enq) => {
//   enq(args.actions.note, args);
//   return { target: 'approved' };
// }
```

The integration constrains declared actions to the `EffectActionArgs` shape (context, event, self/family, sources, system, and optional params/output). Do not copy an arbitrary top-level parameter-object signature from a plain core action example into `setupEffect`. Enqueue the compatible machine argument object, as above; the complete background-action example uses an explicit `EffectActionArgs` annotation.

Named action functions are called synchronously to obtain an Effect. Keep construction pure; put synchronous side effects in `Effect.sync`/`Effect.suspend` or use existing Effect combinators. The returned Effect runs after the transition commits, without blocking later mailbox events.

A background failure is routed to the **current** state's `onError`, not necessarily the state that originally queued the action. Design a suitable error boundary and correlation strategy. For work whose result determines the next transition, invocation is clearer and safer.

Final completion or scope closure can interrupt outstanding background actions. Best-effort telemetry may be an action. Required audit persistence is not “best effort” merely because it is called an audit: invoke it and wait or use a durable outbox.

## Enqueue operations

`enq.raise`, `sendTo`, `emit`, `cancel`, `spawn`, `stop`, `listen`, and `subscribeTo` describe work for the transition. The enqueue handle is valid only during the synchronous callback. Never retain it inside an Effect, Promise, timeout, or event listener. A later Effect action can send a new event through its actor reference instead.

Never write `enq(() => Effect.log(...))`: creating an Effect is not executing it. Never manually call an action implementation just to bypass named action registration and its service inference.

Sources: [tagged transition docs](27-source-index.md#transitions), [Effect schemas/actions](27-source-index.md#effect-schemas-actions), [context discrepancy](00-version-contract.md).

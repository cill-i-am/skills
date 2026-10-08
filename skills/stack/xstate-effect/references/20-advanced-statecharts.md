# Hierarchy, parallel regions, history, choice, and routing

## Hierarchy eliminates duplicated policy

Put shared events and state-owned invocations on the lowest common parent where they apply. Child states define local behavior; an explicit `EVENT: undefined` can block an inherited handler. A missing child handler can allow the parent to handle it. Test this difference for destructive commands and cancellation.

Use explicit IDs and target paths where cross-level transitions need clarity. A transition targeting a descendant is not interchangeable with exiting and re-entering the parent. Re-entry can restart timers and invoked services. Prefer the smallest lifecycle boundary that reflects the product behavior.

## Parallel regions represent independent state dimensions

```ts
// Fragment inside setupEffect(...).createMachine(...).
active: {
  type: 'parallel',
  states: {
    review: {
      initial: 'pending',
      states: {
        pending: { on: { APPROVE: { target: 'accepted' } } },
        accepted: { type: 'final' }
      }
    },
    build: {
      initial: 'running',
      states: {
        running: { invoke: { src: 'build', onDone: { target: 'ready' } } },
        ready: { type: 'final' }
      }
    }
  },
  onDone: { target: 'readyToPublish' }
}
```

All required regions reaching final allows the parent to complete. A final state completes its parent; it is not merely a status label. Handle build failure explicitly in a complete implementation. Parallel regions can respond to the same event; shared context writes need care and regression tests. Do not rely on conflicting updates to implement an implicit transaction.

A parallel model avoids enumerating every Cartesian combination by hand, but the combinations still exist for testing. `taggedState` stops its tag at the parallel node; for a root parallel machine the tag is `'(machine)'`. Use `snapshot.matches` or the state value for region-specific rendering.

## History is control-state memory, not persistence

A v6 history node requires a nonempty default target. Shallow history remembers the immediate child; deep history remembers nested configuration. Resume only when underlying prerequisites still hold. Changing a plan, role, or form answer may invalidate the remembered path. A history node does not save database records, revive an interrupted Effect continuation, or recover after process loss by itself.

Avoid using history where an explicit `resumeAt` decision with validation is clearer. Test first entry with no history, repeated pause/resume, altered context, and fallback target behavior.

## Choice states and eventless routing

A `type: 'choice'` node uses a synchronous `choice` function that selects a target. Return a valid target for every possible input; do not leave a choice branch unresolved. Use this for a visible routing point based on already available facts. Fetch missing facts through an invoked Effect first.

`always` transitions run without an external event. Ensure they converge: an always self-cycle or two states bouncing without changing the condition can hang computation. Prefer an explicit decision state when it makes the graph easier to understand. Keep guards pure and deterministic.

## State input and per-state context

Root actor input initializes one actor. State input supplies data for a particular target entry and is declared in the setup's state schema contract. Per-state context describes state-specific available fields. Do not confuse either with emitted event payloads or invoke input. Use schema-derived narrowing and exhaustive Match for state-specific rendering; do not scatter casts to pretend optional fields are present.

The shared-context merge discrepancy noted in the version contract matters when leaving typestates: do not assume omitted secret/stale fields are erased. Explicitly define cleanup policy and test installed semantics.

## Route states, tags, and metadata

Route states need explicit IDs and route configuration. The `xstate.route` event can target a route; it is not an ordinary source transition or authorization mechanism. Gate route availability with trusted facts and server checks. A browser URL must not jump directly into a privileged completed/approved state.

Tags describe semantic UI categories such as busy or cancellable across multiple structural states. Metadata supplies descriptive information. Neither executes permission checks. Use tags/selectors instead of exposing fragile internal state paths to every component, while retaining exact path assertions in machine tests.

Sources: [statecharts and state kinds](27-source-index.md#statecharts), [matching](27-source-index.md#effect-matching), [transitions](27-source-index.md#transitions).

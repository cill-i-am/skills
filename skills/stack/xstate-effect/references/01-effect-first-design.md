# Decide what Effect and XState each own

## Begin with the existing Effect application

A business operation should remain callable without a particular UI or state machine. Keep domain policies, HTTP/SQL clients, authorization, schema decoding, and external SDK adaptation in ordinary Effect services and functions. The machine expresses **when** those operations may run and **what event or outcome changes the workflow**.

A useful boundary is:

```text
UI / API / CLI / webhook
    -> authenticate, decode, authorize, correlate
    -> workflow command
    -> XState transition
    -> invoked Effect operation
    -> existing service and infrastructure Layers
    -> typed outcome or workflow event
```

This is an architectural convention, not a requirement to create a framework. One feature can own its machine, task adapters, tests, and frontend selectors. Shared infrastructure belongs where the repository already puts it.

## Selection table

| Situation | Starting point |
| --- | --- |
| Transform data or calculate a value | A pure function |
| Fetch, decode, validate, save, with bounded retry | An Effect program |
| Run N independent requests with a concurrency limit | Effect concurrency |
| Maintain one reactive value or derive UI data | Existing Effect atoms or the current state/data tool |
| Await approval, accept cancellation, expire, retry on command | XState through `@xstate/effect` |
| Coordinate independently active modes | Hierarchical/parallel statechart |
| Create independently addressable workflow instances | Actor composition with explicit ownership |
| Survive process death, coordinate hosts, execute days later | A durable execution/storage design in addition to the machine |

Do not build `idle → loading → done` around every service solely because it is possible. A machine earns its cost when it makes behavior easier to inspect, evolve, test, or explain. State count alone is not the criterion: a small payment/approval lifecycle can have important forbidden commands and cancellation rules.

## One authority per fact

The machine owns workflow phase. The backend database owns persisted business entities. A form library can own low-level field registration and a query cache can own cached server records. Effect services own resource access. Define which layer wins on reconciliation rather than synchronizing several unrelated `isLoading`, `status`, and `isComplete` variables.

A frontend machine can represent optimistic intent; it cannot prove a server-side payment or authorization happened. Use operation IDs and authoritative responses. A server machine may own a business lifecycle while the client owns a separate interaction lifecycle. They need not share the same states or transport raw snapshots.

## Services and ports

Prefer a small service contract such as `publish(input): Effect<Receipt, PublishError>` over providing a raw SDK, full database connection, or application container to every actor. Reuse an existing service where it already expresses the operation. Do not add a service class just to wrap a single pure helper.

Machine context should carry serializable workflow data and identities. Runtime services, credentials, mutable connections, fibers, and subscription handles live in Effect's environment and scopes. Actor references are legitimate for local composition, but require an explicit persistence and public-DTO policy.

## What not to duplicate

Use Effect for retry schedules inside one task, scoped acquisition/release, service substitution, streams, concurrency limits, tracing, and typed failures. Use XState for legal next steps, operator retry, human approval, shared cancellation rules, and state-dependent deadlines. Do not hand-roll a second dependency container, lifecycle system, or Promise cancellation bridge.

Do not casually introduce a second actor/durability platform. When one already exists, choose whether it hosts an Effect-owned machine, invokes a bounded machine operation, or replaces the need for a machine. Prove that integration before promising durable semantics.

## Questions that reveal the model

Which commands are legal now? Which operations stop when we leave? Which resources survive a child step? What does a retry repeat? What happens when the caller disconnects? Who knows whether the remote operation succeeded after an ambiguous timeout? Which state should an operator see while that uncertainty is resolved?

These questions usually produce a better machine than translating every line of an existing async function into a state.

Sources: [Effect quick start](27-source-index.md#effect-quick-start), [actor ownership](27-source-index.md#effect-actors). Architecture guidance here is a proposed convention for Effect-first applications.

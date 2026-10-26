# Official integration API reference

This is a task-oriented inventory of the alpha.6 public entrypoint, not a replacement for installed TypeScript declarations. Exact overloads and conditional inference belong to the package. See [version contract](00-version-contract.md) before using preview options.

## Author and start

| Export | Use / important constraint |
| --- | --- |
| `setupEffect` | Author a machine with Effect schemas, declared actions, actors, guards, delays, and state contracts |
| `createEffectActor` | Create/start a scoped actor; alpha.6 options expose input only |
| `EffectActor` | Returned ActorRef-compatible handle; do not manually construct an alternate host |
| `EffectActorOptions` | Version-specific constructor option type |
| `RequirementsFrom` | Required services gathered from known Effect actions/actors; nested inference has a depth limit |
| `EffectSetupReturn` | Return type of Effect-aware setup |
| `EffectAction`, `EffectActionArgs` | Declared Effect action implementation contracts |

The actor handle supports the XState observation/command contract: `send`, `getSnapshot`, subscription, emitted-event listeners, and persisted-snapshot access. Consult its declarations for the exact supported instance methods. Do not infer constructor-option parity from its ActorRef compatibility. Use scope ownership instead of untracked manual lifetime management.

## Adapt tasks and streams

| Export | Purpose |
| --- | --- |
| `fromEffect` | One scoped task; successful value becomes output |
| `fromEffectStream` | Latest stream value becomes snapshot context |
| `fromEffectEventStream` | Stream items are events forwarded to the parent |
| `EffectSource`, `EffectSourceArgs` | Source value/function contract and input/self/system/emit arguments |
| `EffectStreamSource` | Stream source contract |
| `EffectActorLogic`, `EffectLogicBrand` | Effect-backed logic types/branding |
| `EffectSnapshot` | Task snapshot type |
| `EffectStreamActorLogic`, `EffectStreamSnapshot` | Stream logic/snapshot types |

Each adapter accepts an appropriate Effect/Stream value, source function, or configuration. Input schemas may make input mandatory; inferred service requirements must be provided by the owner. A task actor is not an arbitrary mutable mailbox handler.

## Observe and command

| Export | Outcome |
| --- | --- |
| `send` | Enqueue as an Effect; direct/pipeable; not acknowledgement |
| `snapshots` | Stream of current/subsequent snapshots |
| `waitFor` | Await predicate, optionally narrowed and timed |
| `WaitForOptions` | Wait options, notably Effect duration timeout |
| `join` | Final output or actor failure/stop error |
| `emitted` | Stream of notifications |
| `inspect` | Stream of inspection events |
| `deadLetters` | Stream of event rejection records |
| `EmittedEventFrom` | Derive emitted-event type |
| `SendableEventFrom` | Derive externally sendable event type |

Do not import similarly named core Promise helpers by habit. The integration functions are the default inside Effect code. Streams need running consumers; notification streams are not durable replay logs.

## Scope and error contracts

`ActorScope` names the owning root Effect actor's scope service. `withActorScope` moves an acquisition to that lifetime; use sparingly. Normal task scopes release before task completion/failure is reported.

`ActorStoppedError` reports an unavailable awaited result. `EffectInterruptedError` reports self-interruption. `ErrorFrom` is re-exported from XState for extracting actor error types. Effect's `Cause.TimeoutError` is not defined by this package but is important for timed waits. Task typed failures and unknown machine failures must be handled distinctly.

## Schema and state types

`EffectSchema`, `EffectSchemaLike`, `EffectSetupSchemas`, and `EffectSetupStateSchema` describe accepted schema contracts. Use Effect Schema directly in `setupEffect`; runtime checking remains opt-in through core `standardSchemaValidator`. Decode transformations outside the machine.

`taggedState` creates the tagged state view. `TaggedState<typeof machine>`, `TaggedStateFrom<Snapshot>`, and `StateTag<StateValue>` name its type-level forms. Tags follow dotted state paths except at parallel configurations. Exhaustive `Match` is valuable for rendering/decision adapters.

## Atom subpath

`@xstate/effect/atom` provides `createActorAtoms` and `NotReadyError`. It integrates with `Atom.runtime` / `AtomRegistry` from `effect/reactivity`. Returned atom members: `actor`, `snapshot`, `result`, `send`, `select`, `state`. Readiness, registry ownership, and Layer error types are part of the contract. Consult installed declarations for any additional exported helper types rather than assuming root exports cover this subpath.

## Legitimate companion core APIs

Core type extraction (`SnapshotFrom`, `ActorRefFrom`, event/input/output types), pure transition APIs, graph utilities, validation, and schema/configuration tooling can be imported from their documented `xstate` entrypoints. They do not authorize starting an alternate runtime. Optional package/API compatibility must be verified, especially model-testing, serialization, and durability surfaces.

Sources: [alpha.6 export inventory](27-source-index.md#integration-exports), [Effect docs](27-source-index.md#effect-guides), [atom guide](27-source-index.md#effect-atoms).

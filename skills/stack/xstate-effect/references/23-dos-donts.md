# Dos, don'ts, and review heuristics

| Do | Don't | Why it matters |
| --- | --- | --- |
| Start with the installed package/lockfile | Mix current docs, v5 memory, and v6 alpha code | API generations differ materially |
| Use `setupEffect` and the Effect host | Start Effect logic with `createActor` or `useMachine` | Hosted services/scopes are required |
| Keep simple work as Effect | Put every CRUD call in a machine | Complexity must earn its place |
| Keep transition decisions synchronous and pure | Await APIs or read ambient time inside transitions | Determinism and replay/testability |
| Return immutable context updates | Mutate arrays/objects in snapshots | Shared snapshots must remain stable |
| Preserve intended context fields explicitly | Rely on conflicting docs about implicit merge/replacement | Version-sensitive behavior needs tests |
| Register named Effect actions | Return an Effect from an arbitrary callback | Returned lazy Effect may never execute |
| Invoke work that determines success | Fire-and-forget required payment/persist/audit | Final state can interrupt unfinished work |
| Register Effect actor sources | Inline-spawn undiscoverable Effect requirements | Dependency inference and persistence identity |
| Choose state/task/root lifetimes deliberately | Keep every resource until application exit | Leaks and wrong cancellation behavior |
| Observe the outcome after `send` | Treat enqueue as acknowledgement or completion | Mailbox processing is asynchronous |
| Correlate commands and responses | Match only a generic success state for concurrent work | Stale outcomes can satisfy the wrong waiter |
| Decode/authorize at ingress | Cast untrusted JSON into an event union | Types are not runtime validation or permission |
| Use synchronous identity-preserving actor validators | Expect the validator to apply schema transformations | Decode before entering the actor |
| Use Effect Clock/TestClock | Use ad hoc real timers for workflow semantics | Cleanup and deterministic tests |
| Separate local interruption from remote cancellation | Label a charge refunded when its fiber stops | External work may already be accepted |
| Use stable idempotency keys | Generate a new key on each retry | Duplicate work can become authoritative |
| Bound retry and admission | Spawn unlimited workers or restart forever | Capacity and failure amplification |
| Install notification consumers before sending | Assume emitted events replay for late listeners | Notifications can be missed |
| Inspect error snapshots or `result` | Assume snapshot streams fail their channel on actor error | Failure can be a snapshot value |
| Observe long-lived root errors | Create an actor and forget its outcome | Unobserved errors can remain silent |
| Dispose runtime/registry owners | Let an arbitrary reader component stop shared work | Ownership and rendering are distinct |
| Wait for atom readiness | Send during runtime startup and assume buffering | `NotReadyError` is possible |
| Use per-request SSR owners | Share tenant-sensitive module globals | Cross-user data leakage |
| Version/review persistence | Restore arbitrary JSON or assume fiber continuation | Crash recovery is a separate contract |
| Rebind trusted serialized implementations | Evaluate untrusted machine code strings | Code execution risk |
| Test real Effect lifecycles | Rely solely on graph/state coverage | Pure transitions do not prove cleanup |
| Redact inspection and traces | Share raw snapshots with hosted tools | Data exposure |

## Recognize misleading code shapes

**An async transition:** returning a Promise is invalid for decision logic. Move the operation into a registered `fromEffect` actor and route by `onDone/onError`.

**A “background” action returning a promise from `Effect.runPromise`:** this can detach work from the intended runtime/error/scope. Keep the action declared as an Effect action, or invoke it when its result matters. Runtime execution belongs at boundaries.

**A stopped actor returned from a helper:** the helper wrapped creation in `Effect.scoped` and returned the handle. The scope closed. Move the owner up or return a final value instead of a live handle.

**A “durable” singleton:** the actor lives in a module global, periodically serializes state, and has no recovery/lease/idempotency story. Describe it honestly as an in-memory actor until a supported durable design is implemented and tested.

**A giant boolean context:** `isLoading`, `isSaving`, `hasError`, `isCancelled`, `isDone` can form contradictory combinations. Move mutually exclusive behavior into states, retain supporting facts in context, and use parallel regions only for truly independent dimensions.

## Review language

Replace “works” with a precise outcome: the example parses; the project typechecks; the test passed with these versions; cancellation closed this resource; restore repeated this task; the remote operation was reconciled. Do not claim one level of evidence proves another. Record any alpha-version gap rather than hiding it behind casts or an alternate runtime.

Sources: the linked topic references in [SKILL.md](../SKILL.md), especially [version contract](00-version-contract.md), [actions](03-transitions-guards-actions.md), [lifetimes](05-actor-lifecycle-services.md), and [tests](15-testing.md).

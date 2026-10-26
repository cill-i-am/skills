# Troubleshooting and diagnostic decision trees

## Start from the observed failure

Record the exact package versions, TypeScript error or Cause, minimal entrypoint, host, and the operation that hangs or fails. Reproduce the problem before changing architecture. Inspect the installed declaration for the first uncertain API; avoid speculative casts and compatibility wrappers.

| Symptom | First investigation | Likely repair direction |
| --- | --- | --- |
| Missing service requirement at a runner | Read the Effect's `R` and the Layer's input/output types | Supply the dependency at the correct composition boundary |
| An API does not exist or an overload looks wrong | Installed package/export and matching source tag | Use the exact v4 API; align compatible integration packages |
| Expected failure escaped a catch | Is it a typed error, a defect, or interruption? | Handle the right channel; wrap a throwing foreign boundary correctly |
| A supposedly lazy operation ran during import | Look for eager Promise creation or side effects in `succeed` arguments | Defer construction with the appropriate constructor |
| A Promise rejected after cancellation but remote work continued | Was the AbortSignal connected to the real API? | Implement cancellation at the foreign boundary; handle ambiguous writes |
| Resources leak at shutdown | Identify owner scope and awaited finalizers | Move acquisition into the owner and await teardown |
| Resource is already closed while streaming | Compare response-return lifetime with consumption lifetime | Keep the resource alive until body completion/cancellation |
| Background task stops immediately | Check `forkChild`/`forkScoped` and parent lifetime | Attach it to its real owner, not an arbitrary detached runtime |
| Background task never stops | Look for unowned fibers and broad uninterruptible regions | Restore structured ownership and bounded interruption |
| TestClock test hangs | Was the timed operation forked before advancing time? | Fork, synchronize registration where needed, adjust, then join |
| Queue stops making progress | Capacity, producer/consumer topology, lifecycle, permits | Start consumers concurrently; release permits; define terminal state |
| Pool deadlocks | Nested acquisition and per-request connection demand | Remove nested holds or adjust the design, not merely the pool size |
| Cache returns another user's data | Full key and captured lookup context | Include authorization-relevant identity and fix cache ownership |
| Failure persists after upstream recovers | Negative caching and TTL | Set deliberate failure expiry/invalidation |
| Same Layer starts twice | Layer identity and separate memoization maps/builds | Share the intended Layer value and memoization boundary |
| SQL writes escape rollback | Nested runner or callback bridge lost transaction context | Keep operations in the database transaction Effect |
| Retries never end | Delay cap confused with continuation/attempt cap | Combine eligibility, finite attempts, and a deadline |
| CPU load increases without throughput | Fibers mistaken for worker threads | Measure and move CPU work to a bounded worker pool |
| SSR data crosses sessions | Global registry/runtime captured request identity | Isolate request/session-sensitive state |
| Durable workflow repeats an external action | Crash window or incomplete activity replay | Add idempotency/reconciliation at the external boundary |
| Cluster entity forgets state | Passivation/restart with only an in-memory Ref | Persist authoritative state explicitly |

## Type-level debugging

Inspect `Effect.Effect<A, E, R>` and `Layer.Layer<ROut, E, RIn>` at a named intermediate value. A misplaced `provide` or accidental union often becomes clearer when the composition is split into two or three well-named values. Avoid annotating every local expression; add an annotation where it establishes an important contract or localizes inference.

Check whether a schema has different decoded and encoded types and whether decoding/encoding needs services. A codec projected to its decoded type is not interchangeable with the original wire decoder. A service class identifier is not the same type as the service's implementation object.

Distinguish a module namespace from an exported service value with the same name, such as `HttpClient.HttpClient` or `SqlClient.SqlClient`. Read the actual import and declaration rather than resolving confusion with `any`.

## Runtime debugging

Use an Exit/Cause-aware boundary and attach a stable operation span. Inspect fiber ownership, pending waits, scopes, and finalizers. Add temporary structured diagnostics for acquisition, release, queue transitions, and retry attempts; avoid logging secrets or entire requests.

A hang is often a wait whose producer was never started, a scope closed too early, a permit never released, or a foreign callback never resumed. Trace both sides of the wait. Increasing the timeout does not repair missing completion.

## Reduce without changing semantics

Replace remote services with deterministic Layers while keeping the same requirements and lifecycle. Use TestClock instead of real sleeps for time-dependent behaviour. Keep interruption and transaction boundaries intact in the reproduction; a Promise-only rewrite may remove the bug by removing the semantics being tested.

After fixing the root cause, add a regression test that fails for the original reason. Remove temporary diagnostics and any workaround that is no longer needed. Record remaining uncertainty specifically: which adapter or deployment property still needs a real integration test.

## Official sources

- [Effect runtime and API](https://effect.website/docs/v4/api/effect/Effect)
- [Layer](https://effect.website/docs/v4/api/effect/Layer)
- [Scope](https://effect.website/docs/v4/api/effect/Scope)
- [Cause](https://effect.website/docs/v4/api/effect/Cause)
- [TestClock](https://effect.website/docs/v4/api/effect/testing/TestClock)
- [Cache semantics](https://github.com/Effect-TS/effect/blob/effect@4.0.2/packages/effect/src/Cache.ts)
- [Workflow activity replay](https://github.com/Effect-TS/effect/blob/effect@4.0.2/packages/effect/src/workflow/Activity.ts)

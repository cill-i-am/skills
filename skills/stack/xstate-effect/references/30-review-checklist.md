# Implementation acceptance checklist

Use the relevant sections rather than mechanically applying persistence questions to an ephemeral tooltip. An unchecked consequential item must be explained in the PR or workflow brief.

## Scope and version

- [ ] A machine improves an actual event-driven lifecycle; simple operations remain Effects.
- [ ] Installed Effect, core XState, integration, and optional binding/test versions are recorded.
- [ ] Source-preview features are not presented as published baseline behavior.
- [ ] The code uses the official integration host and Effect 4, without hidden vanilla fallbacks.
- [ ] Changes fit existing feature/service boundaries and do not reorganize unrelated code.

## Behavioral model

- [ ] States encode meaningful differences in behavior, not duplicate boolean combinations.
- [ ] Events express commands/facts and carry required correlation/revision data.
- [ ] Expected business rejection, expiry, and cancellation differ from actor runtime failure.
- [ ] Shared parent transitions, explicit blocking, re-entry, and parallel completion are tested.
- [ ] History/route/choice/eventless states cannot bypass prerequisites or loop indefinitely.
- [ ] Context is immutable; stale/sensitive fields have an explicit cleanup policy.

## Effects and resources

- [ ] Service implementations are supplied through the appropriate Effect Layer/runtime.
- [ ] Decisions/guards are synchronous and do not perform I/O or read ambient nondeterminism.
- [ ] Background actions are registered and enqueued with explicit parameters.
- [ ] Required side effects are awaited through invocation or reliable durable intent.
- [ ] Spawned Effect sources are registered; child/listener counts and lifetimes are bounded.
- [ ] Task-local versus root-actor versus application resources are distinguished.
- [ ] Scope closure and finalizers are awaited and cannot hang indefinitely without visibility.

## Commands and failures

- [ ] Send is not mistaken for acknowledgement/completion.
- [ ] Waits are correlated and observe failure/stop as well as success.
- [ ] Root actor errors are observed; unknown errors are narrowed rather than cast.
- [ ] Retry policy is bounded and does not multiply across layers unnoticed.
- [ ] Local interruption is not claimed as remote rollback.
- [ ] Remote ambiguity, duplicate requests, and stale results have defined handling.

## UI and boundaries

- [ ] UI derives workflow lifecycle from actor state/selectors instead of duplicating it.
- [ ] Atom readiness, provider lifetime, entity-key changes, and unmount behavior are correct.
- [ ] SSR/session/tenant ownership cannot leak mutable actor data across users.
- [ ] Untrusted input is decoded, authorized, bounded, and correlated before dispatch.
- [ ] Public DTOs and diagnostics exclude secrets, raw snapshots, and actor references.
- [ ] Agent tools and route links cannot bypass approval/resource authorization.

## Durability and operations, when needed

- [ ] Restore capability is verified for the exact integration version.
- [ ] Snapshots are versioned, protected, validated, and compatible with current logic.
- [ ] Running tasks restarting after restore are safe through idempotency/reconciliation.
- [ ] Storage writes/intent delivery and command deduplication have explicit guarantees.
- [ ] Multiple owners are prevented or fenced; stale writers cannot overwrite newer state.
- [ ] Deadlines have an absolute-time/wakeup policy when processes are absent.
- [ ] Capacity limits, alerts, error visibility, and shutdown behavior are documented.

## Evidence

- [ ] Pure and real Effect-host tests cover relevant transitions/outcomes.
- [ ] TestClock and deterministic service gates replace timing guesses.
- [ ] Cancellation, cleanup, failure, duplicate/stale inputs, and important races are tested.
- [ ] Negative type assertions cover required input, event protocol, and service requirements.
- [ ] UI, recovery, graph/property, and end-to-end tests are added where the feature needs them.
- [ ] Exact commands and results distinguish syntax, semantic compilation, runtime tests, and proposals.
- [ ] Any remaining gap is stated plainly without a false passing claim.

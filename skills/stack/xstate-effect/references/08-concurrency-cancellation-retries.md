# Concurrency, cancellation, retries, and supervision

## A sequential mailbox does not serialize all work

The root Effect actor processes enqueued events in order. Invoked children, streams, and background Effect actions can run concurrently. A transition's action enqueue order is not a guarantee of completion order. When operation B depends on operation A's outcome, compose A then B inside one Effect, or move to B only through A's `onDone`.

Choose a concurrency policy for each event family before implementation:

| Policy | Workflow shape | Typical use |
| --- | --- | --- |
| Latest wins | Exit/re-enter invocation on newer input | Search, preview generation |
| Ignore while running | Handle command only in idle state | Non-repeatable submit button |
| Queue | Explicit bounded pending collection or service queue | Ordered imports |
| Parallel bounded | One child per independent job with admission limit | Batch uploads |
| Join prerequisites | Parallel regions, each reaching final | Independent checks before approval |

“Not handled while busy” is not the same as “queued for later.” Explain this in UI/transport responses. Ignoring duplicates is only safe when the caller can determine what happened to the original operation.

## Cancellation has several meanings

A state transition can interrupt its invoked Effect. An AbortSignal can request cancellation of a cooperative SDK call. A remote provider can separately acknowledge cancellation of accepted work. A compensation can undo some business consequence. These are distinct facts.

Model states such as `cancelRequested`, `cancellingRemote`, `cancelled`, `reconciling`, and `compensationFailed` when those distinctions matter. Do not label the UI “refunded” just because a local fiber stopped. Do not automatically retry after a timeout when the provider may already have succeeded; first query by the stable operation key.

The parent can continue while an interrupted invocation finalizes. Where reuse of a file/port/session depends on cleanup being complete, wait for an explicit release acknowledgement or make the dependent sequence one scoped Effect. Broad uninterruptible regions are not a fix: they can make deadlines and shutdown ineffective.

## Place retries at the right layer

**Task retry:** brief transport errors, bounded attempts, backoff/jitter, no human decision. Keep this inside the Effect service or `fromEffect` source. Use a stable idempotency key across retry attempts. A new key per retry defeats deduplication.

**Workflow retry:** a user or operator decides after seeing an error; retry count, cooldown, and authorization are visible business state. Keep `failed -> retrying` or `failed -> running` as explicit transitions. Reset stale result/error fields intentionally.

**Supervisor restart:** unexpected actor termination. Scope each attempt separately and verify old resources close before recreating. The structural rule is `Effect.scoped(oneAttempt).pipe(Effect.retry(...))`, not one giant scope around all attempts. Decide which failures are restartable and which require escalation. Report exhaustion.

Do not combine three independently multiplying retry policies without calculating the total attempts and maximum elapsed time. Respect provider rate limits and retry hints. Give cancellation priority in your behavioral contract, but test races rather than assuming event order makes all remote outcomes deterministic.

## Stale results and concurrent writers

Latest-wins local invocation cancels obsolete work, but a non-cooperative upstream may continue. Include a request ID/revision when messages re-enter through a transport or independent callback. Accept a result only for the current request; otherwise record or discard according to policy. A result cannot become authoritative merely because it arrived last.

For shared server workflows, a single actor's mailbox does not prevent another process from writing the same record. Use optimistic revisions or a single-writer lease with fencing. Coordinate the command, state update, and externally important intent through an appropriate transactional design.

## Required tests

Test completion versus cancellation at the same boundary; retry exhaustion; cancellation during backoff; new query while the previous service is slow; failure of cleanup itself; stop with multiple children; and a server success whose response is lost. Assert both final state and side-effect counts. [The test matrix](../templates/transition-test-matrix.md) makes these outcomes explicit.

Sources: [Effect logic cancellation](27-source-index.md#effect-logic), [actor host implementation](27-source-index.md#released-actor-source), [testing and errors](27-source-index.md#effect-testing). Distributed and idempotency recommendations are architectural guidance, not claims of built-in XState guarantees.

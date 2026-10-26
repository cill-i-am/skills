# Use-case cookbook and design recipes

These recipes are implementation starting points, not claims that every subsystem is included in the example project. Use the linked references for API contracts and the named service boundaries for execution. All live actors use the Effect integration.

## Approval with deadline

**States:** awaitingApproval, executing, completed, failed, expired, cancelled. **Services:** approval authorization at ingress; business execution; required audit. **Events:** approve/reject/cancel/retry bound to the current proposal revision. **Tests:** no execution before approval, expiry, duplicate approval, cancel race, retry idempotency. See [approval.ts](../examples/src/approval.ts).

## Search with latest-wins cancellation

**States:** idle, debouncing, searching, results, failed. **Service:** typed Search API accepting a query. **Policy:** newer query exits old invocation; empty input clears. **Tests:** no early request, old invocation cleanup, stale independent callbacks, no results versus failure. See [search.ts](../examples/src/search.ts).

## Multi-step onboarding or claim form

**States:** nested steps with common exit/cancel; validating/submitting branches. **Services:** remote eligibility and final submit. **Policy:** reset dependent answers and invalidate remembered steps when prerequisites change. **Tests:** back/forward, direct link, hidden invalid data, preservation after failure. See [forms](12-forms-and-ux.md).

## Autosave with conflict handling

**States:** clean, dirty, waiting, saving, saved, conflict, failed. **Service:** conditional write by revision. **Policy:** one active write and coalesced pending revision; reconcile ambiguous acceptance. **Tests:** editing mid-save, network loss after acceptance, two tabs, retry exhaustion. Never assume local cancellation cancels a committed write.

## Upload with progress and remote abort

**States:** selecting, uploading, processing, done, cancelRequested, cancelled, failed. **Services:** upload task, progress stream, remote abort/status. **Policy:** separate displayed progress from definitive completion; limit parallel uploads. **Tests:** no first progress value, stream failure, completed upload with late cancel, cleanup. See [streams](../examples/src/streams.ts).

## Connection/reconnection lifecycle

**States:** disconnected, connecting, connected with nested syncing/ready, retrying, permanentlyFailed. **Services:** scoped socket/session, event feed. **Policy:** invoke the feed on connected parent so child transitions do not reconnect; bounded jittered retry. **Tests:** EOF versus error, credentials change, subscriber cleanup, duplicate delivery after reconnect.

## Checkout/payment with compensation

**States:** validating, reserving, charging, confirming, completed, reconciling, compensating, manualReview. **Services:** inventory/payment/order APIs with stable operation keys. **Policy:** critical writes invoked/awaited; remote uncertainty is explicit. **Tests:** provider accepted then response lost, partial failure, duplicate webhook, failed refund. An illustrative machine is not a certified payment system.

## Parallel prerequisite checks

**States:** parallel identity/eligibility/stock regions, each completing; then ready or rejected. **Services:** independent bounded checks. **Policy:** define fail-fast versus collect-all; release cancelled branches. **Tests:** all success, one rejection, timeout while another completes, shared-context conflicts. See [statecharts](20-advanced-statecharts.md).

## Batch import with bounded workers

**States:** validating, queued, running, paused, complete, failed. **Services:** durable job records and worker effects. **Policy:** bounded child count, explicit per-item IDs and deduplication, aggregate progress without copying entire history. **Tests:** resume, malformed row, cancel subset, worker crash, repeated item delivery. Actor spawning alone is not a persistent queue.

## Human-reviewed AI proposal

**States:** gathering, proposing, waitingForHuman, approved, executing, rejected, expired. **Services:** model call, schema parsing, policy/authorization, domain operation. **Policy:** agent sees narrow tools; approval binds immutable proposal revision; secrets stay in services. **Tests:** malformed model output, prompt-injected document, altered proposal, denied tool, duplicate approval. See [backend](13-backend-workflows.md) and [security](18-security.md).

## Multi-surface workflow

**Surfaces:** web, mobile, CLI, webhook, agent tool. **Design:** one trusted command service and versioned public projection; surfaces do not edit context independently. **Policy:** correlate command/result, define offline behavior, reject stale revisions. **Tests:** simultaneous commands, tenant switch, obsolete client schema, late observer. A shared state machine definition does not by itself synchronize running actors.

## Undo/redo or pause/resume

Use domain operation history for undoable data changes; use a history state for control-state resumption. They solve different problems. Once an external action succeeds, undo may require compensation. Test prerequisites changing while paused and partial undo failure. Do not persist arbitrary Effect continuations or assume state history rewinds a provider.

## When the recipe should stay plain Effect

A one-shot calculation, simple CRUD endpoint, parsing operation, bounded parallel map, ordinary query/cache, or retrying fetch usually does not need a machine. Keep it an Effect until externally driven lifecycle decisions make states useful. Adding two frameworks to a linear function without improving clarity is not a successful application of this skill.

Sources: [Effect-first design](01-effect-first-design.md), [tasks](06-tasks-streams.md), [statecharts](20-advanced-statecharts.md), [durability](14-persistence-durability.md). Recipes are proposed designs assembled from those primitives.

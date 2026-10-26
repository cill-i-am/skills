# Backend workflows, approvals, and agent-controlled work

## Use a machine for long-lived decisions, not every endpoint

A linear service call with validation, database work, and a return value normally stays an Effect. A workflow waiting for outside events—review decisions, provider callbacks, cancellation, SLA escalation, or repeated manual recovery—benefits from an explicit machine. Keep the transport independent: HTTP, CLI, queue, UI, and agent tools should invoke the same authenticated command boundary rather than each editing state.

Define whether the workflow lives for one request, one application session, one tenant/entity, or across process restarts. A request-scoped actor that waits for a decision next week is a lifecycle mismatch. An application-scoped actor still disappears on deployment unless an external durable design supports recovery.

## Approval pattern

A useful model is `draft -> awaitingApproval -> executing -> completed`, with `rejected`, `expired`, `cancelRequested`, and recoverable failure paths where required. Bind approval to a specific immutable proposal version/hash. If the proposal changes after approval, require a fresh approval. Record who approved, their authority, the subject/revision, and expiration using trusted server data.

The machine should receive an authorized domain event rather than a raw claim of role from the client. Where authorization can change while waiting, re-check it at execution time. Run required audit/persist steps as awaited Effects or durable intents before acknowledging completion. Do not enqueue a fire-and-forget audit and immediately enter a final state.

The [publishing example](../examples/src/approval.ts) demonstrates the local approval/task boundary. It is deliberately not a complete durable approval backend, authorization server, or transaction system.

## Command boundary

Decode and validate untrusted input with Effect Schema. Resolve workflow and tenant from authenticated routing/context. Check command permission and expected revision. Apply deduplication appropriate to the durability level. Send the typed event to the correct actor. Return a correlated acceptance/outcome, not a raw snapshot and not a false success based only on `send`.

The machine does not replace the database as the source of truth for records owned by another service. Store stable references/revisions, refresh authoritative data through services, and reconcile conflicts. Avoid embedding a large ORM entity graph in context.

## Provider workflows and sagas

For multi-provider work, identify each irreversible boundary and persist the operation key. Separate transport retry from provider status reconciliation. Compensation is a new operation with its own success/failure states and idempotency key. Do not claim ACID behavior across independent remote providers merely because the sequence is modeled in a statechart.

Parallel checks are suitable when they are independent and can be joined. When one branch fails, decide whether the other branches continue, cancel, or compensate. A parallel state is not an automatic bounded worker pool or distributed transaction coordinator.

## AI and human-in-the-loop tools

Expose a narrow set of typed commands as tools. The agent may propose an action or request approval; it must not receive arbitrary actor references, direct context setters, unrestricted event dispatch, or broad service capabilities. Tool descriptions and prompt text do not enforce authorization. Enforce principal, tenant, amount/resource limits, approval revision, and idempotency in the Effect service boundary.

Treat retrieved documents, model outputs, and provider messages as untrusted data. Parse model proposals into schemas before presenting or executing them. Represent waiting-for-human, approved, executing, denied, and timed-out states explicitly. A human response must correlate to the right pending proposal and must not approve a later edited proposal accidentally.

## Operational ownership

Give every long-lived actor a named owner, command ingress policy, error observer, resource budget, shutdown policy, and recovery record. A lease holder must not continue writing after losing ownership; use fencing at the persistence boundary. Do not rely on module globals in autoscaling/serverless hosts for durable per-entity ownership. Hosting-specific integration must preserve the Effect runtime and be verified against that platform; generic XState durability examples are not drop-in replacements.

Sources: [backend concepts](27-source-index.md#backend), [Effect actor lifetime](27-source-index.md#effect-actors), [persistence distinction](14-persistence-durability.md). Security/durability designs above are recommendations, not capabilities automatically supplied by the package.

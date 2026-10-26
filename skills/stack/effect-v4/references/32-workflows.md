# Durable workflows, activities, approvals, and compensation

## Durability is an engine and storage property

The baseline workflow APIs are marked unstable. A Workflow defines a name, payload/success/error schemas, and an idempotency key. A configured WorkflowEngine executes it and supplies persistence/replay semantics. An ordinary Effect with a long sleep is not a durable workflow, and an in-memory engine is not production persistence.

```ts
import { Effect, Schema } from "effect"
import { Activity, Workflow } from "effect/workflow"

export const SummarizeRequest = Workflow.make("SummarizeRequest", {
  payload: {
    tenantId: Schema.NonEmptyString,
    requestId: Schema.NonEmptyString,
    subject: Schema.NonEmptyString
  },
  success: Schema.String,
  idempotencyKey: ({ tenantId, requestId }) => JSON.stringify([tenantId, requestId])
})

export const SummarizeRequestLive = SummarizeRequest.toLayer((payload) =>
  Activity.make({
    name: "normalize-subject",
    success: Schema.String,
    execute: Effect.succeed(payload.subject.trim())
  })
)
```

This is a workflow/handler definition, not a deployed durable system. It deliberately uses a pure activity so the example cannot suggest that a network side effect becomes exactly-once by wrapping it. Provide and test the chosen engine and durable storage before calling `execute` in production.

## Identity and replay

Workflow and activity names are persisted protocol identity. Choose stable, meaningful names, with stable per-item identity when a workflow contains repeated steps. Do not use a random name each time execution is replayed. Include tenant identity and a true logical operation key in idempotency keys.

An idempotency key also needs a payload-consistency rule. Reusing the same operation key with materially different payloads should not silently overwrite the meaning of an existing execution. Store or compare the expected operation identity according to the engine and application contract.

Activities record completed results. The official source explicitly notes that an activity which suspends before completion can run its body again during replay. Side effects performed before that suspension may repeat. Separate external actions into stable activities with idempotency controls and avoid relying on arbitrary in-memory variables to remember prior completion.

## External side effects and crash windows

An external service may accept a request before the workflow records its result. On recovery, the activity can be attempted again. Use the external service's idempotency key, a durable operation ledger, or a reconciliation query. Do not claim exactly-once payment/email delivery from workflow replay alone.

Capture non-deterministic values in durable results where they affect later decisions. Clock, random IDs, external reads, and model outputs should not silently change a replayed decision. Do not put open handles, runtime services, or non-serializable exceptions into persisted activity results.

## Human approval recipe

Persist an approval request containing the operation identity, authorized approver scope, the exact action/payload to approve, an expiry, and an audit trail. Suspend through a durable deferred or another supported durable waiting primitive. A separate authenticated handler validates the approver and completes the wait exactly according to the durable API.

On resume, verify that approval is still applicable to the operation and current policy before executing a sensitive action. Handle rejection, expiry, revocation, duplicate callbacks, and callbacks arriving before the workflow reaches its wait. Do not use an in-memory Deferred for an approval that must survive a process restart.

Use `DurableClock` for waits that must survive suspension/restart, and the durable deferred/queue modules where their semantics fit. Read their exact engine requirements and completion APIs; do not emulate durability with a Timer plus a global Map.

## Compensation and cleanup

Compensation is a business action that attempts to counter a completed action; it is not a database rollback. It can fail, require retries, or need an operator. Define the compensating action and its idempotency before performing the original action.

The baseline `Workflow.withCompensation` documents registration for top-level workflow effects, not nested activities. Place compensation at the supported boundary and test the actual failure path. Do not assume a normal resource finalizer will run after a machine crash or that compensation always restores the original world.

## Operations and tests

Use execute/poll/resume/interrupt through authorized application endpoints. Distinguish interruption, suspension, terminal failure, and completed results. A discarded execution returning an ID still needs observability and an operator recovery path.

Test a fresh-process restart after each important persisted step, failure after an external side effect but before result recording, duplicate execution requests, duplicate approval callbacks, expired approvals, compensation failure, and changed workflow code with existing stored executions. Test the real engine/driver, not just the handler body.

## Official sources

- [Workflow definition and lifecycle](https://github.com/Effect-TS/effect/blob/effect@4.0.2/packages/effect/src/workflow/Workflow.ts)
- [Activity replay semantics](https://github.com/Effect-TS/effect/blob/effect@4.0.2/packages/effect/src/workflow/Activity.ts)
- [WorkflowEngine](https://effect.website/docs/v4/api/effect/workflow/WorkflowEngine)
- [DurableClock](https://effect.website/docs/v4/api/effect/workflow/DurableClock)
- [DurableDeferred](https://effect.website/docs/v4/api/effect/workflow/DurableDeferred)
- [DurableQueue](https://effect.website/docs/v4/api/effect/workflow/DurableQueue)

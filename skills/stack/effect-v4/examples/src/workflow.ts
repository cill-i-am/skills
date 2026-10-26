// Baseline: effect@4.0.2. See ../../references/32-workflows.md
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

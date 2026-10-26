// Baseline: effect@4.0.2. See ../../references/13-retries-timeouts-and-scheduling.md
import { Effect, Schedule, Schema } from "effect"

export class TransientFailure extends Schema.TaggedError<TransientFailure>()(
  "TransientFailure", { retryable: Schema.Boolean }
) {}

const jitteredBackoff = Schedule.exponential("250 millis").pipe(
  Schedule.jittered
)
const cappedDelay = Schedule.min([
  jitteredBackoff,
  Schedule.spaced("5 seconds")
])
export const retryPolicy = Schedule.max([
  cappedDelay,
  Schedule.recurs(4)
]).pipe(
  Schedule.setInputType<TransientFailure>(),
  Schedule.while(({ input }) => input.retryable)
)

export const withRetryBudget = <A, R>(
  task: Effect.Effect<A, TransientFailure, R>
) => task.pipe(
  Effect.retry(retryPolicy),
  Effect.timeout("20 seconds")
)

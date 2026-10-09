# Retries, deadlines, schedules, and cron

## Retry only what is safe to repeat

Retry transient failures for operations whose repetition is safe or protected by a stable idempotency key. Do not retry authentication failures, invalid input, or a business rejection as though they were outages. After a timeout, the remote side may already have committed the write.

A retry policy has at least four independent controls: eligibility, delay, attempt count, and overall deadline. Add jitter when many workers could retry together. Respect server-provided retry guidance where supported, but do not let it defeat the caller's total budget.

```ts
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
```

This allows at most four retries after the initial attempt. The min with the fixed delay is applied after jitter so jitter cannot raise the selected delay above that cap. The final timeout bounds the retrying computation, including its waits; cleanup and non-cooperating foreign operations still require separate consideration.

## Composition semantics matter

At this baseline, `Schedule.max` continues while all component schedules continue and selects the slower delay. `Schedule.min` continues while any component continues and selects the faster delay. A delay cap implemented with `min` does not by itself cap attempts. Pair it with an attempt-limiting schedule deliberately.

`Effect.retry` repeats after failure. `Effect.repeat` repeats after success. Do not use success polling when a failure should stop the loop, or a failure retry when you meant to sample a successful endpoint periodically.

The placement of timeout changes its meaning. A timeout inside retry is a per-attempt timeout. A timeout outside retry is a total operation budget. Sometimes both are needed. Include time spent waiting for a connection, permit, and response body according to the service-level contract.

## Idempotency and deduplication

Generate an idempotency key once per logical action, not once per attempt. Persist it with the action when retry can continue across requests or restarts. A cache or process-local Set does not provide cross-process exactly-once effects. Design the server-side uniqueness or deduplication record and its retention period.

For a provider timeout, reconcile using the stable operation identifier before deciding to repeat a mutation. “Unknown outcome” is a legitimate state; do not map it to “definitely failed” when a charge or booking could already exist.

## Polling and cron

Choose fixed-rate versus spaced-after-completion behaviour deliberately. Define whether slow jobs skip, overlap, queue, or catch up. A per-process cron schedule can run once on every replica; distributed single execution requires coordination or a scheduler that owns that guarantee.

Use an explicit IANA timezone for civil-time schedules. Test daylight-saving transitions, missing local times, repeated local times, and restart catch-up. Do not translate “every day at 09:00 local time” into a fixed duration from the previous run and assume it remains the same wall-clock time.

For long waits that must survive restart, use a durable clock or host scheduler rather than a sleeping ordinary fiber. Rate limiting and concurrency limiting are different: one restricts frequency over time; the other restricts simultaneous operations.

## Test the budget

Use TestClock for deterministic delay and timeout tests. Assert exact attempt counts, non-retryable short-circuiting, overall deadline behaviour, cancellation during backoff, and idempotency-key reuse. Test a successful response arriving near the timeout boundary and a failure after partial external completion.

## Official sources

- [Official schedules example](https://github.com/Effect-TS/effect/blob/effect@4.0.2/ai-docs/src/06_schedule/10_schedules.ts)
- [Schedule](https://effect.website/docs/v4/api/effect/Schedule)
- [Timeout operators](https://effect.website/docs/v4/api/effect/Effect)
- [Cron](https://effect.website/docs/v4/api/effect/Cron)
- [TestClock](https://effect.website/docs/v4/api/effect/testing/TestClock)

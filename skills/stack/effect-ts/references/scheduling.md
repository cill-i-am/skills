# Scheduling, Retry, And Time

Use this file for retry, repeat, polling, timeout, backoff, jitter, pacing, deadlines, and time-sensitive tests.

## Choose The Operation First

- retry a failed effect: `Effect.retry` or `Effect.retryOrElse`
- repeat a successful effect: `Effect.repeat`
- poll until a condition: repeat plus a condition-aware Schedule or workflow state
- delay one start: `Effect.delay`
- enforce a deadline: `Effect.timeout`
- model recurring values: Schedule, or Stream when downstream needs a multi-value pipeline

Use Schedule instead of `while (true)` plus manual sleeps.

## Core Semantics

- The source effect runs once before the Schedule is stepped.
- `Schedule.recurs(3)` permits three additional retries or repetitions.
- `Schedule.spaced(...)` waits after an execution completes.
- `Schedule.fixed(...)` aligns starts to a cadence.
- `Schedule.exponential(...)` and `Schedule.fibonacci(...)` create backoff.
- Add jitter to distributed retries to avoid synchronized storms.
- Bound retry policies by attempts, elapsed time, or both.
- Retry handles typed failures; defects and interruption are not ordinary retry input.
- Repeat handles success; an unhandled failure stops repetition.

## Bounded Retry

Retry only the narrow adapter operation that is transient and proven idempotent.

```ts
const retryTransientProviderFailure: Schedule.Schedule<unknown, ProviderError> =
  Schedule.exponential("100 millis").pipe(
    Schedule.jittered,
    Schedule.upTo({ times: 5 }),
    Schedule.while(({ input }) => input.retryable),
  );

export const fetchProfile = Effect.fn("Profiles.fetch")(function* (
  id: ProfileId,
) {
  return yield* provider
    .get(id)
    .pipe(Effect.retry(retryTransientProviderFailure));
});
```

Do not retry a whole workflow when only one read is transient. Do not retry non-idempotent writes unless the protocol provides an idempotency key or equivalent proof.

## Exhaustion

Use `retryOrElse` when exhaustion needs a truthful fallback or final report:

```ts
const loadWithFallback = primary
  .load(id)
  .pipe(
    Effect.retryOrElse(retryTransientProviderFailure, (error) =>
      fallback
        .load(id)
        .pipe(
          Effect.tap(() =>
            Effect.logWarning("Profiles.primaryUnavailable", error),
          ),
        ),
    ),
  );
```

If the fallback cannot satisfy the same semantic contract, let the final error remain visible.

## Rate-Limit-Aware Retry

When a typed provider error carries a retry delay, combine it with normal backoff:

```ts
interface RateLimited {
  readonly retryAfterMs?: number;
}

const providerRetry: Schedule.Schedule<RateLimited, RateLimited> =
  Schedule.exponential("200 millis").pipe(
    Schedule.jittered,
    Schedule.upTo({ times: 5 }),
    Schedule.passthrough,
    Schedule.modifyDelay(({ input, duration }) =>
      Effect.succeed(
        input.retryAfterMs === undefined
          ? duration
          : Duration.max(duration, Duration.millis(input.retryAfterMs)),
      ),
    ),
  );
```

Keep `retryAfterMs` typed and validated when it enters from an HTTP header or SDK error.

## Polling Worker

Separate one pass from recurrence. Decide which pass failures may be logged and continued.

```ts
const runPass = Effect.fn("ProjectionWorker.pass")(function* () {
  const batch = yield* source.nextBatch;
  yield* Effect.forEach(batch, projectEvent, {
    concurrency: 8,
    discard: true,
  });
});

const resilientPass = runPass().pipe(
  Effect.tapError((error) =>
    Effect.logError("ProjectionWorker.passFailed", error),
  ),
  Effect.ignore,
);

export const runProjectionWorker = resilientPass.pipe(
  Effect.repeat(Schedule.spaced("1 second")),
);
```

This policy continues after expected typed pass failures. Defects still reach supervision. Fork the recurring worker into its owning Layer scope.

## Per-Item Isolation

Catch expected failures around each item only when skip, dead-letter, or later retry is the explicit policy:

```ts
yield *
  Effect.forEach(
    jobs,
    (job) =>
      processJob(job).pipe(
        Effect.catchTag("InvalidJob", (error) =>
          deadLetters.publish(job, error),
        ),
      ),
    { concurrency: 5, discard: true },
  );
```

Do not use `Effect.ignore` merely to keep a batch green. Persist or report the outcome when work may be lost.

## Deadlines And Sleeping

- Use `Effect.timeout(...)` when the caller has a real deadline and model timeout recovery explicitly.
- Use `Effect.delay(...)` to postpone one operation.
- Use `Effect.sleep(...)` when sleeping is itself part of production behavior.
- Use Clock-derived time in Effect workflows instead of `Date.now()`.
- Use `TestClock` in tests; do not wait on wall-clock time.

## Observability

Annotate retries with stable operation, provider, attempt, and error-tag information. Avoid logging once per layer. Metrics should distinguish attempted, succeeded, exhausted, timed out, and cancelled outcomes without unbounded labels.

## Verification

Test:

- initial attempt plus exact retry bound
- non-retryable typed error exits immediately
- idempotency behavior across repeated attempts
- provider retry delay versus backoff
- timeout and cancellation
- polling continuation after expected pass failure
- worker interruption when its owning scope closes

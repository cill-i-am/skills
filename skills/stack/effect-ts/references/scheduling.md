# Scheduling, Retry, And Time

Use this file for retry, repeat, polling, timeout, backoff, jitter, pacing, deadlines, and time-sensitive tests.

## Choose The Operation First

- retry a failed Effect: retry or retry-or-else;
- repeat a successful Effect: repeat;
- poll until a condition: a condition-aware Schedule or explicit workflow state;
- delay one start: delay;
- enforce a deadline: timeout;
- recurring values: Schedule or Stream when consumers need a many-valued pipeline.

Use Schedule instead of `while (true)` plus manual sleeps for recurring policy. Exact Schedule metadata and combinator signatures are version-sensitive; compile a probe against the installed v4 pin.

## Core Semantics

Prove these for the target version instead of relying on memory:

- whether the source runs before the first Schedule step;
- how recurrence counts translate into total attempts;
- whether spacing is measured after completion or on fixed boundaries;
- how exponential/fibonacci delays are shaped;
- how jitter, elapsed-time bounds, and input predicates compose;
- what metadata is exposed to delay and observation functions.

## Bounded Retry

Retry only the narrow adapter operation that is transient and proven idempotent. Add jitter to distributed retries and bound attempts, elapsed time, or both.

Do not retry an entire workflow when only one read is transient. Do not retry a non-idempotent write without an idempotency key or equivalent proof.

## Exhaustion And Fallback

Use retry-or-else only when exhaustion has a truthful fallback or final report. If the fallback cannot satisfy the same semantic contract, preserve the final typed error.

## Rate-Limit-Aware Policy

When a typed provider error carries retry timing, combine that bounded delay with normal backoff. Parse and validate header/provider values at the HTTP adapter boundary. Keep retry metadata typed rather than parsing messages.

## Polling Workers

Separate one pass from recurrence. Decide which expected pass failures may be logged and continued, which should dead-letter, and which stop the worker. Defects remain visible to supervision. Fork the recurring worker into its owning Layer Scope.

## Per-Item Isolation

Catch expected failure around each item only when skip, dead-letter, or later retry is the explicit policy. Do not use `Effect.ignore` simply to keep a batch green when work may be lost.

## Deadlines And Clock

- use Effect time services rather than `Date.now()` or `new Date()` in Effect workflows;
- use timeout when a caller has a real deadline and model timeout recovery explicitly;
- use delay for one postponed start;
- use sleep when sleeping is part of production behavior;
- use TestClock in tests.

## Race Versus Timeout

Do not implement deadlines with an arbitrary race unless the race semantics are exactly what the product needs. Prefer-success and first-completion races differ materially. Use the dedicated timeout combinator when modeling a deadline.

## Verification

Test the initial attempt, exact recurrence bound, non-retryable exit, exhaustion, idempotency, provider retry delay versus backoff, timeout, cancellation, polling continuation, worker interruption, and Clock behavior without wall-time waits.

# Errors And Observability

Use this file for expected failures, defects, recovery policy, public error mapping, redaction, logs, spans, metrics, and interruption.

## Classify At The Failure Site

An error belongs in the typed channel when a caller can recover, select an HTTP status, choose UI behavior, retry, classify telemetry, or redact it differently.

Use:

- the target pin's Schema-backed tagged error constructor for persisted, public, RPC/HTTP, or otherwise boundary-visible failures;
- the target pin's Data tagged error constructor for lightweight internal expected failures that need no encoding;
- a defect for violated invariants, programmer bugs, impossible states, or unrecoverable host contracts.

Current v4 RCs use `Schema.TaggedError`; older betas used `Schema.TaggedErrorClass`. Verify the target installation before editing constructor names.

Do not turn every JavaScript exception into one generic application error. Map it at the adapter that understands what operation failed.

## Schema-Backed Error

Use domain values and bounded operation labels in error payloads:

```ts
export const PersistenceOperation = Schema.Literals([
  "findUserById",
  "decodeUserRow",
  "saveUser",
])
export type PersistenceOperation = typeof PersistenceOperation.Type

export class PersistenceError extends Schema.TaggedError<PersistenceError>()(
  "UserRepository.PersistenceError",
  {
    operation: PersistenceOperation,
    cause: Schema.Unknown,
  },
) {
  override get message() {
    return `User persistence failed during ${this.operation}`
  }
}
```

The example uses the current RC constructor; compile it against the target pin. Add a useful `message` when logs, spans, Cause rendering, or host adapters need a human label. Keep secrets, tokens, full provider bodies, raw SQL, and private user data out of public error schemas.

## Terminal Failure In Generators

Use `return yield*` so the terminal control flow is explicit and TypeScript does not infer continuation:

```ts
if (row === undefined) return yield* new UserNotFound({ id })
```

Do not use JavaScript `try` / `catch` inside `Effect.gen`. Yielded Effect failures do not behave like thrown exceptions. Use Effect recovery combinators or inspect an `Exit`/Result where appropriate.

## Adapter Mapping

Translate third-party failures immediately:

```ts
const send = Effect.fn("EmailProvider.send")(function* (
  message: OutboundEmail,
) {
  return yield* Effect.tryPromise({
    try: () => client.send(encodeEmail(message)),
    catch: (cause) =>
      new EmailProviderError({ operation: "sendEmail", cause }),
  })
})
```

Use a shared mapper when many operations produce the same bounded error family. Preserve enough structured context for recovery and diagnosis, but expose raw causes only to trusted telemetry.

## Recovery Policy

Recover at the narrowest layer that can tell the truth:

- `catchTag` or a typed predicate: one expected variant has a real response;
- `mapError`: translate an adapter failure into the owning capability contract;
- `retry`: the operation is proven idempotent and the error is transient;
- fallback: another implementation can satisfy the same semantic contract;
- host mapping: convert the final typed union to HTTP, RPC, CLI, or SDK output.

Do not use `orDie`, Layer escape hatches, broad catch-all recovery, or Cause-level suppression merely to make expected operational failures disappear.

## Cause And Interruption

Use Cause-level APIs at supervision, foreign-callback, or diagnostic boundaries where typed failures, defects, and interruption all matter.

- Preserve interrupt-only causes.
- Never convert interruption into a retryable failure.
- A broad Cause handler must either re-fail the unhandled Cause or intentionally terminate at an owner boundary.
- Do not log the same Cause at every layer.

```ts
const supervise = worker.pipe(
  Effect.catchCauseIf(
    (cause) => !Cause.hasInterrupts(cause),
    (cause) => Effect.logError("Worker.defect", cause),
  ),
)
```

Verify the exact Cause predicates and handler signatures against the target pin.

## Public Mapping

At a transport edge, map the final typed error union to a stable public shape. Prefer exhaustive matching at this boundary:

```ts
const toResponse = Match.value<AppError>().pipe(
  Match.tag("UserNotFound", (error) =>
    Response.json({ code: "USER_NOT_FOUND", id: error.id }, { status: 404 }),
  ),
  Match.tag("EmailAlreadyUsed", () =>
    Response.json({ code: "EMAIL_ALREADY_USED" }, { status: 409 }),
  ),
  Match.exhaustive,
)
```

Public codes should be literal or Schema-defined protocol values, not ad hoc messages. Log trusted causes separately and return redacted stable responses.

Direct `_tag` matching on your own domain unions is acceptable when clear and exhaustive. Prefer Effect public guards for Effect-owned data types and Predicate utilities for unknown values.

## Named Operations And Spans

- Use named `Effect.fn("Domain.operation")` when the call deserves an independent operational identity.
- Use `Effect.fnUntraced` for reusable internal generator wrappers that do not deserve a span.
- Add `Effect.withSpan` for meaningful nested work, not every helper.
- Use stable low-cardinality attributes: operation, provider, bounded outcome, queue, or error tag.
- Do not attach payloads, free-form user text, tokens, email bodies, or unbounded IDs as metric labels.

Avoid creating duplicate spans by naming a public operation and every trivial substep.

## Logs

Log events an operator can act on. Prefer structured annotations to interpolated blobs:

```ts
yield* Effect.logWarning("Payments.retrying").pipe(
  Effect.annotateLogs({
    operation: "capturePayment",
    provider: error.provider,
    attempt,
  }),
)
```

The layer that handles or finally reports a failure should log it with the context needed to act. Lower layers may annotate or wrap without logging.

## Metrics

- count domain outcomes and operational failures with bounded tags;
- measure latency around meaningful capability or adapter operations;
- record queue depth, active fibers, cache-hit state, and retry counts where they answer production questions;
- never use unbounded identifiers, messages, stack traces, or raw URLs as metric labels.

## Verification

For every new error family, test:

- construction or decoding where Schema-backed;
- the adapter mapping that creates it;
- at least one recovery or host-mapping branch;
- redaction of secrets and private payloads;
- interruption preservation for broad supervision;
- useful messages and stable span/log naming without duplicate reporting;
- exhaustive public mapping when variants are added.

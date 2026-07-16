# Errors And Observability

Use this file for expected failures, defects, recovery policy, public error mapping, redaction, logs, spans, and metrics.

## Classify At The Failure Site

An error belongs in the typed channel when a caller can recover, select an HTTP status, choose UI behavior, retry, classify telemetry, or redact it differently.

Use:

- `Schema.TaggedErrorClass`: schema-backed, persisted, public, RPC/HTTP, or otherwise boundary-visible errors
- `Data.TaggedError`: lightweight internal expected failures that do not need encoding
- defect: violated invariant, programmer bug, impossible state, or unrecoverable host contract

Do not turn every JavaScript exception into one generic application error. Map it at the adapter that understands what operation failed.

## Schema-Backed Error

Use domain types and bounded operation labels in error payloads too.

```ts
export const PersistenceOperation = Schema.Literals([
  "findUserById",
  "decodeUserRow",
  "saveUser",
]);
export type PersistenceOperation = typeof PersistenceOperation.Type;

export class PersistenceError extends Schema.TaggedErrorClass<PersistenceError>()(
  "UserRepository.PersistenceError",
  {
    operation: PersistenceOperation,
    cause: Schema.Defect(),
  },
) {
  override get message() {
    return `User persistence failed during ${this.operation}`;
  }
}
```

Add `message` when logs, spans, `Cause.pretty`, or error adapters need a useful human label. Keep secrets, tokens, full provider bodies, raw SQL, and private user data out of public error schemas.

## Adapter Mapping

Translate third-party failures immediately:

```ts
const send = Effect.fn("EmailProvider.send")(function* (
  message: OutboundEmail,
) {
  return yield* Effect.tryPromise({
    try: () => client.send(encodeEmail(message)),
    catch: (cause) =>
      new EmailProviderError({
        operation: "sendEmail",
        cause,
      }),
  });
});
```

Use a shared curried mapper when many operations produce the same error family:

```ts
const persistenceError = (operation: PersistenceOperation) =>
  Effect.mapError(
    (cause: unknown) => new PersistenceError({ operation, cause }),
  );

const rows = yield * query.pipe(persistenceError("findUserById"));
```

Preserve enough structured context for recovery and diagnosis, but expose raw causes only to trusted telemetry.

## Recovery Policy

Recover at the narrowest layer that can tell the truth:

- `catchTag` or typed predicates: one expected variant has a real response
- `mapError`: translate an adapter failure into the owning service contract
- `retry`: the operation is proven idempotent and the error is transient
- `orElse`: an actual fallback can satisfy the same contract
- host error mapping: convert the final typed error union to HTTP, RPC, CLI, or SDK shape

Do not use `orDie`, `Layer.orDie`, `catchAll`, or cause-level recovery to make expected operational failures disappear. If a failure is expected, model it.

## Cause And Interruption

Use Cause-level APIs only at supervision or diagnostic boundaries where defects and interruption genuinely matter.

```ts
const supervise = worker.pipe(
  Effect.catchCauseIf(
    (cause) => !Cause.hasInterrupts(cause),
    (cause) => Effect.logError("Worker.defect", cause),
  ),
);
```

Never convert interruption into an ordinary retryable failure. Broad `catchCause` logic must preserve interrupt-only causes.

## Public Mapping

At a transport edge, map the typed error contract to a stable public shape:

```ts
const toResponse = Match.value<AppError>().pipe(
  Match.tag("UserNotFound", (error) =>
    Response.json({ code: "USER_NOT_FOUND", id: error.id }, { status: 404 }),
  ),
  Match.tag("EmailAlreadyUsed", () =>
    Response.json({ code: "EMAIL_ALREADY_USED" }, { status: 409 }),
  ),
  Match.exhaustive,
);
```

Public codes should be literal or schema-defined protocol values, not ad hoc messages. Log trusted causes separately and return a redacted stable response.

## Named Operations And Spans

- Use `Effect.fn("Domain.operation")` for public and non-trivial operations.
- Add `Effect.withSpan` for meaningful nested work that needs an independent span.
- Use stable low-cardinality attributes: operation, provider, outcome, tenant class, queue, or bounded error tag.
- Do not attach full payloads, free-form user text, tokens, email bodies, or unbounded IDs as metric labels.

```ts
export const charge = Effect.fn("Payments.charge")(function* (
  command: ChargePayment,
) {
  return yield* provider.charge(command).pipe(
    Effect.withSpan("Payments.providerCharge", {
      attributes: {
        provider: command.provider,
        currency: command.amount.currency,
      },
    }),
  );
});
```

## Logs

Log events an operator can act on. Prefer structured annotations to string interpolation.

```ts
yield *
  Effect.logWarning("Payments.retrying").pipe(
    Effect.annotateLogs({
      operation: "capturePayment",
      provider: error.provider,
      attempt,
    }),
  );
```

Avoid logging the same failure at every layer. The layer that handles or finally reports it should log it with the context needed to act.

## Metrics

- Count domain outcomes and operational failures with bounded tags.
- Measure latency around meaningful service or adapter operations.
- Record queue depth, active fibers, cache hit state, and retry counts where they answer production questions.
- Never use unbounded identifiers, messages, or raw URLs as metric labels.

## Verification

For every new error family, test:

- construction or decoding where schema-backed
- the adapter mapping that creates it
- at least one recovery or host-mapping branch
- redaction of secrets and private payloads
- interruption preservation for broad supervision
- useful span/log naming without duplicate reporting

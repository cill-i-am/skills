# Errors, recovery, Cause, and Exit

## Separate three failure meanings

An expected failure is part of the operation's public contract: an unknown customer, invalid input, an exhausted quota, or a recoverable provider outage. Put it in `E`. A defect is a bug or violated invariant. Interruption means the work was cancelled. Do not automatically turn defects and interruption into a normal “not found” or successful fallback.

`Cause` carries runtime failure information beyond the expected error channel. `Exit` captures completion as success or a failure cause. Use them for diagnostics, supervision, and host boundaries where preserving all completion modes matters. Do not assume an Effect with `E = never` cannot fail at runtime.

## Define errors that support decisions

```ts
import { Effect, Schema } from "effect"

export class ItemMissing extends Schema.TaggedError<ItemMissing>()(
  "ItemMissing", { id: Schema.String }
) {}

export class InventoryUnavailable extends Schema.TaggedError<InventoryUnavailable>()(
  "InventoryUnavailable", {
    retryable: Schema.Boolean,
    cause: Schema.Defect()
  }
) {}

export const classifyInventoryFailure = (
  task: Effect.Effect<string, ItemMissing | InventoryUnavailable>
) => task.pipe(
  Effect.catchTag("ItemMissing", () => Effect.succeed("No matching item"))
)
```

After recovery, `InventoryUnavailable` still belongs to the result's error channel. The function has not made all failures disappear. Keep useful data on errors: operation, safe identifier, retryability, a machine-readable reason, or a preserved cause. Do not make arbitrary human-readable messages the only discriminant.

Schema-backed tagged errors work well across serialisation boundaries. `Data.TaggedError` is useful for in-process typed errors that do not need a schema. Use the error form that matches the boundary. A `Schema.Defect()` field can preserve diagnostics but is not a safe public error payload; redact or translate it before returning data to an untrusted client.

## Recover at the layer that can decide

`catchTag` and `catchTags` narrow specific expected variants. `catch` handles the remaining expected errors. `mapError` translates an error without pretending the operation succeeded. `tapError` adds an effect on a typed failure path. A failing logging hook can affect the program: telemetry must not silently replace the failure you meant to report.

Use `catchCause` only when the policy truly includes defects or interruption. A broad handler at a job-supervision boundary may report a defect and fail the job; the same handler deep inside a repository may hide a serious bug. Preserve cancellation unless the surrounding protocol explicitly defines a different result.

`orDie` is a policy decision: “this failure is an unrecoverable defect at this boundary.” It is not a way to shorten a return type. A transient database or network outage may deserve recovery and should not become a defect merely because the service interface looks tidier without it.

## Validation, optionality, and accumulation

A missing optional value is not always an error. Model a query as returning an `Option` when absence is normal; fail with a domain variant when existence is required. Do not convert every `Option.none` into a defect.

Fail fast for dependent operations. For independent validation or batch work, collect errors intentionally. One simple strategy is to capture each item's expected result using `Effect.result`, then traverse with bounded concurrency; defects and interruption still require an explicit policy. When every completion mode must be inspected, use `Effect.exit` instead. These operations change the result type and the caller's obligations.

Do not accumulate errors by starting irreversible writes in parallel and hoping that the final list explains the partial state. Validate first, then apply the transaction or compensation policy.

## Host boundaries

Prefer an `Exit`-returning runner when a host must distinguish domain failure from unexpected failure. Do not assume the JavaScript rejection value from a Promise runner has precisely the shape of `E`. Map known errors to the transport contract, log private diagnostics internally, and return a stable public error identifier.

For HTTP, distinguish malformed input, unauthorised access, forbidden access, missing resources, conflicts, rate limits, and service failures. Do not reveal resource existence to unauthorised callers. A typed route declaration is not an authorisation policy.

## Tests that matter

Test each recoverable variant, unknown defects, cancellation during recovery, error translation, and redaction. Verify that retries occur only for eligible variants. Check that fallback metrics distinguish normal success from degraded success. For concurrent work, verify what gets cancelled after one operation fails and whether partial writes remain.

## Official sources

- [Error guidance and reason errors](https://github.com/Effect-TS/effect/blob/effect@4.0.2/LLMS.md)
- [Cause](https://effect.website/docs/v4/api/effect/Cause)
- [Exit](https://effect.website/docs/v4/api/effect/Exit)
- [Effect error operators](https://effect.website/docs/v4/api/effect/Effect)

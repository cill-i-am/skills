# Configuration and secrets

## Describe, validate, and provide configuration

Use Config to describe configuration and ConfigProvider to supply it. Load and validate required settings at an appropriate startup boundary. Keep configuration policy separate from raw environment access so tests can provide explicit values.

```ts
import { Config, ConfigProvider, Effect } from "effect"

const appName = Config.String("APP_NAME").pipe(
  Config.withDefault("example-worker")
)
const testProvider = ConfigProvider.fromUnknown({ APP_NAME: "test-worker" })
export const configuredName = appName.parse(testProvider)

export const loadSecret = Effect.gen(function*() {
  const token = yield* Config.Redacted("SERVICE_TOKEN")
  return token
})
```

The secret remains wrapped. Unwrap it only at the point where an authorised client needs the raw value. Do not log it, stringify it into a diagnostic object, or insert it into a URL where proxies might record it.

## Missing and invalid are different

A default can be appropriate for optional display text or a local development port. It should not hide malformed configuration or missing credentials. At the baseline, Config distinguishes missing input from invalid data and source failures; use the documented fallback behaviour deliberately.

Prefer schema-backed validation for ranges, enumerations, durations, URLs, and nested configuration. “It parsed as a number” is not enough for a concurrency limit, retry count, or memory budget. Fail early on values that could cause an unbounded workload.

Specify provider precedence explicitly: command flags, runtime bindings, files, environment, and defaults should not compete accidentally. Avoid reading `process.env` throughout business logic. Host bindings may not be available through a Node-style environment at all.

## Secret handling is more than display redaction

`Redacted` helps avoid accidental display. It is not encryption, permission enforcement, a secure vault, or a guarantee against every serialization path. Do not unwrap early and store raw values alongside the wrapper. Audit logging, tracing, errors, cache keys, HTTP URLs, and snapshots independently.

Use platform secret storage for production credentials and least-privilege access for each integration. Do not embed production secrets in example code, committed `.env` files, generated client bundles, or test fixtures. Keep browser-public configuration distinct from server-only configuration.

Rotate credentials with an explicit lifecycle. If a client captures a token during layer construction, determine whether rotation requires rebuilding that layer or obtaining a fresh token per operation. Do not keep using a stale client indefinitely while the new secret exists elsewhere.

## Dynamic configuration

Separate immutable startup configuration from settings that genuinely change at runtime. Use an explicit reloadable service or resource abstraction for changes. Validate the replacement before publishing it, decide what happens to in-flight operations, and preserve the previous valid state when that is the desired failure policy.

Feature flags must have clear tenant/user scope and fail-open versus fail-closed behaviour. A cached flag should not bypass an authorisation check or remain valid after a permission revocation without a stated policy.

## Tests and diagnostics

Test missing keys, malformed values, provider failures, precedence, defaults, invalid defaults, secret redaction, and rotation. Error messages should identify the problematic key without echoing its secret value. Run configuration tests with explicit providers so a developer's shell environment cannot make them pass accidentally.

## Official sources

- [Config source](https://github.com/Effect-TS/effect/blob/effect@4.0.2/packages/effect/src/Config.ts)
- [ConfigProvider](https://effect.website/docs/v4/api/effect/ConfigProvider)
- [Redacted](https://effect.website/docs/v4/api/effect/Redacted)
- [Reloadable Layers](https://effect.website/docs/v4/api/effect/LayerRef)

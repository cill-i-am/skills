# Creating and composing Effects

## Choose the constructor by what can happen

| Source | Constructor | Important contract |
| --- | --- | --- |
| A value already computed | `Effect.succeed(value)` | Does not make eager work lazy |
| Synchronous side effect that should not throw | `Effect.sync(() => value)` | A thrown exception is a defect |
| Synchronous operation with expected throws | `Effect.try({ try, catch })` | Map the unknown throw into a meaningful typed error |
| Promise API that can reject | `Effect.tryPromise({ try, catch })` | Create the Promise inside the callback; forward cancellation where supported |
| Promise API whose rejection is a defect | `Effect.promise(...)` | Use only with that deliberate failure policy |
| Callback or event registration | `Effect.callback(...)` | Return cancellation/unsubscription cleanup |
| Deferred construction of another Effect | `Effect.suspend(...)` | Useful for recursion and construction-time laziness |
| Nullable foreign value | `Effect.fromNullishOr(...)` | Map absence to a domain error when appropriate |

`Effect.succeed(fetch(url))` starts the fetch immediately and produces an Effect of a Promise. It is not an interruptible HTTP request. Similarly, `Effect.sync(async () => ...)` produces a Promise as its success value; it does not await it or model its rejection.

## Compose with generators and named functions

Use `Effect.gen` for a workflow value and `Effect.fn("operation")` for a reusable function with a useful tracing boundary. `Effect.fnUntraced` suits reusable helpers that do not deserve spans or stack-frame capture, especially measured hot paths. The function's name should describe the business operation rather than repeat a generic “execute.”

```ts
import { Effect, Schema } from "effect"

export class ProviderUnavailable extends Schema.TaggedError<ProviderUnavailable>()(
  "ProviderUnavailable", { cause: Schema.Defect() }
) {}

export const readRemoteText = Effect.fn("readRemoteText")(
  function*(url: string) {
    return yield* Effect.tryPromise({
      try: async (signal) => {
        const response = await fetch(url, { signal })
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return await response.text()
      },
      catch: (cause) => new ProviderUnavailable({ cause })
    })
  }
)
```

This illustrates a foreign Promise boundary, not a complete production HTTP client. Validate destination policy, response size, status-specific failures, and timeouts; prefer `HttpClient` when those behaviours are shared. Never treat all failures in this compact example as equally retryable.

`yield*` extracts the success value and propagates failures and requirements. When terminating a generator with a failure, write `return yield* ...` so control flow and TypeScript agree that the path does not continue.

## Select operators by intent

`map` transforms a successful value with a pure function. `flatMap` selects another Effect. `tap` performs an Effect while retaining the original value. `as` replaces the result; `asVoid` discards it. `all` combines independent work. `forEach` traverses inputs with an explicit concurrency policy. `zip` combines two programs. Use `catchTag`, `catchTags`, and `catch` for expected failures, not a `map` that returns an error-shaped success.

Keep branching readable. A normal `if` inside a generator is often clearer than an elaborate operator chain. Use pattern matching where exhaustiveness genuinely helps. Prefer early returns to deeply nested generators. Extract a helper when it represents a named operation, not merely to reduce indentation.

Attach combinators to an Effect value, or pass them as extra transformations to `Effect.fn`. The result of constructing `Effect.fn` is a function; do not treat it as an Effect with `.pipe`.

## Callback cancellation

```ts
import { Effect } from "effect"

export const callbackDelay = (milliseconds: number) =>
  Effect.callback<void>((resume) => {
    const timer = setTimeout(() => resume(Effect.void), milliseconds)
    return Effect.sync(() => clearTimeout(timer))
  })
```

Production adapters need to handle synchronous callback invocation, double completion, registration failure, and interruption before completion. Cleanup must be safe when completion and cancellation race. Use Effect's clock instead of this timer when the timer is yours; this example exists to demonstrate adapting a foreign callback API.

## Do / don't

**Do** defer work until execution, preserve cancellation, and keep pure work direct. **Don't** start a Promise and then wrap it later expecting interruption to regain control.

**Do** return an Effect from a service method. **Don't** call a runner inside it to erase requirements.

**Do** constrain parallel traversal. **Don't** replace every loop with unbounded concurrency.

**Do** use the typed error channel for an expected failure. **Don't** throw inside `map` and expect a `catchTag` handler to catch it as a typed error.

## Official sources

- [Official constructor examples](https://github.com/Effect-TS/effect/blob/effect@4.0.2/ai-docs/src/01_effect/01_basics/10_creating-effects.ts)
- [Official function guidance](https://github.com/Effect-TS/effect/blob/effect@4.0.2/LLMS.md)
- [Effect signatures](https://effect.website/docs/v4/api/effect/Effect)

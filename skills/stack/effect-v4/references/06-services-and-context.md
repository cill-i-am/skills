# Services and Context

## A service is a capability

Define a service when callers need a replaceable capability: a repository, clock-like source, payment gateway, mailer, configuration object, or permission evaluator. The interface should describe domain operations instead of exposing an arbitrary SDK wholesale.

```ts
import { Context, Effect, Layer, Schema } from "effect"

export class UserMissing extends Schema.TaggedError<UserMissing>()(
  "UserMissing", { id: Schema.String }
) {}

export class UserDirectory extends Context.Service<UserDirectory, {
  readonly findName: (id: string) => Effect.Effect<string, UserMissing>
}>()("example/users/UserDirectory") {}

export const UserDirectoryTest = Layer.succeed(UserDirectory, {
  findName: (id) => id === "u-1"
    ? Effect.succeed("Mina")
    : Effect.fail(new UserMissing({ id }))
})

export const greeting = Effect.fn("greeting")(function*(id: string) {
  const directory = yield* UserDirectory
  const name = yield* directory.findName(id)
  return `Hello, ${name}`
})

export const testGreeting = greeting("u-1").pipe(
  Effect.provide(UserDirectoryTest)
)
```

The use case depends on `UserDirectory`, not the test object or a concrete HTTP client. Its required service appears in `R` until the composition root provides a layer.

## Context keys and service shape

Use globally distinct identifiers for service keys, normally a package/module path. Two independently constructed keys with a confusing shared identifier are not a sensible dependency design. Avoid dynamic service IDs derived from user input.

A service can expose functions and effect values. Use functions when input varies and values when the operation has no arguments. Avoid storing an already-running Promise in a service unless its one-shot lifecycle is explicitly intended.

Capture stable dependencies in a service's construction Effect when that makes its methods simpler. Do not capture request-specific credentials, tenant identity, current transactions, or mutable request metadata in an application-wide singleton. Obtain those from the proper request context, or pass them explicitly according to the security model.

`Context.Reference` is appropriate for a dependency with a meaningful default. Do not use a convenient default for a capability that must fail closed, such as an authenticated principal or production credentials. Defaults must not conceal a missing layer.

## Keep boundaries testable, not ceremonial

A useful service interface has clear operations and a manageable error union. It need not have a one-method wrapper for every imported function. A pure calculation usually does not need a service. An infrastructure object with dozens of methods does not become a good domain boundary merely by being placed in Context.

Return domain errors or intentional infrastructure failures. Document whether a method is idempotent, supports cancellation, may block for a permit, and requires a surrounding scope. Those properties matter as much as the success type.

## Request context and tenancy

Build a request principal only after authentication. Resolve tenant membership and permissions independently of client-supplied resource IDs. Include tenant identity in repository predicates, cache keys, and batch partitioning. Context propagation is not an access-control mechanism by itself.

Keep request data out of global mutable objects and singleton layers. Test two simultaneous requests with different identities. Verify that logs, SQL operations, spans, and caches use the correct identity in both cases.

## Do / don't

**Do** make service dependencies visible and replace implementations through Layers. **Don't** reach into a module-level service locator or call a runner just to avoid declaring `R`.

**Do** distinguish service acquisition errors from operation errors. **Don't** flatten both into an undifferentiated generic failure.

**Do** keep test implementations behaviourally realistic. **Don't** make every test service return success regardless of input.

**Do** isolate mutable test state per layer build or test. **Don't** put a shared mutable Map into a reusable `Layer.succeed` and assume tests cannot affect one another.

## Official sources

- [Official services guide](https://github.com/Effect-TS/effect/blob/effect@4.0.2/LLMS.md)
- [Context](https://effect.website/docs/v4/api/effect/Context)
- [Service composition example](https://github.com/Effect-TS/effect/blob/effect@4.0.2/ai-docs/src/01_effect/03_services/20_layer-composition.ts)

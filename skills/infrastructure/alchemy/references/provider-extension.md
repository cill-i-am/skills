# Provider Extension, Actions, Custom State

Use this file when adding a new Alchemy resource/provider, authoring deploy-time actions, or implementing a custom state store.

## Custom Resource Provider

Provider workflow:

1. Define props and attributes.
2. Define a `Resource<Type, Props, Attributes, Error, Providers>` type.
3. Export the resource constructor with `Resource<T>("Provider.Type")`.
4. Implement a provider Layer with `Provider.effect` or `Provider.succeed`.
5. Bundle it into a `providers()` Layer.
6. Add provider lifecycle tests with `test.provider`.

Minimal type shape:

```ts
export interface ProductProps {
  name: string;
}

export interface ProductAttributes {
  productId: string;
}

export type Product = Resource<
  "Stripe.Product",
  ProductProps,
  ProductAttributes
>;

export const Product = Resource<Product>("Stripe.Product");
```

Provider shape:

```ts
export const ProductProvider = () =>
  Provider.effect(
    Product,
    Effect.gen(function* () {
      const client = yield* StripeClient;

      return Product.Provider.of({
        stables: ["productId"],
        reconcile: Effect.fn("Stripe.Product.reconcile")(function* ({ news, output }) {
          // observe -> ensure -> sync -> return
        }),
        delete: Effect.fn("Stripe.Product.delete")(function* ({ output }) {
          // treat not-found as success
        }),
      });
    }),
  );
```

Default to `Effect.fn("Provider.Resource.operation")` for provider lifecycle operations so traces and diagnostics have useful names. Use `Effect.fnUntraced` only for deliberate hot paths or provider internals where tracing has been consciously avoided.

## Reconcile Rules

Reconcile must be convergent and idempotent.

Do:

- Observe live cloud state first.
- Use deterministic physical names or cached IDs to find resources.
- Create only if missing.
- Sync drift field by field.
- Return fresh attributes.
- Use `Effect.tryPromise` for SDK calls.
- Wrap foreign SDK/API errors in typed provider errors with enough operation/resource context to debug.
- Use `Schedule`/`Effect.retry` for transient cloud failures and polling.
- Tolerate retries and partial failures.

Do not:

- Split into `if (!output) create else update`.
- Trust `olds` as live cloud state.
- Repeat ownership policy checks after `read` has approved write.
- Leak raw SDK errors across provider boundaries.
- Retry validation, permission, or deterministic input errors.
- Log raw secrets.

Input matrix:

| output | olds | Meaning |
| --- | --- | --- |
| undefined | undefined | greenfield |
| defined | defined | normal update |
| defined | undefined | adoption |

## Diff

Use `diff` when property changes need explicit planning:

- `noop`: ignore trivial changes.
- `update`: apply in place.
- `replace`: create replacement, switch dependents, delete old.
- `replace` with `deleteFirst`: required when old/new cannot coexist.

Guard unresolved inputs:

```ts
if (!isResolved(news)) return undefined;
```

Use `deepEqual`/`anyPropsAreDifferent` helpers for nested props when available.

## Read And Adoption

`read` is called when there is no prior state. It supports recovery and adoption.

Return:

- `undefined`: resource not found.
- plain attrs: exists and is owned/safe to adopt.
- `Unowned(attrs)`: exists but not owned; require `--adopt`.

If the API cannot find resources without cached output, return `undefined` when `output` is absent.

Providers for resources with irrecoverable plaintext credentials must account for write-only secrets. PlanetScale `MySQLPassword` cannot adopt without cached plaintext because the API never reissues it.

## Delete

Delete must be idempotent. Missing resource is success. Cleanup dependent write-only credentials carefully and use TTLs when the cloud supports them.

## Actions

Use `Action` for deploy-time work whose result should be input-hashed:

```ts
const Seed = Action("Seed", Effect.fn("Seed")(function* (input: { url: string }) {
  // idempotent deploy-time work
  return { ok: true };
}));

const seed = yield* Seed("initial", { url: dbUrl });
```

Action has no read, delete, replace, or lifecycle. Removed actions drop state without running a cleanup body. Bodies must tolerate retries. Use `Effect.fn("ActionName")` unless there is a measured reason to suppress tracing.

Use Action for seeding, notifications, sync, cache invalidation, generated artifacts. Use Resource for actual managed infrastructure.

## Custom State Store

A state store is a Layer that provides `State`, whose value is a deferred `Effect<StateService>`. Initialization should be lazy and cached.

Important rules:

- Use `Effect.cached` so the backend connects only on first state use.
- Capture `Scope` if a delayed initializer needs a scoped resource.
- Use `encodeState` and `reviveState` for serialization.
- Return `undefined` for missing `get`.
- Wrap transport failures in `StateStoreError`.
- Keep backend connection setup effectful, typed, lazy, and cached instead of doing eager module-level I/O.
- Implement `listStacks`, `listStages`, `list`, `get`, `set`, `delete`, `deleteStack`, and `getReplacedResources`.

Hot path methods:

- `get({ stack, stage, fqn })`
- `set({ stack, stage, fqn, value })`

`getReplacedResources` returns resources with status `replaced` so the next deploy can finish old-generation cleanup.

## Provider Test Strategy

Use `test.provider` for lifecycle tests:

- Create.
- Noop.
- Update.
- Replace if applicable.
- Delete.
- Adoption/read if applicable.
- Out-of-band deletion recovery if the cloud API makes it reasonable.

Use real cloud tests only when necessary and always select a non-production stage/profile.

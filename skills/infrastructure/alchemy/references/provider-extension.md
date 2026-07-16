# Extending Alchemy

Use this file when Alchemy lacks a first-class Resource, auth provider, state store, binding, or runtime. Prefer an existing native provider over shelling out to a vendor CLI.

## Choose The Extension

- Resource provider: remote object with identity and lifecycle.
- Action: idempotent deploy-time work keyed by inputs, without a managed remote lifecycle.
- Auth Provider: credentials/profile integration for `alchemy login`.
- State store: custom persistence for Alchemy resource state.
- Binding: runtime capability plus deploy-time policy/config wiring.
- Runtime: new host for Effectful Functions/Servers.

Do not use an Action to avoid implementing required read/delete/adoption semantics. Do not build a custom runtime when an existing Function/Server resource can host the code.

## Declare A Resource

Separate desired props from observed attributes and use a stable provider-qualified type:

```ts
import { Resource } from "alchemy";

export interface ProductProps {
  readonly name: string;
  readonly description?: string;
}

export interface ProductAttributes {
  readonly productId: string;
  readonly createdAt: number;
}

export type Product = Resource<
  "Stripe.Product",
  ProductProps,
  ProductAttributes
>;

export const Product = Resource<Product>("Stripe.Product");
```

Resource type and logical IDs are durable identity. Add aliases only for intentional migration of an earlier type, and test state recovery through the alias.

## Provider Layer

Register the typed lifecycle service with `Provider.succeed`:

```ts
import * as Provider from "alchemy/Provider";
import * as Effect from "effect/Effect";

export const ProductProvider = () =>
  Provider.succeed(
    Product,
    Product.Provider.of({
      reconcile: Effect.fn("Stripe.Product.reconcile")(function* (input) {
        const observed = yield* readProduct(input.output?.productId);
        const ensured = observed ?? (yield* createProduct(input.news));
        const synced = productMatches(ensured, input.news)
          ? ensured
          : yield* updateProduct(ensured.id, input.news);
        return toProductAttributes(synced);
      }),
      delete: Effect.fn("Stripe.Product.delete")(function* () {
        // not-found is success
      }),
      list: Effect.fn("Stripe.Product.list")(function* () {
        return [];
      }),
    }),
);
```

The adapter helpers in the skeleton (`readProduct`, `createProduct`, `updateProduct`, and attribute conversion) are provider-specific typed Effects; implement them before registering the Layer.

`reconcile`, `delete`, and `list` are required. Optional hooks include `diff`, `read`, and `precreate`. Use `Provider.effect` only when constructing the provider service requires a stable non-credential dependency; credentials must remain lazy.

## Credentials

Expose credentials as a `Context.Service` whose value is an Effect returning a redacted structure. Provider Layers are created before login/configuration may exist, so they must not resolve credentials at construction.

Lifecycle handlers run:

```ts
const { apiKey } = yield* yield* StripeCredentials;
```

The first yield obtains the lazy credential Effect; the second resolves the current profile/session. This enables environment credentials in CI and refreshed sessions locally.

Use `environments-auth-state.md` to implement `AuthProviderLayer`, profile configuration, credential storage, login/logout, redacted display, and lazy read.

## Reconcile

Write one convergent flow for create, update, recovery, and adoption:

1. Observe the live API using a deterministic physical identifier or prior output.
2. Ensure the object exists, tolerating already-exists races.
3. Compare observed mutable fields with desired props.
4. Apply only required changes.
5. Return freshly observed attributes.

Inputs include desired `news`, optional previous `olds`, optional previous/imported `output`, logical `id`, deterministic `instanceId`, and attached `bindings`.

Do not branch the whole method into `if output undefined then create else update`. During adoption, output can exist while old props do not. Trust observed cloud state.

Wrap SDK calls with `Effect.tryPromise` and map failures into tagged provider errors containing operation, resource identity, safe message, and retryability. Retry only transient failures with a bounded Schedule.

## Diff And Replacement

Implement `diff` only when the default structural comparison cannot express provider semantics.

- Guard unresolved Inputs/Outputs.
- Mark replacement only for immutable fields or identity changes.
- Ignore provider-computed/defaulted fields that should not cause perpetual updates.
- Normalize equivalent representations before comparison.
- Include a human-readable reason for replacement.

Test no-op, mutable update, and replacement separately. A noisy diff is an operational defect.

## Read, Ownership, And Adoption

`read` lets Alchemy find a resource when state is absent.

- Return `undefined` when absent.
- Return plain attributes when the resource is provably owned by this stack/stage/logical ID.
- Return `Unowned(attributes)` when it exists but ownership cannot be proven.

Use provider tags, labels, or naming metadata for ownership. Never silently claim a foreign object because its name matches. If the upstream API has no ownership concept, document that recovery/adoption cannot distinguish ownership.

## Delete

Delete must be idempotent:

- already absent is success;
- disable/protect semantics are explicit props, not hidden environment behavior;
- dependent child cleanup follows provider requirements;
- asynchronous deletion is polled with a bounded Schedule;
- credentials/permission errors remain visible;
- secrets never enter logs.

If a provider cannot safely delete an object, model retention/protection in the Resource contract and plan output.

## List

`list` supports broad inventory operations, including `unsafe nuke`. It must:

- scope results to the authenticated account/project/region where possible;
- paginate completely;
- return stable physical identity and attributes;
- avoid leaking secrets;
- make ownership metadata available to callers.

Because list can feed catastrophic deletion, test scoping more aggressively than ordinary read.

## Bindings

A custom binding should expose a narrow runtime capability and attach deploy-time policy/config to a host.

- Keep contract and implementation Layer separate.
- Record only minimum permissions.
- Provide native and HTTP implementations only when both topologies are supported.
- Keep provisioning SDKs out of runtime bundles.
- Test plan-time wiring and runtime behavior.

## Actions

Use an Action for idempotent side effects that should rerun when declared inputs change.

- Hash every semantic input.
- Make retries harmless.
- Return redacted, serializable outputs.
- Do not use timestamps/randomness unless they are intentional inputs.
- Do not use an Action for a remote object that requires deletion, drift correction, or adoption.

## State And Runtime Extensions

For custom state, implement the full `StateService` contract and test persistence, listing, deletion, replacement history, concurrency, and interrupted writes.

For a custom runtime, define bundling, Resource lifecycle, runtime API, phase handling, binding policy/client behavior, runtime context, and cleanup. Prove one HTTP handler and one binding end to end before expanding the surface.

## Provider Tests

Use `test.provider` against a sandbox API/account. Cover:

- create and fresh attributes;
- no-op repeated reconcile;
- mutable update and drift correction;
- replacement;
- delete twice;
- owned recovery;
- unowned refusal and explicit adoption;
- pagination/list scoping;
- typed errors and transient retry;
- redaction;
- partial failure recovery.

Read-only unit tests around normalization/diff helpers are useful, but they do not replace lifecycle tests.

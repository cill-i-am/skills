# Core Model

Alchemy turns an Effect program into a dependency graph, computes a plan from desired code plus persisted/observed state, and reconciles cloud resources through provider Layers.

## Stack

`Alchemy.Stack(id, options, effect)` is the deployment and state ownership unit.

- The ID participates in resource identity and physical naming.
- `providers` supplies lifecycle implementations and binding policies.
- `state` persists resource inputs/attributes for later plans.
- The Effect declares resources/actions and returns stack outputs.
- Stage selects an isolated instance of the stack.

Default-export one stack per entrypoint. Use a custom entrypoint only when the CLI command names it explicitly.

## Resource

A Resource has:

- a resource type, such as `Cloudflare.R2.Bucket`;
- a stable logical ID, such as `Uploads`;
- input props describing desired state;
- output attributes returned by the provider;
- a provider lifecycle implementation.

```ts
export const Uploads = Cloudflare.R2.Bucket("Uploads");
```

The constructor returns an Effect description. Yielding it registers the resource in the surrounding stack/function graph. Cloud APIs run later during planning and apply.

Logical IDs are identity. Renaming a variable does nothing; changing `"Uploads"` can create a different resource. Preserve IDs through refactors and migrations unless replacement is intentional.

## Action

An Action is deploy-time Effect work that reruns when its inputs change. It has graph dependencies and memoized input identity but no full remote lifecycle.

Use an Action for idempotent code generation, seeding, one-time API calls, or migration-like work that can safely retry. Use a Resource when the object needs read, adoption, drift reconciliation, replacement, or delete behavior.

## Outputs

Provider attributes are lazy `Output<T>` values because they do not exist until upstream resources resolve.

```ts
import * as Output from "alchemy/Output";

const bucket = yield* Cloudflare.R2.Bucket("Uploads");

const upper = bucket.bucketName.pipe(
  Output.map((name) => name.toUpperCase()),
);

const objectArn = Output.interpolate`arn:aws:s3:::${bucket.bucketName}/objects/*`;
```

Use:

- property access for nested attributes;
- `literal` for a known value already needing Output shape;
- `asOutput` in helpers accepting plain values, Effects, or Outputs;
- `map` for pure transforms;
- `mapEffect` for Effectful transforms;
- `all` for parallel tuple composition;
- `interpolate` for strings;
- `of`/`ref` for explicit references;
- `Redacted` for secrets flowing through evaluation.

Passing an Output into another Resource's props creates a dependency edge. Do not run Output evaluation yourself or coerce Outputs to strings.

## References

References read attributes of resources or stacks that are already deployed in a state store.

- Same stack: reuse and yield the exported Resource constructor/tag.
- Another stack: import/yield its Stack tag or use `Resource.ref`.
- Another stage: use explicit stage selection only when intentionally shared/pinned.
- Low-level: `Output.ref`/`Output.stackRef` when helper APIs require it.

References do not deploy the target. Deploy upstream first and destroy downstream first. Missing targets should fail clearly; do not hide them with fallback infrastructure.

## Lifecycle

A plan compares desired inputs with persisted state and provider observations. Resource operations include create/reconcile, no-op, update, replacement, read/recovery/adoption, and delete.

Providers should converge from observed state:

1. Read live state when possible.
2. Ensure the object exists.
3. Reconcile mutable differences.
4. Replace only when the API cannot update a property safely.
5. Return fresh attributes.
6. Delete idempotently.

A replacement creates or adopts the new identity according to provider ordering, updates dependents, then removes the old resource. Review replacements more carefully than ordinary updates.

## Adoption And Recovery

When state is missing, provider `read` determines whether a resource is absent, owned, or unowned.

- Owned resources can be recovered into state automatically.
- Unowned resources fail by default.
- `--adopt` authorizes takeover across the deploy.

Adoption is an ownership mutation. Verify tags, physical identity, stack/stage/profile, and reconcile behavior before enabling it.

## Providers

The stack's provider Layer maps resource types to lifecycle implementations and contributes auth/binding services.

```ts
providers: Layer.mergeAll(
  Cloudflare.providers(),
  Drizzle.providers(),
  Neon.providers(),
)
```

Register each required provider once. Keep the set minimal and use `provider-extension.md` when implementing a new provider.

## State

State records resolved props and attributes, replacement history, stacks, stages, and resources. It is what the next plan diffs against; it is not the cloud itself.

- Use provider remote state for team and CI stacks.
- Use local state for isolated work and examples.
- Never commit `.alchemy/`.
- Inspect state before clearing or switching stores.
- Protect state storage and credentials as production infrastructure.

## Stages And Profiles

- Stage answers: which isolated stack instance?
- Profile answers: which credentials/auth methods?

Default developer stages are derived from the user. CI and production must pass explicit stages and profiles. Stage-aware props belong in stack context; do not build a second environment model from scattered env variables.

## Plan, Init, Runtime

For ordinary Resources, planning describes and reconciles infrastructure. For Functions/Servers, one Effectful constructor spans:

- Init: runs at plan time to discover bindings and at cold start to build runtime clients/services.
- Runtime: returned handlers execute only for requests/events.

`Alchemy.RuntimeContext` is runtime-only. Init can capture clients and services into returned handlers, but must not perform request-dependent work.

## Bindings

A binding connects a resource to a Function/Server and usually combines:

- a typed runtime capability;
- deploy-time wiring such as IAM, environment variables, native bindings, routes, or event mappings;
- a runtime implementation Layer.

Use the narrowest capability. Examples include R2 read/write access, an AWS S3 operation, an SQS sender, or a typed internal service client. Bindings make access part of the graph rather than invisible configuration.

## Graph Design Checklist

- One owner for every physical resource and state record.
- Stable logical IDs and deliberate physical names.
- Dependencies represented by Outputs, bindings, event sources, or references.
- No hidden deploy ordering in shell scripts.
- Resources for lifecycles; Actions for input-keyed side effects.
- Useful redacted outputs.
- Explicit stage/profile/state for every mutating operation.

# Core Model

Alchemy v2 is Infrastructure-as-Effects: a single TypeScript/Effect program declares cloud resources, application runtime code, bindings, credentials, state, and deploy-time actions.

## Stack

`Alchemy.Stack(name, options, effect)` is the deployment unit.

- `name` identifies the stack in state.
- `options.providers` supplies provider Layers.
- `options.state` supplies a state store.
- The generator declares resources and returns stack outputs.

Default CLI entrypoint is `alchemy.run.ts`, but any TypeScript file exporting a default stack can be used: `pnpm exec alchemy deploy stacks/github.ts`.

Best practices:

- Return useful outputs only: URLs, resource IDs, database branch names, bucket names, queue names, or values tests/operators need.
- Prefer one stack while resources ship together. Split stacks only for independent ownership/deploy cadence.
- Use typed stack handles for cross-stack outputs:

```ts
export class Backend extends Alchemy.Stack<Backend, { url: string }>()(
  "Backend",
) {}

const backend = yield* Backend;
const prodBackend = yield* Backend.stage.prod;
```

## Resources

A resource has a stable logical ID, input props, and output attributes. Calling `Cloudflare.R2Bucket("Bucket")` builds an Effect description. It is registered when `yield*` happens inside a stack or Layer; cloud API calls happen later during plan/apply.

Logical ID rules:

- Stable ID means same resource across deploys.
- Variable/file renames are safe if logical ID stays the same.
- Logical ID change means new resource and deletion of the old one.
- IDs only need to be unique within a stack namespace.

Physical names are derived from stack, stage, logical ID, and instance ID. Stage isolation and deterministic names make retries/adoption possible.

## Outputs

Resource attributes are lazy `Output<T>` values.

- Use property access for nested outputs.
- Use `Output.interpolate` for strings.
- Use `Output.map`/`mapEffect` for transformations.
- Use `Output.all` to combine dependencies.
- Passing outputs into resource props creates graph edges.

Do not try to log or unwrap outputs during declaration. They resolve when the engine evaluates the graph.

## References

References read already-deployed state at plan time.

- `Resource.ref(id, { stage, stack })` references one deployed resource.
- `yield* TypedStack` reads a whole stack output record at the matching stage.
- `TypedStack.stage[name]` pins the stage.
- `Output.ref` and `Output.stackRef` are lower-level escape hatches.

Missing refs fail at plan time with an invalid reference. Deploy upstream first.

Canonical PR database pattern:

```ts
const project = stage.startsWith("pr-")
  ? yield* Neon.Project.ref("app-db", { stage: "dev_shared" })
  : yield* Neon.Project("app-db", { region: "aws-us-east-1" });
```

## Lifecycle

Plan classifies each state entry/resource as create, update, replace, delete, or noop. Apply walks the dependency graph.

Provider lifecycle:

- `reconcile`: required, converges live cloud to desired state.
- `delete`: required, idempotent cleanup.
- `diff`: optional planning hook for noop/update/replace.
- `read`: optional recovery/adoption hook.
- `precreate`: optional for circular platform bindings.
- `tail`/`logs`: optional observability hooks.

Provider reconcile should be observe -> ensure -> sync -> return. Do not split create/update by `output === undefined`; adoption has output but no old props.

Adoption:

- Owned resources can be silently recovered when state is missing.
- `Unowned(attrs)` fails unless `--adopt` is used.
- `--adopt` is a takeover flag, not a normal recovery flag.

## Stages And Profiles

Stages isolate state and physical names. Resolution order:

1. `--stage`
2. `STAGE`
3. `dev_$USER` or `dev_$USERNAME`
4. `dev_unknown`

Common names: `dev_<user>`, `dev_shared`, `pr-<number>`, `prod`.

Use `dev_shared` only for shared development resources such as a Neon project
that PR/dev stages branch from. It is not a release gate, and it should not
become a long-lived staging environment unless the user explicitly chooses that
topology.

Profiles isolate credentials. Use `--profile` or `ALCHEMY_PROFILE`. A typical pattern is `pnpm exec alchemy deploy --stage prod --profile prod`, but stages and profiles are orthogonal.

## State

State stores persisted resource state by stack, stage, and fully-qualified resource name.

- Local state lives in `.alchemy/`; gitignore it.
- `Cloudflare.state()` is recommended for teams/CI on Cloudflare. It bootstraps a state-store Worker backed by a Durable Object and Secrets Store.
- A Cloudflare state bootstrap is one-time per account/state worker name.
- Custom state stores provide `State` with a cached `StateService`; defer backend connection until first state access.

## Platforms And Phases

Platforms combine infrastructure and runtime code. Cloudflare Workers, Lambda Functions, and Containers are platforms.

Alchemy platform code has two phases:

- Plantime/init: stack graph and binding discovery during `plan`, `deploy`, or `dev`; also runs at runtime cold start.
- Runtime: request/event handlers inside the deployed Worker/Lambda.

Effect Workers return an Effect from an Effect:

```ts
export default Cloudflare.Worker(
  "Api",
  { main: import.meta.filename },
  Effect.gen(function* () {
    const bucket = yield* Cloudflare.R2.ReadWriteBucket(Bucket);

    return {
      fetch: Effect.gen(function* () {
        const object = yield* bucket.get("hello.txt");
        return object
          ? HttpServerResponse.text(yield* object.text())
          : HttpServerResponse.text("Not found", { status: 404 });
      }),
    };
  }).pipe(Effect.provide(Cloudflare.R2.ReadWriteBucketBinding)),
);
```

Init can bind resources and construct layers. Runtime handles requests. `Alchemy.RuntimeContext` requirements should only appear in returned runtime effects.

## Bindings

Bindings record runtime wiring and return typed clients. On Cloudflare they emit native Worker bindings or scoped HTTP credentials. Binding has two layers internally:

- Policy: plan-time binding emission.
- Service: runtime SDK wrapper.

Best practices:

- Effect style: bind in init, use typed client in runtime.
- For beta.58 capability resources, prefer the least-privilege namespace: `Cloudflare.R2.ReadBucket`, `Cloudflare.R2.WriteBucket`, `Cloudflare.R2.ReadWriteBucket`, `Cloudflare.KV.ReadWriteNamespace`, and `Cloudflare.Queues.WriteQueue`.
- Provide the matching implementation Layer such as `Cloudflare.R2.ReadWriteBucketBinding` or `Cloudflare.R2.ReadWriteBucketHttp`.
- Hyperdrive still uses `Cloudflare.Hyperdrive.bind(Hyperdrive)` with `Cloudflare.HyperdriveBindingLive`.
- Async style: use `env` props and `Cloudflare.InferEnv<typeof Worker>`.
- Catch/handle binding errors in runtime effects so Worker error channels typecheck.

## Secrets And Config

`effect/Config` values resolved in platform init become bindings.

```ts
const apiKey = yield* Config.redacted("OPENAI_API_KEY");
```

Footgun: resolving `Config` only inside `fetch` means Alchemy does not discover or bind it. Resolve in init and capture it in the closure.

All Config values bind as secrets. Use literal `env` values for intentionally plain, non-sensitive config.

## Layers

Use Effect Layers to encapsulate infrastructure behind typed services. A Layer can declare resources, bind them, and return a domain interface. Consumers depend on the service, not R2/KV/D1/etc.

Use Layers when:

- Multiple Workers share the same capability.
- You want to swap storage implementations.
- You want test fakes.
- Runtime code is getting cloud-primitive-heavy.

Best practices:

- Use `Context.Service` plus named layer constants such as `UploadsLive`, `DbLive`, or `GitHubLive`.
- Prefer `Layer.effect` when constructing a service depends on resources, bindings, Config, Scope, SDK clients, or other services.
- Use `Layer.succeed` only for pure values and `Layer.effectDiscard` for startup effects that do not provide a service.
- Provide Layers at stack, Worker init, test, or subsystem boundaries. Avoid scattering `Effect.provide` deep in business logic.
- Avoid repeated layer factory calls; layer memoization is by layer reference.

For Alchemy-specific Effect boundary patterns, load `effect-infra.md`.

## Actions

`Action` is a deploy-time graph node with input hashing. It runs when inputs change or `--force` is used. It has no provider lifecycle, no delete, and no read.

Use Action for:

- Seeding.
- Notifications.
- Artifact sync.
- Cache invalidation.
- One-off checks.

Use Resource instead when lifecycle, adoption, reading, replacement, or delete behavior matters.

# Gotchas And Hard Rules

Load this before finalizing nontrivial Alchemy work.

## Safety

- Do not run deploy, destroy, mutating dev, bootstrap, token creation, adoption, state/profile clearing, or real-cloud tests without explicit confirmation.
- Treat `alchemy unsafe nuke` as catastrophic. Never run it from a broad or inferred approval.
- Do not pass `--yes` locally unless the user explicitly requested the exact operation.
- CI cleanup must hard-refuse `prod` and shared long-lived stages.
- Never commit `.alchemy/`, credential stores, raw secrets, generated tokens, or unredacted connection strings.

## Sources And Versions

- Use `https://alchemy.run/llms.txt`, current guide pages, generated provider APIs, and `alchemy-run/alchemy` source.
- Inspect the resolved package before using version-sensitive APIs.
- Use canonical current names in new code, even when source preserves aliases for migration.
- Do not use historical blog posts as API reference.
- Do not copy v1 async infrastructure declarations into v2 stacks.
- Pin the runtime and package manager used by infrastructure scripts in real projects.

## Identity And State

- Resource type, logical ID, stack, and stage participate in identity.
- A logical-ID edit can replace or orphan infrastructure even if the TypeScript variable rename looks harmless.
- One physical resource must have one authoritative stack/state owner.
- An empty or switched state store can make existing resources look new.
- Inspect state before clearing it; `state clear` removes records, not cloud objects.
- Recovery of owned resources is normal; takeover of unowned resources requires explicit adoption.
- References read existing state and do not deploy upstream resources.
- Deploy upstream before downstream; destroy downstream before upstream.

## Stages And Profiles

- Stage selects infrastructure; profile selects credentials.
- CI must not rely on `dev_$USER` defaults.
- A profile name does not prove the account/project currently resolved by its auth provider.
- Shared development stages create shared data and destroy risk; use them intentionally.
- Do not pin references to production merely to make local development convenient.

## Outputs

- Outputs are lazy graph expressions, not values available during declaration.
- Do not interpolate with JavaScript strings, serialize, log, compare, or branch on unresolved Outputs.
- Use Output combinators and pass Outputs directly through props.
- Keep `Redacted` wrappers intact through Outputs and state.
- Custom provider diff/read code must account for unresolved Inputs.

## Resources And Actions

- Use Resources for identity, drift, read, adoption, replacement, and delete.
- Use Actions only for idempotent deploy-time side effects keyed by all semantic inputs.
- Time, randomness, machine paths, or undeclared files can make Action/Command memoization dishonest.
- Do not hide lifecycle work in shell scripts when it belongs in the graph.
- Reconcile from observed cloud state; old state is evidence, not truth.
- Delete is idempotent and treats not-found as success.
- List scope must be safe because it can feed broad deletion.

## Phases And Runtime

- Function initialization runs during planning and cold start. It must be safe in both contexts.
- Request-, message-, and event-dependent effects belong in returned handlers.
- Resolve `Config` during initialization so bindings/secrets can be discovered.
- `RuntimeContext` is runtime-only.
- Keep clients that need deterministic cleanup in request/event scope when the host has no instance teardown hook.
- Do not manually reproduce internal runtime guards; provide the binding Layer.
- Build reusable service Layers once and provide them at platform/application boundaries.

## Bindings And APIs

- Bind the narrowest capability and provide its exact native/HTTP Layer.
- Native platform bindings are preferable for trusted internal calls when available.
- Schemaless RPC is for trusted internal communication, not arbitrary external input.
- Effect RPC and Effect HTTP validate trust boundaries; do not pay schema encode/decode cost merely to restate internal types.
- Client and server serialization must match.
- Keep API schemas free of provider resources, credentials, SDK clients, and runtime implementation types.

## Cloudflare

- Use canonical namespaced resources: `R2.Bucket`, `KV.Namespace`, `D1.Database`, and `Queues.Queue`.
- Use least-privilege R2/KV/Queue capabilities and matching Layers.
- `alchemy dev` uses real cloud dependencies; it is not full emulation.
- Prove frontend traffic targets the local Worker instead of a deployed URL.
- Use a narrow Worker `cwd` in monorepos to prevent reloads on generated/sibling output.
- Durable Object and Workflow handlers must account for replay/concurrency semantics.
- Queue consumers must be idempotent and configure retry/dead-letter behavior.
- Zone, DNS, route, Access, certificate, and security resources can affect unrelated traffic; inspect existing configuration before mutation.

## AWS

- Verify account and region, not only profile name.
- `aws bootstrap` mutates the account and must precede Lambda CI deployments.
- Operation bindings should generate IAM; broad hand-written wildcard policies are a warning sign.
- Lambda is the default runtime until workload constraints justify ECS, EC2, EKS, or MicroVMs.
- Event sources are commonly at-least-once and can redeliver batches.
- S3 bodies and stream records should remain streaming when size can grow.
- Route53 and ACM changes need explicit domain/zone ownership evidence.

## Databases

- Hyperdrive is for external Postgres/MySQL behind Workers, not D1.
- Give Hyperdrive a direct origin, not a provider's pooled endpoint.
- Open/close database clients at the runtime scope supported by the driver and host.
- Use one migration owner; concurrent deploy jobs must not race migrations.
- Shared projects/branches are upstream resources, not disposable preview children.
- Production branch protection and destructive migrations require explicit review.
- Keep DSNs and passwords redacted until the driver boundary.

## Tests

- Alchemy stack/provider tests can create real resources without prompting.
- A unique stage is not enough if the provider uses globally unique names or shared data.
- Deploy once per suite and bound every propagation/polling retry.
- Do not use arbitrary sleeps or `Date.now()` deadline loops.
- Teardown failure is a test failure and must report retained resources.
- Do not run broad cleanup when a precise stack-stage destroy is available.
- Mocks can test adapters but cannot prove provider lifecycle or cloud binding behavior.

## CI

- Plain mode does not prompt; mutation needs `--yes` after guards.
- Every job must know whether it owns deployment, tests, or cleanup.
- Do not let parallel jobs deploy/destroy one stage without coordination.
- Prefer OIDC/workload identity; long-lived cloud keys require stronger justification.
- Remote state and auth must be available to every runner that owns the same deployment.
- PR comments and GitHub resources need stable IDs to avoid duplicates.

## Docker, Kubernetes, Commands

- Pin remote images by digest where reproducibility matters.
- Docker build context and Command inputs must exclude unrelated monorepo churn.
- `Command.Build` output directories must never overlap source or shared artifacts.
- `Command.Exec` must tolerate retry and partial prior success.
- Verify Kubernetes cluster/context, namespace, and server-side apply ownership before changing objects.
- Raw `Kubernetes.Object` is an escape hatch; validate manifests and pruning behavior.

## Custom Providers

- Credentials remain lazy and redacted.
- Reconcile observes, ensures, syncs, and returns fresh attributes.
- Do not equate `output === undefined` with create-only behavior.
- `read` distinguishes absent, owned, and unowned where the API permits.
- `diff` normalizes equivalent values and marks replacement intentionally.
- `list` paginates and scopes results.
- Provider tests cover no-op, drift, replacement, delete twice, recovery, adoption refusal, and partial failure.

## Finish

- Current imports and canonical API names.
- Stable identities and expected plan.
- Explicit stack/stage/profile/account/state.
- Correct phase and binding ownership.
- Typecheck/tests completed or skipped with reason.
- No unapproved cloud mutation.
- Exact retained resources and cleanup status reported.

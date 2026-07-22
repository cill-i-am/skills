# Audit Checklist

Use this for explicit reviews, nontrivial infrastructure changes, real-cloud test preparation, and pre-deploy evidence. Load only the references matching touched surfaces.

## Route The Audit

- Graph, Outputs, references, identity, lifecycle: `core-model.md`.
- Phases, bindings, Layers, events, runtime scope: `effect-infra.md`.
- API trust boundaries: `apis.md`.
- Cloudflare: `cloudflare.md`.
- AWS: `aws.md`.
- CLI/adoption/recovery: `cli-operations.md`.
- Stages/profiles/auth/secrets/state/CI: `environments-auth-state.md`.
- Tests and test-created resources: `testing.md`.
- Telemetry and alerts: `observability.md`.
- Docker/Kubernetes/commands: `containers-toolchain.md`.
- Databases: `database-patterns.md` plus the selected provider file.
- GitHub resources and workflows: `github.md`.
- Workspaces and stack boundaries: `monorepos.md`.
- Custom providers/extensions: `provider-extension.md`.
- Always: `gotchas.md`.

## Evidence First

Record before judging:

- resolved Alchemy and Effect versions;
- stack entrypoint and relevant package scripts;
- current branch/diff and changed logical IDs;
- target stage, profile, account/project, region, and state store;
- plan output when safe and credentials are available;
- tests/typecheck run and whether they mutate cloud resources;
- deploy/destroy/adoption/bootstrap authorization state.

Do not claim a plan, deploy, integration test, or cleanup happened without command evidence.

## Universal Checks

- Canonical current provider imports and resource names are used.
- Logical IDs and physical names remain stable or replacement is explicitly intended.
- Every Resource has exactly one owner and provider.
- Outputs carry dependencies without eager coercion.
- Actions are idempotent and not standing in for managed lifecycles.
- References target already-deployed resources and destroy order is safe.
- Stage/profile/state/account assumptions are explicit.
- Secrets stay `Redacted` and out of logs/state outputs.
- Stack outputs support verification and operations.
- No mutation occurred without confirmation.

## Runtime And Bindings

- Initialization contains resource/binding/config/service setup only.
- Request/message/event work remains in returned runtime handlers.
- Runtime-only context is not required at plan time.
- Every capability has the matching implementation Layer.
- Access is least privilege: R2/KV/queue capability or AWS operation-specific IAM.
- Service Layers are stable values and provided at coherent boundaries.
- Instance/request scopes and cleanup match the runtime.
- Event consumers are idempotent with explicit retry, batch, and dead-letter policy.

## APIs

- Schemaless RPC is used only across trusted internal boundaries.
- Effect RPC/HTTP schemas validate every external value once at ingress.
- IDs and domain primitives are branded/structured rather than interchangeable strings where confusion is plausible.
- Success and error contracts round-trip.
- Serialization and transport agree on both ends.
- Authentication, authorization, CORS, and idempotency are owned by the correct boundary.

## Cloud Providers

Cloudflare:

- Current namespaced APIs and binding Layers are used.
- `Cloudflare.state()` ownership/bootstrap is understood.
- Worker local-dev URL and browser routing are verified.
- Hyperdrive uses a direct origin and request-scoped DB clients.
- Zone/domain/security resources cannot overwrite unrelated traffic accidentally.

AWS:

- Account, region, profile, and assets bootstrap are correct.
- IAM derives from narrow bindings, without wildcard escape hatches.
- Lambda/ECS/EC2/EKS choice matches runtime requirements.
- Event sources have failure destinations and bounded retry behavior.
- Domains/certificates/DNS are in the intended account and zone.

## Data

- Database provider and branch/project ownership are explicit.
- Dev/PR isolation does not clone expensive persistent projects unnecessarily.
- Migration generation and application have one owner.
- Destructive SQL and production branch protection are reviewed.
- Connections/pools close at the runtime's request/event boundary.
- Connection strings remain redacted until the driver boundary.
- Shared database references are explicit and cannot be destroyed downstream.

## Environment And CI

- CI passes explicit stage/profile and uses remote state.
- Workload identity/OIDC is preferred over long-lived credentials.
- Non-interactive `--yes` follows stage/event guards.
- Preview stages are unique and cleanup refuses production/shared stages.
- Concurrent jobs cannot race deploy/destroy on the same stack.
- Auth providers resolve credentials lazily and do not persist secrets in profiles.
- State clearing/switching/adoption has explicit ownership evidence.

## Tests

- Unit, adapter, stack, and provider tests are not conflated.
- Real-cloud suites have explicit authorization, sandbox account/profile, unique stage, and cleanup policy.
- The stack deploys once per suite.
- Propagation and async work use bounded retries, not sleeps/deadline loops.
- Provider tests prove no-op, update, drift, replacement, delete, read, adoption, list, and typed failure behavior.
- Retained resources are reported exactly.

## Tooling And Observability

- Docker images are pinned/content-addressed and build inputs are narrow.
- Command operations are memoized, idempotent, and own safe output paths.
- Kubernetes context, namespace, field ownership, and pruning are correct.
- Logs/spans/metrics include stage and resource identity.
- Secrets/PII are excluded from telemetry.
- Alerts have owners, actionable thresholds, and verified notification routes.

## Report

For workflow reviews, use the finding dispositions owned by
`docs/agents/execution-policy.md`; this capability does not define authority.
Include file/line evidence before assumptions, skipped checks, and verification.
For implementation completion, summarize only relevant evidence: versions,
tests, physical proof, stage/profile/account, migrations, cloud mutation, and
retained resources.

# Ownership, protection and deployment operations

## Bind an existing object

| Owner | Representation | Check |
|---|---|---|
| Current stack | Pass the resource declaration or its Output | The plan includes the intended graph edge and stable logical ID. |
| Another Alchemy stack | Typed Stack output or `Resource.ref` with explicit stack/stage | Confirm the producer has deployed and the intended stage supplied the ID. |
| External owner | Resource-specific `.lookup(...)` where supported | A live read resolves it. No create, update, deletion or ownership transfer for that object. A missing lookup fails. |
| Becoming this stack's responsibility | Explicit, scoped adoption after identity/ownership verification | Inspect the physical ID, provider ownership and resulting plan. |

A lookup that finds this stack's own resource fails with `LookupOfManagedResourceError`. A missing target can raise `LookupNotFoundError`. Keep the declaration in scope for an in-stack dependency. For a rename, preserve the physical ID and account for every consuming stage. Cloudflare Durable Object class renames also need the provider's class-level `renamedFrom`; changing the logical ID alone does not migrate the exported class or stored data.

## Protect persistent data

`RemovalPolicy.retain()` leaves the physical object and removes its state row. A replacement can still redirect dependents. `RemovalPolicy.protect()` refuses a planned replacement or deletion, including removal of the declaration. If removal is intended, first deploy the unprotected declaration as a separate change and verify it persisted. Confirm parent-side cascade behavior and backups separately.

## Move state

Inventory backend, region/account, stack, stage, schema version, writers and current physical IDs. Serialize all writers through completion. AWS defaults to DynamoDB with S3 overflow. Explicit S3 remains available with `AWS.state({ backend: "s3" })`. Use the installed `alchemy state migrate` help to scope the migration. The migration fences old S3 writers; confirm the destination's identities, row counts and expected plan. Rehearse `--rollback` before downgrading. Never point the same continuing stage at an empty store. GCP state uses a Cloud Storage bucket. Cloudflare uses a state Worker; custom-domain flags matter to bootstrap and subsequent operations. Postgres uses `@alchemy.run/sql/PostgresState` with session-level locking. Isolate state backend teardown from application cleanup.

## Identify the caller

For a cross-cloud binding record host, target capability, generated role, issuer, audience/subject, transport and propagation time. Cloud Run and Fly Services can use workload identity for supported AWS calls. Some hosts require a narrowly scoped secret. Verify the intended workload succeeds and another principal is denied. Treat the CI deployer identity independently. Avoid widening IAM during propagation.

## Concurrent runs and headless automation

Choose a distinct dev, test and deployment stage per worktree or CI run. Get the effective runner stage before starting; the standalone test runner can derive one for a linked worktree. Keep cleanup and creation on the same naming function and writer lock. The upstream composite creates `staging-N`; the shipped workflows use `pr-N`. Use a matched creator and cleaner. Check failed deploy, PR close, fork and retry paths.

Use `alchemy/Alchemist` for structured automation. For deployment/destruction, inspect the plan and pass it to apply. For drift use scan then execute only the selected repair. Consume structured events and preserve error causes. A nuke scans providers independently of state. For extensions, export a lazy contributions module through `alchemy.contributes` for auth/state/CLI discovery before stack evaluation. Verify create, no-op, update, replace, delete and recovery with a disposable target.

[References](https://alchemy.run/infrastructure-as-code/references) · [Lifecycle](https://alchemy.run/infrastructure-as-code/resource-lifecycle) · [State](https://alchemy.run/state-store) · [Identity](https://alchemy.run/infrastructure-as-effects/identity-federation) · [Worktrees](https://alchemy.run/environments/worktrees) · [Alchemist](https://alchemy.run/cli/api) · [Provider contributions](https://alchemy.run/infrastructure-as-code/contributions)

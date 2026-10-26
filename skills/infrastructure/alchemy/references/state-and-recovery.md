# State stores, concurrency, and recovery


## Choose the backend deliberately

Local state defaults to `.alchemy/`. It is useful for isolated local work but cannot be discarded between CI jobs that manage a continuing deployment. Remote state supplies a shared deployment record. It is independent of the provider resources in the stack.

The current `Cloudflare.state()` guide describes a Worker with a Durable Object using embedded SQLite. Its bearer token and encryption key live in Cloudflare Secrets Store. The first `plan`, `dev`, or `deploy` can trigger an approved bootstrap. That backend is shared across stacks and stages on the account; a preview cleanup must not delete it.

Postgres state is imported through a dedicated subpath:

```ts
import { postgresState } from "alchemy/State/PostgresState";
import * as Config from "effect/Config";

const state = postgresState({ url: Config.Redacted("STATE_DATABASE_URL") });
```

The documented implementation uses a session advisory lock per `(stack, stage)`. It requires the optional Postgres driver dependencies. Keep this Node-only state code out of Worker/browser bundles. Do not assume every backend has identical locking or encryption semantics.

## Preserve the state identity

Changing state backend, worker name, storage prefix, account, stack, or stage can make a deployment look new. It is not a harmless configuration cleanup. Export/backup state using the matching release's supported mechanism, verify the new backend, and test a representative stage before moving production. Do not manually invent an incompatible resource-state JSON format.

State contains resource inputs, outputs, instance IDs, lifecycle markers, and binding information. Even redacted representations may be encoded for later use. Treat state and backup files as sensitive credentials-bearing data, not public build artifacts.

## One writer per target

Serialize deploy, destroy, repair, and migration writers for the same stack and stage. Use the same CI concurrency key across preview deployment and cleanup workflows. Avoid cancelling a running apply to replace it with a newer run; let it finish, then apply the next revision. Backend locks and CI serialization are complementary safeguards, not substitutes for understanding other writers such as a developer laptop.

Separate test stages from persistent preview stages. A test suite that destroys `test-pr-42-run-123` must not destroy `pr-42`, and a preview test must not call harness teardown on the environment it is merely observing.

## Diagnose before repairing

1. Confirm the complete target tuple and original source revision.
2. Preserve the current state record and relevant provider logs.
3. Compare three things: declared inputs, persisted state, and observed cloud state.
4. Decide whether the problem is code drift, an external cloud change, interrupted apply, missing permission, or missing state.
5. Choose a bounded recovery operation and explain its effect before running it.

`plan` is a declaration comparison; `drift` re-observes live resources. A drift repair restores the last deployed state, not necessarily the current source tree's desired state. Choose the right operation.

Deleting a state record does not delete its cloud resource. Losing a state store does not automatically erase cloud infrastructure, but it can make future ownership and deletion dangerous. Blanket adoption and account-wide nuke are not routine recovery procedures.

## Restore requirements

Record who owns backups, where keys are held, a restore runbook, the expected interruption window, and a tested restoration path. Restore credentials and state coherently. For a custom backend, test lock release after crashes, partial writes, encoding of secrets, concurrent writers, and versioned migration of stored records.


## Sources

- [state-store](https://alchemy.run/state-store/)
- [state-store/custom-state-store](https://alchemy.run/state-store/custom-state-store/)
- [cli/state](https://alchemy.run/cli/state/)
- [cli/inspecting-state](https://alchemy.run/cli/inspecting-state/)
- [cli/drift](https://alchemy.run/cli/drift/)
- [environments/ci](https://alchemy.run/environments/ci/)

Documentation snapshot: 7 October 2026. Resolve exact APIs against the target project’s installed version; see [version policy](version-policy.md).

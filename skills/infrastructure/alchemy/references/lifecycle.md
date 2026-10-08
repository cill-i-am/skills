# Lifecycle, retention, adoption, and renames


## Understand the proposed change

Planning compares declarations with persisted state and classifies create, update, replace, delete, and no-op changes. Providers implement reconciliation to converge on the desired state, plus deletion and other lifecycle hooks. A replacement creates a new generation, rewires dependents, then removes the old generation. Do not infer a universal zero-downtime or automatic data-copy guarantee from that ordering.

Check provider-specific replacement conditions before changing immutable properties. A database primary key, a region, a cloud identifier, or a binding host can be far more consequential than a code diff suggests. Review downstream application compatibility as well as infrastructure diffs.

## Protect data before removing its declaration

```ts
import * as RemovalPolicy from "alchemy/RemovalPolicy";
import { Stack } from "alchemy/Stack";

// Inside construction:
const { stage } = yield* Stack;
const uploads = yield* Cloudflare.R2.Bucket("Uploads").pipe(
  RemovalPolicy.retain(stage === "prod"),
);
```

`retain` skips the provider delete but removes the state row. It is not a backup, ownership lock, or promise that the resource remains manageable. A retained resource can still be deleted by its cloud API, by a cascading parent operation, or by another operator. Persist the retention policy in a successful deployment before the deployment that removes the declaration. A retention-only change may appear as no-op while still updating the stored policy.

For production data, specify backup, restore testing, retention, and removal ownership separately. Retain parent and dependent data resources coherently; a retained child does not make destructive parent deletion harmless.

## Renaming safely

For a naming-only refactor, inspect the current Renaming Resources guide and the installed release's `renamedFrom` support. Compare old and new FQNs, preserve the resource type and physical identity, and verify the plan shows a rename rather than replacement. Do not assume changing a class name, namespace, or stack name is just a source-code refactor.

Keep rename metadata long enough for every relevant stage to cross the migration. Test a stage that has not deployed recently. Remove old aliases only after their transition is complete. A cross-stack ownership transfer is not equivalent to an in-stack rename and needs its own recovery procedure.

## Adoption is an ownership change

A provider's `read` can recover an already-created object after a partial failure. Adopting an independently managed resource is different: it hands lifecycle control to this stack. Confirm identity, physical name, account, region, intended owner, retention, and backups before using `--adopt`.

Do not enable blanket adoption to make CI green. It can mask collisions with another stack. Pin physical names only when adopting a known resource or when a provider contract requires them. Review the declaration against the existing cloud object because successful adoption can still reconcile its settings.

## Recover from interruption

First establish whether the cloud operation completed. Preserve logs, the source commit, stack/stage, and state snapshot. Re-run the same intended declaration under the same identity only after understanding partial changes. A well-behaved provider should converge rather than duplicate. If it does not, inspect the resource's read/reconcile implementation or report an upstream bug; do not start deleting state at random.

Removal, adoption, repair, and state editing are separate operations. Authorization for one does not implicitly authorize all of them. Finish static investigation before asking for any missing authorization.


## Sources

- [infrastructure-as-code/resource-lifecycle](https://alchemy.run/infrastructure-as-code/resource-lifecycle/)
- [infrastructure-as-code/renaming](https://alchemy.run/infrastructure-as-code/renaming/)
- [cli/adopting-resources](https://alchemy.run/cli/adopting-resources/)
- [cli/inspecting-state](https://alchemy.run/cli/inspecting-state/)

Documentation snapshot: 7 October 2026. Resolve exact APIs against the target project’s installed version; see [version policy](version-policy.md).

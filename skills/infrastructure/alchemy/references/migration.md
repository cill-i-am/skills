# Migrate from v1 or between v2 releases deliberately

## Establish the migration scope

Do not migrate because the skill is invoked. First confirm the task explicitly includes an upgrade or migration. Inventory installed versions, patches, resource identities, state backend, providers, physical names, CI scripts, and the current successful deployment revision. Back up state and valuable data before changing lifecycle ownership.

V1 commonly uses a default `alchemy` import, `await alchemy(...)`, lowercase provider paths, and `finalize()`. V2 uses Effect-based stacks, `yield*`, and case-sensitive provider paths. Ordinary async Worker handlers can remain async in v2, so handler style is not a reliable version detector.

## Map concepts, not strings

Create a table of every resource's old type/ID/FQN/physical identity and its intended v2 counterpart. Check resource aliases and migration guidance in the installed/source release. A mechanical search-and-replace of imports is not enough: provider props, outputs, state storage, binding mechanisms, and lifecycle behaviour may differ.

Move composition to `Alchemy.Stack` with the chosen providers and state. Replace imperative infrastructure sequencing with resource/output dependencies. Keep request I/O out of construction. Translate Worker entrypoint/binding configuration using the exact migration guide; do not assume all v1 `entrypoint`/`bindings` props become `main`/`env` identically for every resource.

## Preserve the environment

Keep stack/stage names, provider account/region, physical names, and state identity stable unless a deliberate migration changes them. Do not point the new code at an empty backend and enable blanket adoption. Determine how existing ownership is imported or transferred, and verify the proposed resource plan before applying.

Rehearse on a disposable copy that represents existing data and state, not only a brand-new stack. Verify that rename/adoption metadata works for stages that have not deployed recently. A successfully migrated development stage does not prove a months-old production stage is covered.

## Upgrade the dependency family

Resolve Alchemy, Effect, platform packages, SQL integrations, framework adapters, test runners, and patches together. The reference baseline uses Alchemy `2.0.0-beta.81`; its workspace catalogue uses Effect `^4.0.0`, while some setup docs still mention RC tags. Prefer the actual installed peer/exports contract over a moving install snippet.

Remove obsolete patches only after verifying the upstream fix and the project's regression tests. Avoid compatibility shims that hide an unexamined breaking change. Keep migration-specific code only for the stages and transition window that actually need it.

## CI and runtime proof

Update CLI flags, package-manager invocations, explicit stage/profile selection, state authentication, and environment permissions. Preserve least privilege. Test constructor/runtime separation, bindings, public API compatibility, migration history, queue retries, and observability.

Run static checks and local tests first. Apply only in an authorized target after reviewing replacements/deletions. Record exact old/new identifiers, data checks, and cleanup. If a provider proposes replacing persistent data unexpectedly, stop and investigate rather than treating a clean compile as approval.

## Rollback limitations

A package downgrade is not automatically a state-format rollback or database rollback. Identify whether the old release can read state written by the new one, whether resource generations remain, and whether data/message formats are compatible. Maintain a known-good source and dependency snapshot, state backup, and a tested roll-forward or restoration path.

Finish by removing stale documentation and updating the source/version evidence. Do not mark a migration complete while an important stage remains on an untested transition path.

## Sources

- [migrating-from-v1](https://alchemy.run/migrating-from-v1/)
- [infrastructure-as-code/renaming](https://alchemy.run/infrastructure-as-code/renaming/)
- [infrastructure-as-code/resource-lifecycle](https://alchemy.run/infrastructure-as-code/resource-lifecycle/)
- [state-store](https://alchemy.run/state-store/)
- [getting-started](https://alchemy.run/getting-started/)
- [environments/ci](https://alchemy.run/environments/ci/)

Reference baseline: Alchemy `2.0.0-beta.81`, upstream `fbe6ece368c6898234592e897d852bb47b88ebb1`, researched 7 October 2026. Check installed APIs before applying examples.

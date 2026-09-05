---
name: alchemy
description: Change Alchemy v2 infrastructure, bindings, or deployment configuration.
---

# Alchemy v2

Check the installed Alchemy/Effect versions and the relevant stack or runtime declaration. Use installed exports and narrow [official sources](references/doc-map.md) for version-sensitive APIs. A routine edit does not need a full workspace audit or package upgrade.

Keep resource IDs stable unless replacement is intended. Separate declaration/deploy-time work, runtime initialization, and request/event handling. Bind the narrowest capability, resolve config/bindings during initialization, and keep resource/provider details out of public contracts.

Use native internal RPC where the accepted architecture calls for it, while preserving decoding/reconstruction at runtime boundaries. A typed transport does not replace domain validation. Expected provider failures stay typed; retry only when the effect's semantics permit it.

## References by task

- Resource graph and lifecycle: [core model](references/core-model.md), [Effect infrastructure](references/effect-infra.md).
- Provider configuration: [Cloudflare](references/cloudflare.md), [AWS](references/aws.md), [GitHub](references/github.md).
- Protocol and runtime boundaries: [APIs](references/apis.md).
- Commands and state: [CLI operations](references/cli-operations.md), [environments/auth/state](references/environments-auth-state.md).
- Local tests or integration proof: [testing](references/testing.md).
- Containers and builds: [toolchain](references/containers-toolchain.md).
- Database resources: [database patterns](references/database-patterns.md), with [Drizzle](references/drizzle.md), [Neon](references/neon.md), or [PlanetScale](references/planetscale.md) only when used.
- Stack ownership: [monorepos](references/monorepos.md).
- Custom provider work: [extensions](references/provider-extension.md).
- Operational investigation: [observability](references/observability.md), [gotchas](references/gotchas.md).
- Requested infrastructure audit or deployment review: [audit checklist](references/audit-checklist.md).

## Effects and proof

Local static checks and disposable tests may proceed within the task. Inspect unfamiliar stack/test commands: a plan or dev command can load provider credentials or perform setup, so its name alone does not establish safety. Deploy, destroy, adoption, state ownership changes, credential creation, and cloud-provisioning tests need authorization for their actual target and effects.

Reuse existing authorization; do not ask again for an already authorized operation. Complete safe implementation and useful local proof before presenting any missing external approval. Run only checks relevant to the change and required repository gates; a cloud plan is not mandatory proof for every edit.

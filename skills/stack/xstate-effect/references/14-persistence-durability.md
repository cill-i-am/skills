# Persistence, crash recovery, and external durability

## Separate four different artifacts

A **UI DTO** is a public projection suitable for clients. A **persisted actor snapshot** is runtime-specific continuation data. A **machine definition** describes logic/configuration. An **event log** records inputs/facts for audit or replay. They are not interchangeable; serializing one does not automatically reconstruct the others.

`getSnapshot()` is not the persistence API. Use `getPersistedSnapshot()` for supported persisted actor data, then validate, version, protect, and store it through an explicit persistence boundary. Never assume arbitrary context values—including connections, fibers, functions, or actor references—are portable JSON.

## Released baseline versus source preview

**Released reference baseline alpha.6:** the inspected `createEffectActor` options only contain input. Although the actor exposes `getPersistedSnapshot`, there is no supported `snapshot` restore option in that tagged constructor. Do not work around the gap by restoring with vanilla `createActor`, casting away the option type, or mutating private internals.

**Source-preview alpha.7:** the inspected commit adds `createEffectActor(logic, { snapshot })`. It restores state/context without replaying entry actions and preserves pending timer deadlines on Effect's Clock. Child machines resume; completed children stay complete. Running Effect tasks and streams start again from their beginning, including root task/stream actors. A snapshot-only restore does not require original input. The isolated [preview example](../examples/preview/restore.ts) is excluded from the alpha.6 compile target.

This preview is source evidence, not confirmation of npm publication or a locally executed restore contract. Recheck the installed package, then add recovery tests before relying on it.

## The critical crash window

Suppose the provider accepts a publish operation and the process crashes before recording success. On restart, the task can run again. The correct response is not to assume the first attempt failed. Reuse the stable operation key, query provider status, and reconcile. External side effects must be idempotent or explicitly compensatable. A snapshot does not contain a paused JavaScript/Effect fiber or an exactly-once execution guarantee.

Do not put mandatory persistence in an unobserved background action. A transition, database write, and remote request cannot be made one atomic transaction by labeling the machine durable. Use a transactional state/intent record and an outbox worker where appropriate; deduplicate inbound commands through an inbox/command record. Those components remain Effect services and must have their own tested delivery/retry semantics.

## Persistence envelope

A production envelope typically includes workflow ID, tenant ID, machine ID/version, persistence schema version, revision, timestamps/deadline data, and the protected snapshot payload. Validate the envelope before selecting a logic implementation. Reject tenant mismatches, unknown versions, oversized payloads, and untrusted code. Do not trust a client-supplied snapshot to grant a state or role.

Plan a version transition before changing state paths, context structure, actor source names, or child identities. Keep archived fixtures from supported versions. A migration is a deterministic audited transformation of data, not arbitrary source evaluation. Core helpers such as `machineVersions` require version/capability verification and do not automatically prove Effect-host restoration compatibility.

## Storage concurrency and wakeups

Use optimistic revision checks or a single-writer ownership protocol with fencing. A local mailbox does not protect against two restored actors processing the same workflow. Checkpoints must not overwrite a newer revision. Define whether an acknowledgement means accepted into durable storage, applied to state, or completed remotely.

A saved timer deadline does not wake a process that is not running. Durable hosting needs scheduling/wakeup and overdue-deadline policy. Reconstruct services at startup, do not serialize them. After restore, attach observers and supervise errors; no previous process's subscription still exists.

## Recovery test suite

Test restart in every nonterminal state; restart after remote acceptance but before checkpoint; repeated replay with the same operation key; restore after a deadline; child completion before shutdown; task/stream restart and cleanup; incompatible snapshot versions; corrupt/oversized data; two competing owners; and failed compensation. Verify public outcome and provider call counts, not only restored state names.

Until these capabilities are verified, document the feature as in-memory orchestration with a separate restart strategy—not as a durable workflow engine.

Sources: [release/source records](27-source-index.md#release-and-source-records), [released actor source](27-source-index.md#released-actor-source), [persistence docs](27-source-index.md#persistence).

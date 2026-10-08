# Custom providers, local implementations, auth, state, and runtimes

## Extend only where a supported resource is missing

First search the current provider catalogue and installed exports. Prefer a maintained provider or supported extension point over a new shell wrapper. A custom provider is justified when lifecycle ownership cannot be expressed safely through existing resources. Do not create a second provider for an API simply because one example is unfamiliar.

## Define a resource contract

```ts
import { Resource } from "alchemy";

export interface WidgetProps { name: string; enabled: boolean }
export interface WidgetAttributes { id: string; name: string; enabled: boolean }
export type Widget = Resource<"Example.Widget", WidgetProps, WidgetAttributes>;
export const Widget = Resource<Widget>("Example.Widget");
```

Use a globally unique type string. Keep props and persisted attributes serializable, explicit, and versionable. Credentials belong in an auth service rather than every resource's public props. The constructor is a declaration; it does not itself implement cloud lifecycle.

## Lifecycle contract

Use `Provider.succeed(Resource, Resource.Provider.of({...}))` or the version-compatible Effect constructor. Implement required `reconcile`, `delete`, and `list`; inspect optional `diff`, `read`, `precreate`, and other hooks in the installed source.

Reconcile should observe the actual system, create only when absent, update only differences, and return fresh attributes. Stored output is a useful identity cache, not proof the remote object exists. Distinguish greenfield, update, and adoption without creating separate logic that cannot recover from partial success.

Resolve refreshable credentials lazily inside operations. Use the official SDK where suitable and `Effect.tryPromise` to preserve expected failures. Never equate every retrieval error with absence: treat an actual NotFound differently from timeout, throttling, invalid credentials, or permission denial. Some tutorial snippets simplify this; a production provider must not create duplicates during an outage.

## Idempotency and ownership

Use stable external IDs, supported idempotency keys, and ownership labels where the API supports them. Handle create-success/state-write-failure by discovering the existing object safely. A read/adoption path must prove the target identity and distinguish unowned resources from those owned by another stack.

Deletion should tolerate an already-absent object but propagate real failures. Do not ignore AccessDenied or partial cascading deletion. A list operation must paginate and return the intended ownership scope; it can power broad cleanup, so an overly broad list is dangerous.

Diff should flag immutable changes as replacements and avoid churn from server defaults, unordered collections, or volatile attributes. Do not promise create-before-delete if physical-name uniqueness forces delete-first. Make retention and replacement interactions explicit.

## Tests

Use fake clients for deterministic failure injection and `test.provider` for engine lifecycle integration. Cover unchanged redeploy, mutable update, replacement, adoption, foreign ownership rejection, deletion after external removal, throttling, stale credentials, and crash recovery. Independently inspect the real service in a narrow authorized integration test.

Test secret redaction and error messages. Do not claim an in-memory state store means a test does not call the cloud. The [provider test skeleton asset](examples.md) is a checklist-bearing template, not a mock service disguised as production support.

## Other extension points

A custom auth provider should expose the supported profile/CI contract and refresh semantics. Keep secrets redacted and avoid resolving network credentials while merely constructing the provider Layer.

A custom state backend must preserve resource encoding, isolation, atomicity/locking, crash recovery, and secret protection. Prefer an existing backend unless requirements genuinely differ. Test concurrent writers and schema upgrades; an object-store put alone is not a complete transactional state design.

A local provider must reproduce the relevant resource/binding semantics without secretly reaching production. Clearly report unsupported operations and explicit remote opt-ins. A custom runtime additionally owns bundling, deployment, construction/runtime bridging, event delivery, scope, and observability. Start from the current Platform/custom-runtime source rather than inventing an ad hoc launcher.

## Sources

- [infrastructure-as-code/custom-provider](https://alchemy.run/infrastructure-as-code/custom-provider/)
- [infrastructure-as-code/provider](https://alchemy.run/infrastructure-as-code/provider/)
- [infrastructure-as-code/local-provider](https://alchemy.run/infrastructure-as-code/local-provider/)
- [environments/custom-auth-provider](https://alchemy.run/environments/custom-auth-provider/)
- [state-store/custom-state-store](https://alchemy.run/state-store/custom-state-store/)
- [infrastructure-as-effects/custom-runtime](https://alchemy.run/infrastructure-as-effects/custom-runtime/)
- [testing/testing-providers](https://alchemy.run/testing/testing-providers/)

Reference baseline: Alchemy `2.0.0-beta.81`, upstream `fbe6ece368c6898234592e897d852bb47b88ebb1`, researched 7 October 2026. Check installed APIs before applying examples.

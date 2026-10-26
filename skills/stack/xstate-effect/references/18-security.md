# Security, privacy, tenant isolation, and trust boundaries

## Treat the actor as an internal capability

An actor handle can command a workflow, inspect state, and expose communication paths. Do not hand it to arbitrary callers, agent-generated code, or public transports. Expose a narrow service with authorized commands and sanitized read models. A registry key is an address, not an access-control check.

Decode input, authenticate the principal, resolve tenant/resource ownership, authorize the command, check revision/idempotency, then send a typed domain event. Event schema validation is structural validation, not permission. A machine's `snapshot.can(event)` is useful for behavior/UI hints, not a security decision, transaction lock, or promise that state will remain unchanged until delivery.

## Protect approval and agent workflows

Bind decisions to a proposal revision/hash, target resource, principal, and expiry. A generated tool call must go through the same authorization service as the UI. A model's instruction to “skip approval” or a document that claims to be trusted is data, not authority. Keep the machine and Effect Layers' allowed operations explicit; do not let prompt content choose arbitrary actor events or inject a service implementation.

Human approval must be recorded before the critical action executes. Re-check permissions or business preconditions at execution when they may change while waiting. Define whether different people must request and approve; the state model alone does not enforce separation of duties unless the boundary and data contract implement it.

## Validate at every serialization boundary

Use Effect Schema decoding for external JSON and bounded payloads. Reject forbidden internal event types from public interfaces. Avoid accepting an arbitrary `type` string plus unbounded object and casting it into `EventFromLogic`. Transformed schemas must decode before sending; the XState validator checks but does not replace payloads with transformed values.

Never restore a user-supplied snapshot as authority for state, balance, role, approval, or tenant identity. Validate provenance, schema/version, revision, machine identity, and tenant binding. Protect stored snapshots like the business records they contain. Do not serialize live credentials, runtime resources, or private actor internals.

## Avoid code and destination injection

Serialized machine definitions may contain textual inline implementations. Do not evaluate untrusted `@code`, dynamic function bodies, or JSON-provided action code. Prefer named, audited implementations rebound from local code. Schema validity is not proof that a machine definition is safe to execute.

Services that fetch URLs or open files need allowlists/path constraints, size limits, timeouts, and content parsing rules. Cancellation of the local fiber is not a security control for a remote action already accepted. Rate-limit commands and bound spawned actor counts to avoid memory and resource exhaustion.

## Isolate tenants and sessions

Do not store an authenticated request principal in an application-global mutable service. A long-lived actor should hold stable tenant/resource identity and use a trusted per-command principal envelope where needed. SSR registries must not leak across requests. Clear/dispose user-owned runtime state on logout, tenant switch, and session expiry according to the application's policy.

Do not let an attacker choose another actor's registry key or operation ID and gain access. Namespaces help organization, but an authorization check must still bind identity to resource. Fencing/revision checks prevent stale owners from writing, not unauthenticated users from reading.

## Redaction and test cases

Redact logs, traces, inspector traffic, public error messages, snapshots exported for debugging, and model-test fixtures. Prefer synthetic reproductions. Test forged tenant/resource IDs, stale approval revision, replayed command, internal-event injection, invalid/oversized payload, actor exhaustion, restored snapshot tampering, and a direct URL to a restricted wizard state.

These are recommended application safeguards. They are not claims that `@xstate/effect` provides a complete authentication, authorization, durable audit, or multi-tenant security layer.

Sources for the relevant library boundaries: [schemas](27-source-index.md#effect-schemas), [internal events and routing](27-source-index.md#statecharts), [serialization](27-source-index.md#serialization), [inspection](27-source-index.md#inspection).

# Troubleshooting by symptom

## Diagnose the layer before changing anything

Capture the command, exact package versions, source revision, target tuple, first meaningful error, and whether it occurred during construction, planning, apply, boot, or a runtime request. Remove secrets before sharing evidence. Use the smallest relevant reproduction; a routine bug does not require auditing the whole account.

| Symptom | Investigate first | Do not do this first |
|---|---|---|
| Missing provider | Provider Layer and exact case-sensitive import/type | Grant broader cloud credentials |
| `Service not found` for a binding | Matching native/HTTP/EventSource Layer | Add random environment variables |
| Queue EventSource missing | `Cloudflare.Queues.EventSourceLive` | Create a second consumer manually |
| Unknown prop or missing export | Installed version, peer family, package export path | Add `as any` |
| Output prints as an object or wrong string | Lazy Output interpolation/map | Force `runPromise` during construction |
| Request service unavailable during plan | Request code accidentally in construction | Suppress the requirement type |
| Config value absent at runtime | Construction discovery, binding, stage config | Put the secret in a public build variable |
| State authentication denied | Backend bootstrap/Secrets Store permissions | Delete the backend or use an admin token everywhere |
| Existing resource conflict | Target identity, ownership labels, physical-name collision | Enable blanket adoption |
| Plan unexpectedly deletes data | Conditional declarations, IDs, namespace/stage | Approve to see what happens |
| Local command proposes replacement | Local/live stage collision | Run local dev under `prod` |
| CI cannot see a deployed stack | Different backend/account/stack/stage | Copy a laptop's credential directory into CI |
| Repeated replacement/no-op churn | Volatile props, random generation, provider normalization | Ignore the plan diff |
| Docker plan is slow or runs commands | Image build happens in diff; inspect Dockerfile | Assume plan is only a JSON comparison |
| Lambda/Worker boot error | Bundle entrypoint, platform Layers, Node-only imports | Increase all memory/timeouts blindly |
| Frontend works at `/` but not deep links | SPA fallback versus SSR and asset routing | Proxy every 404 to an unrelated backend |
| SQL works locally but not live | Migration history, transport, permissions, network | Apply migrations from a second tool |
| Queue duplicates a business action | At-least-once delivery, idempotency, batch failures | Increase retries without a dedupe design |
| Workflow repeats external action | Side effect outside task or ambiguous success/checkpoint | Promise exactly-once from a task wrapper |
| DO loses state after restart | In-memory state versus persistent storage | Keep the isolate alive with timers |
| OIDC AssumeRole denied | Audience, exact subject, environment and repository-ID format | Widen the trust subject to all repositories |
| Cleanup deletes the wrong environment | Stage derivation, stale PR state, shared concurrency | Accept every name other than `prod` |
| Live cloud differs from a clean plan | Drift versus desired-state comparison | Assume a plan re-read every live property |
| Delete failed but state is uncertain | Provider observation and state preservation | Account-wide nuke |

## Missing capability versus missing permission

A missing Layer is usually a program composition problem. AccessDenied is usually a provider identity/policy or target problem. A binding can have both correctly typed construction and insufficient live credentials. Fix the specific boundary and verify it; do not conflate the two.

## Read failures are not absence

When an SDK call fails, classify NotFound, invalid credentials, rate limiting, transport failure, and provider outage separately. A reconciler that treats all failures as absence can create duplicates. An application that treats all failures as an empty result can conceal data outages. Preserve typed errors where available.

## Safe escalation

After a small local reproduction, compare the matching upstream example/test and installed implementation. Record a minimal upstream issue when behaviour contradicts the contract. Include non-secret versions and resource types, not account tokens or full state. Work around a confirmed limitation only with a clear scope and removal condition.

For state repair, adoption, destructive migration, or replacement of persistent resources, stop short of the mutation until its target/effects are authorized. Continue useful static analysis and prepare the exact operation rather than blocking all progress.

## Sources

- [cli](https://alchemy.run/cli/)
- [cli/drift](https://alchemy.run/cli/drift/)
- [state-store](https://alchemy.run/state-store/)
- [testing/test-harness](https://alchemy.run/testing/test-harness/)
- [cloudflare/messaging/queues](https://alchemy.run/cloudflare/messaging/queues/)
- [infrastructure-as-code/outputs](https://alchemy.run/infrastructure-as-code/outputs/)
- [infrastructure-as-effects/phases](https://alchemy.run/infrastructure-as-effects/phases/)
- [docker](https://alchemy.run/docker/)
- [environments/ci](https://alchemy.run/environments/ci/)

Reference baseline: Alchemy `2.0.0-beta.81`, upstream `fbe6ece368c6898234592e897d852bb47b88ebb1`, researched 7 October 2026. Check installed APIs before applying examples.

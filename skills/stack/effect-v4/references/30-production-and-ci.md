# Production, CI/CD, deployment, security, and performance

## Build a reproducible boundary

Pin the runtime/toolchain according to the repository's policy, commit the package-manager lockfile, and keep Effect integration packages compatible. Use frozen installs in CI. Check ESM/module resolution, exported subpaths, bundler handling of optional platform code, and the target host's actual APIs.

Do not declare a successful semantic typecheck because a transpiler emitted JavaScript. Compile the application with its strict TypeScript configuration, then run behaviour tests and the real production build. Inspect the built artifact for server-only dependencies in browser bundles and unsupported host modules in edge bundles.

## A deployment pipeline

A practical sequence is: deterministic dependency install; formatting/lint checks; TypeScript checking; unit and property tests; lifecycle/contract tests; real-adapter integration tests; production build; controlled database changes; deployment; smoke/readiness checks; monitored release decision.

The included CI template uses command steps instead of fabricated action commit SHAs. Supply the repository's reviewed checkout and Node-setup steps, working directory, credentials, and environment protections. Commit a real generated lockfile before switching to `npm ci`; never invent a lockfile to make an example look reproducible.

Required checks should fail on unresolved peer versions, type errors, test failures, and missing necessary evidence. Security-sensitive deploy credentials must not be available to untrusted pull-request code. Prefer short-lived identity where supported, least-privilege environments, and explicit production approvals.

## Readiness, shutdown, and overload

Separate liveness from readiness. Readiness should reflect required startup resources and the ability to accept new work. On shutdown, stop admission, drain within a bound, interrupt what should stop, await finalizers, and flush telemetry inside the host's deadline.

Set budgets for active fibers, queued items and bytes, pool connections, open sockets, in-flight requests, stream buffers, cache entries, and retry work. Bound tenant demand separately when one tenant can monopolize the shared budget. A system with limits but no overload response can still deadlock or fail unpredictably.

Use durable storage for work that must survive eviction or process loss. A scoped background fiber is a lifetime mechanism, not durable scheduling. A global singleton inside one process is not a distributed singleton.

## Security boundaries

Validate unknown input, authenticate the caller, authorize the operation/resource, and encode the permitted output. Each is a separate step. A Schema validates shape; a service type expresses a dependency; neither proves a user may perform an action.

Protect secrets throughout configuration, traces, errors, cache keys, serialized state, browser bundles, and support diagnostics. Redaction is not encryption. Restrict outbound destinations and command arguments, enforce upload/record limits, and avoid exposing administrative/devtools endpoints publicly.

For AI-enabled workflows, tool calls are untrusted requests from a model. Authorize them independently, cap resource use, and require real approval state where the action needs it. Text in a prompt cannot grant a permission or satisfy a required approval.

## Performance work

Measure realistic load, cold start, steady-state latency, allocation, memory retention, event-loop delay, and shutdown cost. Identify whether the bottleneck is CPU, I/O, connection limits, serialization, schema construction, duplicated Layer acquisition, or excessive telemetry.

Reuse schemas and parsers where their identity and configuration are stable. Prefer `Effect.fnUntraced` for a measured hot path that does not represent a useful span. Bound parallelism to the downstream capacity. Use batching only when added queueing latency is acceptable.

Do not enable JIT/AOT schema compilation solely because it exists. Measure the actual schema workload, check the host's dynamic-code policy, regenerate artifacts after schema/package changes, and verify semantic parity. Do not replace safe APIs with unsafe variants without identifying an invariant and proving the measured benefit.

## Release and operations evidence

Record package versions, build identity, meaningful test results, contract changes, storage changes, and deployment checks. Alert on symptoms users experience: sustained failures, queue age, retry amplification, exhausted pools, lagging durable work, and invalid schemas from upstreams.

A rollback plan must account for already-written data and already-performed side effects. Reverting application code does not reverse a database change, a sent email, or a payment. Test operator recovery for stuck jobs and ambiguous outcomes before they become a production incident.

## Official sources

- [Runtime guidance](https://github.com/Effect-TS/effect/blob/effect@4.0.2/LLMS.md)
- [Package exports](https://github.com/Effect-TS/effect/blob/effect@4.0.2/packages/effect/package.json)
- [Schema compilation](https://github.com/Effect-TS/effect/blob/effect@4.0.2/packages/effect/SCHEMA.md)
- [Scope](https://effect.website/docs/v4/api/effect/Scope)
- [ManagedRuntime](https://effect.website/docs/v4/api/effect/ManagedRuntime)
- [OTLP exporters](https://effect.website/docs/v4/api/effect/observability/OtlpExporter)

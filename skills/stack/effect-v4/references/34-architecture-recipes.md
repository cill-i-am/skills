# Architecture and end-to-end implementation recipes

## A small default structure

Start with the code's real boundaries, not a framework of empty directories:

```text
src/
  domain/          # Schema models, domain errors, pure calculations
  services/        # Context.Service contracts and focused implementations
  contracts/       # Shared HTTP/RPC definitions; no server bootstrap
  adapters/        # Database, third-party APIs, filesystem, host integration
  app/             # Layer composition and configuration
  entrypoints/     # Process/web/worker runners and shutdown ownership
  test/            # Fakes, fixtures, contract and integration tests
```

A smaller application can use fewer files. The important constraints are dependency direction, trust boundaries, and lifecycle ownership. Do not create a service for a constant or force every pure function through dependency injection.

## Recipe: an authenticated HTTP operation

Define input and public output schemas. Define expected domain errors. Obtain an authenticated principal from middleware, authorize the resource, then call an Effect-native use case. The use case composes repositories and external services through requirements; it does not run its own runtime.

Implement repository queries with row decoding and tenant constraints. If several database writes are atomic, wrap the entire operation in the database transaction context. Record an outbox item in that transaction for a reliable post-commit external action. Encode the public response using its schema and map failures to deliberate HTTP statuses.

Test invalid input, unauthorized identity, cross-tenant IDs, missing records, constraint conflicts, transaction rollback, outbox creation, and cancellation after commit. The final case may require response reconciliation rather than pretending the commit was undone.

## Recipe: a paginated import pipeline

Represent page fetching as an Effect with typed transport and decode failures. Build a Stream using the remote API's cursor contract. Enforce a page/item/byte budget, detect repeated cursors, and limit concurrent enrichment to the downstream service's capacity.

Validate records before writes. Choose fail-fast, reject-records-and-continue, or grouped error accumulation according to the product requirements. Persist checkpoints and stable imported-record IDs if restart/resume matters. Do not restart from page one and replay writes blindly after a stream failure.

Use a Sink or incremental database writes rather than unbounded `runCollect`. Test empty pages, malformed records, duplicated cursors, failure after partial writes, slow consumers, and interruption with an open response body.

## Recipe: a scheduled reconciler

Use a scoped loop with a Schedule for best-effort work tied to a running process. Use a host scheduler, durable queue, or durable workflow for executions that must occur across restarts. A local timer is not a reliable production scheduler.

Acquire a safe ownership/locking mechanism where only one logical reconciliation should run. Read authoritative state, compute a pure diff, validate the intended changes, then apply idempotent operations with bounded concurrency. Persist progress and expose a dry-run mode where changes have operational impact.

Test overlap, skipped runs, duplicate delivery, long-running iterations, shutdown, partial progress, and a clock/time-zone boundary. Do not hold a database transaction open while waiting on a slow remote provider unless that is an intentional, justified design.

## Recipe: a reactive browser screen

Share domain schemas and a safe client contract. Provide one appropriate session/app runtime and registry, then bind Effect-backed queries to the view. Keep form drafts separate from validated domain values. Make loading/error/refreshing states visible and tie subscriptions to the view lifetime.

Authorize mutations on the server, reconcile optimistic UI after ambiguous outcomes, and invalidate related query keys only according to the mutation's commit policy. Test request cancellation, rapid parameter changes, unmount, reconnect, hydration, and identity changes.

## Recipe: an AI-assisted workflow with approval

Use deterministic application logic to determine the allowed tools and data scope. Let the model propose or classify within a schema, then validate business rules independently. Persist a proposed action and request human approval for sensitive changes. Resume through the durable workflow engine only after an authorized approval event.

Make every mutating tool idempotent and auditable. Bound model attempts and tool steps, preserve task state independently from chat text, and test replay after the model response and after the external action. A model's explanation is not evidence that a tool succeeded.

## Recipe: a CLI over the same application services

Parse CLI input with `effect/cli`, decode to the same domain models, and call the same use cases as the HTTP adapter. Supply different configuration and platform Layers at the executable root. Keep machine output stable, diagnostics separate, cancellation responsive, and destructive operations explicit.

The reuse boundary is the application service, not the HTTP handler. A CLI should not need to serialize a local operation through an HTTP stack just to avoid sharing a use case.

## Choosing how much Effect to introduce

Add Effect where it improves the current operation's error, dependency, concurrency, resource, or observability requirements. Keep direct code where it remains clear. Adopt native facilities before inventing custom runtimes, ad hoc retry engines, stream protocols, or state containers, but do not force a library abstraction onto a problem it does not solve.

Write down costly-to-reverse choices: durable identities, storage guarantees, public contracts, authorization boundaries, and lifecycle ownership. Let ordinary code express small implementation details.

## Official sources

- [Official application patterns](https://github.com/Effect-TS/effect/blob/effect@4.0.2/LLMS.md)
- [HTTP and host integration](https://github.com/Effect-TS/effect/blob/effect@4.0.2/ai-docs/src/51_http-server/10_basics.ts)
- [SQL applications](https://github.com/Effect-TS/effect/blob/effect@4.0.2/ai-docs/src/40_sql/10_basics.ts)
- [Workflow semantics](https://github.com/Effect-TS/effect/blob/effect@4.0.2/packages/effect/src/workflow/Workflow.ts)

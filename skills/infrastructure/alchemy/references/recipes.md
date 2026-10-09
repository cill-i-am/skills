# End-to-end architecture recipes

## 1. HTTP API with object storage

Start with one stack, an R2 or S3 resource, and a Worker or Lambda. Bind only the read/write operations needed. Resolve credentials/configuration in construction; validate/authenticate requests in the handler. Return a safe URL output, test a write/read and denied access locally, then run a narrow approved live test. Add retention/backups before storing irreplaceable data. See [Workers](cloudflare-workers.md), [AWS](aws.md), and the complete assets in [examples](examples.md).

## 2. Full-stack TanStack Start with SQL

Keep shared API schemas in a client-safe package. Deploy the appropriate Website integration and an Effect HTTP/RPC backend. Provision or reference the database, apply committed migrations, and bind runtime connectivity through the supported driver/Hyperdrive path. Wire browser state through the chosen client library, not a deployment Output masquerading as browser data. Test SSR, authentication, a data mutation, and preview isolation. The dedicated upstream full-stack TanStack/RPC/Drizzle guide is the source for exact current atom/client wiring.

## 3. Direct-upload processing pipeline

Authorize a user and issue a scoped, short-lived upload capability. Store the object in R2/S3, persist an upload record, then enqueue processing with a stable operation ID. Use a container for native processing only when the Worker/runtime cannot do the job. Store the result durably and update status idempotently. Test duplicate delivery, malicious filenames/URLs, timeout, and a partially completed job. Avoid letting user input become a shell command.

## 4. Collaborative room or per-tenant actor

Use a Durable Object keyed by authenticated tenant/entity identity. Persist state and use hibernation-aware WebSockets where appropriate. Keep authorization at join/message boundaries and transactionally enforce invariants. Test restart, reconnect, duplicate messages, and schema migration during activation. A module map is not the authoritative membership or persistence store.

## 5. Human-approved durable operation

A Worker accepts and validates a request, starts a Workflow with a stable operation ID, and returns its status handle. Named tasks perform idempotent external actions. An approval wait exposes only an authenticated decision endpoint with actor/permission checks. Persist approval, continue, and compensate where necessary. Test timeout, duplicate approval, rejected approval, retries, and compensation failure. Do not equate task checkpointing with exactly-once payments.

## 6. Pull-request preview with a database branch

Use a verified PR number for the stage and a reviewed immutable head revision. Reference a retained staging database parent and create an isolated provider-supported branch, or create an independent disposable database when needed. Apply the PR's committed schema changes only to that preview. Publish a non-secret URL, run HTTP-only smoke tests, and destroy the exact PR stage after closure using trusted code. Verify cleanup cannot delete the parent database or shared state backend.

## 7. Scheduled ingestion and analytics

Use a cron or event source to enqueue/trigger ingestion rather than holding a request open. On GCP, Pub/Sub plus a Cloud Run Job and BigQuery is a documented path; AWS and Cloudflare have analogous provider-specific primitives. Bound batch size/concurrency, checkpoint progress, and deduplicate inputs. Observe backlog, failed batches, and data freshness. Test a retry after partial ingestion.

## 8. Private multi-service application

Start with one public gateway and private services using native bindings/RPC. Give each service the capabilities it needs, not a shared administrative client. Keep domain schemas separate from runtime code and validate at any external boundary. For cross-provider calls, design real network identity and failure behaviour; a typed Output is not a secure tunnel. Split stacks only when ownership/lifecycle warrants it.

## 9. Retrieval or agent application

Choose source storage, embedding model, vector index/search service, and model provider explicitly. Maintain tenant filtering and source authorization through retrieval. Use bounded tools, budgets, cancellation, and durable coordination for consequential work. Put human approval before actions that require it. Test prompt-injected content as untrusted data, failed tools, duplicate calls, and resumption. Keep model names/prices live rather than embedding a stale recommendation.

## 10. Existing application adoption or upgrade

Inventory current owners and resource identities first. Decide which objects Alchemy should own and which remain referenced. Rehearse adoption and migration with state/data backups. Preserve runtime handlers where no rewrite is necessary. Verify the plan does not unexpectedly replace persistent data, update the CI/state credential contract, and test the old-to-new transition. A successful brand-new stack is not evidence of safe adoption.

## Sources

- [cloudflare/frontend/full-stack-tanstack-rpc-drizzle](https://alchemy.run/cloudflare/frontend/full-stack-tanstack-rpc-drizzle/)
- [cloudflare/data/branch-from-shared-database](https://alchemy.run/cloudflare/data/branch-from-shared-database/)
- [cloudflare/data/r2-presigned-urls](https://alchemy.run/cloudflare/data/r2-presigned-urls/)
- [cloudflare/ai/release-agent](https://alchemy.run/cloudflare/ai/release-agent/)
- [gcp/guides/event-pipeline](https://alchemy.run/gcp/guides/event-pipeline/)
- [cloudflare/compute/workflows](https://alchemy.run/cloudflare/compute/workflows/)
- [cloudflare/compute/hibernatable-websockets](https://alchemy.run/cloudflare/compute/hibernatable-websockets/)
- [cli/adopting-resources](https://alchemy.run/cli/adopting-resources/)

Reference baseline: Alchemy `2.0.0-beta.81`, upstream `fbe6ece368c6898234592e897d852bb47b88ebb1`, researched 7 October 2026. Check installed APIs before applying examples.

# Google Cloud services, jobs, data, and identity

## Provider model

Alchemy's GCP provider combines Cloud Run-style hosts with resources and typed bindings. Bindings carry the runtime IAM roles, while a matching HTTP Layer implements the operation. Establish project, location, enabled APIs, deployment credentials, runtime service accounts, and state before deploying.

The documented hosts include `GCP.Function` (Cloud Run service), `GCP.Run.Job`, `GCP.Run.WorkerPool`, and gen2 `GCP.CloudFunctions.Function`. A service handles HTTP, a job runs to completion, and a worker pool handles always-on work. Cloud Run hosts build containers locally; the documented Cloud Functions path builds an uploaded archive in the cloud. Check Docker requirements for the chosen host.

## Firestore service pattern

```ts
import * as GCP from "alchemy/GCP";
import * as Effect from "effect/Effect";
import * as HttpServerResponse from "effect/http/HttpServerResponse";

export default class Api extends GCP.Function<Api>()(
  "Api",
  { main: import.meta.url, location: "us-central1" },
  Effect.gen(function* () {
    const records = yield* GCP.Firestore.Database("Records", {
      location: "us-central1", type: "FIRESTORE_NATIVE",
    });
    const db = yield* GCP.Firestore.ReadWriteDatabase(records);
    return {
      fetch: Effect.gen(function* () {
        const record = yield* db.get("examples/hello");
        return yield* HttpServerResponse.json(record?.fields ?? {});
      }).pipe(Effect.orDie),
    };
  }).pipe(Effect.provide(GCP.Firestore.ReadWriteDatabaseHttp)),
) {}
```

This source-reviewed example demonstrates wiring, not authentication or a complete domain API. Pick the location from the application's requirements rather than inheriting the illustrative region. Use a narrower read capability where available. Keep expected failures typed and avoid treating every transient failure as a programmer defect merely because the tutorial uses `orDie` at its boundary.

## Data and pipelines

The documented resource set includes Firestore, Pub/Sub, BigQuery, Secret Manager, Cloud Storage, and Memorystore. Use a service to accept/validate requests, Pub/Sub to buffer events, a job or worker pool to process them, and BigQuery when analytical ingestion is the requirement. Define delivery IDs, duplicate handling, and schema evolution across the pipeline.

Memorystore uses private networking; a successful resource creation is not proof the host can reach it. Review Direct VPC egress, subnet/location alignment, and connection limits. For Cloud SQL, select the documented connection transport and migration identity instead of exposing the database publicly to solve connectivity.

## Identity and event sources

Keep per-host service accounts and grants specific to the bindings used. For private service-to-service requests, use the documented identity-aware invocation binding rather than making both services public. Deployment credentials that can grant roles should not be shipped into runtime containers.

Event sources include Pub/Sub, bucket events, schedules, and Eventarc. Check their retry and acknowledgement contracts, especially when an event triggers a job with a separate lifecycle. Apply idempotency at the final business mutation, not only at the HTTP ingress.

## Operational proof

Verify required APIs, image build/push, runtime readiness, authenticated invocation, denied access, and data round trips. Test job completion independently of job creation. Check cleanup of service accounts and dependent resources without deleting a shared project or database. Local mocks do not validate workload identity or private network configuration.

The provider intentionally focuses on infrastructure. Do not model personal Gmail, Drive documents, Calendar events, or other end-user content as disposable infrastructure resources merely because Google exposes an API for them.

## Sources

- [gcp](https://alchemy.run/gcp/)
- [gcp/setup](https://alchemy.run/gcp/setup/)
- [gcp/guides/cloud-run-api](https://alchemy.run/gcp/guides/cloud-run-api/)
- [gcp/guides/event-pipeline](https://alchemy.run/gcp/guides/event-pipeline/)
- [gcp/guides/memorystore](https://alchemy.run/gcp/guides/memorystore/)
- [gcp/guides/bindings](https://alchemy.run/gcp/guides/bindings/)

Reference baseline: Alchemy `2.0.0-beta.81`, upstream `fbe6ece368c6898234592e897d852bb47b88ebb1`, researched 7 October 2026. Check installed APIs before applying examples.

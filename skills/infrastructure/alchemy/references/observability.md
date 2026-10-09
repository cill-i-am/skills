# Logs, traces, metrics, alerts, and operational evidence

## Define evidence for the feature

A deployment needs evidence that the application works, not merely that resources exist. Identify a small set of useful signals: request success/latency, failed authorization, queue backlog and dead letters, Workflow failures and compensation, database errors, and container readiness/restarts. Choose signals tied to user impact rather than exporting every available event.

Alchemy's documented model combines Effect telemetry Layers with infrastructure for the receiving system. Cloudflare native tracing and Axiom integrations are examples; AWS uses its relevant native logging/monitoring services. Read the runtime-specific guide before configuring exporter Layers or assuming a Node exporter can run in a Worker.

## Correlate without leaking

Include service, source revision, environment/stage, and a request/job/operation identifier. Propagate trace context across HTTP and asynchronous work where supported. A queue message or Workflow instance should be traceable to the originating operation without storing unnecessary personal data in its name.

Never log bearer tokens, cookies, complete database URLs, presigned URLs, raw state, or secret-bearing request bodies. Use structured fields and deliberate redaction. Treat stack traces and provider error payloads as potentially sensitive. Do not return the internal error message to a public caller just because it is useful in logs.

## Native Cloudflare and Axiom

The current Cloudflare guide exposes `Cloudflare.Telemetry()` for native Workers observability. The Axiom guides combine datasets, an ingest token, telemetry, and monitors. Choose one intentional export path rather than duplicating every event through two pipelines and doubling cost/noise.

Separate an ingest-only runtime token from an administrative token that creates datasets and monitors. Set retention and sampling based on privacy, diagnosis, and cost requirements. Verify an actual event reaches the expected dataset/stage; a correctly typed Layer is not proof of delivery.

## Asynchronous and durable work

Record retries, attempts, dead-letter routing, terminal failure, and compensation outcomes. Distinguish accepted work from completed work: HTTP 202 or a returned instance ID does not prove the job succeeded. Monitor old or stuck instances with a bounded ownership-aware process.

A Workflow replay can reproduce logs outside checkpointed tasks. Interpret repeated logs with attempt/replay identity rather than counting them as separate business operations. Container logs should carry the job ID and exit status without dumping the full input file.

## Alerts and runbooks

An alert should name the affected service/stage, the user impact, the relevant dashboard/query, and the first diagnostic steps. Avoid paging on expected validation errors or known transient readiness. Route preview/test alerts differently from production unless they indicate a shared platform failure.

Provision receivers, notifiers, monitors, and access through the appropriate provider where supported. Test notification delivery using a deliberate synthetic incident, not a real customer failure. Assign ownership and a review cadence so obsolete alerts do not persist indefinitely.

## Deployment and incident evidence

Record source SHA, target tuple, plan summary, applied resources, test results, and a safe endpoint/trace reference. During an incident, preserve logs and state before repair. Compare declared state, persisted state, and live state. Avoid changing observability and infrastructure simultaneously unless necessary to diagnose the problem.

After rollback or repair, verify the actual service behaviour and the absence of continuing asynchronous failures. A green deployment command cannot prove recovery from a data or message-processing incident.

## Sources

- [testing/observability](https://alchemy.run/testing/observability/)
- [infrastructure-as-effects/telemetry](https://alchemy.run/infrastructure-as-effects/telemetry/)
- [cloudflare/observability/workers-tracing](https://alchemy.run/cloudflare/observability/workers-tracing/)
- [cloudflare/observability/axiom-observability](https://alchemy.run/cloudflare/observability/axiom-observability/)
- [cloudflare/observability/analytics-engine](https://alchemy.run/cloudflare/observability/analytics-engine/)
- [axiom](https://alchemy.run/axiom/)
- [cli/logs](https://alchemy.run/cli/logs/)

Reference baseline: Alchemy `2.0.0-beta.81`, upstream `fbe6ece368c6898234592e897d852bb47b88ebb1`, researched 7 October 2026. Check installed APIs before applying examples.

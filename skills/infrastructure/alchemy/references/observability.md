# Observability

Use this file when Alchemy work touches logs, traces, metrics, dashboards, alarms, provider lifecycle diagnostics, or runtime telemetry.

## Three Planes

- Deployment plane: plans, provider lifecycle spans, retries, state changes, and resource annotations.
- Runtime plane: application requests, jobs, queues, workflows, database calls, and external APIs.
- Cloud plane: provider-native logs, metrics, alarms, and audit events.

Keep them correlated by stack, stage, resource type, logical ID, deployment/run ID, and request/job correlation ID. Do not make one plane responsible for reconstructing all the others.

## Deployment Diagnostics

- Use `alchemy tail` for live resource logs and `alchemy logs` for historical batches.
- Use state inspection to understand what a plan is diffing against.
- Name provider and Action operations with `Effect.fn` so spans identify the resource operation.
- Annotate lifecycle work with provider, operation, logical ID, physical ID, and retry count.
- Preserve typed causes while redacting props and credentials.

Provider tests should assert semantic lifecycle spans/annotations where sequencing and retry behavior matter. Avoid assertions tied to terminal colors or prose.

## Runtime Effect Instrumentation

- Create shared telemetry Layers at the application boundary.
- Add spans around request, job, workflow, database, and external-service operations.
- Use structured log fields rather than interpolated strings.
- Record latency, throughput, failures, retries, queue depth/age, and saturation where actionable.
- Propagate correlation and trace context through HTTP, RPC, queues, and workflows.
- Do not create exporters or SDK clients inside business logic or per request.

Never attach raw request bodies, tokens, connection strings, or full resource props to logs or spans.

## Axiom

Register `Axiom.providers()` alongside the platform provider. Primary resources include:

- `Axiom.Dataset` for OTel traces, logs, and metrics.
- `Axiom.ApiToken` scoped for ingest or query use.
- `Axiom.Notifier` for Slack and other destinations.
- `Axiom.Monitor` for alert queries.
- dashboard and annotation resources for operational context.

```ts
const traces = yield* Axiom.Dataset("Traces", {
  name: "app-traces",
  kind: "otel:traces:v1",
});

const ingest = yield* Axiom.ApiToken("RuntimeIngest", {
  name: "runtime-ingest",
  datasetCapabilities: {
    "app-traces": { ingest: ["create"] },
  },
});
```

Use the current generated API for exact token permission and monitor props. Bind the narrow ingest token to the runtime; do not expose administrative/query credentials.

## AWS CloudWatch

- Lambda and service logs should use intentional retention.
- Declare dashboards and metric alarms in the same ownership stack as the resources or in a clearly owned observability stack.
- Use stable dimensions and resource Outputs rather than copied ARNs/names.
- Alarm on symptoms tied to an operator action: error rate, latency, throttles, queue age, DLQ depth, function concurrency, database capacity, and health checks.

## Cloudflare

- Use Workers logs/tail for runtime diagnosis.
- Use Analytics Engine, Logpush, Axiom integrations, or platform-native analytics based on retention and query needs.
- Account for sampling and propagation when writing automated verification.
- Keep state-store logs separate from application logs.

## Alerts And Dashboards

- Every alert needs an owner, severity, threshold/window, runbook/action, and testable signal.
- Prefer a few service-level dashboards over one dashboard per resource.
- Annotate deploys and incidents so behavior changes can be correlated.
- Avoid alerting on metrics with no response action.
- Test notifier routing without leaking secrets or paging production unnecessarily.

## Verification

- Telemetry Layers initialize once and exporters flush on runtime shutdown where supported.
- Logs/spans include stage and resource identity.
- Secrets and PII are redacted by construction.
- Alerts reference existing datasets/resources and have a verified notification route.
- Retention and cost are intentional.
- A smoke test can correlate a deployed request or job across runtime and provider signals.

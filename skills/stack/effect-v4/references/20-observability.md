# Logging, tracing, metrics, and diagnostics

## Instrument operations people need to understand

Use named `Effect.fn` functions or explicit spans around meaningful operations: reserving inventory, loading a customer, processing a batch, or committing an import. Avoid a span for every trivial pure helper. Excessive instrumentation can obscure the useful path and add cost.

```ts
import { Effect } from "effect"

export const markBatchAccepted = (batchId: string, itemCount: number) =>
  Effect.logInfo("Batch accepted").pipe(
    Effect.annotateLogs({ batchId, itemCount }),
    Effect.withSpan("batch.accept")
  )
```

Use structured fields rather than constructing a large unstructured message. Only record identifiers and counts that are safe under the application's data policy. A useful debugging field is not automatically safe to export to a third-party telemetry system.

## Logging policy

Distinguish expected domain failures, transient infrastructure failures, and defects. A normal “not found” should not flood error logs, but repeated backend failures should be visible. Avoid logging the same failure at every layer. Keep the full cause at a diagnostic boundary and map to a safe public response separately.

Configure log levels, formatting, and logger sinks at the composition root. Do not let each service install its own global logger. Redact secrets before they enter logs; relying only on a display wrapper is insufficient after values have been unwrapped or embedded in another object.

## Tracing and context propagation

Preserve parent context across HTTP, RPC, queues, and foreign callbacks where supported. A new runtime inside a callback may break trace continuity as well as service context. For batching, use per-request links or the resolver's supported tracing facilities instead of assigning one unrelated request as the parent of every item.

Use stable operation names and low-cardinality attributes. Do not put a raw URL with arbitrary parameters, a complete prompt, or a customer's personal data into every span. Distinguish an attempt span from the logical operation that owns all retries.

## Metrics

Measure request outcomes, latency, active concurrency, queue age/depth, dropped work, retries, cache hits/misses, pool utilization, and resource/shutdown failures. Select units and bucket boundaries intentionally. Avoid high-cardinality labels such as user IDs, request IDs, full URLs, or error messages.

A metric should answer an operational question. “How many retries are happening?” is more useful when split by a bounded provider and reason category than when labelled with every customer identifier.

## Exporting telemetry

The baseline offers OTLP modules under `effect/observability`, Prometheus support, and a separate OpenTelemetry integration for existing SDK setups. Choose one coherent pipeline; avoid duplicate exporters that emit the same span twice.

Own exporter resources in a Layer, bound queues and retries, and flush on shutdown within the host deadline. Telemetry outages must not recursively generate unlimited telemetry or take down every business request. Define the acceptable loss and backpressure policy explicitly.

## Diagnostics and tests

Use DevTools and fiber-tracking facilities locally when investigating blocked work or unexpected lifetimes. Do not expose a development control endpoint publicly. Preserve useful causes and operation names in production diagnostics without leaking payloads.

Test redaction, parent trace propagation, batch links, retry-attempt visibility, bounded telemetry queues, and disposal. Verify that failure logging does not replace the original error and that a telemetry outage cannot cause an infinite retry loop.

## Official sources

- [Official observability guidance](https://github.com/Effect-TS/effect/blob/effect@4.0.2/LLMS.md)
- [Logger](https://effect.website/docs/v4/api/effect/Logger)
- [Metric](https://effect.website/docs/v4/api/effect/Metric)
- [Tracer](https://effect.website/docs/v4/api/effect/Tracer)
- [OTLP](https://effect.website/docs/v4/api/effect/observability/Otlp)
- [DevTools](https://effect.website/docs/v4/api/effect/devtools/DevTools)

# Performance, capacity, and scaling

## Measure the workload you actually have

Before optimizing, record events per second, actors per active entity, context size, child counts, service concurrency, time spent in transitions, observer/serialization cost, and cleanup duration. Separate CPU spent calculating transitions from remote I/O latency. Do not attribute a slow provider call to the state machine without measurement.

Transition functions are synchronous. Large CPU loops or expensive cloning can block event processing. Keep decision work small and pure; put CPU-heavy or I/O work behind an appropriate Effect service and execution strategy. Adding fibers does not make CPU-bound JavaScript automatically parallel across cores.

## Admission control is not automatic

The inspected alpha.6 root host uses an unbounded mailbox Queue. Do not market that as a backpressure mechanism. A fast stream, transport retry storm, or UI pointer feed can enqueue more events than the consumer can process. Coalesce lossy latest-value telemetry before sending. For lossless commands use bounded admission, response/acknowledgement, and a persistence strategy appropriate to the product.

Set limits for active workflows, spawned children per workflow, pending commands, subscription counts, retries, and stored history. Define behavior at the limit: reject, defer, persist, or aggregate. Avoid quietly dropping authorization/payment events. A registry and an atom family can also become unbounded caches unless retention is designed.

## Keep context economical

Store the data required for decisions and UI projection, not an entire database or binary attachment. Keep immutable updates focused; reconstruct changed nested objects rather than deep-cloning everything on each event. Store file/entity references and revisions, and fetch authoritative data through services. Measure snapshot/persistence payload size and serialization frequency.

Do not keep obsolete child refs, completed job data, repeated full snapshots, or long error chains forever. Bound retry histories and display diagnostics separately from the main workflow context. Privacy and performance often benefit from the same smaller projection.

## Selectors and subscriptions

Select the smallest useful value in React; avoid new objects/arrays on every snapshot unless equality is intentional. Share one actor owner across consumers rather than creating one per component. Debounce presentation of rapid progress updates without changing the lossless business-event path. Unsubscribe/dispose observers and registries when owners end.

Inspection and tracing can be expensive if they serialize full contexts on every event. Use bounded fields, sampling, and development-only inspectors where suitable. Be careful that sampling a diagnostic event stream does not become the mechanism for mandatory auditing.

## Horizontal scaling is a storage/ownership problem

One local actor per document is a convenient model, not a distributed sharding solution. Scaling across processes requires routing commands to the current owner or using a durable record/queue with concurrency control. Multiple restored copies need revision checks or lease fencing. Network partitions and deployment restarts require explicit recovery behavior.

Serverless/module-global actors may disappear or be duplicated as instances scale. Choose a host whose lifecycle matches the business requirement, verify its integration with Effect, and preserve the package boundary. Do not swap in a vanilla durable runtime just to claim persistence.

## Benchmark and regression plan

Use representative context size and event distributions, including cancellation storms, slow services, many child completions, subscriber churn, and deadline batches. Report throughput with tail latency, memory, backlog, and finalizer behavior. Include a long-running churn test to reveal leaks. Compare alternative models against the same workload; avoid universal claims that a machine, stream, or atom always improves performance.

Sources: [root host source](27-source-index.md#released-actor-source), [atom lifetime](27-source-index.md#effect-atoms), [actor composition](27-source-index.md#actor-composition). Capacity policies and benchmarking guidance are recommendations, not advertised limits.

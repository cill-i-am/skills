# Worker threads, browser workers, and CPU-bound work

## Fibers are not CPU parallelism

Effect fibers provide cooperative concurrency. A long synchronous CPU calculation still occupies its JavaScript execution thread. Increasing `Effect.forEach` concurrency does not split that calculation across CPU cores. First measure the bottleneck, then choose a worker pool or another execution service when parallel CPU work is justified.

The baseline contains `effect/workers` modules for worker execution, runner support, errors, and transferable values, plus RPC worker integration. Concrete worker creation depends on the platform adapter and bundler. Inspect the matching worker and runner example for the installed packages rather than inventing a universal worker constructor.

## Worker protocol recipe

Define a schema-backed input and output contract in a shared module. Keep the worker entrypoint separate from the parent entrypoint and free of browser/server-only dependencies that do not belong there. Instantiate a bounded pool in a Layer, submit work through a service, and close workers when the owner scope ends.

Carry a request ID for correlation and cancellation. Decide whether one worker handles one task at a time, multiplexes tasks, or shares mutable state. Include timeouts, queue limits, startup failure, worker crashes, and replacement policy. A timeout in the parent does not prove the CPU task stopped; cancellation needs a supported worker protocol or termination policy.

## Serialization and ownership

Messages cross a serialization boundary. Functions, service instances, closures, and open resources are not ordinary portable payloads. Decode input inside the worker even when the parent is typed. Avoid repeated copying of large data by using supported transferables where appropriate.

Transferring an `ArrayBuffer` can relinquish the sender's usable ownership. Document which side may read or mutate it after submission. Shared memory introduces synchronization and platform-security requirements; do not add it just to avoid one measured copy.

## Scheduling and failure policy

Use a bounded queue and a worker count chosen from the measured workload and deployment resources. Reserve capacity for the main thread and other services. Many tiny tasks can spend more time crossing the worker boundary than doing useful work; batching may be better.

Retry only tasks whose repeated execution is safe. A crashed worker might have completed an external side effect before disappearing. Keep CPU transforms pure where possible, and perform state-changing I/O through a boundary with idempotency and authorization.

## Tests and deployment checks

Test real worker entrypoint loading after bundling, payload round trips, corrupt inputs, cancellation, worker crashes, queue saturation, buffer transfer, and shutdown. Check cold-start cost and memory per worker. A unit test of the pure calculation is necessary but does not validate worker wiring.

**Do** use ordinary Effects for I/O concurrency and workers for measured CPU needs. **Don't** claim that `forkChild` creates an operating-system thread.

**Do** bound pool size and queued bytes. **Don't** spawn one worker per untrusted input item.

## Official sources

- [Worker](https://effect.website/docs/v4/api/effect/workers/Worker)
- [WorkerRunner](https://effect.website/docs/v4/api/effect/workers/WorkerRunner)
- [Transferable](https://effect.website/docs/v4/api/effect/workers/Transferable)
- [RpcWorker](https://effect.website/docs/v4/api/effect/rpc/RpcWorker)

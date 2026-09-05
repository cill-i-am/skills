---
name: effect-ts
description: Implement Effect v4 schemas, services, lifecycles, and runtime boundaries against the installed version.
---

# Effect v4

Use the project's installed `effect` and `@effect/*` versions. Check declarations/source when an API or its semantics are uncertain. Compiling the changed production code can prove API compatibility; use a scratch probe when that leaves a specific ambiguity. Do not invent compatibility imports or hide version drift with casts.

Keep effectful backend workflows Effect-native and pure synchronous calculations direct. Decode domain values with their owning Schema, represent expected failures in typed channels, and supply service Layers at composition roots. Resources and background work need an owner and appropriate cleanup.

Run Effect programs at host/framework or genuine foreign-callback boundaries. A bridge must preserve the relevant error, interruption, context, transaction, and scope semantics; do not call `runPromise` merely to erase requirements inside application logic.

Read only the reference that answers the current question:

| Concern                                   | Reference                                                                                                              |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Function shape and application boundaries | [Principles](references/principles.md)                                                                                 |
| Schema, brands, errors, encoding          | [Schema](references/schema.md)                                                                                         |
| Services, Layers, runtime wiring          | [Services and Layers](references/services-layers.md)                                                                   |
| Resource lifetime, fibers, interruption   | [Resources and concurrency](references/resources-concurrency.md)                                                       |
| Host callbacks and Promise bridges        | [Runtime bridges](references/runtime-bridges.md)                                                                       |
| Errors, logs, tracing                     | [Errors and observability](references/errors-observability.md)                                                         |
| Config and secrets                        | [Configuration](references/configuration.md)                                                                           |
| Retry, polling, idempotency               | [Scheduling](references/scheduling.md)                                                                                 |
| Cache lifetime and deduplication          | [Caching](references/caching.md)                                                                                       |
| Streaming and backpressure                | [Streams](references/streams.md)                                                                                       |
| HTTP/RPC clients and contracts            | [HTTP/RPC](references/http-rpc-clients.md)                                                                             |
| SQL and transactions                      | [SQL](references/sql.md)                                                                                               |
| Effect tests and virtual time             | [Testing](references/testing.md)                                                                                       |
| Version/source lookup                     | [Sources](references/source-lookup.md)                                                                                 |
| Requested repository policy audit         | [Schema enforcement](references/schema-enforcement.md), [repository enforcement](references/repository-enforcement.md) |

Verify the meaningful behaviour and affected failure/lifecycle paths. No separate evidence form or universal scratch-probe requirement is needed.

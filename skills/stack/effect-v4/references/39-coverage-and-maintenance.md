# Documentation coverage and maintenance

## What “covered” means

The package has three layers of coverage: detailed task-oriented guides, source-reviewed TypeScript examples, and the full core-package module discovery index. It is an original working reference, not a verbatim mirror of every documentation page. The examples have a runnable validation fixture, but their Effect semantic compilation and runtime tests were not executed in the authoring environment; see [verification](../VERIFICATION.md).

The matrix below maps the official guide families and the major ecosystem use cases to local references. Topic names summarize the source navigation rather than pretending every page was individually read. Source sections actually read are recorded separately in [the source manifest](source-manifest.json).

| Documentation family / use case | Included subjects | Local references |
| --- | --- | --- |
| Onboarding and getting started | Effect type, installation/version checks, imports, creation, generators, pipelines, execution, DevTools | [Version and source workflow](00-version-and-source-workflow.md); [The mental model and application design](01-mental-model.md); [Creating and composing Effects](02-creating-and-composing.md); [Runtime boundaries and foreign frameworks](09-runtime-boundaries.md); [Logging, tracing, metrics, and diagnostics](20-observability.md) |
| Error management | Expected failures, defects, matching, fallback, retries, timeouts, sandbox/cause inspection, accumulation, parallel failures, yieldable errors | [Errors, recovery, Cause, and Exit](03-errors-and-recovery.md); [Fibers and bounded concurrency](10-fibers-and-concurrency.md); [Retries, deadlines, schedules, and cron](13-retries-timeouts-and-scheduling.md); [Testing, virtual time, properties, and integration evidence](29-testing.md) |
| Requirements and construction | Services, default/reference services, Context, Layers, memoization, graph composition | [Services and Context](06-services-and-context.md); [Layers, memoization, and application wiring](07-layers-and-wiring.md) |
| Resources and runtime | Acquisition/release, Scope, finalizers, managed runtimes, process and framework boundaries | [Resources, scopes, and finalization](08-resources-and-scopes.md); [Runtime boundaries and foreign frameworks](09-runtime-boundaries.md) |
| Observability | Logging, metrics, tracing, fibers, exporters, cardinality, secrets and teardown | [Logging, tracing, metrics, and diagnostics](20-observability.md); [Production, CI/CD, deployment, security, and performance](30-production-and-ci.md) |
| Configuration | Providers, defaults, malformed input, schema decoding, secrets, startup and rotation | [Configuration and secrets](17-configuration-and-secrets.md) |
| Scheduling | Retries versus repeats, choosing/composing policies, continuation, deadlines, cron/time zones | [Retries, deadlines, schedules, and cron](13-retries-timeouts-and-scheduling.md); [Time, numbers, randomness, and units](19-time-numbers-and-units.md) |
| State | Ref, SynchronizedRef, SubscriptionRef, transactional Tx* state and repeat-safe bodies | [State and in-memory transactions](12-state-and-transactions.md) |
| Batching and caching | Request/resolver completion, batching latency, key identity, negative caching, TTL and resource caches | [Caching, request batching, and resource reuse](14-caching-and-batching.md) |
| Concurrency | Fibers, Deferred, Queue, PubSub, Semaphore, Latch, ownership, backpressure and cancellation | [Fibers and bounded concurrency](10-fibers-and-concurrency.md); [Queues, PubSub, Deferred, and semaphores](11-queues-and-coordination.md) |
| Streams | Creating/consuming, operators, errors, resources, ordering, pagination and backpressure | [Streams and backpressured pipelines](15-streams.md) |
| Sinks and lower-level processing | Sinks, leftovers, chunks, Channel/Pull, NDJSON/SSE/binary framing and limits | [Sinks, channels, framing, and encoding](16-sinks-channels-and-encoding.md) |
| Testing | TestClock, Effect-aware tests, properties, layer isolation, lifecycle and integration evidence | [Testing, virtual time, properties, and integration evidence](29-testing.md) |
| Code style | Clear functions, dual APIs, brands, matching, nesting, control flow and minimal abstraction | [The mental model and application design](01-mental-model.md); [Creating and composing Effects](02-creating-and-composing.md); [Schema and domain models](04-schema-and-domain-models.md); [Data types, equality, matching, and utilities](18-data-types-and-utilities.md); [Dos, don’ts, and practical review checklists](36-dos-donts-and-review.md) |
| Data types, traits and behaviour | Option, Result, Exit, Cause, Chunk, Data, dates, durations, numbers, sets/maps, Equal/Hash, Equivalence/Order | [Data types, equality, matching, and utilities](18-data-types-and-utilities.md); [Time, numbers, randomness, and units](19-time-numbers-and-units.md); [Glossary and concept distinctions](37-glossary.md) |
| Schema basics and advanced modelling | Primitives, structs/classes, optional/null, brands, constraints, composition, default construction | [Schema and domain models](04-schema-and-domain-models.md); [Schema codecs, transformations, and generated tooling](05-schema-codecs-and-tooling.md) |
| Schema codecs and tools | Encoding/decoding, services, transforms, projections, annotations, error formatting, Standard Schema, generators, JSON Schema, equivalence, experimental compilers | [Schema codecs, transformations, and generated tooling](05-schema-codecs-and-tooling.md); [Reactive UI, browser applications, forms, and SSR](28-reactivity-and-frontend.md); [Testing, virtual time, properties, and integration evidence](29-testing.md) |
| Platform | Filesystem, path, runtime, logger, terminal, child process and host capabilities | [Runtime boundaries and foreign frameworks](09-runtime-boundaries.md); [Logging, tracing, metrics, and diagnostics](20-observability.md); [Files, paths, terminals, processes, and command-line tools](26-platform-and-cli.md) |
| HTTP ecosystem | Clients, status/body handling, API definitions, servers, middleware, security, generated clients, documentation and tests | [HTTP clients and external services](21-http-clients.md); [HTTP APIs, contracts, middleware, and web handlers](22-http-apis.md) |
| RPC/network ecosystem | RPC contracts/transport, sockets, streaming, reconnect, network values, cancellation and tests | [RPC, sockets, networking, and transport boundaries](23-rpc-and-sockets.md) |
| SQL ecosystem | Drivers, rows, models and variants, repositories, parameterization, transactions, pooling, database migrations and streaming | [SQL, repositories, model variants, and database transactions](24-sql.md) |
| Durable storage ecosystem | Key-value storage, persistence/cache, persisted queues, rate limiting, journal/event log, recovery | [Persistence, durable queues, rate limiting, and event logs](25-persistence-and-eventlogs.md) |
| CLI and workers | Typed arguments/flags, subcommands, machine output, process lifecycle, worker pools, transferables and CPU parallelism | [Files, paths, terminals, processes, and command-line tools](26-platform-and-cli.md); [Worker threads, browser workers, and CPU-bound work](27-workers.md) |
| Frontend ecosystem | Atoms/registries, asynchronous results, client integration, forms, session isolation, hydration and browser lifecycle | [Reactive UI, browser applications, forms, and SSR](28-reactivity-and-frontend.md) |
| AI ecosystem | Text/object/stream, providers, plans, toolkits, chat, MCP, embeddings/decisions, authorization and evals | [AI models, structured output, tools, chat, and MCP](31-ai-and-tools.md) |
| Durable workflows | Stable identity, activities, replay, approvals, clocks/deferreds/queues, compensation, recovery and engine requirements | [Durable workflows, activities, approvals, and compensation](32-workflows.md) |
| Distributed entities | Identity/routing, handler ordering, passivation, messages versus state, runners/storage, tests and topology | [Distributed entities, clustering, sharding, and state](33-cluster.md) |
| Cross-cutting implementation | Architecture recipes, production/CI, security, debugging, review and evidence | [Production, CI/CD, deployment, security, and performance](30-production-and-ci.md); [Architecture and end-to-end implementation recipes](34-architecture-recipes.md); [Troubleshooting and diagnostic decision trees](35-troubleshooting.md); [Dos, don’ts, and practical review checklists](36-dos-donts-and-review.md) |

## Areas that intentionally require implementation-time lookup
Low-level runtime internals, individual overloads, specialized schema AST/compiler hooks, Kubernetes discovery configuration, each concrete database/provider driver, encrypted event-log deployments, and every worker/transport adapter are indexed or discussed by family, not presented as fully assembled deployment recipes. Consult the pinned/installed source and selected integration tests for those exact tasks.
This distinction avoids manufacturing code for APIs whose full signatures and environmental assumptions were not inspected. It also keeps the skill useful when an unstable integration changes within v4.

## Keeping the skill current
Run the read-only project inspector to identify the real installed version. Compare official release/source changes for the modules being used. The refresh script can write a separate candidate API inventory; it does not update reviewed files or certify new APIs. After changing examples, update their matching guide snippets, typecheck and run the fixture against the chosen dependency set, run real adapter tests where needed, and replace the verification record with actual results.

## Official sources

- [Versioned guide navigation](https://effect.website/docs/v4/getting-started)
- [Versioned onboarding](https://effect.website/docs/v4/onboarding)
- [Official package index](https://effect.website/docs/v4/api)
- [Pinned application patterns](https://github.com/Effect-TS/effect/blob/effect@4.0.2/LLMS.md)

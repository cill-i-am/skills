# Complete core-package module atlas

This atlas lists all **357 modules** in the bundled Effect **4.0.2** inventory. Each module's exact v4 API URL and pinned source URL is in [module-index.json](module-index.json). The grouped names below are a compact navigation view of that same inventory, not an additional independently maintained API catalog.

A listed module is discovery coverage, not proof that every exported function was reviewed, demonstrated, or tested. See [source-manifest.json](source-manifest.json) for actual source-review scopes and [coverage and maintenance](39-coverage-and-maintenance.md) for limitations. Concrete platform, database, AI-provider, and test-adapter packages are outside this core-package inventory.

## Find exact API and source links

Run from the skill root:

```sh
python3 scripts/find-module.py queue
python3 scripts/find-module.py TestSchema
python3 scripts/find-module.py schema --limit 30
```

The helper reads only the local inventory. API links follow the moving v4 website; source links pin `effect@4.0.2`. Prefer installed declarations and matching source when a project uses another v4 release. Read only the relevant guide, not this whole inventory, for an ordinary task.

## ai — 20 modules

[Start with the ai guide](31-ai-and-tools.md).

`AiError`, `AnthropicStructuredOutput`, `Chat`, `Decision`, `DecisionModel`, `EmbeddingModel`, `IdGenerator`, `LanguageModel`, `McpProtocol`, `McpSchema`, `McpServer`, `Model`, `OpenAiStructuredOutput`, `Prompt`, `Response`, `ResponseIdTracker`, `Telemetry`, `Tokenizer`, `Tool`, `Toolkit`.

## core — 139 modules

[Start with the core guide](18-data-types-and-utilities.md).

`Arbitrary`, `Array`, `BigDecimal`, `BigInt`, `Boolean`, `Brand`, `ByteSize`, `Cache`, `Cause`, `Channel`, `ChannelSchema`, `Chunk`, `Clock`, `Combiner`, `Config`, `ConfigProvider`, `Console`, `Context`, `Cron`, `Crypto`, `Data`, `DateTime`, `Deferred`, `Differ`, `Duration`, `Effect`, `Effectable`, `Equal`, `Equivalence`, `ErrorReporter`, `ExecutionPlan`, `Exit`, `Fiber`, `FiberHandle`, `FiberMap`, `FiberSet`, `FileSystem`, `Filter`, `Formatter`, `Function`, `Graph`, `Hash`, `HashMap`, `HashRing`, `HashSet`, `HKT`, `Inspectable`, `Iterable`, `JsonPatch`, `JsonPointer`, `JsonSchema`, `Latch`, `Layer`, `LayerMap`, `LayerRef`, `Logger`, `LogLevel`, `ManagedRuntime`, `Match`, `Metric`, `MutableHashMap`, `MutableHashSet`, `MutableList`, `MutableRef`, `Newtype`, `NonEmptyIterable`, `Number`, `Optic`, `Option`, `Order`, `Ordering`, `PartitionedSemaphore`, `Path`, `Pipeable`, `PlatformError`, `Pool`, `Predicate`, `PrimaryKey`, `PubSub`, `Pull`, `Queue`, `Random`, `RcMap`, `RcRef`, `Record`, `Redactable`, `Redacted`, `Reducer`, `Ref`, `References`, `RegExp`, `Request`, `RequestResolver`, `Resource`, `Result`, `Runtime`, `Schedule`, `Scheduler`, `Schema`, `SchemaAST`, `SchemaGetter`, `SchemaIssue`, `SchemaParser`, `SchemaRepresentation`, `SchemaTransformation`, `Scope`, `ScopedCache`, `ScopedRef`, `Semaphore`, `Sink`, `StandardSchema`, `Stdio`, `Stream`, `String`, `Struct`, `SubscriptionRef`, `Symbol`, `SynchronizedRef`, `Take`, `Terminal`, `Tracer`, `Trie`, `Tuple`, `TxChunk`, `TxDeferred`, `TxHashMap`, `TxHashSet`, `TxPriorityQueue`, `TxPubSub`, `TxQueue`, `TxReentrantLock`, `TxRef`, `TxSemaphore`, `TxSubscriptionRef`, `Types`, `UndefinedOr`, `Unify`, `Utils`, `Version`.

## cli — 12 modules

[Start with the cli guide](26-platform-and-cli.md).

`Argument`, `CliConfig`, `CliError`, `CliOutput`, `Command`, `Completions`, `Flag`, `GlobalFlag`, `HelpDoc`, `Param`, `Primitive`, `Prompt`.

## cluster — 39 modules

[Start with the cluster guide](33-cluster.md).

`ClusterCron`, `ClusterError`, `ClusterMetrics`, `ClusterSchema`, `ClusterWorkflowEngine`, `DeliverAt`, `Entity`, `EntityAddress`, `EntityId`, `EntityProxy`, `EntityProxyServer`, `EntityResource`, `EntityType`, `Envelope`, `HttpRunner`, `K8sHttpClient`, `K8sTypes`, `MachineId`, `Message`, `MessageStorage`, `Reply`, `Runner`, `RunnerAddress`, `RunnerHealth`, `Runners`, `RunnerServer`, `RunnerStorage`, `ShardId`, `Sharding`, `ShardingConfig`, `ShardingRegistrationEvent`, `SingleRunner`, `Singleton`, `SingletonAddress`, `Snowflake`, `SocketRunner`, `SqlMessageStorage`, `SqlRunnerStorage`, `TestRunner`.

## devtools — 4 modules

[Start with the devtools guide](20-observability.md).

`DevTools`, `DevToolsClient`, `DevToolsSchema`, `DevToolsServer`.

## encoding — 10 modules

[Start with the encoding guide](16-sinks-channels-and-encoding.md).

`Base64`, `Base64Url`, `EncodingError`, `Hex`, `Ini`, `Ndjson`, `SchemaBinary`, `Sse`, `Toml`, `Yaml`.

## eventlog — 14 modules

[Start with the eventlog guide](25-persistence-and-eventlogs.md).

`Event`, `EventGroup`, `EventJournal`, `EventLog`, `EventLogEncryption`, `EventLogMessage`, `EventLogRemote`, `EventLogServer`, `EventLogServerEncrypted`, `EventLogServerUnencrypted`, `EventLogSessionAuth`, `SqlEventJournal`, `SqlEventLogServerEncrypted`, `SqlEventLogServerUnencrypted`.

## http-api — 13 modules

[Start with the http-api guide](22-http-apis.md).

`HttpApi`, `HttpApiBuilder`, `HttpApiClient`, `HttpApiEndpoint`, `HttpApiError`, `HttpApiGroup`, `HttpApiMiddleware`, `HttpApiScalar`, `HttpApiSchema`, `HttpApiSecurity`, `HttpApiSwagger`, `HttpApiTest`, `OpenApi`.

## http — 32 modules

[Start with the http guide](21-http-clients.md).

`Cookies`, `Etag`, `FetchHttpClient`, `FindMyWay`, `Headers`, `HttpBody`, `HttpClient`, `HttpClientError`, `HttpClientRequest`, `HttpClientResponse`, `HttpEffect`, `HttpIncomingMessage`, `HttpMethod`, `HttpMiddleware`, `HttpPlatform`, `HttpRouter`, `HttpServer`, `HttpServerError`, `HttpServerRequest`, `HttpServerRespondable`, `HttpServerResponse`, `HttpStaticServer`, `HttpStatus`, `HttpTraceContext`, `Mime`, `Multipart`, `MultipartParser`, `MultipartParser/HeadersParser`, `MultipartParser/Search`, `Template`, `Url`, `UrlParams`.

## net — 3 modules

[Start with the net guide](23-rpc-and-sockets.md).

`IpInterface`, `IpNetwork`, `NetAddress`.

## observability — 8 modules

[Start with the observability guide](20-observability.md).

`Otlp`, `OtlpExporter`, `OtlpLogger`, `OtlpMetrics`, `OtlpResource`, `OtlpSerialization`, `OtlpTracer`, `PrometheusMetrics`.

## persistence — 7 modules

[Start with the persistence guide](25-persistence-and-eventlogs.md).

`KeyValueStore`, `Persistable`, `PersistedCache`, `PersistedQueue`, `Persistence`, `RateLimiter`, `Redis`.

## process — 2 modules

[Start with the process guide](26-platform-and-cli.md).

`ChildProcess`, `ChildProcessSpawner`.

## reactivity — 8 modules

[Start with the reactivity guide](28-reactivity-and-frontend.md).

`AsyncResult`, `Atom`, `AtomHttpApi`, `AtomRef`, `AtomRegistry`, `AtomRpc`, `Hydration`, `Reactivity`.

## rpc — 12 modules

[Start with the rpc guide](23-rpc-and-sockets.md).

`Rpc`, `RpcClient`, `RpcClientError`, `RpcGroup`, `RpcMessage`, `RpcMiddleware`, `RpcSchema`, `RpcSerialization`, `RpcServer`, `RpcTest`, `RpcWorker`, `Utils`.

## schema — 8 modules

[Start with the schema guide](05-schema-codecs-and-tooling.md).

`Model`, `SchemaAOTCompiler`, `SchemaAOTCompiler/Build`, `SchemaCompiler`, `SchemaCompiler/runtime`, `SchemaJITCompiler`, `SchemaJITCompiler/enable`, `VariantSchema`.

## socket — 2 modules

[Start with the socket guide](23-rpc-and-sockets.md).

`Socket`, `SocketServer`.

## sql — 9 modules

[Start with the sql guide](24-sql.md).

`Migrator`, `SqlClient`, `SqlConnection`, `SqlError`, `SqlModel`, `SqlResolver`, `SqlSchema`, `SqlStream`, `Statement`.

## testing — 3 modules

[Start with the testing guide](29-testing.md).

`TestClock`, `TestConsole`, `TestSchema`.

## workers — 4 modules

[Start with the workers guide](27-workers.md).

`Transferable`, `Worker`, `WorkerError`, `WorkerRunner`.

## workflow — 8 modules

[Start with the workflow guide](32-workflows.md).

`Activity`, `DurableClock`, `DurableDeferred`, `DurableQueue`, `Workflow`, `WorkflowEngine`, `WorkflowProxy`, `WorkflowProxyServer`.

## Official discovery sources

[Core-package API inventory](https://effect.website/docs/v4/api/effect) · [Companion-package index](https://effect.website/docs/v4/api)

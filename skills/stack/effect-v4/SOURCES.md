# Sources and provenance

**Technical baseline:** Effect `4.0.2`, Git reference `effect@4.0.2`, observed **7 October 2026**. This package is for Effect 4 only. The guides synthesize official documentation and selected source into implementation guidance; they do not reproduce the full website.

## How to interpret the evidence

The following files were read in full or in the specific sections described. Pinned source URLs identify the baseline content. They do not imply that the complete file was audited or that examples were executed. Per-file hashes are not included or claimed as verified; use the pinned source reference to inspect the original content.

[Machine-readable source manifest](references/source-manifest.json) · [Full module discovery index](references/module-index.json) · [Coverage and maintenance](references/39-coverage-and-maintenance.md) · [Executed checks](VERIFICATION.md)

## Reviewed upstream source
| Source | Review scope |
| --- | --- |
| [packages/effect/package.json](https://github.com/Effect-TS/effect/blob/effect@4.0.2/packages/effect/package.json) | Package version and exported namespaces |
| [LLMS.md](https://github.com/Effect-TS/effect/blob/effect@4.0.2/LLMS.md) | Coding and application-pattern guide; read in sections |
| [packages/effect/SCHEMA.md](https://github.com/Effect-TS/effect/blob/effect@4.0.2/packages/effect/SCHEMA.md) | Selected sections: design, schema compilation, primitives, checks, transformations, templates |
| [ai-docs/src/01_effect/01_basics/10_creating-effects.ts](https://github.com/Effect-TS/effect/blob/effect@4.0.2/ai-docs/src/01_effect/01_basics/10_creating-effects.ts) | Constructors and callback cleanup |
| [ai-docs/src/01_effect/02_schema/10_schema-basics.ts](https://github.com/Effect-TS/effect/blob/effect@4.0.2/ai-docs/src/01_effect/02_schema/10_schema-basics.ts) | Classes, tagged errors, decode/encode |
| [ai-docs/src/01_effect/03_services/20_layer-composition.ts](https://github.com/Effect-TS/effect/blob/effect@4.0.2/ai-docs/src/01_effect/03_services/20_layer-composition.ts) | Service requirements and Layer composition |
| [ai-docs/src/01_effect/05_resources/20_layer-side-effects.ts](https://github.com/Effect-TS/effect/blob/effect@4.0.2/ai-docs/src/01_effect/05_resources/20_layer-side-effects.ts) | Scoped background Layer work |
| [ai-docs/src/03_stream/20_consuming-streams.ts](https://github.com/Effect-TS/effect/blob/effect@4.0.2/ai-docs/src/03_stream/20_consuming-streams.ts) | Streams, folds, immutable-array collection, sinks |
| [ai-docs/src/04_integration/10_managed-runtime.ts](https://github.com/Effect-TS/effect/blob/effect@4.0.2/ai-docs/src/04_integration/10_managed-runtime.ts) | ManagedRuntime host integration and memo maps |
| [ai-docs/src/05_batching/10_request-resolver.ts](https://github.com/Effect-TS/effect/blob/effect@4.0.2/ai-docs/src/05_batching/10_request-resolver.ts) | Request.Class, resolver entries and completion |
| [ai-docs/src/06_schedule/10_schedules.ts](https://github.com/Effect-TS/effect/blob/effect@4.0.2/ai-docs/src/06_schedule/10_schedules.ts) | Schedule min/max, continuation, eligibility, retry |
| [ai-docs/src/07_datetime/10_creating-and-formatting.ts](https://github.com/Effect-TS/effect/blob/effect@4.0.2/ai-docs/src/07_datetime/10_creating-and-formatting.ts) | Clock-backed DateTime operations |
| [ai-docs/src/09_testing/10_effect-tests.ts](https://github.com/Effect-TS/effect/blob/effect@4.0.2/ai-docs/src/09_testing/10_effect-tests.ts) | Vitest helpers, TestClock and Schema property tests |
| [ai-docs/src/40_sql/10_basics.ts](https://github.com/Effect-TS/effect/blob/effect@4.0.2/ai-docs/src/40_sql/10_basics.ts) | Models, repositories, SqlSchema, driver/migrator composition |
| [ai-docs/src/50_http-client/10_basics.ts](https://github.com/Effect-TS/effect/blob/effect@4.0.2/ai-docs/src/50_http-client/10_basics.ts) | HttpClient and response schemas |
| [ai-docs/src/51_http-server/10_basics.ts](https://github.com/Effect-TS/effect/blob/effect@4.0.2/ai-docs/src/51_http-server/10_basics.ts) | HTTP server, client and Fetch handler wiring |
| [ai-docs/src/51_http-server/fixtures/api/Api.ts](https://github.com/Effect-TS/effect/blob/effect@4.0.2/ai-docs/src/51_http-server/fixtures/api/Api.ts) | Root API composition |
| [ai-docs/src/51_http-server/fixtures/api/Users.ts](https://github.com/Effect-TS/effect/blob/effect@4.0.2/ai-docs/src/51_http-server/fixtures/api/Users.ts) | Endpoint schemas, middleware, variants and representations |
| [ai-docs/src/70_cli/10_basics.ts](https://github.com/Effect-TS/effect/blob/effect@4.0.2/ai-docs/src/70_cli/10_basics.ts) | Command, Argument, Flag and platform execution |
| [ai-docs/src/71_ai/10_language-model.ts](https://github.com/Effect-TS/effect/blob/effect@4.0.2/ai-docs/src/71_ai/10_language-model.ts) | Text, object, stream, providers, execution plans |
| [ai-docs/src/71_ai/20_tools.ts](https://github.com/Effect-TS/effect/blob/effect@4.0.2/ai-docs/src/71_ai/20_tools.ts) | Tools, toolkits, handler Layers, failure mode |
| [ai-docs/src/80_cluster/10_entities.ts](https://github.com/Effect-TS/effect/blob/effect@4.0.2/ai-docs/src/80_cluster/10_entities.ts) | Entities, message persistence, handler ordering, TestRunner |
| [packages/effect/src/TxRef.ts](https://github.com/Effect-TS/effect/blob/effect@4.0.2/packages/effect/src/TxRef.ts) | Selected source: transactional reference semantics and operations |
| [packages/effect/src/Queue.ts](https://github.com/Effect-TS/effect/blob/effect@4.0.2/packages/effect/src/Queue.ts) | Selected source: queue model, capacity and producer/consumer capabilities |
| [packages/effect/src/Cache.ts](https://github.com/Effect-TS/effect/blob/effect@4.0.2/packages/effect/src/Cache.ts) | Selected source: successes/failures, shared lookup, constructors and TTL |
| [packages/effect/src/Config.ts](https://github.com/Effect-TS/effect/blob/effect@4.0.2/packages/effect/src/Config.ts) | Selected source: configuration provider/error model |
| [packages/effect/src/Deferred.ts](https://github.com/Effect-TS/effect/blob/effect@4.0.2/packages/effect/src/Deferred.ts) | Selected source: one-shot completion and waiting |
| [packages/effect/src/reactivity/Atom.ts](https://github.com/Effect-TS/effect/blob/effect@4.0.2/packages/effect/src/reactivity/Atom.ts) | Selected source: stability, registry lifetime, Atom.make overloads |
| [packages/effect/src/workflow/Workflow.ts](https://github.com/Effect-TS/effect/blob/effect@4.0.2/packages/effect/src/workflow/Workflow.ts) | Selected source: make, identity, engine requirements, lifecycle, compensation |
| [packages/effect/src/workflow/Activity.ts](https://github.com/Effect-TS/effect/blob/effect@4.0.2/packages/effect/src/workflow/Activity.ts) | Selected source: make and incomplete-activity replay |
| [LICENSE](https://github.com/Effect-TS/effect/blob/effect@4.0.2/LICENSE) | Upstream MIT attribution |
| [package.json](https://github.com/Effect-TS/effect/blob/effect@4.0.2/package.json) | Pinned repository toolchain: TypeScript ^7.0.2; type-test target >=5.9 |

## Versioned website pages
- [Versioned onboarding](https://effect.website/docs/v4/onboarding)
- [Guide navigation and scope](https://effect.website/docs/v4/getting-started)
- [Companion package discovery](https://effect.website/docs/v4/api)
- [4.0.2 and complete 357-module core-package inventory](https://effect.website/docs/v4/api/effect)
- [Structured concurrency guide](https://effect.website/docs/v4/concurrency/fibers)
- [Codec transformations guide](https://effect.website/docs/v4/schema/transformations)
- [Standalone TestClock Layer and virtual-time patterns](https://effect.website/docs/v4/testing/testclock)

## Discovery versus inspection
The 357-module index comes from the official core-package API navigation. Only the selected source files and guide sections listed above were individually inspected. A link in a guide or atlas may be an implementation-time lookup target rather than a previously read complete page. All URL reachability was not rechecked automatically at packaging time.
Module source links pin the baseline tag. Website links remain on the moving v4 documentation. The project’s installed declarations and matching release source take precedence over either when its installed v4 version differs.

## Packaging references
[OpenAI skill authoring and local discovery](https://developers.openai.com/codex/build-skills) informed the folder/frontmatter and optional agent metadata format. It is not a source for the Effect API guidance.

## Attribution
Effect upstream code and documentation carry the MIT license. [NOTICE.md](NOTICE.md) retains the upstream copyright and permission notice for adapted API patterns. No upstream package, dependencies, generated compiler output, or full documentation mirror is bundled.

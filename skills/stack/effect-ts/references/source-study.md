# Source Study

This file records the evidence and design decisions behind the current Effect v4 skill.

## 2026-07-19 Schema-Enforcement Pass

A completed repository-wide schema-first migration across shared contracts, runtime workflows, persistence, APIs, CLI consumers, UI state, and tests exposed a gap between writing good Schema code and proving that the invariant remains true across a large TypeScript graph.

The resulting guidance adds `schema-enforcement.md` and sharpens cross-package contract ownership. Durable findings were:

- semantic domain strings should become constrained Schema brands at ingress and remain branded inward;
- a decoder elsewhere in a function does not prove that the actual raw value reached the boundary;
- names, paths, familiar methods, structural lookalikes, and counterfeit or shadowed imports are not semantic provenance;
- syntax-aware checks are useful locally, while cross-file ownership and canonical symbol identity may require compiler-backed verification;
- every accepted exception needs a paired adversarial fixture, including disconnected decoders and escaping values;
- migration audits should converge on zero actionable violations without count snapshots, broad suppressions, or grandfathered allowlists.

The enforcement reference is deliberately optional. Do not build a custom checker when normal schemas, focused type checks, and tests already protect the repository invariant.

## 2026-07-16 Deepening Pass

The pass read all 1,028 lines in Kit Langton's `skills/effect` bundle at commit `30dee8607214c893dd89f6eee65c669ef3dce8c9`:

- root task router
- Schema and data modeling
- services, Layers, module surfaces, and long-lived work
- Config and ConfigProvider
- scheduling and retry
- Cache and request deduplication
- Stream source, transformation, and consumer selection
- Effect HttpClient
- deterministic testing

The pass also checked relevant APIs against Effect upstream commit `80b539f8aba68f478c75c35c2b4140c4ffc4fada`, whose package version was `4.0.0-beta.98`. The target repository's installed pin remains authoritative for future use.

## What We Adopted From Kit

- Task-oriented routing from the root skill into focused references.
- Concrete v4 defaults and primitive selection tables.
- `Schema.Struct` plus a same-name derived interface.
- constrained Schema brands, exact optionality, and tagged variant selection.
- explicit `Context.Service` interfaces, `Layer.effect`, `Service.of`, and Layer constructor guidance.
- the lifecycle rule that long-lived work forks into the owning Layer scope and Layer acquisition completes.
- concrete ConfigProvider, Schedule, Cache, Stream, HttpClient, TestClock, and test-service patterns.
- source verification for unstable v4 modules.

## What We Extended

This skill goes further for an Effect-first backend portfolio:

- v4 beta only, with no v3 compatibility branches.
- Effect as the default representation of backend operations, while tiny total leaf transforms may remain plain functions.
- an explicit distinction between composing Effect throughout the backend and executing it only at host boundaries.
- a strong rule against stringly typed domain contracts, including IDs, states, roles, event names, operation labels, and bounded categories.
- dedicated references for resources/concurrency, errors/observability, RPC/protocol contracts, SQL/transactions, and runtime ownership.
- deeper lifecycle, interruption, redaction, test, and verification checklists.

Kit's self-exporting module namespace convention was not adopted as a universal rule. Existing repository module style remains authoritative.

## Earlier Source Corpus

The prior first-principles rewrite performed a line-oriented pass over opencode, executor, and effect-smol. It indexed imports, calls, dependencies, and candidate files, then manually reread routed implementation and test files.

| Repo        | Files |     Lines | Effect Import Files | Effect Call Files |
| ----------- | ----: | --------: | ------------------: | ----------------: |
| opencode    | 4,098 | 1,156,154 |               1,059 |             1,087 |
| executor    | 1,654 |   867,545 |                 760 |               643 |
| effect-smol | 2,010 |   628,198 |                 863 |             1,071 |

Candidate files included TypeScript, JavaScript, Markdown/MDX, manifests, TypeScript configs, and Vitest configs. Vendor, generated, build, output, cache, media, binary, and lockfile paths were excluded. This was complete line indexing plus focused manual review, not a claim that every line was semantically hand-read.

## Durable Findings

- opencode demonstrates process-owned runtime graphs, resumable state machines, ScopedCache, Scope finalizers, keyed concurrency, explicit test Layers, and contract-derived clients.
- executor demonstrates Schema decoding over casts, typed boundary errors, Effect-native SDK adapters, Cloudflare callback bridges, resumable Queue/Deferred/Fiber workflows, and bounded telemetry polling.
- Effect source and tests remain the authority for API spelling, lazy execution, Layer and Scope semantics, Schedule behavior, Cache deduplication, Stream backpressure, and virtual time.

## Rewrite Decisions

- Keep `SKILL.md` procedural and route detail into focused references.
- Keep one owner for each rule; cross-link instead of copying entire sections.
- Prefer complete patterns with ownership, errors, and tests over isolated API snippets.
- Treat the boundary ladder as a primitive chooser, not a gate that excludes Effect from backend code.
- Keep runtime execution at hosts so service requirements, typed failures, interruption, and tracing remain composable.
- Verify unstable and non-trivial APIs against the target project's exact v4 beta source.
- Reject casts, Promise escapes, v3 fallbacks, unowned fibers, and stringly domain contracts.

---
name: effect-ts
description: Source-backed Effect guidance for TypeScript backends, workers, CLIs, SDKs, shared packages, and tests. Use when implementing or reviewing Effect services, Layers, Schema boundaries, typed errors, retries, schedules, observability, SQL, HttpApi/RPC clients, scoped resources, concurrency, or runtime boundaries.
---

# Effect Expert

Lead with the boundary. Effect earns its place when code needs typed failure, explicit dependencies, resource lifetime, cancellation, retries, observability, protocol decoding, or testable concurrency.

## Reference Map

Read the smallest file that answers the current question:

- `references/principles.md`: first-principles model for deciding whether Effect belongs in a design and which primitive fits.
- `references/patterns.md`: implementation recipes, examples, and anti-patterns for services, Layers, Schema, errors, clients, resources, concurrency, observability, SQL, and tests.
- `references/source-lookup.md`: live `opensrc` commands and routed source files for opencode, executor, effect-smol, and Effect itself.
- `references/source-study.md`: coverage metrics and evidence from the source and sentence audit behind this rewrite.

## First Pass

1. Inspect the target project before giving advice:
   - `git status --short`
   - package manager and scripts
   - installed `effect` / `@effect/*` versions
   - existing Effect imports, services, layers, schemas, errors, tests, and runtime entrypoints
2. Resolve current source:
   - run `pnpm exec opensrc path --cwd . effect`
   - use `references/source-lookup.md` when the task needs opencode, executor, or effect-smol examples
3. Classify the boundary:
   - unknown input or encoding -> Schema
   - expected failure -> typed error
   - dependency -> service and Layer
   - owned resource -> Scope, Layer, acquire/release
   - parallel or resumable work -> Fiber, Deferred, Queue, Exit
   - outbound protocol -> Effect platform client, usually `HttpClient`
   - host callback or process edge -> one `run*` boundary
4. Use the reference map above before loading detailed guidance.

## Defaults

- Keep pure synchronous transforms as plain TypeScript.
- Use `Effect.gen` for inline multi-step composition.
- Use named `Effect.fn("Domain.operation")` for reusable operations that deserve a stack frame, span, or stable runtime identity.
- Use unnamed `Effect.fn` for reusable operations that need stack-frame behavior but no named span.
- Use `Effect.fnUntraced` for library internals, hot paths, and tiny wrappers where traces would add noise or cost.
- Prefer `Context.Service` class syntax in current v4-style code. Follow local `Context.Tag` style only when the project is pinned to it.
- Use `Schema.TaggedErrorClass` for schema-backed or wire-visible errors. Use `Data.TaggedError` for lightweight internal errors.
- Provide layers at entrypoints, adapters, tests, workers, CLIs, routes, or runtimes. Keep domain functions dependency-declarative.
- Decode boundary data once, then pass typed values through the domain.
- Run Effect only at host edges: handler, worker callback, CLI command, test, SDK callback bridge, or runtime adapter.

## No-op Detection

If the task only touches pure formatting, static UI render code, copy, or packaging metadata without Effect boundaries, do not force Effect patterns into it. Say the Effect skill does not add guidance for that change and follow the local project conventions.

## Completion Criteria

Effect work is complete only when:

- The current Effect version and local conventions were checked.
- Nontrivial APIs were verified against source or a routed reference.
- Boundary inputs are decoded or explicitly trusted at a named boundary.
- Expected failures stay typed; defects are intentional.
- Public errors have stable display and redaction behavior.
- Dependencies are visible through the effect type or a Layer supplied at an edge.
- Owned resources, fibers, queues, streams, schedules, and timers have cleanup or interruption behavior.
- Tests or focused runtime checks cover the success path and at least one failure, retry, interruption, or cleanup path.

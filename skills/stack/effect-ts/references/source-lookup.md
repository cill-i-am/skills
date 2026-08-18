# Source Lookup And Compatibility Proof

Use live source for API spelling and semantics. Reference repositories teach architecture; the target installation proves compatibility.

## Evidence Priority

1. Target repository instructions, package manifest, lockfile, compiler settings, and nearby compiling code.
2. The exact installed `effect` and `@effect/*` package guidance, declarations, implementation, and adjacent tests.
3. A narrow scratch probe compiled with the target project's own typecheck command.
4. Current upstream Effect source and tests for semantic clarification.
5. Exemplar compiling source, tests, and enforced lint configuration at a pinned revision.
6. Exemplar prose, migration notes, and embedded skills.
7. Website posts or remembered examples for conceptual orientation only.

Compiling code and enforcement outrank checked-in prose when they disagree. An exemplar never overrides the target pin.

## Resolve The Target Pin

Inspect the manifest and lockfile rather than trusting a semver range alone:

```sh
rg -n '"effect"|"@effect/' package.json pnpm-lock.yaml yarn.lock package-lock.json bun.lock
```

When the project supports it, resolve installed source with its package manager or a source tool such as:

```sh
pnpm exec opensrc path --cwd . effect
```

Also inspect shipped package-level agent guidance, AI docs, cookbooks, declarations, source, and tests. Package layouts vary by release.

## Compile A Probe

For a version-sensitive API, create a disposable TypeScript file in the repository and compile it with the project's normal command. Include the real imports and the smallest representative call shape. Delete the probe afterward.

A matching symbol name is not enough. Prove its type parameters, option fields, return/error/service channels, and runtime semantics where relevant.

Probe especially:

- Schema classes, brands, error constructors, decoders, encoders, and optionality;
- `Effect.fn`, `fnUntraced`, race, timeout, and callback constructors;
- Layer, Scope, ManagedRuntime, MemoMap, Cache, and ScopedCache;
- Schedule metadata and combinators;
- FiberSet/FiberMap runtime constructors;
- Stream pagination and callback sources;
- unstable HTTP, HttpApi, RPC, SQL, workflow, platform, observability, and reactivity modules;
- test framework helpers and automatic Scope behavior.

## Upstream Routes

Start with the installed module and adjacent tests. Current upstream commonly contains:

- `packages/effect/src/Effect.ts`
- `Context.ts`, `Layer.ts`, `Scope.ts`, `ManagedRuntime.ts`
- `Schema.ts`, `Config.ts`, `ConfigProvider.ts`
- `Schedule.ts`, `Cache.ts`, `ScopedCache.ts`, `Stream.ts`
- `FiberSet.ts`, `FiberMap.ts`
- `testing/TestClock.ts`
- `unstable/http/**`, `httpapi/**`, `rpc/**`, `sql/**`, and workflow/platform modules
- nearby `packages/effect/test/**` and typetests

Verify that a route exists at the target revision before presenting it as current.

## Reference Architectures

Pin exemplars read-only and record their revision. Useful routes include:

### OpenCode

- `.opencode/skills/effect/SKILL.md`
- application and service runtimes under `packages/opencode/src/effect/`
- `packages/core/src/effect/layer-node.ts`
- `packages/core/src/effect/keyed-mutex.ts`
- location service maps and keyed lifetimes
- custom Effect test harness
- Protocol and generated Effect client packages

Use it for runtime topology, Layer graph scaling, context propagation, keyed resources, resumable workflows, and package direction.

### Executor

- Effect-aware lint configuration and custom rules
- SDK contracts and typed errors
- transaction/runtime bridges
- execution state machines and race regressions
- host composition roots and Cloudflare/browser boundaries
- Effect test suites and protocol tests

Use it for boundary discipline, host exceptions, error mapping, enforcement by package role, and behavior-preserving migrations.

Do not copy a version-specific API blacklist or repository-local policy globally.

## Search Pass

```sh
rg -n 'from "effect"|from "effect/|@effect/' .
rg -n 'Context\.Service|Layer\.|Effect\.fn|fnUntraced|Schema\.|ManagedRuntime|runPromise|HttpClient|Deferred|Queue|Fiber|Schedule\.' .
rg -n 'Promise<|async |try\s*\{|Date\.now|new Date|JSON\.parse|fetch\(' packages src
```

Classify findings by package role before calling them violations.

## Evidence Record

For source-backed advice or a change involving unstable/non-trivial APIs, record:

```md
Effect evidence
- target version and lockfile: ...
- installed files inspected: ...
- upstream revision, if consulted: ...
- exemplar revision and files: ...
- compile/typecheck probe: ...
- focused tests: ...
```

Do not vendor large reference repositories into the target project. Use a temporary read-only checkout or source resolver and keep the revision in the investigation record.

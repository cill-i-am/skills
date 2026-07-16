# Source Lookup

Use live source for API spelling and semantics. Do not create or commit a vendored `.repos/effect` tree.

## Priority Order

1. Target project's package pin, lockfile, local Effect guidance, and nearby code.
2. Installed `effect` and `@effect/*` source for that exact v4 beta.
3. Current upstream Effect v4 source and tests.
4. Kit Langton's Effect skill for concise production patterns.
5. Exemplar application repositories for architecture, adapters, and runtime ownership.

An exemplar never overrides the target pin. Do not copy v3 fallback code into a v4 project.

## Resolve Source

Installed Effect:

```bash
pnpm exec opensrc path --cwd . effect
```

Exemplar repositories:

```bash
pnpm exec opensrc path --cwd . kitlangton/skills
pnpm exec opensrc path --cwd . anomalyco/opencode
pnpm exec opensrc path --cwd . UsefulSoftwareCo/executor
```

If `opensrc` cannot resolve a repository, clone it read-only under `/tmp`. Record its commit SHA in the investigation or `source-study.md`; do not vendor it into the target repository.

## Effect v4 Routes

Start with the module implementation and its adjacent tests:

- `packages/effect/src/Effect.ts`
- `packages/effect/src/Context.ts`
- `packages/effect/src/Layer.ts`
- `packages/effect/src/Scope.ts`
- `packages/effect/src/ManagedRuntime.ts`
- `packages/effect/src/Schema.ts`
- `packages/effect/src/Config.ts`
- `packages/effect/src/ConfigProvider.ts`
- `packages/effect/src/Schedule.ts`
- `packages/effect/src/Cache.ts`
- `packages/effect/src/ScopedCache.ts`
- `packages/effect/src/Stream.ts`
- `packages/effect/src/FiberSet.ts`
- `packages/effect/src/FiberMap.ts`
- `packages/effect/src/testing/TestClock.ts`
- `packages/effect/src/unstable/http/**`
- `packages/effect/src/unstable/httpapi/**`
- `packages/effect/src/unstable/rpc/**`
- `packages/effect/src/unstable/sql/**`
- nearby `packages/effect/test/**` files for the API under review

Read exports, type signatures, doc examples, implementation, and tests. A matching symbol name alone is not proof that semantics match an older example.

## Kit Langton Routes

Use Kit's skill for task routing and compact production patterns:

- `skills/effect/SKILL.md`
- `skills/effect/references/SCHEMA.md`
- `skills/effect/references/SERVICES_LAYERS.md`
- `skills/effect/references/CONFIG.md`
- `skills/effect/references/SCHEDULING.md`
- `skills/effect/references/CACHING.md`
- `skills/effect/references/STREAMS.md`
- `skills/effect/references/HTTP_CLIENTS.md`
- `skills/effect/references/TESTING.md`

Pay particular attention to Schema v4 modeling, Layer constructor choice, scoped long-lived work, Effect.fn transforms, ConfigProvider, exit-aware cache TTL, Stream source/consumer selection, and deterministic tests.

Do not copy Kit's optional self-exporting module namespace convention unless the target repository has deliberately adopted it.

## opencode Routes

Use opencode for application runtime and resumable workflow patterns:

- `.opencode/skills/effect/SKILL.md`
- `packages/opencode/src/effect/app-runtime.ts`
- `packages/opencode/src/effect/runner.ts`
- `packages/opencode/src/effect/instance-state.ts`
- `packages/opencode/test/lib/effect.ts`
- `packages/core/src/effect/layer-node.ts`
- `packages/core/src/effect/service-use.ts`
- `packages/core/src/effect/keyed-mutex.ts`
- `packages/protocol/src/api.ts`
- `packages/client/src/effect.ts`

Use these for runtime memoization, Scope ownership, Deferred/Fiber state machines, keyed concurrency, and contract-derived clients. Re-verify API names against the target v4 pin.

## executor Routes

Use executor for SDK, Cloudflare, and host callback boundaries:

- `.agents/skills/wrdn-effect-schema-boundaries/SKILL.md`
- `.agents/skills/wrdn-effect-typed-errors/SKILL.md`
- `.agents/skills/wrdn-effect-raw-fetch-boundary/SKILL.md`
- `.agents/skills/wrdn-effect-vitest-tests/SKILL.md`
- `.skills/effect-use-pattern/SKILL.md`
- `.skills/effect-http-testing/SKILL.md`
- `packages/core/sdk/src/client.ts`
- `packages/core/sdk/src/errors.ts`
- `packages/core/execution/src/engine.ts`
- `packages/hosts/cloudflare/src/mcp/agent-session-durable-object.ts`
- `packages/hosts/mcp/src/tool-server.ts`
- `e2e/src/services.ts`

Use these for boundary decoding, error mapping, raw-fetch exceptions, callback bridges, resumable work, and test Layers.

## Search Commands

Repository convention pass:

```bash
rg -n 'from "effect"|from "effect/|@effect/' .
rg -n 'Context\.Service|Layer\.|Effect\.fn|Schema\.|TaggedError|ManagedRuntime|runPromise|HttpClient|Deferred|Queue|Fiber|Schedule\.' .
```

Source API pass:

```bash
effect_root="$(pnpm exec opensrc path --cwd . effect)"
symbol='makeWith'
rg -n "export (const|function|class|interface|type) ${symbol}|${symbol}" "$effect_root/src" "$effect_root/test"
```

Record the source version or SHA and the files actually inspected before calling advice source-backed.

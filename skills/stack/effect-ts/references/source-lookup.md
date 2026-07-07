# Source Lookup

Use live source for API spelling. Do not create or commit `.repos/effect`.

## Commands

Resolve the target project's installed Effect source:

```bash
pnpm exec opensrc path --cwd . effect
```

Resolve exemplar repositories when source-backed patterns are needed:

```bash
pnpm exec opensrc path --cwd . anomalyco/opencode
pnpm exec opensrc path --cwd . UsefulSoftwareCo/executor
pnpm exec opensrc path --cwd . Effect-TS/effect-smol
```

If a target repo has no opensrc mapping for an exemplar, clone read-only to `/tmp` and do not vendor it into the project.

## Resolved Root Shape

`opensrc` returns machine-local cache paths. Treat these as examples of the
shape, not stable paths:

- `effect`: `$HOME/.opensrc/repos/github.com/Effect-TS/effect/<version>/packages/effect`
- `opencode`: `$HOME/.opensrc/repos/github.com/anomalyco/opencode/<ref>`
- `executor`: `$HOME/.opensrc/repos/github.com/UsefulSoftwareCo/executor/<ref>`
- `effect-smol`: `$HOME/.opensrc/repos/github.com/Effect-TS/effect-smol/<ref>`

Resolve them live before relying on exact line numbers or API names.

## opencode Routes

Use opencode for production app runtime patterns:

- `.opencode/skills/effect/SKILL.md`
- `AGENTS.md`
- `CONTEXT.md`
- `packages/opencode/src/effect/app-runtime.ts`
- `packages/opencode/src/effect/runner.ts`
- `packages/opencode/src/effect/instance-state.ts`
- `packages/opencode/test/lib/effect.ts`
- `packages/core/src/effect/layer-node.ts`
- `packages/core/src/effect/service-use.ts`
- `packages/core/src/effect/keyed-mutex.ts`
- `packages/protocol/src/api.ts`
- `packages/protocol/src/groups/event.ts`
- `packages/opencode/src/server/routes/instance/httpapi/handlers/session.ts`
- `packages/client/src/effect.ts`
- `packages/opencode/src/mcp/index.ts`
- `packages/core/src/git.ts`

## executor Routes

Use executor for SDK, host boundary, Cloudflare, and resumable workflow patterns:

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
- `e2e/src/surfaces/telemetry.ts`

## effect-smol Routes

Use effect-smol for current API spelling and tests:

- `AGENTS.md`
- `.patterns/effect.md`
- `.patterns/testing.md`
- `packages/effect/src/Effect.ts`
- `packages/effect/src/Layer.ts`
- `packages/effect/src/Scope.ts`
- `packages/effect/src/Schema.ts`
- `packages/effect/src/Stream.ts`
- `packages/effect/src/Schedule.ts`
- `packages/effect/src/unstable/sql/SqlClient.ts`
- `packages/effect/src/unstable/sql/SqlResolver.ts`
- nearby `packages/effect/test/**` files for the API under review

## Inventory Command

For a broad source pass:

```bash
root="$(pnpm exec opensrc path --cwd . anomalyco/opencode)"
rg --files "$root" \
  -g '*.{ts,tsx,mts,cts,js,jsx,mjs,cjs,md,mdx,json}' \
  -g '!**/{node_modules,dist,build,out,coverage,.turbo,.next,.svelte-kit,.astro,vendor,.wrangler,.cache,.git,generated,generated-effect,__generated__,.output}/**'
```

Record include/exclude rules before claiming exhaustive coverage.

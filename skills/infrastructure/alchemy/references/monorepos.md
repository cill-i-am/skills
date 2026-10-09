# Alchemy in pnpm monorepos

## Default and scope

Treat a monorepo as the default for Cillian's new projects. Preserve the repository's existing package boundaries and package manager. A monorepo is a packaging choice, not a requirement to have one stack per package. Start with one root stack unless independent ownership, permissions, deployment cadence, or data lifecycle justifies a split.

Use [Drizzle](drizzle.md) for database integration and [infrastructure colocation](infra-colocation.md) for feature Layers. The [worked workspace](../assets/examples/drizzle-monorepo/README.md) contains actual manifests, exports, schemas, Layers, hosts, a small browser app, root stacks, and generation commands. It is a demonstration awaiting dependency and integration verification, not a production template with hidden setup omitted.

## Recommended layout

```text
alchemy.run.ts                 # One root composition graph
pnpm-workspace.yaml             # Workspace membership + compatible version catalog
package.json                   # Root deployment/check commands
apps/
  api/src/                     # Worker entry + HTTP/auth adapter
  web/src/                     # Browser/framework application
packages/
  contracts/src/               # Public schemas/types, no infra imports
  notes/src/                   # Domain rules, service, storage implementations
  notes/drizzle/               # Separate histories for the two example engines
```

For a real shared product database, introduce `packages/database/` to own its resource, client, aggregate schema entrypoint, and migration history. Individual feature packages can own table definitions and repository code. Do not give every feature its own physical database just to match folders. The two sample dialect histories target two **different example databases**, not two writers for one database.

## Workspace dependencies and version alignment

```yaml
packages:
  - "apps/*"
  - "packages/*"
catalog:
  alchemy: "2.0.0-beta.81"
  effect: "4.0.0"
  drizzle-orm: "1.0.0-rc.5-ab785fc"
  drizzle-kit: "1.0.0-rc.5-ab785fc"
```

Each package declares what it imports; do not rely on root hoisting or undeclared transitive dependencies. Internal packages use `workspace:*`; external dependencies use the catalog or a compatible reviewed pin, **not** `workspace:*` unless that external project really is part of the workspace. Keep ORM, Kit, Effect, SQL drivers, and Alchemy compatible as a tuple. Commit one real lockfile once installation has resolved it; do not fabricate one from package declarations.

```json
{
  "name": "@example/api",
  "private": true,
  "type": "module",
  "dependencies": {
    "@example/contracts": "workspace:*",
    "@example/notes": "workspace:*",
    "alchemy": "catalog:",
    "effect": "catalog:"
  }
}
```

The fixture's manifests carry the full toolchain. They are independent from the parent example package; install and typecheck inside the fixture root rather than accidentally using a different parent dependency set.

## Public exports and browser boundaries

Source-first private packages can expose TypeScript entrypoints directly when the selected bundler/toolchain supports them:

```json
{
  "name": "@example/contracts",
  "private": true,
  "type": "module",
  "exports": {
    "./notes": "./src/notes.ts",
    "./health": "./src/health.ts"
  },
  "dependencies": { "effect": "catalog:" }
}
```

The storage package separately exports `./service`, `./d1`, and `./postgres`. There is no catch-all root barrel re-exporting all implementations. Browser imports resolve only through contracts, not through a server module that happens to export the same type. A `type` import can erase at build time, but explicit public entrypoints also protect runtime-schema imports and future refactors.

```ts
// Browser-safe public schema.
import { Note } from "@example/contracts/notes";
// Server-only storage implementation, never a browser import.
import { NotesD1Live } from "@example/notes/d1";
```

If a package publishes built `dist/` or `lib/` exports, build it before consuming it. Do not claim source-first and emitted-package workflows are interchangeable. Avoid TypeScript path aliases that compile locally while bypassing the actual package export map used by the deployed bundler.

## One root stack: backend plus frontend

This is the core of the complete fixture's [root stack](../assets/examples/drizzle-monorepo/alchemy.run.ts):

```ts
import * as Alchemy from "alchemy";
import * as Cloudflare from "alchemy/Cloudflare";
import * as Effect from "effect/Effect";
import { Path } from "effect/Path";
import Api from "./apps/api/src/Api.ts";

export default Alchemy.Stack("NotesExample", {
  providers: Cloudflare.providers(),
  state: Alchemy.localState(),
}, Effect.gen(function* () {
  const api = yield* Api;
  const path = yield* Path;
  const web = yield* Cloudflare.Website.Vite("Web", {
    rootDir: path.resolve(import.meta.dirname, "apps/web"),
    env: { VITE_API_URL: api.url },
    memo: {
      include: ["**/*", "../../packages/contracts/src/**", "../../packages/contracts/package.json"],
      lockfile: true,
    },
  });
  return { apiUrl: api.url, webUrl: web.url };
}));
```

Use remote state for shared team/CI ownership, after a separately authorized bootstrap or state migration. The local state in this disposable example is not a recommendation to lose CI state between runners. Returning an Output or passing it into props preserves graph dependencies; avoid normal string interpolation or branching on unresolved outputs.

For an existing TanStack Start app, the Alchemy Cloudflare baseline also uses `Website.Vite`; preserve that app's framework/Vite configuration. The minimal fixture is plain Vite, **not** a tested TanStack Start SSR application. A complete Start + authenticated RPC + Drizzle path remains an explicit follow-up.

## Paths: two different command roots

Alchemy stack commands in this example run from the workspace root. Drizzle generation runs from the owning package through `pnpm --filter`. This distinction is deliberate:

| Path | Resolution contract |
|---|---|
| Worker `main: import.meta.url` | The declaring file; safe for an imported entrypoint. |
| Website `rootDir` | Explicit absolute app directory, anchored at the stack file. |
| Database `migrations: "./packages/notes/drizzle/sqlite"` | Root Alchemy command directory. |
| Package Drizzle config `schema: "./src/sqlite-schema.ts"` | Notes package directory selected by `pnpm --filter`. |
| Package Drizzle config `out: "./drizzle/sqlite"` | Same Notes package directory. |

The sample's migration-input guard rejects the wrong root and missing SQL before its convenience dev/plan/deploy scripts proceed. It checks existence, not migration correctness. Invoking the CLI directly bypasses that convenience guard; understand the command contract rather than treating the guard as authorization.

When a real project needs commands callable from multiple directories, anchor paths explicitly using the supported path helpers and verify how the runtime bundler handles the module. Do not concatenate unescaped URL pathnames into filesystem paths. Avoid evaluating Node-only filesystem/configuration operations inside deployed request code.

## Build invalidation: the important monorepo trap

A frontend importing a sibling package can change without any file under `apps/web` changing. Include all source-first packages used by the build in the Website memo. Once overriding `include`, explicitly keep `lockfile: true` for the inspected Vite implementation. Include relevant package manifests and build configuration as well as source files.

Two caches must be correct: the workspace task runner's cache (Turborepo or otherwise) and Alchemy's Website memo. Fixing only one does not guarantee the deployed bundle changes. Avoid building the same frontend twice merely because both tools can orchestrate it; define which command owns that build.

A regression test should modify only a shared contract, verify the browser bundle/build hash changes, then modify only the lockfile and repeat. Also verify an unrelated package does not force unnecessary application deployments where that isolation is intended. These tests have not yet been run for the new fixture.

## Multiple stacks: typed handles and explicit ordering

Split when the boundary is real—for example, a retained shared database and independently disposable preview apps. References read producer state; they do not deploy it or establish a cross-stack transaction.

A minimal **plan-time-only** shared stack handle:

```ts
// apps/api/src/Stack.ts; expose this through a server-only ./stack subpath.
import * as Alchemy from "alchemy";
export class Backend extends Alchemy.Stack<Backend, { url: string }>()("Backend") {}
```

Backend stack:

```ts
// apps/api/alchemy.run.ts
import * as Alchemy from "alchemy";
import * as Cloudflare from "alchemy/Cloudflare";
import * as Effect from "effect/Effect";
import Api from "./src/Api.ts";
import { Backend } from "./src/Stack.ts";

export default Backend.make({
  providers: Cloudflare.providers(),
  state: Cloudflare.state(),
}, Effect.gen(function* () {
  const api = yield* Api;
  return { url: api.url.as<string>() };
}));
```

Frontend stack:

```ts
// apps/web/alchemy.run.ts
import * as Alchemy from "alchemy";
import * as Cloudflare from "alchemy/Cloudflare";
import * as Effect from "effect/Effect";
import { Path } from "effect/Path";
import { Backend } from "@example/api/stack";

export default Alchemy.Stack("Frontend", {
  providers: Cloudflare.providers(),
  state: Cloudflare.state(),
}, Effect.gen(function* () {
  const backend = yield* Backend;
  const path = yield* Path;
  const web = yield* Cloudflare.Website.Vite("Web", {
    rootDir: path.resolve(import.meta.dirname),
    env: { VITE_API_URL: backend.url },
    memo: { include: ["**/*", "../../packages/contracts/src/**"], lockfile: true },
  });
  return { url: web.url };
}));
```

These three blocks are a **separate multi-stack composition example**, not files to drop unchanged beside the single-stack fixture. Add the `./stack` export to the backend manifest, declare `@example/api: workspace:*` in the frontend package for its plan-time import, and adapt database migration paths to the chosen invocation directory. Do not keep deploying both root and package stacks over the same intended physical data.

```sh
# After configuring and authorizing these independent stacks:
pnpm --filter @example/api exec alchemy deploy --stage pr-42
pnpm --filter @example/web exec alchemy deploy --stage pr-42
# Cleanup reverses dependency order; use the preview guard before actual destroy.
pnpm --filter @example/web exec alchemy destroy --stage pr-42
pnpm --filter @example/api exec alchemy destroy --stage pr-42
```

`yield* Backend` selects the same stage. `yield* Backend.stage.staging` deliberately selects a shared stage. Never silently fall back to production when the matching producer does not exist. Use the same intended state backend/account/profile resolution across readers and writers; a matching stage name alone does not identify the right environment.

`.as<string>()` above follows the upstream typed-handle example; it is not runtime validation and must not be used to conceal an actually optional/missing URL. Confirm the host exposes a public URL when that is the contract.

## Shared databases, previews, and CI

A preview branch is a database boundary only if its actual data, schema, credentials, and deletion behavior are isolated as intended. A preview Worker stage pointing at production is not isolated storage. Put a long-lived database owner in a shared stack and let preview stacks own only their disposable branches/credentials when that suits the provider.

Keep migration concurrency keyed by physical database, not just by app stack/stage: two different stacks can still target one database. Prevent preview cleanup from deleting the long-lived parent. Do not assume there is a universal provider-independent branch API.

Root CI should install the reviewed lockfile, run affected package checks plus dependent builds, validate/gate migrations, and deploy the right graph. Do not combine `pnpm -r` with deployment scripts accidentally so every package deploys. In a multi-stack pipeline, encode producer-before-consumer deployment and reverse cleanup, and serialize writers for each shared resource.

## Verification gates

Verify package exports in both typechecking and the actual browser/server build. Check root and package working directories, shared-source and lockfile invalidation, one migration owner per database, no provider/driver/secret in browser bundles, resource identity stability during moves, and same-stage/missing-stage references. A local link check is not evidence of any of these behaviors.

## Sources

- [Single-stack guide](https://alchemy.run/project-structure/monorepo-single-stack/)
- [Multi-stack guide](https://alchemy.run/project-structure/monorepo-multi-stack/)
- [Pinned Vite implementation](https://github.com/alchemy-run/alchemy/blob/fbe6ece368c6898234592e897d852bb47b88ebb1/packages/alchemy/src/Cloudflare/Website/Vite.ts)
- [Pinned workspace catalog](https://github.com/alchemy-run/alchemy/blob/fbe6ece368c6898234592e897d852bb47b88ebb1/pnpm-workspace.yaml)
- [References](https://alchemy.run/infrastructure-as-code/references/)
- [Drizzle migration ownership](https://alchemy.run/sql/drizzle/migrations/)

Expanded 9 October 2026 against Alchemy `2.0.0-beta.81`. The single-stack fixture and the multi-stack excerpts have different validation status; see the [iteration checklist](iteration-checklist.md).

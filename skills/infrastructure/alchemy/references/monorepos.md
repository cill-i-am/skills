# Monorepos

Use this file for pnpm workspace Alchemy projects with multiple packages such as `apps/web`, `apps/api`, `packages/db`, or `packages/shared`.

## Contents

- Decision rule
- pnpm workspace layout
- Shared backend/client package pattern
- Single-stack root deployment
- Multi-stack package deployment
- Stage and state behavior
- CI and commands
- Monorepo gotchas

## Decision Rule

Start with a single root stack. Split into multiple stacks only when package ownership, deploy cadence, or blast-radius requirements justify the reference overhead.

Use single-stack when:

- One team owns the app.
- Frontend and backend ship together.
- A single `deploy`/`destroy` per stage is acceptable.
- The project is early or still changing quickly.
- The frontend only needs the backend URL and does not need an independently deployed backend.

Use multi-stack when:

- Backend and frontend deploy on different schedules.
- The backend has consumers beyond one frontend.
- You need to destroy or redeploy the frontend without touching the backend.
- Different teams own package-level CI.
- You are comfortable with deploy ordering and cross-stack reference failures.

## pnpm Workspace Layout

Use pnpm workspaces at the repo root.

```yaml
# pnpm-workspace.yaml
packages:
  - "apps/*"
  - "packages/*"
```

Typical layout:

```txt
.
|-- alchemy.run.ts
|-- package.json
|-- pnpm-lock.yaml
|-- pnpm-workspace.yaml
|-- apps/
|   |-- api/
|   `-- web/
`-- packages/
    |-- db/
    `-- shared/
```

Root `package.json`:

```json
{
  "name": "my-monorepo",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "pnpm -r build",
    "check": "pnpm -r check",
    "deploy": "pnpm exec alchemy deploy",
    "dev": "pnpm exec alchemy dev",
    "destroy": "pnpm exec alchemy destroy",
    "plan": "pnpm exec alchemy plan",
    "test": "pnpm -r test"
  },
  "devDependencies": {
    "alchemy": "latest",
    "typescript": "latest",
    "vitest": "latest"
  }
}
```

Workspace packages should reference each other with `workspace:*`:

```json
{
  "dependencies": {
    "@acme/api": "workspace:*",
    "@acme/shared": "workspace:*",
    "effect": "latest"
  }
}
```

Do not add Bun-specific package conditions, scripts, or test runners unless the existing repo already uses Bun.

## Shared Backend/Client Package Pattern

For a backend package that exposes both server infrastructure and a browser-safe client, split exports carefully.

```txt
apps/api/src/
|-- Client.ts
|-- Service.ts
|-- Spec.ts
|-- Stack.ts
`-- index.ts
```

- `Spec.ts`: pure Effect HTTP API schema shared by server and browser.
- `Client.ts`: browser-safe runtime client.
- `Service.ts`: Cloudflare Worker, server-only.
- `Stack.ts`: typed Alchemy stack handle, server/plan-time only.
- `index.ts`: server/plan-time barrel, not a browser import target.

Package exports for source-first pnpm workspaces:

```json
{
  "name": "@acme/api",
  "private": true,
  "type": "module",
  "exports": {
    ".": {
      "types": "./src/index.ts",
      "import": "./src/index.ts"
    },
    "./Client": {
      "types": "./src/Client.ts",
      "import": "./src/Client.ts"
    }
  },
  "dependencies": {
    "alchemy": "workspace:*",
    "effect": "latest"
  }
}
```

If the repo emits `lib/`, point exports at `lib` and run `pnpm -r build` before `pnpm exec alchemy deploy`.

Browser rule: frontend code imports only the client subpath:

```ts
import { BackendClient } from "@acme/api/Client";
```

Do not import the backend barrel from browser code:

```ts
// Avoid in frontend bundles. This can pull Stack/Worker/server-only modules.
import { BackendClient } from "@acme/api";
```

## Single-Stack Root Deployment

This is the default for most monorepos. Put `alchemy.run.ts` at the workspace root and deploy packages as siblings in one graph.

```ts
// alchemy.run.ts
import * as Alchemy from "alchemy";
import * as Cloudflare from "alchemy/Cloudflare";
import * as Effect from "effect/Effect";
import { Path } from "effect/Path";
import Api from "./apps/api/src/Service.ts";

export default Alchemy.Stack(
  "App",
  {
    providers: Cloudflare.providers(),
    state: Cloudflare.state(),
  },
  Effect.gen(function* () {
    const api = yield* Api;
    const path = yield* Path;

    const web = yield* Cloudflare.Vite("Web", {
      rootDir: path.resolve(import.meta.dirname, "apps/web"),
      env: {
        VITE_API_URL: api.url.as<string>(),
      },
    });

    return {
      apiUrl: api.url.as<string>(),
      webUrl: web.url.as<string>(),
    };
  }),
);
```

Why this works well:

- One plan and one state graph per stage.
- Direct `Output<string>` wiring between backend and frontend.
- Alchemy builds the frontend after the backend URL resolves.
- `Cloudflare.Vite.rootDir` lets a root stack build a package-local Vite app.
- Destroying the stage removes the whole app together.

Commands:

```sh
pnpm exec alchemy plan --stage pr-147
pnpm exec alchemy deploy --stage pr-147
pnpm exec alchemy destroy --stage pr-147
```

## Multi-Stack Package Deployment

Use this only when packages need separate deploy lifecycles. Each package owns an `alchemy.run.ts`, and downstream stacks reference upstream stack outputs from state.

Backend stack handle:

```ts
// apps/api/src/Stack.ts
import * as Alchemy from "alchemy";

export class Backend extends Alchemy.Stack<
  Backend,
  {
    url: string;
  }
>()("Backend") {}
```

Export the handle from the package barrel for plan-time consumers:

```ts
// apps/api/src/index.ts
export * from "./Client.ts";
export * from "./Spec.ts";
export * from "./Stack.ts";
```

Backend `alchemy.run.ts`:

```ts
// apps/api/alchemy.run.ts
import * as Cloudflare from "alchemy/Cloudflare";
import * as Effect from "effect/Effect";
import Service from "./src/Service.ts";
import { Backend } from "./src/Stack.ts";

export default Backend.make(
  {
    providers: Cloudflare.providers(),
    state: Cloudflare.state(),
  },
  Effect.gen(function* () {
    const api = yield* Service;
    return {
      url: api.url.as<string>(),
    };
  }),
);
```

Frontend `alchemy.run.ts`:

```ts
// apps/web/alchemy.run.ts
import * as Alchemy from "alchemy";
import * as Cloudflare from "alchemy/Cloudflare";
import { Backend } from "@acme/api";
import * as Effect from "effect/Effect";

export default Alchemy.Stack(
  "Frontend",
  {
    providers: Cloudflare.providers(),
    state: Cloudflare.state(),
  },
  Effect.gen(function* () {
    const backend = yield* Backend;

    const web = yield* Cloudflare.Vite("Web", {
      env: {
        VITE_API_URL: backend.url,
      },
    });

    return {
      url: web.url.as<string>(),
    };
  }),
);
```

Deploy backend first, then frontend, with matching stages:

```sh
pnpm --filter @acme/api exec alchemy deploy --stage pr-147
pnpm --filter @acme/web exec alchemy deploy --stage pr-147
```

Destroy in reverse:

```sh
pnpm --filter @acme/web exec alchemy destroy --stage pr-147
pnpm --filter @acme/api exec alchemy destroy --stage pr-147
```

`yield* Backend` resolves the backend stack output in the same stage as the frontend. If the backend was not deployed to that stage, planning fails with a reference error.

Pin a frontend to a specific backend stage only when stage symmetry is intentionally broken:

```ts
const backend = yield* Backend.stage.prod;
const sharedDevBackend = yield* Backend.stage.dev_shared;
const prBackend = yield* Backend.stage["pr-42"];
```

## Stage And State Behavior

- Single-stack: one stack name, one state graph per stage, direct graph edges between packages.
- Multi-stack: one state graph per stack per stage; references are state lookups, not resources.
- `yield* Backend` means "same stage"; `Backend.stage.prod` means "pinned stage".
- References do not create upstream resources. Deploy upstream first.
- Deleting a frontend stack does not delete a referenced backend stack.
- Deleting a single-stack root stack deletes backend and frontend together.

## CI And Commands

Single-stack CI:

```yaml
- run: pnpm install --frozen-lockfile
- run: pnpm -r build
- run: pnpm exec alchemy deploy --stage ${{ env.STAGE }}
```

Multi-stack CI:

```yaml
- run: pnpm install --frozen-lockfile
- run: pnpm -r build
- run: pnpm --filter @acme/api exec alchemy deploy --stage ${{ env.STAGE }}
- run: pnpm --filter @acme/web exec alchemy deploy --stage ${{ env.STAGE }}
```

Multi-stack cleanup should reverse dependency order and guard prod:

```yaml
- run: |
    if [ "${{ env.STAGE }}" = "prod" ]; then
      echo "ERROR: refusing to destroy prod"
      exit 1
    fi
- run: pnpm --filter @acme/web exec alchemy destroy --stage ${{ env.STAGE }}
- run: pnpm --filter @acme/api exec alchemy destroy --stage ${{ env.STAGE }}
```

## Monorepo Gotchas

- Prefer single-stack until there is a concrete reason to split.
- Do not split stacks merely because packages live in separate folders.
- Keep stack names stable. In multi-stack, the typed handle name must match the deployed stack name.
- Keep package names stable if downstream imports use package names.
- Never let frontend bundles import Worker, Stack, provider, or database modules.
- Put browser-safe clients behind subpath exports like `@acme/api/Client`.
- Use `Cloudflare.Vite.rootDir` when a root stack builds a package-local frontend.
- Run package builds before deploy if exports point at emitted `lib`.
- Use `pnpm --filter` for package-level stack commands.
- In multi-stack, deploy upstream dependencies first and destroy downstream dependents first.
- Treat cross-stack references as state reads. Missing stage, wrong stack name, wrong profile, or wrong state backend all break resolution.
- Keep CI stage computation identical across stacks, or same-stage references will miss.
- Avoid local `.alchemy/` state in team monorepos; use `Cloudflare.state()`.
- In PR previews, decide whether PR frontend references a PR backend, shared dev backend, or prod backend. Encode that choice explicitly.

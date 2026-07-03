---
name: tanstack-routing
description: TanStack Start routing layer. Use for file routes, root route setup, loaders, beforeLoad, router context, TanStack Query SSR preloading, search/path params, navigation, code splitting, server functions/routes, middleware, SSR, hydration, or deployment behavior.
---

# TanStack Routing

This is a thin project-local routing layer over the official TanStack skills bundled with the installed packages. Start with the nearest app `AGENTS.md` when present, then use the routing table to pick the relevant TanStack reference for the task.

## Authority Order

1. Nearest app or package `AGENTS.md`.
2. Official TanStack skills bundled in `node_modules`.
3. This skill's repo rules.
4. Existing code patterns in the target app.

If the bundled TanStack skills are unavailable after install, stop and report the
environment issue instead of inventing framework guidance.

## Resolve Bundled Skills

From the repo root, list available bundled TanStack skills with:

```sh
find node_modules/.pnpm -path '*@tanstack*skills*SKILL.md' | sort
```

Resolve one specific skill with a narrow pattern:

```sh
find node_modules/.pnpm -path '*@tanstack+router-core*/node_modules/@tanstack/router-core/skills/router-core/data-loading/SKILL.md' -print -quit
```

If no matching skill exists, run `pnpm install` and try again. Missing bundled skills are an environment setup issue, not a reason to invent framework guidance.

## Routing Table

Read the smallest set that matches the task:

| Task | Official skill(s) to read |
| --- | --- |
| TanStack Start app setup, root document, client/server entrypoints, React Start imports | `@tanstack/react-start/skills/react-start/SKILL.md` |
| Server functions, typed RPC-like calls, validators, client/server split | `@tanstack/start-client-core/skills/start-core/server-functions/SKILL.md` |
| Server routes, HTTP method handlers, raw `Request`/`Response` work | `@tanstack/start-client-core/skills/start-core/server-routes/SKILL.md` |
| Middleware, request context, function middleware, auth context | `@tanstack/start-client-core/skills/start-core/middleware/SKILL.md` |
| Isomorphic execution, server-only logic, runtime env reads | `@tanstack/start-client-core/skills/start-core/execution-model/SKILL.md` |
| Route loaders, `beforeLoad`, router context, pending states, cache timing | `@tanstack/router-core/skills/router-core/data-loading/SKILL.md` |
| SSR, hydration, router/query server integration | `@tanstack/router-core/skills/router-core/ssr/SKILL.md` |
| Type inference, params/search typing, route API usage | `@tanstack/router-core/skills/router-core/type-safety/SKILL.md` |
| Search params or path params | `@tanstack/router-core/skills/router-core/search-params/SKILL.md` or `path-params/SKILL.md` |
| Navigation, links, redirects | `@tanstack/router-core/skills/router-core/navigation/SKILL.md` |
| Not found and error boundaries | `@tanstack/router-core/skills/router-core/not-found-and-errors/SKILL.md` |
| Route code splitting and lazy route modules | `@tanstack/router-core/skills/router-core/code-splitting/SKILL.md` and `@tanstack/router-plugin/skills/router-plugin/SKILL.md` |
| Start deployment behavior | `@tanstack/start-client-core/skills/start-core/deployment/SKILL.md` |
| Migration from another React meta-framework | `@tanstack/react-start/skills/lifecycle/migrate-from-nextjs/SKILL.md` only when explicitly migrating |

## Repo Rules

- Keep TanStack Start routing, loaders, server functions, and app-shell wiring inside the owning app, commonly `apps/app` in this bundle's default monorepo shape.
- Move reusable domain logic, API contracts, schemas, and shared client helpers to `packages/*` when more than one app needs them.
- Treat loaders as isomorphic. Do server-only work through server functions, server routes, or server-only helpers described by the official Start skills.
- Prefer TanStack Query for client-visible server state. Create the `QueryClient` in router setup, preload with `queryClient.ensureQueryData` in loaders, and read with `useSuspenseQuery` in components.
- Keep loader prefetch narrow: call `ensureQueryData` for critical data, but do not return that same data from the loader when the component reads it from TanStack Query.
- Use route `beforeLoad` for navigation decisions and context setup only when it
  can run correctly in every execution environment that may hit the route.
  Direct-load SSR must not misclassify authenticated or runtime-dependent users.
- Keep route/server-function payloads plain and serializable. Parse boundary values with Effect Schema, carry branded/domain types inward, and do not serialize resources, clients, schema objects, or rich errors through router data.
- Read runtime config on the TanStack Start server side when values may change without a rebuild. Expose only the public subset to the browser.
- Use Effect HttpApi for the API app. Do not grow the web app's server routes into a separate ad hoc backend unless the route is genuinely a web-app boundary concern.
- Do not introduce Next, Remix, SvelteKit, or build-time `VITE_*` public config patterns unless the user explicitly asks for a framework/topology change.

Completion criterion: the selected official skill files were read, the route
change keeps loader data serializable, server-only work stays on a server
boundary, and SSR/direct-load behavior is explicitly considered when auth,
cookies, runtime config, or deployment bindings are involved.

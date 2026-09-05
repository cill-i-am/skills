---
name: tanstack-routing
description: Change TanStack Start routes, loaders, server boundaries, or SSR behaviour.
---

# TanStack Routing

Use the installed packages' declarations, source, and bundled skills when framework behaviour is uncertain. Locate bundled guides with a narrow search under `node_modules/@tanstack` or `node_modules/.pnpm`; their exact paths vary by installation. Missing skill files alone are not a blocker: use installed source and current official documentation. Install dependencies only when the task actually needs them.

Useful bundled guide topics:

| Task                                   | Guide under the owning TanStack package                      |
| -------------------------------------- | ------------------------------------------------------------ |
| Start setup and entrypoints            | `react-start`                                                |
| Server functions, routes, middleware   | `start-core/server-functions`, `server-routes`, `middleware` |
| Server/client execution and deployment | `start-core/execution-model`, `deployment`                   |
| Loaders, context, pending states       | `router-core/data-loading`                                   |
| SSR and hydration                      | `router-core/ssr`                                            |
| Params, search, inference              | `router-core/type-safety`, `search-params`, `path-params`    |
| Links, redirects, errors               | `router-core/navigation`, `not-found-and-errors`             |
| Lazy routes and splitting              | `router-core/code-splitting`, `router-plugin`                |

## Project boundaries

Keep route wiring in the owning web app and domain/API authority in its established owner. Loaders can run on client and server; keep server-only work behind the proper server boundary. Protected server functions/routes need their own authorization.

When the application uses TanStack Query, use the router's QueryClient for client-visible server state, preload required queries with `ensureQueryData`, and read the same queries in components. Avoid returning duplicate loader data when Query owns it. Parse params/search and API inputs at their owning boundaries; keep serialized data free of resources, clients, private config, and rich runtime objects.

Use server-side runtime config for deployment values that must change without rebuilding; expose only the public projection. When a separate API service owns domain operations, preserve that ownership; use web server functions/routes for their actual application-boundary responsibilities.

When auth, cookies, config, or hydration changes, check direct-load SSR as well as client navigation. Choose other checks according to the actual change.

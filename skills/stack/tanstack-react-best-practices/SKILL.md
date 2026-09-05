---
name: tanstack-react-best-practices
description: Diagnose React rendering, hydration, data-fetching, or bundle performance in TanStack apps.
---

# React Performance

Use these examples for a measured problem or a credible hot path, not as a checklist for every component edit. A rule's “incorrect” example may be acceptable outside its stated performance context. Prefer simpler code when an optimization has no meaningful benefit.

Keep request/user data out of module state, use bounded appropriately keyed caches, and authorize protected server operations. Use TanStack Query/Router for their owned data lifecycles. Local component state and effects remain appropriate for state or external synchronization they actually own.

For framework mechanics, use [tanstack-routing](../tanstack-routing/SKILL.md). For a performance question, search the relevant prefix under `rules/` and read only the matching examples:

| Concern                                         | Rule prefix  |
| ----------------------------------------------- | ------------ |
| Request waterfalls and independent I/O          | `async-`     |
| Heavy bundles and import splitting              | `bundle-`    |
| Server caches, serialization, request isolation | `server-`    |
| Shared client requests and subscriptions        | `client-`    |
| Expensive rerenders and derived state           | `rerender-`  |
| Rendering, hydration, and resource hints        | `rendering-` |
| Measured JavaScript hot paths                   | `js-`        |
| Effect Events and callback lifetimes            | `advanced-`  |

Use installed React/TanStack APIs and verify version-sensitive advice. Keep cancellation and concurrency bounded where needed; examples using native Promises do not override Effect ownership in backend workflows. Confirm the optimization addresses the original problem without broadening scope.

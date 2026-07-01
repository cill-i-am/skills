---
title: Prevent Waterfall Chains in Server Boundaries
impact: CRITICAL
impactDescription: 2-10x improvement
tags: server-functions, server-routes, waterfalls, parallelization
---

## Prevent Waterfall Chains in Server Boundaries

In TanStack Start server functions and server routes, start independent operations immediately, even when one result is only needed later.

**Incorrect (config waits for auth, data waits for both):**

```typescript
export const getDashboard = createServerFn({ method: "GET" }).handler(
  async () => {
    const session = await auth()
    const config = await loadPublicConfig()
    const dashboard = await loadDashboard(session.user.id)

    return { config, dashboard }
  },
)
```

**Correct (auth and config start immediately):**

```typescript
export const getDashboard = createServerFn({ method: "GET" }).handler(
  async () => {
    const sessionPromise = auth()
    const configPromise = loadPublicConfig()

    const session = await sessionPromise
    const [config, dashboard] = await Promise.all([
      configPromise,
      loadDashboard(session.user.id),
    ])

    return { config, dashboard }
  },
)
```

For more complex dependency chains, use `better-all` or an Effect program that makes dependencies explicit.

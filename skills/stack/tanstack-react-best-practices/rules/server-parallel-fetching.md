---
title: Parallel Server Data Fetching
impact: CRITICAL
impactDescription: eliminates server-side waterfalls
tags: server, loaders, server-functions, parallel-fetching, tanstack-start
---

## Parallel Server Data Fetching

Structure route loaders and server functions so independent server work starts in parallel. Avoid making one query wait for another unless it depends on the result.

**Incorrect (sidebar waits for header):**

```typescript
export const Route = createFileRoute("/dashboard")({
  loader: async () => {
    const header = await fetchHeader()
    const sidebar = await fetchSidebarItems()

    return { header, sidebar }
  },
})
```

**Correct (independent work starts together):**

```typescript
export const Route = createFileRoute("/dashboard")({
  loader: async () => {
    const [header, sidebar] = await Promise.all([
      fetchHeader(),
      fetchSidebarItems(),
    ])

    return { header, sidebar }
  },
})
```

**Correct with TanStack Query preloading:**

```typescript
export const Route = createFileRoute("/dashboard")({
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(headerQueryOptions),
      context.queryClient.ensureQueryData(sidebarQueryOptions),
    ])
  },
})
```

Use dependency-aware orchestration, such as `better-all` or an explicit Effect program, when only part of the graph is independent.

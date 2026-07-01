---
title: Avoid Shared Module State for Request Data
impact: HIGH
impactDescription: prevents concurrency bugs and request data leaks
tags: server, ssr, concurrency, security, state, tanstack-start
---

## Avoid Shared Module State for Request Data

In TanStack Start SSR, server functions, server routes, and worker code, module scope is shared by more than one request over the lifetime of the process or worker isolate. Never store request-scoped or user-scoped mutable data there.

**Incorrect (request data can leak across concurrent renders):**

```tsx
let currentUser: User | undefined

export const Route = createFileRoute("/dashboard")({
  loader: async () => {
    currentUser = await requireUser()
  },
  component: Dashboard,
})

function Dashboard() {
  return <div>{currentUser?.name}</div>
}
```

**Correct (keep request data in loader/query/component state):**

```tsx
export const Route = createFileRoute("/dashboard")({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(currentUserQueryOptions)
  },
  component: Dashboard,
})

function Dashboard() {
  const { data: currentUser } = useSuspenseQuery(currentUserQueryOptions)
  return <div>{currentUser.name}</div>
}
```

Safe exceptions:

- Immutable static assets or config loaded once at module scope.
- Shared caches intentionally designed for cross-request reuse and keyed correctly.
- Process-wide singletons that do not store request- or user-specific mutable data.

For static assets and config, see [Hoist Static I/O to Module Level](./server-hoist-static-io.md).

---
title: Avoid Duplicate Serialized Data
impact: LOW
impactDescription: reduces payload size and hydration work
tags: server, serialization, loaders, server-functions, tanstack-query
---

## Avoid Duplicate Serialized Data

TanStack Start loaders, server functions, and query dehydration can all send data from the server to the browser. Avoid sending the same meaningful data multiple ways.

**Incorrect (same list appears twice):**

```tsx
export const Route = createFileRoute("/")({
  loader: async ({ context }) => {
    const users = await context.queryClient.ensureQueryData(usersQueryOptions)
    return {
      users,
      sortedUsers: users.toSorted((a, b) => a.name.localeCompare(b.name)),
    }
  },
  component: UsersPage,
})
```

**Correct (send once, derive in the component):**

```tsx
export const Route = createFileRoute("/")({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(usersQueryOptions)
  },
  component: UsersPage,
})

function UsersPage() {
  const { data: users } = useSuspenseQuery(usersQueryOptions)
  const sortedUsers = useMemo(
    () => users.toSorted((a, b) => a.name.localeCompare(b.name)),
    [users],
  )

  return <UserList users={sortedUsers} />
}
```

Operations that often duplicate payloads: `.toSorted()`, `.filter()`, `.map()`, object spreading, `structuredClone`, and returning loader data already present in a dehydrated query cache.

Exception: send derived data when the derivation is expensive, security-sensitive, or requires server-only dependencies.

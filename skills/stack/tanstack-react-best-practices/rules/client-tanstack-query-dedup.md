---
title: Use TanStack Query for Client Request Deduplication
impact: MEDIUM-HIGH
impactDescription: shared cache, request deduplication, retries, and revalidation
tags: client, tanstack-query, deduplication, data-fetching
---

## Use TanStack Query for Client Request Deduplication

Use TanStack Query for client-visible server data that needs cache sharing, request deduplication, retries, stale times, or refetch intervals. Keep query options in reusable factories when inputs are typed domain values.

**Incorrect (each instance fetches independently):**

```tsx
function UserList() {
  const [users, setUsers] = useState<ReadonlyArray<User>>([])

  useEffect(() => {
    fetch("/api/users")
      .then((response) => response.json())
      .then(setUsers)
  }, [])

  return <Users users={users} />
}
```

**Correct (query key, typed fetcher, shared cache):**

```tsx
export const usersQueryOptions = queryOptions({
  queryKey: ["users"] as const,
  queryFn: fetchUsers,
  retry: 2,
  staleTime: 60_000,
})

function UserList() {
  const { data: users } = useSuspenseQuery(usersQueryOptions)
  return <Users users={users} />
}
```

**Correct (server preloads the same query):**

```tsx
export const Route = createFileRoute("/users")({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(usersQueryOptions)
  },
  component: UserList,
})
```

For runtime public config or health checks, use a `refetchInterval` that matches the server cache TTL.

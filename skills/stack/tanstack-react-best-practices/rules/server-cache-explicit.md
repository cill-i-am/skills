---
title: Use Explicit Server-Side Deduplication
impact: MEDIUM
impactDescription: deduplicates repeated server work without framework magic
tags: server, cache, deduplication, tanstack-start, effect
---

## Use Explicit Server-Side Deduplication

Do not assume a framework will deduplicate server-side work for you. In TanStack Start, make request-local and source-level caching explicit.

Use request-local memoization when repeated work is only safe within one request.

**Incorrect (same lookup can run several times):**

```typescript
async function loadDashboard(userId: UserId) {
  const profile = await getUserProfile(userId)
  const permissions = await getUserPermissions(userId)
  const header = await getUserProfile(userId)

  return { header, permissions, profile }
}
```

**Correct (request-local cache is created inside the boundary):**

```typescript
function makeRequestCache() {
  const userProfiles = new Map<UserId, Promise<UserProfile>>()

  return {
    getUserProfile: (userId: UserId) => {
      const existing = userProfiles.get(userId)
      if (existing) return existing

      const next = getUserProfile(userId)
      userProfiles.set(userId, next)
      return next
    },
  }
}

export const getDashboard = createServerFn({ method: "GET" }).handler(
  async () => {
    const session = await requireSession()
    const requestCache = makeRequestCache()

    const [profile, permissions, header] = await Promise.all([
      requestCache.getUserProfile(session.user.id),
      getUserPermissions(session.user.id),
      requestCache.getUserProfile(session.user.id),
    ])

    return { header, permissions, profile }
  },
)
```

Use source-level caches for shared, non-secret data that is safe across requests, such as public config, feature flag metadata, and static reference data. When Effect is part of the project, prefer Effect cache utilities or a small bounded cache with a TTL.

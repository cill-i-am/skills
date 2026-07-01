---
title: Minimize Serialization at Server-Client Boundaries
impact: HIGH
impactDescription: reduces data transfer and hydration size
tags: server, serialization, server-functions, loaders, tanstack-query
---

## Minimize Serialization at Server-Client Boundaries

Only send fields the browser actually needs. This applies to TanStack Start loaders, server functions, server routes returning JSON, and dehydrated TanStack Query data.

**Incorrect (serializes the full record):**

```typescript
export const getProfile = createServerFn({ method: "GET" }).handler(
  async () => {
    const session = await requireSession()
    return db.user.findUniqueOrThrow({ where: { id: session.user.id } })
  },
)
```

**Correct (return a small DTO parsed at the boundary):**

```typescript
export const getProfile = createServerFn({ method: "GET" }).handler(
  async () => {
    const session = await requireSession()
    const user = await db.user.findUniqueOrThrow({
      where: { id: session.user.id },
      select: { displayName: true, avatarUrl: true },
    })

    return parsePublicProfile(user)
  },
)
```

Do not send secrets, internal IDs, permission maps, or implementation details just because they were already loaded server-side.

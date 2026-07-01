---
title: Authenticate Server Boundaries
impact: CRITICAL
impactDescription: prevents unauthorized access to server reads and mutations
tags: server, server-functions, server-routes, authentication, authorization
---

## Authenticate Server Boundaries

TanStack Start server functions and server routes are public HTTP endpoints. Always validate input and check authentication/authorization inside the handler or in attached middleware. Client-side route guards are not enough.

**Incorrect (trusts the caller):**

```typescript
export const deleteUser = createServerFn({ method: "POST" })
  .validator((userId: unknown) => parseUserId(userId))
  .handler(async ({ data: userId }) => {
    await db.user.delete({ where: { id: userId } })
    return { success: true }
  })
```

**Correct (validates, authenticates, and authorizes at the server boundary):**

```typescript
export const deleteUser = createServerFn({ method: "POST" })
  .validator((userId: unknown) => parseUserId(userId))
  .handler(async ({ data: userId }) => {
    const session = await requireSession()

    if (session.user.role !== "admin" && session.user.id !== userId) {
      throw new Response("Forbidden", { status: 403 })
    }

    await db.user.delete({ where: { id: userId } })
    return { success: true }
  })
```

**Correct (shared auth via middleware):**

```typescript
const authMiddleware = createMiddleware({ type: "function" }).server(
  async ({ next, request }) => {
    const session = await requireSession(request.headers)

    return next({
      context: { session },
    })
  },
)

export const updateProfile = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => parseUpdateProfile(input))
  .handler(async ({ context, data }) => {
    if (context.session.user.id !== data.userId) {
      throw new Response("Forbidden", { status: 403 })
    }

    return updateUserProfile(data)
  })
```

Validation proves shape. Authorization proves permission. Do both.

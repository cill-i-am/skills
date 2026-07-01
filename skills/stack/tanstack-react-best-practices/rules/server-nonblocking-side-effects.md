---
title: Use Platform Background Work for Non-Critical Side Effects
impact: MEDIUM
impactDescription: faster response times without losing important work
tags: server, async, logging, analytics, side-effects, cloudflare
---

## Use Platform Background Work for Non-Critical Side Effects

Do not block the response on analytics, audit logs, notifications, or cleanup unless the user-visible result depends on them. Use a platform-supported background primitive.

**Incorrect (logging blocks the response):**

```typescript
export const updateProfile = createServerFn({ method: "POST" })
  .validator((input: unknown) => parseUpdateProfile(input))
  .handler(async ({ data }) => {
    const profile = await saveProfile(data)
    await writeAuditLog({ action: "profile.updated", userId: profile.userId })

    return profile
  })
```

**Correct (critical mutation completes, non-critical work is scheduled):**

```typescript
export const updateProfile = createServerFn({ method: "POST" })
  .validator((input: unknown) => parseUpdateProfile(input))
  .handler(async ({ data, context }) => {
    const profile = await saveProfile(data)

    context.waitUntil?.(
      writeAuditLog({ action: "profile.updated", userId: profile.userId }),
    )

    return profile
  })
```

For work that must be durable or retried, use a queue, workflow, or durable background pipeline instead of an in-memory promise.

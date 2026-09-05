---
title: Parallelize Independent Work
impact: HIGH
impactDescription: removes unnecessary waiting where independent work exists
tags: async, parallelization, dependencies
---

## Parallelize independent work

Start independent asynchronous work together. A dependent operation can begin as soon as its own prerequisite resolves; it need not wait for unrelated work.

```typescript
const userPromise = fetchUser();
const profilePromise = userPromise.then((user) => fetchProfile(user.id));
const [user, config, profile] = await Promise.all([userPromise, fetchConfig(), profilePromise]);
```

Keep error handling and cancellation ownership explicit. In Effect-owned code, use the appropriate Effect concurrency combinators. Use existing language/runtime tools before introducing a dependency to schedule a small task graph. Sequential execution remains correct when operations share mutable state or depend on order.

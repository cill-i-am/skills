---
title: Check Cheap Conditions Before Async Flags
impact: HIGH
impactDescription: avoids unnecessary async work when a synchronous guard already fails
tags: async, await, feature-flags, short-circuit, conditional
---

## Check Cheap Conditions Before Async Flags

When a branch uses `await` for a flag or remote value and also requires a cheap synchronous condition, evaluate the cheap condition first. Otherwise you pay for the async call even when the compound condition can never be true.

This is a specialization of [Defer Await Until Needed](./async-defer-await.md) for `flag && cheapCondition` checks.

**Incorrect:**

```typescript
const enabled = await getFeatureFlag()

if (enabled && request.method === "POST") {
  await writeAuditLog()
}
```

**Correct:**

```typescript
if (request.method === "POST") {
  const enabled = await getFeatureFlag()

  if (enabled) {
    await writeAuditLog()
  }
}
```

This matters when the async value hits the network, a feature-flag service, a database, or a cached source read. Skipping it when the cheap condition is false removes that cost on the cold path.

Keep the original order if the condition is expensive, depends on the async result, or side effects must run in a fixed order.

---
title: Suppress Expected Hydration Mismatches
impact: LOW-MEDIUM
impactDescription: avoids noisy hydration warnings for known differences
tags: rendering, hydration, ssr, tanstack-start
---

## Suppress Expected Hydration Mismatches

Some SSR values are intentionally different on server and client, such as local time formatting, randomized visual-only IDs, and browser-only locale details. For these expected mismatches, wrap the dynamic text in an element with `suppressHydrationWarning`.

Do not use this to hide real bugs. Prefer deterministic server/client rendering whenever possible.

**Incorrect (known mismatch warning):**

```tsx
function Timestamp() {
  return <span>{new Date().toLocaleString()}</span>
}
```

**Correct (suppress expected mismatch only):**

```tsx
function Timestamp() {
  return (
    <span suppressHydrationWarning>
      {new Date().toLocaleString()}
    </span>
  )
}
```

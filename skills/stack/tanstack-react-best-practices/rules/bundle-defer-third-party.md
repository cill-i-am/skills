---
title: Defer Non-Critical Third-Party Libraries
impact: MEDIUM
impactDescription: loads after hydration
tags: bundle, third-party, analytics, defer
---

## Defer Non-Critical Third-Party Libraries

Analytics, logging, session replay, and monitoring should not block the initial route. Load them after hydration, after consent, or after the interaction that needs them.

**Incorrect (blocks the initial bundle):**

```tsx
import { Analytics } from "@example/analytics-react"

export function RootDocument({ children }: { readonly children: React.ReactNode }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

**Correct (loads after mount):**

```tsx
import { lazy, Suspense } from "react"

const Analytics = lazy(() =>
  import("@example/analytics-react").then((module) => ({
    default: module.Analytics,
  })),
)

export function AnalyticsMount() {
  return (
    <Suspense fallback={null}>
      <Analytics />
    </Suspense>
  )
}
```

Prefer a small local wrapper so the app has one place to gate consent, sampling, environment checks, and route tracking.

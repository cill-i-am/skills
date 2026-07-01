---
title: Strategic Suspense Boundaries
impact: HIGH
impactDescription: faster initial paint and better loading states
tags: async, suspense, streaming, layout-shift, tanstack-query
---

## Strategic Suspense Boundaries

Use Suspense boundaries around route regions or lazy components whose data/code can load independently from the surrounding shell. In TanStack Start projects, pair Suspense with TanStack Router pending UI, TanStack Query suspense queries, or `React.lazy`.

**Incorrect (the whole route waits for one panel):**

```tsx
function DashboardPage() {
  const { data } = useSuspenseQuery(dashboardQueryOptions)

  return (
    <DashboardShell>
      <SlowMetricsPanel data={data.metrics} />
    </DashboardShell>
  )
}
```

**Correct (stable shell, focused pending state):**

```tsx
function DashboardPage() {
  return (
    <DashboardShell>
      <Suspense fallback={<MetricsSkeleton />}>
        <MetricsPanel />
      </Suspense>
    </DashboardShell>
  )
}

function MetricsPanel() {
  const { data } = useSuspenseQuery(metricsQueryOptions)
  return <SlowMetricsPanel data={data} />
}
```

Use route `pendingComponent`, `pendingMs`, and `pendingMinMs` when the loading state belongs to navigation rather than an inner panel.

Do not use Suspense just to hide poor data modeling. Keep critical layout data available early and avoid loading states that cause large layout shifts.

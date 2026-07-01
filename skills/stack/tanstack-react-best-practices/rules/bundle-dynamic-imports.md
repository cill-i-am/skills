---
title: Dynamic Imports for Heavy Components
impact: CRITICAL
impactDescription: directly affects TTI and LCP
tags: bundle, dynamic-import, code-splitting, vite, tanstack-router
---

## Dynamic Imports for Heavy Components

Lazy-load large client components that are not needed on the first interaction. In Vite/TanStack projects, use Vite-compatible `import()`, `React.lazy`, and TanStack Router route code splitting.

**Incorrect (Monaco ships in the initial chunk):**

```tsx
import { MonacoEditor } from "./monaco-editor"

function CodePanel({ code }: { readonly code: string }) {
  return <MonacoEditor value={code} />
}
```

**Correct (Monaco loads on demand):**

```tsx
import { lazy, Suspense } from "react"

const MonacoEditor = lazy(() =>
  import("./monaco-editor").then((module) => ({
    default: module.MonacoEditor,
  })),
)

function CodePanel({ code }: { readonly code: string }) {
  return (
    <Suspense fallback={<div>Loading editor...</div>}>
      <MonacoEditor value={code} />
    </Suspense>
  )
}
```

For route-sized chunks, prefer TanStack Router's lazy route and code-splitting conventions instead of ad hoc component-level splitting.

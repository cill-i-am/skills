---
title: Use defer or async on Script Tags
impact: HIGH
impactDescription: eliminates render-blocking scripts
tags: rendering, script, defer, async, performance
---

## Use defer or async on Script Tags

Script tags without `defer` or `async` block HTML parsing while the script downloads and executes. This delays First Contentful Paint and Time to Interactive.

- `defer`: downloads in parallel, executes after HTML parsing completes, and maintains order.
- `async`: downloads in parallel, executes immediately when ready, and does not guarantee order.

Use `defer` for scripts that depend on DOM or other scripts. Use `async` for independent scripts like analytics.

**Incorrect (blocks rendering):**

```tsx
export function Document() {
  return (
    <html>
      <head>
        <script src="https://example.com/analytics.js" />
        <script src="/scripts/utils.js" />
      </head>
      <body>{/* content */}</body>
    </html>
  )
}
```

**Correct (non-blocking):**

```tsx
export function Document() {
  return (
    <html>
      <head>
        <script src="https://example.com/analytics.js" async />
        <script src="/scripts/utils.js" defer />
      </head>
      <body>{/* content */}</body>
    </html>
  )
}
```

In TanStack Start, keep script placement compatible with the root document and `Scripts` component. Do not block the generated client bundle.

Reference: [MDN - Script element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script#defer)

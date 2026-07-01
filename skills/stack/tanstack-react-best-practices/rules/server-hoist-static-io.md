---
title: Hoist Static I/O to Module Level
impact: HIGH
impactDescription: avoids repeated file/network I/O per request
tags: server, io, performance, server-functions, server-routes
---

## Hoist Static I/O to Module Level

When loading immutable static assets or templates in server functions, server routes, or worker code, hoist the I/O operation to module level. Module-level code runs once when the module is first imported in the current process/isolate, not on every request.

**Incorrect (reads template on every request):**

```typescript
import fs from "node:fs/promises"

export async function renderEmail(data: EmailData) {
  const template = await fs.readFile("./templates/welcome.html", "utf-8")
  return applyTemplate(template, data)
}
```

**Correct (starts static I/O once):**

```typescript
import fs from "node:fs/promises"

const welcomeTemplate = fs.readFile("./templates/welcome.html", "utf-8")

export async function renderEmail(data: EmailData) {
  return applyTemplate(await welcomeTemplate, data)
}
```

**Correct (static fetch starts once):**

```typescript
const logoData = fetch(new URL("./assets/logo.png", import.meta.url)).then(
  (response) => response.arrayBuffer(),
)

export async function getLogoBytes() {
  return logoData
}
```

Use this pattern for static fonts, icons, templates, public config files, and reference data that does not change at runtime.

Do not use this pattern for request-specific data, user data, secrets that should not persist in memory, large files that would waste memory, or values that need runtime refresh. Use a bounded TTL cache for refreshable data.

Cloudflare may reuse worker isolates across requests, but reuse is not guaranteed. Treat module-level static I/O as an opportunistic performance optimization.

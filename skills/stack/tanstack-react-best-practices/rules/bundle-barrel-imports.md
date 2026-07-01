---
title: Avoid Expensive Barrel Imports
impact: CRITICAL
impactDescription: faster dev startup, HMR, builds, and cold starts
tags: bundle, imports, tree-shaking, barrel-files, performance, vite
---

## Avoid Expensive Barrel Imports

Import directly from source files when a package barrel loads large dependency graphs. Barrel files are entry points that re-export many modules, such as an `index.ts` with many `export * from "./module"` lines.

This matters in Vite dev, production builds, and Cloudflare worker cold starts when the toolchain has to parse or evaluate far more code than the app uses.

**Incorrect (imports a broad entry point):**

```tsx
import { Button, TextField } from "@mui/material"
```

**Correct (typed direct imports when the package supports them):**

```tsx
import Button from "@mui/material/Button"
import TextField from "@mui/material/TextField"
```

**Correct (keep barrel import when it is the package's typed public API and the cost is acceptable):**

```tsx
import { Check, Menu, X } from "lucide-react"
```

Before changing imports, verify that the package exposes typed subpaths. Do not deep-import private files or paths that collapse to `any` under strict TypeScript.

For repeated offenders, prefer Vite-compatible import optimization or package-level aliases that preserve types and editor support.

---
title: Prefer Statically Analyzable Paths
impact: HIGH
impactDescription: avoids accidental broad bundles and file traces
tags: bundle, vite, webpack, rollup, esbuild, path
---

## Prefer Statically Analyzable Paths

Build tools work best when import and file-system paths are obvious at build time. If the real path is hidden inside a variable or composed too dynamically, the tool may include a broad set of possible files, warn that it cannot analyze the import, or emit a larger chunk than expected.

Prefer explicit maps or literal paths so the reachable file set stays narrow and predictable.

**Incorrect (the bundler cannot tell what may be imported):**

```ts
const pageModules = {
  home: "./pages/home",
  settings: "./pages/settings",
} as const

const page = await import(pageModules[pageName])
```

**Correct (use an explicit map of allowed modules):**

```ts
const pageModules = {
  home: () => import("./pages/home"),
  settings: () => import("./pages/settings"),
} as const

const page = await pageModules[pageName]()
```

**Incorrect (a small enum still hides the final file path):**

```ts
const baseDir = path.join(process.cwd(), `content/${contentKind}`)
```

**Correct (make final paths literal at the callsite):**

```ts
const baseDir =
  contentKind === ContentKind.Blog
    ? path.join(process.cwd(), "content/blog")
    : path.join(process.cwd(), "content/docs")
```

Reference: [Vite features](https://vite.dev/guide/features.html), [esbuild API](https://esbuild.github.io/api/), [Rollup dynamic import vars](https://www.npmjs.com/package/@rollup/plugin-dynamic-import-vars), [Webpack dependency management](https://webpack.js.org/guides/dependency-management/)

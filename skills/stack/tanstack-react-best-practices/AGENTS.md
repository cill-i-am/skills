# React Performance Rules for TanStack Start Projects

This compiled index is intentionally shorter than the upstream source. The individual files in `rules/` are the source of detailed examples.

## Stack Contract

- Use TanStack Start for app/server boundaries.
- Use TanStack Router loaders and TanStack Query for data fetching, cache sharing, refetch intervals, retries, and hydration.
- Use Vite/Rollup-compatible dynamic imports and TanStack route code splitting for bundle work.
- Use Cloudflare-supported background execution primitives for work that should outlive the response.
- Keep request-scoped data out of module scope.
- Keep cross-request caches explicit, bounded, non-secret, and keyed by parsed domain values.
- Parse boundary values before carrying them inward.

## High-Impact Rules

- Eliminate waterfalls by starting independent work early and awaiting late.
- Use `Promise.all` or dependency-aware helpers when work is independent or partially independent.
- Avoid broad barrel imports when they slow dev startup, HMR, production bundles, or worker cold starts.
- Keep import paths and file-system paths statically analyzable.
- Lazy-load heavy client components and feature-only code paths.
- Authenticate and authorize every server function and server route that accesses protected data.
- Minimize serialized loader, server function, and query hydration payloads.
- Deduplicate client-visible requests through TanStack Query or Router loader caching.
- Use passive listeners, singleton global subscriptions, and stable callbacks for hot UI paths.
- Suppress hydration warnings only for expected, harmless mismatches.

## Detailed Rules

Read the relevant `rules/*.md` file before editing code. If a rule touches TanStack Start mechanics, read the matching TanStack skill under `node_modules/@tanstack/*/skills` as well.

---
name: tanstack-react-best-practices
description: React performance rules for Vite and TanStack Start. Use when writing, reviewing, refactoring, or optimizing React components, loaders, server functions/routes, serialization, bundle size, hydration, rendering, or TanStack Query data fetching.
---

# React Best Practices for TanStack Start

This skill adapts the Vercel React performance rule catalog to the target stack: Vite, TanStack Start, TanStack Router, TanStack Query, Cloudflare deployment when present, Effect when present, and pnpm.

## Compatibility Rules

- Treat TanStack Start and TanStack Router skills from `node_modules/@tanstack/*/skills` as the authority when a rule touches routing, loaders, server functions, server routes, middleware, SSR, or deployment.
- Use `createServerFn`, `createMiddleware`, and route `server.handlers` for server boundaries.
- Remember that route loaders and most modules are isomorphic by default. Use server functions/routes for server-only work.
- Use TanStack Query or TanStack Router loader caching for client-visible data fetching. Do not add a second client data cache unless the user asks.
- Prefer TanStack Query for server state that is visible to components: create a stable query options factory, preload critical queries in loaders with `ensureQueryData`, and read the same query in components. Do not return duplicate loader data when Query owns it.
- Use Vite/Rollup-compatible dynamic imports, `React.lazy`, TanStack Router route code splitting, and explicit import maps for bundle work.
- Treat server functions and server routes as public HTTP endpoints. Validate input at the boundary and authorize inside the handler or middleware.
- For background work on Cloudflare, prefer platform-supported `waitUntil`, queues, workflows, or a durable async pipeline over fire-and-forget promises.
- Keep cross-request caches explicit, bounded, and non-user-specific unless keyed by a parsed principal. Prefer Effect cache utilities for server-side source caching when Effect is part of the project.
- Avoid request-scoped module state. Module scope may hold immutable config, static assets, or intentionally bounded caches.
- Avoid `useEffect` and `useState` for data derivation, server state, form state, or URL state when TanStack Router, TanStack Query, TanStack Form, render-time derivation, or event handlers own the lifecycle.

## Data Flow Defaults

- Parse route params, search params, server function inputs, server route bodies,
  headers, cookies, env/config, and localStorage before carrying values inward.
- Keep route and server-function payloads plain and serializable. Carry branded
  values inside the app, but serialize plain decoded data across client/server
  boundaries.
- Use narrow projections at external boundaries and shared API contracts. Avoid
  route-local bespoke DTOs unless the route would otherwise leak sensitive data
  or large unused payloads.
- Put reusable query/client/schema logic in feature slices or packages when
  multiple routes need it. Keep one-off route behavior route-local.

## Rule Categories

| Priority | Category | Impact | Prefix |
|----------|----------|--------|--------|
| 1 | Eliminating Waterfalls | CRITICAL | `async-` |
| 2 | Bundle Size Optimization | CRITICAL | `bundle-` |
| 3 | Server-Side Performance | HIGH | `server-` |
| 4 | Client-Side Data Fetching | MEDIUM-HIGH | `client-` |
| 5 | Re-render Optimization | MEDIUM | `rerender-` |
| 6 | Rendering Performance | MEDIUM | `rendering-` |
| 7 | JavaScript Performance | LOW-MEDIUM | `js-` |
| 8 | Advanced Patterns | LOW | `advanced-` |

## Quick Reference

### 1. Eliminating Waterfalls

- `async-cheap-condition-before-await` - Check cheap sync conditions before awaiting flags or remote values.
- `async-defer-await` - Move awaits into branches where the value is actually used.
- `async-parallel` - Use `Promise.all` for independent operations.
- `async-dependencies` - Use `better-all` for partial dependency graphs.
- `async-api-routes` - Start independent promises early in server functions/routes.
- `async-suspense-boundaries` - Use Suspense boundaries where streaming or progressive rendering helps.

### 2. Bundle Size Optimization

- `bundle-barrel-imports` - Prefer typed direct imports or Vite-compatible import optimization over broad package barrels.
- `bundle-analyzable-paths` - Keep import and file-system paths statically analyzable.
- `bundle-dynamic-imports` - Lazy-load heavy components with Vite-compatible dynamic imports or route code splitting.
- `bundle-defer-third-party` - Load analytics, logging, and monitoring after hydration or route interaction.
- `bundle-conditional` - Load modules only when the feature is activated.
- `bundle-preload` - Preload on hover/focus for perceived speed.

### 3. Server-Side Performance

- `server-auth-boundaries` - Authenticate and authorize every server function/route that reads or mutates protected data.
- `server-cache-explicit` - Use explicit per-request or source caches instead of framework-specific implicit caches.
- `server-cache-lru` - Use bounded cross-request caches only for safe shared data.
- `server-dedup-serialized-data` - Avoid duplicate serialized payloads in loaders, server functions, and query hydration.
- `server-hoist-static-io` - Hoist immutable static I/O to module level.
- `server-no-shared-module-state` - Keep request/user data out of module scope.
- `server-serialization-boundaries` - Send only client-needed fields across server/client boundaries.
- `server-parallel-fetching` - Structure loaders and server functions to parallelize independent fetches.
- `server-parallel-nested-fetching` - Chain per-item dependent fetches inside each parallel item.
- `server-nonblocking-side-effects` - Move non-critical work to platform-supported background execution.

### 4. Client-Side Data Fetching

- `client-tanstack-query-dedup` - Use TanStack Query for shared client requests, deduplication, retries, and refetch intervals.
- `client-event-listeners` - Deduplicate global event listeners.
- `client-passive-event-listeners` - Use passive listeners for scroll/touch.
- `client-localstorage-schema` - Version and minimize localStorage data.

### 5. Re-render Optimization

- `rerender-defer-reads` - Do not subscribe to state only used in callbacks.
- `rerender-memo` - Extract expensive work into memoized components.
- `rerender-memo-with-default-value` - Hoist default non-primitive props.
- `rerender-dependencies` - Use primitive dependencies in effects.
- `rerender-derived-state` - Subscribe to derived booleans, not raw values.
- `rerender-derived-state-no-effect` - Derive state during render, not effects.
- `rerender-functional-setstate` - Use functional `setState` for stable callbacks.
- `rerender-lazy-state-init` - Pass a function to `useState` for expensive initialization.
- `rerender-simple-expression-in-memo` - Avoid memoization for simple primitives.
- `rerender-split-combined-hooks` - Split hooks with independent dependencies.
- `rerender-move-effect-to-event` - Put interaction logic in event handlers.
- `rerender-transitions` - Use `startTransition` for non-urgent updates.
- `rerender-use-deferred-value` - Defer expensive renders to keep input responsive.
- `rerender-use-ref-transient-values` - Use refs for transient frequent values.
- `rerender-no-inline-components` - Do not define components inside components.

### 6. Rendering Performance

- `rendering-animate-svg-wrapper` - Animate a wrapper instead of the SVG element.
- `rendering-content-visibility` - Use `content-visibility` for long lists.
- `rendering-hoist-jsx` - Extract static JSX outside components.
- `rendering-svg-precision` - Reduce SVG coordinate precision.
- `rendering-hydration-no-flicker` - Use minimal inline scripts for unavoidable client-only data.
- `rendering-hydration-suppress-warning` - Suppress only expected hydration mismatches.
- `rendering-activity` - Use Activity for show/hide when available.
- `rendering-conditional-render` - Use ternaries instead of `&&` for conditionals that can produce text nodes.
- `rendering-usetransition-loading` - Prefer `useTransition` for non-blocking loading state.
- `rendering-resource-hints` - Use React DOM resource hints for preloading.
- `rendering-script-defer-async` - Use `defer` or `async` on script tags.

### 7. JavaScript Performance

- `js-batch-dom-css` - Group CSS changes via classes or `cssText`.
- `js-index-maps` - Build a `Map` for repeated lookups.
- `js-cache-property-access` - Cache object properties in loops.
- `js-cache-function-results` - Cache hot pure function results when memory is bounded.
- `js-cache-storage` - Cache localStorage/sessionStorage reads.
- `js-combine-iterations` - Combine multiple `filter`/`map` passes on hot paths.
- `js-length-check-first` - Check array length before expensive comparisons.
- `js-early-exit` - Return early from functions.
- `js-hoist-regexp` - Hoist RegExp creation outside loops.
- `js-min-max-loop` - Use loops for min/max instead of sort.
- `js-set-map-lookups` - Use `Set`/`Map` for repeated lookups.
- `js-tosorted-immutable` - Use `toSorted` for immutable sorting.
- `js-flatmap-filter` - Use `flatMap` to map and filter in one pass.
- `js-request-idle-callback` - Defer non-critical browser work to idle time.

### 8. Advanced Patterns

- `advanced-effect-event-deps` - Do not put `useEffectEvent` results in effect deps.
- `advanced-event-handler-refs` - Store event handlers in refs when the identity must stay stable.
- `advanced-init-once` - Initialize app-wide browser state once per app load.
- `advanced-use-latest` - Use `useLatest` for stable callback refs.

## How to Use

Read the smallest relevant rule files from `rules/` before acting. When a rule touches TanStack Start behavior, also read the corresponding TanStack skill under `node_modules/@tanstack/*/skills` if available.

The compiled guide in `AGENTS.md` is a sanitized index for target projects. The individual rule files remain the source of detailed examples.

Completion criterion: every touched server/client boundary is parsed and
authorized where needed, data fetching has one cache owner, avoidable effects or
local state are removed, and any performance rule applied has a focused
verification or clear rationale.

---
title: Use Bounded Cross-Request Caches
impact: HIGH
impactDescription: caches safe shared data across requests
tags: server, cache, lru, cross-request, cloudflare
---

## Use Bounded Cross-Request Caches

Use cross-request caches only for data that is safe to share within a process or worker isolate. Keep them bounded, give them TTLs, and never use them as request-local state.

**Incorrect (unbounded module cache):**

```typescript
const productCache = new Map<ProductId, ProductSummary>()

export async function getProductSummary(productId: ProductId) {
  const cached = productCache.get(productId)
  if (cached) return cached

  const product = await fetchProductSummary(productId)
  productCache.set(productId, product)
  return product
}
```

**Correct (bounded TTL cache):**

```typescript
import { LRUCache } from "lru-cache"

const productCache = new LRUCache<ProductId, ProductSummary>({
  max: 500,
  ttl: 5 * 60 * 1000,
})

export async function getProductSummary(productId: ProductId) {
  const cached = productCache.get(productId)
  if (cached) return cached

  const product = await fetchProductSummary(productId)
  productCache.set(productId, product)
  return product
}
```

Good candidates: public config, catalog summaries, static reference data, parsed templates, and feature metadata.

Bad candidates: secrets, raw session data, authorization decisions without principal-aware keys, per-request objects, and user-specific mutable state.

Cloudflare workers may reuse an isolate for multiple requests, but reuse is not guaranteed. Treat in-memory caches as opportunistic performance improvements, not durability.

Reference: [node-lru-cache](https://github.com/isaacs/node-lru-cache)

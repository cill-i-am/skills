---
title: Use flatMap to Map and Filter in One Pass
impact: LOW-MEDIUM
impactDescription: eliminates intermediate array
tags: javascript, arrays, flatMap, filter, performance
---

## Use flatMap to Map and Filter in One Pass

**Impact: LOW-MEDIUM (eliminates intermediate array)**

Chaining `.map().filter(Boolean)` creates an intermediate array and iterates twice. Consider `.flatMap()` when it makes the transformation clearer. Preserve the original predicate; one pass does not by itself prove better performance because callback allocations and engine behavior also matter.

**Two-step form (filters all falsy names):**

```typescript
const userNames = users
  .map(user => user.isActive ? user.name : null)
  .filter(Boolean)
```

**Equivalent flatMap form:**

```typescript
const userNames = users.flatMap(user =>
  user.isActive && user.name ? [user.name] : []
)
```

**More examples:**

```typescript
// Extract valid emails from responses
// Before
const emails = responses
  .map(r => r.success ? r.data.email : null)
  .filter(Boolean)

// After
const emails = responses.flatMap(r =>
  r.success && r.data.email ? [r.data.email] : []
)

// Parse and filter valid numbers
// Before
const numbers = strings
  .map(s => parseInt(s, 10))
  .filter(n => !isNaN(n))

// After
const numbers = strings.flatMap(s => {
  const n = parseInt(s, 10)
  return isNaN(n) ? [] : [n]
})
```

**When to use:**
- Transforming items while filtering some out
- Conditional mapping where some inputs produce no output
- Parsing/validating where invalid inputs should be skipped

---
title: Deduplicate Global Event Listeners
impact: LOW
impactDescription: one listener for many consumers
tags: client, event-listeners, subscription, browser
---

## Deduplicate Global Event Listeners

Do not register a new global listener for every component instance. Use a module-level browser subscription or `useSyncExternalStore` style adapter so many components can share one listener.

**Incorrect (N instances means N listeners):**

```tsx
function useKeyboardShortcut(key: string, callback: () => void) {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.metaKey && event.key === key) {
        callback()
      }
    }

    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [callback, key])
}
```

**Correct (one listener dispatches to registered callbacks):**

```tsx
const keyCallbacks = new Map<string, Set<() => void>>()
let unsubscribeGlobalKeydown: (() => void) | undefined

function ensureGlobalKeydown() {
  if (unsubscribeGlobalKeydown) return

  const handler = (event: KeyboardEvent) => {
    if (!event.metaKey) return
    keyCallbacks.get(event.key)?.forEach((callback) => callback())
  }

  window.addEventListener("keydown", handler)
  unsubscribeGlobalKeydown = () => window.removeEventListener("keydown", handler)
}

export function useKeyboardShortcut(key: string, callback: () => void) {
  useEffect(() => {
    ensureGlobalKeydown()

    const callbacks = keyCallbacks.get(key) ?? new Set<() => void>()
    callbacks.add(callback)
    keyCallbacks.set(key, callbacks)

    return () => {
      callbacks.delete(callback)
      if (callbacks.size === 0) {
        keyCallbacks.delete(key)
      }
    }
  }, [callback, key])
}
```

Keep the module state browser-only and avoid storing request/user server data in shared module scope.

---
title: Parallel Nested Data Fetching
impact: CRITICAL
impactDescription: eliminates server-side waterfalls
tags: server, loaders, server-functions, parallel-fetching, promise-chaining
---

## Parallel Nested Data Fetching

When fetching nested data in parallel, chain dependent fetches inside each item's promise so one slow item does not block the rest.

**Incorrect (all authors wait for all chats):**

```typescript
const chats = await Promise.all(chatIds.map((chatId) => getChat(chatId)))
const authors = await Promise.all(
  chats.map((chat) => getUser(chat.authorId)),
)
```

If one `getChat` call is slow, the authors for the other chats cannot start even when their chat data is already available.

**Correct (each item chains its own dependency):**

```typescript
const authors = await Promise.all(
  chatIds.map((chatId) =>
    getChat(chatId).then((chat) => getUser(chat.authorId)),
  ),
)
```

Each item independently chains `getChat` then `getUser`, so a slow item does not block nested fetches for the others.

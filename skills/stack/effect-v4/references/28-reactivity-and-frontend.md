# Reactive UI, browser applications, forms, and SSR

## Choose an explicit state owner

The v4 `effect/reactivity` family includes `Atom`, `AtomRegistry`, `AsyncResult`, `AtomRef`, `AtomHttpApi`, `AtomRpc`, `Hydration`, and `Reactivity`. These are not automatically a replacement for every local UI state variable or the framework's routing/cache conventions. Use them where Effect-backed state, shared dependencies, cancellation, or stream integration provides a clear benefit.

The baseline `Atom` source is marked unstable. Check the framework adapter's compatible version and hook API before writing React or other framework code. Do not mix core atom definitions with a guessed hook signature.

```ts
import { Effect } from "effect"
import { Atom } from "effect/reactivity"

export const quantity = Atom.make(1)
export const doubled = Atom.make((get) => get(quantity) * 2)
export const delayedLabel = Atom.make(
  Effect.sleep("100 millis").pipe(Effect.as("ready"))
)
```

A plain value creates writable atom state; a read function can derive state from other atoms. An Effect-backed atom exposes an `AsyncResult`, not a synchronous string. A registry owns evaluation, dependencies, subscribers, asynchronous work, and cleanup. The example defines atoms only; the application must supply the appropriate registry/framework lifetime.

## Identity and lifetime

Keep atom definitions stable for the intended lifetime. Recreating an atom on every render can recreate state and asynchronous work. Parameterized atoms need stable keys and a retention policy; an unbounded cache of every search term or user ID can leak memory.

`keepAlive` and idle TTL choices are resource policies, not just rendering options. Unused subscriptions, streams, sockets, and Effect computations must be disposed when the owning registry or component subtree no longer needs them. Test unmount, remount, navigation, and hot reload.

For authenticated applications, distinguish public shared state, session state, and request-local state. Clear or replace identity-sensitive registries/caches when the principal changes. A global server registry must not retain the first SSR request's token or data.

## Async state and mutations

Render loading, success, failure, refreshing, and retained previous values deliberately according to the installed `AsyncResult` representation. Avoid hiding every failure behind an empty array or a spinner that never terminates. Keep safe error messages separate from diagnostic causes.

For mutations, decide how optimistic updates are confirmed, rolled back, and invalidated. Tie invalidation to successful commit, not to the moment a button is clicked. A cancelled network request may still commit on the server; refetch or reconcile when the outcome is ambiguous.

`AtomHttpApi` and `AtomRpc` can connect contract clients to reactive state. Check their keying, invalidation, and runtime requirements before introducing a custom query wrapper. Do not run two independent caches for the same resource without defining which owns freshness and updates.

## Forms and Schema

Use Schema at the submission and server boundary. A field-level form check is user feedback, not security. Preserve the raw editable value while the user is typing; incomplete input is normal UI state and may not yet be a valid domain value.

Distinguish decoding transformations from field validation. Trimming, defaulting, numeric coercion, and optional-field rules affect submitted values. Test the exact values sent to the server, including empty strings, omitted keys, nulls, and partially edited arrays.

Use the installed Standard Schema integration where the form library supports it. Verify whether that integration validates, transforms, or only reports issues. Do not assume a compatible validator interface carries every Effect service dependency or encoding direction.

## SSR and hydration

Create request-local state for identity-sensitive server rendering. Serialize only allowed, schema-encoded client data; never include service instances, credentials, raw causes, or database resources. Hydration must agree with the client's schema and state identity.

Avoid hydration races where client revalidation overwrites a newer user edit or resurrects another session's cache. Test concurrent SSR requests, logout/login transitions, stale payloads, failed prefetch, and browser back/forward navigation.

## Browser constraints

DOM listeners, timers, WebSockets, storage listeners, and fetches need cleanup. Browser storage is untrusted input and may be absent, full, restricted, or populated with stale values. Cross-tab synchronization is a separate problem from in-memory atom dependency tracking.

Use a genuine browser test for rendering lifecycle, abort, hydration, and storage behaviour. A Node unit test does not prove that the browser adapter works after bundling.

## Official sources

- [Atom source and constructors](https://github.com/Effect-TS/effect/blob/effect@4.0.2/packages/effect/src/reactivity/Atom.ts)
- [AtomRegistry](https://effect.website/docs/v4/api/effect/reactivity/AtomRegistry)
- [AsyncResult](https://effect.website/docs/v4/api/effect/reactivity/AsyncResult)
- [AtomHttpApi](https://effect.website/docs/v4/api/effect/reactivity/AtomHttpApi)
- [Hydration](https://effect.website/docs/v4/api/effect/reactivity/Hydration)
- [Schema guide](https://github.com/Effect-TS/effect/blob/effect@4.0.2/packages/effect/SCHEMA.md)

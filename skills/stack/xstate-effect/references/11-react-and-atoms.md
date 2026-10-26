# React, Effect atoms, SSR, and feature ownership

## Preferred frontend integration

Keep the existing Effect application runtime. Create actor atoms with `createActorAtoms` from `@xstate/effect/atom`, using `Atom.runtime` from **`effect/reactivity`**. Provide the machine's services through its Layer. Use React's `@effect/atom-react` bindings to consume these atoms. The [optional UI example](../examples/ui/Review.tsx) includes imports and ownership.

```ts
// Fragment; PublishingLive and publishMachine come from the example project.
const runtime = Atom.runtime(PublishingLive);
const review = createActorAtoms(runtime, publishMachine, {
  input: { documentId: 'doc-1', operationId: 'op-1' }
});
const status = review.select((snapshot) => snapshot.value);
```

The runtime Layer must satisfy the required services. Required input is required by the type contract. Do not silence a missing service/input error with casts. Initial input is not a reactive prop channel: changing a React prop does not update an already-created actor. Send an explicit update event, or create a differently keyed actor when identity changes.

## Treat readiness and failure as real UI states

The atom group exposes `actor`, `snapshot`, `result`, `send`, `select`, and `state`. The actor/snapshot/select values use `AsyncResult`; `result` exposes actor failure as failure rather than merely an error snapshot datum. Handle startup failure, machine-domain failure, and unexpected actor termination separately.

The `send` atom can produce `NotReadyError` while the runtime is building. It is not a promise of durable buffering. Render controls only when `useAtomSuspense` has resolved or a readiness check succeeds. `useAtomSuspense` returns a successful result object; read its `.value`. For explicit pending/error rendering, use `useAtomValue` and discriminate `AsyncResult`.

Use a Suspense fallback and an application-appropriate error boundary. Do not display sensitive causes to the user. Disable only the commands unavailable in the current model; keeping a Cancel control available during work is often intentional. An enabled button is not a server-side authorization decision.

## Make lifetime a product decision

Actor atoms start lazily when read/mounted. Unused atoms are released according to the registry's idle lifetime. `RegistryProvider` is the normal React owner; dispose a manually created `AtomRegistry` at its owner shutdown. `useAtomMount` can keep an actor alive while its parent feature is present. `Atom.keepAlive` retains it for registry lifetime; `Atom.family` can identify one actor per entity/input.

Use stable family keys and bound caches. Recreating an atom group inside every render can start/release multiple workflows. A global keepAlive actor can leak one user's data into another session. A route-level provider can accidentally cancel an upload during navigation; choose a higher owner for a truly background upload. Browser persistence and process durability are still separate requirements.

## Reading an existing actor directly

`useSelector` from a compatible `@xstate/react` version can read an already-owned `EffectActor`. Do not call `useMachine`, `useActor`, or `useActorRef` to start Effect-backed logic; they create the vanilla host. Dispose the ManagedRuntime/Layer owner, not an arbitrary child component that merely reads the actor.

Selector identity and equality affect render frequency. Select small stable values, tags, or derived booleans; avoid constructing a new object on every snapshot unless an equality strategy is provided. Distinguish loading flags that belong in states from business data that belongs in context or an external cache. Do not mirror the actor's `isLoading` into independent React state.

## SSR, hydration, and multiple clients

Create tenant-sensitive registries/runtime instances per request or authenticated application owner, not as shared server module globals. Do not start long-lived work during server rendering by accidentally reading an actor atom. Separate server loader data from client workflow ownership. Hydrate an intentionally validated DTO, not raw runtime actor references or arbitrary serialized snapshots.

React development remounts can expose lifecycle bugs; make startup side effects idempotent and cleanup deterministic. Test provider unmount/remount, navigation, changed entity identity, startup rejection, repeated submission, and parent retention. Multi-tab coordination is a separate message/ownership protocol, not a property of a module-level atom.

Sources: [atoms and React](27-source-index.md#effect-atoms), [matching states](27-source-index.md#effect-matching), [version contract](00-version-contract.md).

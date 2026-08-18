# Services, Layers, And Lifecycles

Use this file for service contracts, implementation Layers, dependency graphs, runtime topology, lifetime classification, test replacement, and long-lived service work.

## Type Ownership

Use three different policies rather than one universal style:

1. **Serializable data:** derive the TypeScript type from its owning Schema.
2. **Private implementation value with one factory:** infer with `ReturnType<typeof makeX>` when that keeps one source of truth.
3. **Public capability or value with multiple implementations:** define an explicit stable interface.

A service is appropriate when callers need a runtime capability, substitution, dependency tracking, lifecycle, or authority boundary.

```ts
export interface UserRepositoryShape {
  readonly findById: (
    id: UserId,
  ) => Effect.Effect<User, UserNotFound | PersistenceError>
  readonly save: (user: User) => Effect.Effect<void, PersistenceError>
}

export class UserRepository extends Context.Service<
  UserRepository,
  UserRepositoryShape
>()("@app/users/UserRepository") {}
```

Use package/path-qualified service identifiers. Reusing a runtime key for unrelated services is a correctness bug.

Service contracts should:

- return Effect values rather than raw Promises;
- use domain types rather than driver rows or SDK payloads;
- remain independent of the live implementation;
- expose only intentional capabilities;
- preserve expected failures and requirements instead of executing or providing them internally.

In ordinary orchestration, prefer `const service = yield* Service`. Use `.use(...)` for a compact accessor or bridge when it improves the local API, not to obscure the dependency graph.

## Standard Service Module Shape

A useful default module exports:

- the service interface and `Context.Service` class;
- the primary `layer` or a descriptive live Layer name;
- variants such as `layerTest`, `layerMemory`, `layerConfig`, or `layerNoDeps` when they have real consumers;
- private adapter helpers and row/provider codecs.

```ts
export const layer = Layer.effect(
  UserRepository,
  Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient

    const findById = Effect.fn("UserRepository.findById")(function* (
      id: UserId,
    ) {
      const rows = yield* loadUserRows(sql, id)
      const row = rows[0]
      if (row === undefined) return yield* new UserNotFound({ id })
      return yield* decodeUserRow(row)
    })

    const save = Effect.fn("UserRepository.save")(function* (user: User) {
      yield* persistUser(sql, user)
    })

    return UserRepository.of({ findById, save })
  }),
)
```

Use `Effect.fnUntraced` instead of named `Effect.fn` when a reusable generator wrapper does not deserve an independent span. Follow the target repository's established instrumentation policy.

## Layer Constructor Chooser

Verify the exact signatures against the installed Effect version.

```ts
Layer.succeed(Service, implementation)       // already built
Layer.sync(Service, () => implementation)    // lazy synchronous acquisition
Layer.effect(Service, makeService)            // effectful acquisition
Layer.effectContext(makeContext)              // deliberately provides several tags
Layer.unwrap(selectLayer)                     // effect chooses a Layer
```

A Layer may acquire scoped resources because Layer construction is scope-aware. Use `Effect.acquireRelease` inside the Layer when the implementation owns a closeable resource.

## Lifetime Taxonomy

Every stateful service, resource, cache, runtime, and background fiber should be classified as one of:

- process/global;
- application runtime;
- tenant/workspace/location;
- request/session/job;
- operation-local;
- cache-entry.

State the owner, sharing policy, invalidation trigger, and disposal path. Do not let a mutable singleton accidentally become process-global merely because it was declared at module scope.

## Application Services

Application workflows orchestrate capabilities while leaving requirements visible.

```ts
export const registerUser = Effect.fn("Users.register")(function* (
  command: RegisterUser,
) {
  const users = yield* UserRepository
  const identities = yield* IdentityProvider
  const notifications = yield* Notifications

  const identity = yield* identities.create(command.email)
  const user = User.make({
    id: identity.userId,
    displayName: command.displayName,
    email: command.email,
  })

  yield* users.save(user)
  yield* notifications.welcome(user)
  return user
})
```

Do not provide live Layers inside this workflow. Tests and alternate hosts must be able to replace each capability at the composition root.

## Layer Graph Progression

Use the smallest graph representation that remains understandable.

### Small Graph

Use ordinary Layer composition and one application root.

```ts
const PersistenceLive = UserRepositoryLive.pipe(Layer.provide(SqlLive))
const IntegrationsLive = Layer.mergeAll(IdentityLive, NotificationsLive).pipe(
  Layer.provide(HttpClientLive),
)

export const AppLayer = Layer.mergeAll(
  PersistenceLive,
  IntegrationsLive,
  AppConfigLive,
)
```

### Medium Graph

Name responsibility-based subgraphs and package-level composition roots. Replace whole capability Layers in tests rather than rebuilding transitive wiring at every call site.

### Large Multi-Lifetime Graph

Only after the ordinary graph becomes difficult to reason about, consider typed dependency metadata, cycle detection, replacement maps, and lifetime tags. OpenCode's LayerNode architecture is an example of this progression, not a universal Effect requirement.

### Several Runtimes Sharing Acquisitions

Separately created `ManagedRuntime` values do not share Layer acquisitions automatically. Use a deliberate shared `Layer.MemoMap` only when runtime identity and resource sharing are required. Isolation is the default for tests and tenant boundaries.

### Keyed Resource Graphs

Use `ScopedCache`, `LayerMap`, or another owned keyed-scope abstraction when each tenant/workspace/location key owns resources that require finalization. Do not cache a scoped resource in a plain Map or let it escape a closed scope.

## Long-Lived Work

A Layer that starts a listener, stream consumer, subscription, worker, or forever loop must fork it into the Layer's scope. Layer acquisition itself must complete.

```ts
export const ProjectionWorkerLive = Layer.effectDiscard(
  Effect.gen(function* () {
    const events = yield* DomainEvents
    const projection = yield* UserProjection

    yield* events.stream.pipe(
      Stream.runForEach(projection.apply),
      Effect.forkScoped,
    )
  }),
)
```

Lifecycle rules:

- use `Effect.forkScoped`, `FiberSet`, or `FiberMap` for owned background work;
- do not run a never-ending effect inline during Layer acquisition;
- do not detach a fiber with host-level `runFork` merely to escape ownership;
- keep finalizers idempotent and tolerant of partial acquisition where necessary;
- expose manual `start` and `stop` only when lifecycle control is a real domain capability.

A service implementation may contain a foreign Promise/callback bridge when the adapter protocol demands it, but the public service contract remains Effect-native. Follow `runtime-bridges.md`.

## Runtime Ownership

Build the Layer graph once for the lifetime intended by the host:

- process/server: one managed runtime for the process;
- Durable Object/actor: one runtime for the actor lifetime;
- tenant/workspace/location: one keyed scoped acquisition;
- CLI: one scoped runtime for the command;
- test: one isolated scoped runtime or test Layer per test unless sharing is explicit.

Do not create a managed runtime per repository call or ordinary request. The owner must dispose a long-lived runtime.

## Test Services

A reusable stateful fake should implement the production contract and may expose a separate control tag.

```ts
export interface NotificationTestShape extends NotificationShape {
  readonly sent: Effect.Effect<ReadonlyArray<Notification>>
  readonly failNext: (error: NotificationError) => Effect.Effect<void>
}

export class NotificationTest extends Context.Service<
  NotificationTest,
  NotificationTestShape
>()("@app/notifications/NotificationTest") {}
```

Use `Layer.effectContext(...)` when the same object intentionally backs both the production tag and the test-control tag. Production code depends only on the production tag.

## Red Flags

- Service methods return Promises or accept raw string IDs.
- A workflow chooses its own live Layer or runtime.
- A service key is a vague global name reused across packages.
- Layer acquisition never completes because it runs a worker inline.
- A runtime is allocated per operation without a genuine isolation requirement.
- Several runtimes accidentally acquire duplicate clients that should be shared.
- `Context.Reference` hides required authority, persistence, credentials, or transports behind defaults.

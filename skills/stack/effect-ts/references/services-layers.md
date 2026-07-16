# Services, Layers, And Lifecycles

Use this file for service contracts, implementations, Layer graphs, module surfaces, test replacement, and long-lived service work.

## Service Contract

Use a service when callers need a runtime capability, substitution, dependency tracking, lifecycle, or authority boundary.

```ts
import { Context, Effect, Layer } from "effect";

export interface UserRepositoryShape {
  readonly findById: (
    id: UserId,
  ) => Effect.Effect<User, UserNotFound | PersistenceError>;
  readonly save: (user: User) => Effect.Effect<void, PersistenceError>;
}

export class UserRepository extends Context.Service<
  UserRepository,
  UserRepositoryShape
>()("@app/UserRepository") {}
```

Guidance:

- Service methods return Effect values, not Promises.
- Use domain types in arguments and results; do not expose raw database rows, SDK payloads, or string IDs.
- Keep the interface independent of the live implementation.
- Export only intentional capabilities. Keep row codecs and adapter helpers private.
- Follow an existing local module naming style. Do not require self-exporting namespace tricks.

## Live Layer

Build real implementations in Layers and return `Service.of(...)`.

```ts
export const UserRepositoryLive = Layer.effect(
  UserRepository,
  Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient;

    const findById = Effect.fn("UserRepository.findById")(function* (
      id: UserId,
    ) {
      const rows = yield* sql<UserRow>`
        SELECT id, display_name, email
        FROM users
        WHERE id = ${id}
      `.pipe(
        Effect.mapError(
          (cause) => new PersistenceError({ operation: "findUserById", cause }),
        ),
      );

      const row = rows[0];
      if (row === undefined) {
        return yield* new UserNotFound({ id });
      }
      return yield* Schema.decodeUnknownEffect(User)(row).pipe(
        Effect.mapError(
          (cause) =>
            new PersistenceError({ operation: "decodeUserRow", cause }),
        ),
      );
    });

    const save = Effect.fn("UserRepository.save")(function* (user: User) {
      yield* persistUser(sql, user);
    });

    return UserRepository.of({ findById, save });
  }),
);
```

Choose the Layer constructor by acquisition behavior:

```ts
Layer.succeed(Service, implementation); // already built
Layer.sync(Service, () => implementation); // lazy synchronous acquisition
Layer.effect(Service, makeService); // effectful; acquisition may require Scope
```

Use `Layer.effectContext(...)` when one acquisition deliberately provides multiple tags. Use `Layer.unwrap(...)` when configuration or runtime discovery selects a Layer.

## Application Service

Application services orchestrate capabilities while leaving requirements visible.

```ts
export const registerUser = Effect.fn("Users.register")(function* (
  command: RegisterUser,
) {
  const users = yield* UserRepository;
  const identities = yield* IdentityProvider;
  const notifications = yield* Notifications;

  const identity = yield* identities.create(command.email);
  const user = User.make({
    id: identity.userId,
    displayName: command.displayName,
    email: command.email,
  });

  yield* users.save(user);
  yield* notifications.welcome(user);
  return user;
});
```

Do not provide live Layers inside this workflow. Tests and alternate hosts must be able to replace each dependency at the composition root.

## Dependency Graphs

Assemble named, topologically understandable subgraphs:

```ts
const PersistenceLive = UserRepositoryLive.pipe(Layer.provide(SqlLive));

const IntegrationsLive = Layer.mergeAll(
  IdentityProviderLive,
  NotificationsLive,
).pipe(Layer.provide(HttpClientLive));

export const AppLayer = Layer.mergeAll(
  PersistenceLive,
  IntegrationsLive,
  AppConfigLive,
);
```

- `Layer.provide(...)`: satisfy and hide an implementation dependency.
- `Layer.provideMerge(...)`: satisfy it and intentionally keep it exposed.
- `Layer.mergeAll(...)`: combine independent services that remain exposed.
- `Layer.fresh(...)` or local provisioning: opt out of memoization only when isolated acquisition is required.

Do not use `mergeAll` or `provideMerge` as trial-and-error type-error fixes. Name large subgraphs by responsibility and keep authority-bearing dependencies visible.

## Long-Lived Work

A Layer that starts a listener, stream consumer, subscription, worker, or forever loop must fork it into the Layer's scope. Layer acquisition itself must complete.

```ts
export const ProjectionWorkerLive = Layer.effectDiscard(
  Effect.gen(function* () {
    const events = yield* DomainEvents;
    const projection = yield* UserProjection;

    yield* events.stream.pipe(
      Stream.runForEach(projection.apply),
      Effect.forkScoped,
    );
  }),
);
```

When acquisition owns a closeable resource, use a scoped Layer:

```ts
export const BrokerLive = Layer.effect(
  Broker,
  Effect.acquireRelease(connectBroker, (client) => client.close).pipe(
    Effect.map((client) => Broker.of(makeBroker(client))),
  ),
);
```

Lifecycle rules:

- Use `Effect.forkScoped`, `FiberSet`, or `FiberMap` for owned background work.
- Do not run a never-ending effect inline during Layer acquisition.
- Do not detach fibers with an unowned `runFork` from service code.
- Do not expose `start` and `stop` methods unless manual lifecycle control is a real domain capability.
- Finalizers should be idempotent and tolerate partial acquisition where the API requires it.

## Runtime Ownership

Build the Layer graph once for the lifetime intended by the host:

- process or server: one managed runtime for the process
- Durable Object or actor: one runtime for the actor lifetime
- CLI: one scoped runtime for the command
- test: one scoped runtime or test-provided Layer per test

Do not create a managed runtime per repository call or ordinary request. Execute application programs through the owner runtime at the host edge.

## Test Services

Reusable stateful fakes should implement the same production interface and may expose a separate control tag for tests.

```ts
export interface NotificationTestShape extends NotificationShape {
  readonly sent: Effect.Effect<ReadonlyArray<Notification>>;
  readonly failNext: (error: NotificationError) => Effect.Effect<void>;
}

export class NotificationTest extends Context.Service<
  NotificationTest,
  NotificationTestShape
>()("@app/Notification/Test") {}
```

Use `Layer.effectContext(...)` so the same object backs both the production tag and test-control tag. Production code depends only on the production tag.

## Red Flags

- Service methods return Promises or accept raw string IDs.
- A domain workflow calls `Effect.runPromise` or chooses its own live Layer.
- An adapter leaks SDK clients or database rows through the service interface.
- Layer acquisition never completes because it runs the worker inline.
- A runtime is allocated per operation without a genuine isolation requirement.
- `Context.Reference` hides credentials, persistence, transports, or authority behind defaults.

// Baseline: effect@4.0.2. See ../../references/06-services-and-context.md
import { Context, Effect, Layer, Schema } from "effect"

export class UserMissing extends Schema.TaggedError<UserMissing>()(
  "UserMissing", { id: Schema.String }
) {}

export class UserDirectory extends Context.Service<UserDirectory, {
  readonly findName: (id: string) => Effect.Effect<string, UserMissing>
}>()("example/users/UserDirectory") {}

export const UserDirectoryTest = Layer.succeed(UserDirectory, {
  findName: (id) => id === "u-1"
    ? Effect.succeed("Mina")
    : Effect.fail(new UserMissing({ id }))
})

export const greeting = Effect.fn("greeting")(function*(id: string) {
  const directory = yield* UserDirectory
  const name = yield* directory.findName(id)
  return `Hello, ${name}`
})

export const testGreeting = greeting("u-1").pipe(
  Effect.provide(UserDirectoryTest)
)

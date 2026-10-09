# Files, paths, terminals, processes, and command-line tools

## Depend on platform capabilities

Use Effect's `FileSystem`, `Path`, `Terminal`, and standard-I/O services where testability and portability matter. Provide a concrete Node, Bun, browser, or other supported implementation at the composition root. A platform abstraction does not guarantee that every host supports every operation or the same filesystem semantics.

The `effect/process` modules describe child processes and execute them through `ChildProcessSpawner`. Use the supported argument-vector API instead of concatenating shell commands. Resolve exact process/stream combinators from the installed release before building pipelines.

## CLI example

This source-checked composition requires a compatible `@effect/platform-node` package in addition to `effect`:

```ts
import { NodeRuntime, NodeServices } from "@effect/platform-node"
import { Console, Effect, Schema } from "effect"
import { Argument, Command, Flag } from "effect/cli"

const greet = Command.make("greet", {
  name: Argument.String("name").pipe(Argument.withSchema(Schema.NonEmptyString)),
  uppercase: Flag.Boolean("uppercase").pipe(Flag.withDefault(false))
}, Effect.fn(function*({ name, uppercase }) {
  const message = `Hello, ${name}`
  yield* Console.log(uppercase ? message.toUpperCase() : message)
}))

export const main = greet.pipe(
  Command.run({ version: "1.0.0" }),
  Effect.provide(NodeServices.layer)
)

// Put this runner in the executable entrypoint, not an imported library module.
NodeRuntime.runMain(main)
```

Use `Command.withSubcommands` to compose related commands. Shared parent flags are declared with `Command.withSharedFlags`; a subcommand can yield the parent command to read its parsed input. Use aliases, descriptions, examples, help, completion, and `Flag.optional`/schema validation instead of a second handwritten parser.

## Files and paths

Treat file handles, watchers, temporary directories, and locks as scoped resources. Bound read size when processing untrusted files, use streaming for large data, and decide how partial output is cleaned up after interruption. Prefer a staged write and atomic replacement when supported and required by the application.

Normalize paths with the platform service, enforce allowed roots, and account for symlinks, case sensitivity, permissions, and path traversal. A lexical “starts with this folder” check is not a complete filesystem security policy. Never delete a recursively constructed path without verifying the target and intended scope.

Do not assume UTF-8, line endings, or file names are valid input. Schema-decode configuration and records after parsing the external format. File format parsers and line splitting have different responsibilities.

## Processes and pipelines

Keep executable identity and arguments separate. Set a minimal environment, working directory, timeout, and output limits. Avoid shell evaluation for user-controlled input. Never log inherited secret environment variables.

Own process termination and output readers in one scope. A child that fills stderr can block even while the parent waits only for stdout; consume both streams or use a supported combined strategy. Distinguish exit status, spawn failure, signal termination, and domain-level command failure.

Streaming output requires framing and encoding handling; chunks are not lines. Terminate subprocesses on interruption according to the host's process-group behaviour. Test that grandchildren do not remain running when cancellation is supposed to stop the complete job.

## Interactive and machine modes

Interactive prompts need cancellation and non-TTY behaviour. Automation should use explicit flags rather than hanging for input. Keep machine-readable stdout free of diagnostic logs; direct diagnostics through an appropriate stderr logger or output service. Set meaningful exit codes and preserve the original failure cause in diagnostics.

For destructive operations, implement a dry run and an explicit confirmation policy appropriate to the command. A default flag must not silently turn a read-only preview into a write.

## Verification

Test parsed flags, invalid input, help output, subcommands, exit status, no-TTY mode, stdout/stderr separation, process timeout, interrupted writes, and traversal attempts. Use a real temporary directory or subprocess in integration tests when a fake cannot establish operating-system behaviour.

## Official sources

- [Official CLI example](https://github.com/Effect-TS/effect/blob/effect@4.0.2/ai-docs/src/70_cli/10_basics.ts)
- [FileSystem](https://effect.website/docs/v4/api/effect/FileSystem)
- [Path](https://effect.website/docs/v4/api/effect/Path)
- [Terminal](https://effect.website/docs/v4/api/effect/Terminal)
- [ChildProcess](https://effect.website/docs/v4/api/effect/process/ChildProcess)
- [ChildProcessSpawner](https://effect.website/docs/v4/api/effect/process/ChildProcessSpawner)

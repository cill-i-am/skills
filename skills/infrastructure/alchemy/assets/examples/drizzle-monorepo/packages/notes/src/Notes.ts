import type * as Alchemy from "alchemy";
import type { Note } from "@example/contracts/notes";
import * as Context from "effect/Context";
import * as Data from "effect/Data";
import type * as Effect from "effect/Effect";

export class InvalidTitle extends Data.TaggedError("InvalidTitle")<{}> {}
export class NotesStorageError extends Data.TaggedError("NotesStorageError")<{
  readonly operation: "list" | "create";
}> {}

// This is a SERVER service, not the browser contract. Preserve the phase marker
// rather than casting runtime-only queries into construction-safe operations.
export class Notes extends Context.Service<Notes, {
  readonly list: () => Effect.Effect<ReadonlyArray<Note>, NotesStorageError, Alchemy.RuntimeContext>;
  readonly create: (title: string) => Effect.Effect<Note, InvalidTitle | NotesStorageError, Alchemy.RuntimeContext>;
}>()("example/Notes") {}

import * as Cloudflare from "alchemy/Cloudflare";
import * as Drizzle from "alchemy/Drizzle/D1";
import { asc } from "drizzle-orm";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { InvalidTitle, Notes, NotesStorageError } from "./Notes.ts";
import { notes, relations } from "./sqlite-schema.ts";
import { normalizeTitle } from "./title.ts";

export const NotesD1Live = Layer.effect(Notes, Effect.gen(function* () {
    // Construction: declare storage, obtain the capability, construct a lazy client.
    // Migration paths follow the ROOT deployment command, not this package's cwd.
    const database = yield* Cloudflare.D1.Database("NotesDatabase", {
      migrations: "./packages/notes/drizzle/sqlite",
    });
    const binding = yield* Cloudflare.D1.QueryDatabase(database);
    const db = yield* Drizzle.D1(binding, { relations });
    // The returned methods run queries later, within the handler's execution scope.

    return {
      list: () => db.select({ id: notes.id, title: notes.title }).from(notes)
        .orderBy(asc(notes.id)).limit(50)
        .pipe(Effect.mapError(() => new NotesStorageError({ operation: "list" }))),
      create: (input: string) => Effect.gen(function* () {
        const title = normalizeTitle(input);
        if (title === undefined) return yield* Effect.fail(new InvalidTitle({}));
        const [created] = yield* db.insert(notes)
          .values({ id: crypto.randomUUID(), title })
          .returning({ id: notes.id, title: notes.title })
          .pipe(Effect.mapError(() => new NotesStorageError({ operation: "create" })));
        if (!created) return yield* Effect.fail(new NotesStorageError({ operation: "create" }));
        return created;
      }),
    };

  })).pipe(Layer.provide(Cloudflare.D1.QueryDatabaseBinding));

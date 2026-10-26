import * as Cloudflare from "alchemy/Cloudflare";
import * as Drizzle from "alchemy/Drizzle/Postgres";
import * as Neon from "alchemy/Neon";
import { asc } from "drizzle-orm";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { InvalidTitle, Notes, NotesStorageError } from "./Notes.ts";
import { notes, relations } from "./postgres-schema.ts";
import { normalizeTitle } from "./title.ts";

export const NotesPostgresLive = Layer.effect(Notes, Effect.gen(function* () {
    // An independent example database; selecting this does NOT migrate D1 data.
    const project = yield* Neon.Project("NotesProject", { region: "aws-us-east-1" });
    const branch = yield* Neon.Branch("NotesBranch", {
      project,
      migrations: "./packages/notes/drizzle/postgres",
    });
    const hyperdrive = yield* Cloudflare.Hyperdrive.Connection("NotesHyperdrive", {
      origin: branch.origin,
      dev: branch.pooledOrigin,
      caching: { disabled: true },
    });
    const hd = yield* Cloudflare.Hyperdrive.Connect(hyperdrive);
    const db = yield* Drizzle.Postgres(hd.connectionString, {
      relations,
      client: { prepare: false },
    });

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

  })).pipe(Layer.provide(Cloudflare.Hyperdrive.ConnectBinding));

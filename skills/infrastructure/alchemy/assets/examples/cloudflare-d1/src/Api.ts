import * as Cloudflare from "alchemy/Cloudflare";
import * as Effect from "effect/Effect";
import * as HttpServerResponse from "effect/http/HttpServerResponse";
import { Database } from "./Database.ts";
// Public read-only fixture endpoint. Add authentication before real user data.
export default Cloudflare.Worker("Api", { main: import.meta.url },
  Effect.gen(function* () {
    const db = yield* Cloudflare.D1.QueryDatabase(Database);
    return {
      fetch: Effect.gen(function* () {
        const rows = yield* db.prepare("SELECT id, title FROM notes WHERE id = ?").bind(1).all();
        return yield* HttpServerResponse.json(rows);
      }).pipe(Effect.orDie),
    };
  }).pipe(Effect.provide(Cloudflare.D1.QueryDatabaseBinding)),
);

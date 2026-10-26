import * as Cloudflare from "alchemy/Cloudflare";
import { NotesPostgresLive } from "@example/notes/postgres";
import * as Effect from "effect/Effect";
import { makeHttp } from "./Http.ts";

export default Cloudflare.Worker(
  "Api",
  { main: import.meta.url, compatibility: { flags: ["nodejs_compat"] } },
  makeHttp.pipe(Effect.provide(NotesPostgresLive)),
);

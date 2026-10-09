import * as Cloudflare from "alchemy/Cloudflare";
import { NotesD1Live } from "@example/notes/d1";
import * as Effect from "effect/Effect";
import { makeHttp } from "./Http.ts";

export default Cloudflare.Worker(
  "Api",
  { main: import.meta.url },
  makeHttp.pipe(Effect.provide(NotesD1Live)),
);

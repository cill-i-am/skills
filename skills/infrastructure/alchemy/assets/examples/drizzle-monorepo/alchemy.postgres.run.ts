import * as Alchemy from "alchemy";
import * as Cloudflare from "alchemy/Cloudflare";
import * as Effect from "effect/Effect";
import { Path } from "effect/Path";
import * as Neon from "alchemy/Neon";
import * as Layer from "effect/Layer";
import Api from "./apps/api/src/ApiPostgres.ts";

// Always invoke deployment commands from this workspace root.
export default Alchemy.Stack("NotesPostgresExample", {
  providers: Layer.mergeAll(Cloudflare.providers(), Neon.providers()),
  state: Alchemy.localState(),
}, Effect.gen(function* () {
  const api = yield* Api;
  const path = yield* Path;
  const web = yield* Cloudflare.Website.Vite("Web", {
    rootDir: path.resolve(import.meta.dirname, "apps/web"),
    env: { VITE_API_URL: api.url },
    memo: {
      include: ["**/*", "../../packages/contracts/src/**", "../../packages/contracts/package.json"],
      lockfile: true,
    },
  });
  return { apiUrl: api.url, webUrl: web.url };
}));

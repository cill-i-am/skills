import * as Alchemy from "alchemy";
import * as Cloudflare from "alchemy/Cloudflare";
import * as Effect from "effect/Effect";
import Api from "./src/Api.ts";
export default Alchemy.Stack(
  "ExampleR2Api",
  // Local persistence for this standalone example. Configure a shared remote
  // backend, with authorized bootstrap, before using continuing CI stages.
  { providers: Cloudflare.providers(), state: Alchemy.localState() },
  Effect.gen(function* () {
    const api = yield* Api;
    return { url: api.url };
  }),
);
